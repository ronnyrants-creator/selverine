'use strict';

/**
 * Central configuration.
 *
 * Every tunable comes from an environment variable so the app is fully
 * configurable on EasyPanel (or any host) without code changes. For local
 * development we additionally read a `.env` file if one is present — in
 * production EasyPanel injects the variables directly and the file is absent.
 *
 * NOTHING secret is hard-coded here. Missing optional integrations (Meta CAPI,
 * outbound webhooks) degrade gracefully instead of crashing the server.
 */

const fs = require('fs');
const path = require('path');

// ── Minimal .env loader (no dependency) ────────────────────────────────────
// Only used for local dev. Does not override variables already in the
// environment (so EasyPanel-provided values always win).
(function loadDotEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // strip optional surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch (err) {
    console.warn('[config] could not read .env:', err.message);
  }
})();

const env = process.env;

function bool(v, def = false) {
  if (v === undefined) return def;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

/**
 * DATABASE_URL is accepted for parity with the spec / 12-factor apps. This app
 * uses SQLite (better-sqlite3); we interpret DATABASE_URL of the form
 * `sqlite:/path/to.db` or a bare path, falling back to DB_PATH then a local file.
 */
function resolveDbFile() {
  const url = env.DATABASE_URL;
  if (url) {
    if (url.startsWith('sqlite:')) return url.replace(/^sqlite:(\/\/)?/, '') || ':memory:';
    if (url.startsWith('file:')) return url.replace(/^file:(\/\/)?/, '') || ':memory:';
    if (!url.includes('://')) return url; // already a bare path
  }
  return env.DB_PATH || path.join(__dirname, '..', 'selverine.db');
}

const NODE_ENV = env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const config = {
  nodeEnv: NODE_ENV,
  isProd,
  port: Number(env.PORT) || 3000,
  appUrl: (env.APP_URL || 'https://selverine.com').replace(/\/+$/, ''),

  databaseFile: resolveDbFile(),

  // ── Secrets / auth ──
  jwtSecret: env.JWT_SECRET || env.SESSION_SECRET || 'dev-insecure-jwt-secret-change-me',
  sessionSecret: env.SESSION_SECRET || env.JWT_SECRET || 'dev-insecure-session-secret-change-me',
  admin: {
    username: env.ADMIN_USERNAME || 'admin',
    // Plain password from env is hashed in-memory at boot (see services/adminAuth).
    password: env.ADMIN_PASSWORD || '',
    // Optional: provide a pre-computed bcrypt hash instead of a plain password.
    passwordHash: env.ADMIN_PASSWORD_HASH || '',
  },
  sessionTtlMs: Number(env.SESSION_TTL_MS) || 8 * 60 * 60 * 1000, // 8h

  // ── Facebook / Meta ──
  facebookPixelId: env.FACEBOOK_PIXEL_ID || env.META_PIXEL_ID || '',
  meta: {
    pixelId: env.META_PIXEL_ID || env.FACEBOOK_PIXEL_ID || '',
    accessToken: env.META_ACCESS_TOKEN || '',
    testEventCode: env.META_TEST_EVENT_CODE || '',
    apiVersion: env.META_API_VERSION || 'v19.0',
  },

  // ── Webhooks ──
  webhookSecret: env.WEBHOOK_SECRET || '',
  // Optional outbound webhook target fired when an order is created/updated.
  outboundWebhookUrl: env.OUTBOUND_WEBHOOK_URL || env.WEBHOOK_URL || '',

  // ── Product defaults (used for Pixel/CAPI value + content) ──
  product: {
    name: env.PRODUCT_NAME || 'SELVERINE',
    id: env.PRODUCT_ID || 'selverine-hair-oil',
    currency: env.CURRENCY || 'MAD',
    country: env.DEFAULT_COUNTRY || 'MA',
  },
};

/** True when Meta Conversion API is fully configured. */
config.meta.enabled = Boolean(config.meta.pixelId && config.meta.accessToken);

/** Warn loudly (but do not crash) about insecure defaults in production. */
function auditProductionSecrets() {
  if (!isProd) return;
  const warn = [];
  if (config.sessionSecret.startsWith('dev-insecure')) warn.push('SESSION_SECRET');
  if (config.jwtSecret.startsWith('dev-insecure')) warn.push('JWT_SECRET');
  if (!config.admin.password && !config.admin.passwordHash) warn.push('ADMIN_PASSWORD');
  if (!config.webhookSecret) warn.push('WEBHOOK_SECRET');
  if (warn.length) {
    console.warn(
      `[config] ⚠ Production is running with missing/insecure secrets: ${warn.join(', ')}. ` +
      `Set these in EasyPanel → Environment.`
    );
  }
}
auditProductionSecrets();

module.exports = { config };
