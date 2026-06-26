'use strict';

/**
 * Small dependency-free helpers shared across routes/services:
 * HTTP I/O, cookie parsing, crypto (HMAC cookie signing, hashing, ids),
 * and input validation/sanitization.
 */

const crypto = require('crypto');
const { config } = require('./config');

// ── HTTP ───────────────────────────────────────────────────────────────────

function sendJson(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function sendHtml(res, status, html, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(html);
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

/** Read and JSON-parse a request body, capped to avoid abuse. */
function readJsonBody(req, limitBytes = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve({ raw, json: raw ? JSON.parse(raw) : {} });
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/** Read a urlencoded form body into an object (admin forms). */
function readFormBody(req, limitBytes = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limitBytes) { reject(new Error('Payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const params = new URLSearchParams(raw);
      const obj = {};
      for (const [k, v] of params) obj[k] = v;
      resolve(obj);
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function setCookie(res, name, value, opts = {}) {
  const segs = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge != null) segs.push(`Max-Age=${Math.floor(opts.maxAge / 1000)}`);
  segs.push(`Path=${opts.path || '/'}`);
  if (opts.httpOnly !== false) segs.push('HttpOnly');
  segs.push(`SameSite=${opts.sameSite || 'Lax'}`);
  if (opts.secure ?? config.isProd) segs.push('Secure');
  appendHeader(res, 'Set-Cookie', segs.join('; '));
}

function clearCookie(res, name) {
  appendHeader(res, 'Set-Cookie', `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

function appendHeader(res, name, value) {
  const prev = res.getHeader(name);
  if (!prev) res.setHeader(name, value);
  else res.setHeader(name, Array.isArray(prev) ? [...prev, value] : [prev, value]);
}

/** Best-effort real client IP, honouring common proxy headers (Cloudflare/Traefik). */
function getClientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return String(cf).trim();
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  const xreal = req.headers['x-real-ip'];
  if (xreal) return String(xreal).trim();
  return (req.socket && req.socket.remoteAddress) || '';
}

// ── Crypto ──────────────────────────────────────────────────────────────────

/** sha256 hex of a normalized (lowercased, trimmed) string — for Meta user_data. */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function hashNormalized(value) {
  if (value == null || value === '') return undefined;
  return sha256(String(value).trim().toLowerCase());
}

/** Sign an arbitrary string payload with the session secret (HMAC-SHA256). */
function signValue(value) {
  const sig = crypto.createHmac('sha256', config.sessionSecret).update(value).digest('base64url');
  return `${value}.${sig}`;
}

/** Verify a `value.sig` token; returns the value or null. Constant-time compare. */
function verifySignedValue(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const value = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', config.sessionSecret).update(value).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? value : null;
}

function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** Unique, dedup-safe event id shared between browser Pixel and server CAPI. */
function generateEventId() {
  return crypto.randomUUID();
}

// ── Validation / sanitization ────────────────────────────────────────────────

/** Escape a string for safe interpolation into HTML. */
function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Trim + collapse whitespace + cap length. Returns '' for nullish. */
function cleanStr(value, maxLen = 500) {
  if (value == null) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

/** Moroccan + international mobile validation (matches the frontend rules). */
function isValidPhone(value) {
  const digits = String(value || '').replace(/[\s\-.]/g, '');
  return /^(0[5-7]\d{8}|(\+212|00212)[5-7]\d{8})$/.test(digits);
}

function isValidEmail(value) {
  if (!value) return true; // email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

// ── Dates ── timestamps are stored in UTC; display them in Morocco time.
const APP_TZ = process.env.APP_TZ || 'Africa/Casablanca';

/** Today's date (YYYY-MM-DD) in Morocco time — for "today" stat queries. */
function localToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ }).format(new Date());
}

/** Format a UTC 'YYYY-MM-DD HH:MM:SS' string in Morocco time. */
function formatDate(utc, withTime = true) {
  if (!utc) return '';
  const d = new Date(`${String(utc).replace(' ', 'T')}Z`);
  if (isNaN(d.getTime())) return String(utc);
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d).reduce((a, x) => ((a[x.type] = x.value), a), {});
  const date = `${p.year}-${p.month}-${p.day}`;
  return withTime ? `${date} ${p.hour}:${p.minute}` : date;
}

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Delivered'];
function isValidStatus(value) {
  return ORDER_STATUSES.includes(value);
}

module.exports = {
  sendJson, sendHtml, redirect, readJsonBody, readFormBody,
  parseCookies, setCookie, clearCookie, appendHeader, getClientIp,
  sha256, hashNormalized, signValue, verifySignedValue, randomToken, generateEventId,
  escapeHtml, cleanStr, isValidPhone, isValidEmail, isValidStatus, ORDER_STATUSES,
  formatDate, localToday, APP_TZ,
};
