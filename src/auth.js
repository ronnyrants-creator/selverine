'use strict';

/**
 * Admin authentication & session management.
 *
 * - Password is bcrypt-hashed. You may provide ADMIN_PASSWORD_HASH (pre-hashed)
 *   or ADMIN_PASSWORD (plain) — the plain value is hashed in-memory at boot and
 *   never stored on disk.
 * - Sessions are stateless signed cookies (HMAC-SHA256 via SESSION_SECRET),
 *   HttpOnly + Secure + SameSite=Lax.
 * - Login is rate-limited per IP.
 * - A per-session CSRF token protects all admin mutations.
 */

const bcrypt = require('bcryptjs');
const { config } = require('./config');
const {
  signValue, verifySignedValue, randomToken,
  setCookie, clearCookie, parseCookies, getClientIp,
} = require('./util');

const SESSION_COOKIE = 'slv_admin';

// ── Password hash (computed once) ───────────────────────────────────────────
let ADMIN_HASH = '';
if (config.admin.passwordHash) {
  ADMIN_HASH = config.admin.passwordHash;
} else if (config.admin.password) {
  ADMIN_HASH = bcrypt.hashSync(config.admin.password, 10);
}

function credentialsConfigured() {
  return Boolean(ADMIN_HASH);
}

function verifyCredentials(username, password) {
  if (!credentialsConfigured()) return false;
  if (username !== config.admin.username) return false;
  try {
    return bcrypt.compareSync(String(password || ''), ADMIN_HASH);
  } catch {
    return false;
  }
}

// ── Sessions ────────────────────────────────────────────────────────────────

function createSession(res, username) {
  const payload = {
    u: username,
    csrf: randomToken(16),
    iat: Date.now(),
    exp: Date.now() + config.sessionTtlMs,
  };
  const token = signValue(Buffer.from(JSON.stringify(payload)).toString('base64url'));
  setCookie(res, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: config.isProd,
    maxAge: config.sessionTtlMs,
  });
  return payload;
}

function destroySession(res) {
  clearCookie(res, SESSION_COOKIE);
}

/** Returns the session payload if valid & unexpired, else null. */
function getSession(req) {
  const cookies = parseCookies(req);
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;
  const value = verifySignedValue(raw);
  if (!value) return null;
  try {
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    if (payload.u !== config.admin.username) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Login rate limiting (per IP) ────────────────────────────────────────────
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 7;
const attempts = new Map(); // ip -> { count, first }

function rateState(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    return { count: 0, first: now };
  }
  return rec;
}

function isRateLimited(req) {
  const ip = getClientIp(req);
  const rec = rateState(ip);
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(req) {
  const ip = getClientIp(req);
  const rec = rateState(ip);
  rec.count += 1;
  rec.first = rec.first || Date.now();
  attempts.set(ip, rec);
}

function resetAttempts(req) {
  attempts.delete(getClientIp(req));
}

// Periodically prune stale rate-limit records.
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of attempts) if (now - rec.first > WINDOW_MS) attempts.delete(ip);
}, WINDOW_MS).unref?.();

// ── CSRF ─────────────────────────────────────────────────────────────────────
function validCsrf(session, token) {
  return Boolean(session && token && session.csrf && token === session.csrf);
}

module.exports = {
  SESSION_COOKIE,
  credentialsConfigured,
  verifyCredentials,
  createSession,
  destroySession,
  getSession,
  isRateLimited,
  recordFailedAttempt,
  resetAttempts,
  validCsrf,
};
