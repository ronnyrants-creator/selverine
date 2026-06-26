'use strict';

/**
 * SQLite (better-sqlite3) connection + schema management.
 *
 * - Creates the full `orders` schema for fresh installs.
 * - Migrates pre-existing databases by adding any missing columns (the original
 *   table only had: id, ref, name, phone, city, bundle, total, status, created_at).
 * - Creates indexes for the columns the admin filters/sorts on.
 *
 * The DB file path is configurable (DATABASE_URL / DB_PATH) so it can live on a
 * persistent EasyPanel volume (e.g. DB_PATH=/data/selverine.db).
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { config } = require('./config');

// Ensure the parent directory exists (e.g. a mounted /data volume).
try {
  const dir = path.dirname(config.databaseFile);
  if (dir && dir !== '.' && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
} catch (err) {
  console.warn('[db] could not ensure db directory:', err.message);
}

const db = new Database(config.databaseFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Canonical schema (fresh installs) ──────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    ref            TEXT    UNIQUE,
    created_at     DATETIME DEFAULT (datetime('now')),
    updated_at     DATETIME DEFAULT (datetime('now')),

    customer_name  TEXT    NOT NULL,
    customer_phone TEXT    NOT NULL,
    customer_email TEXT,

    country        TEXT,
    city           TEXT,
    address        TEXT,

    product_name   TEXT,
    product_id     TEXT,
    quantity       INTEGER DEFAULT 1,
    price          REAL    DEFAULT 0,
    currency       TEXT    DEFAULT 'MAD',

    status         TEXT    DEFAULT 'Pending',

    ip_address     TEXT,
    user_agent     TEXT,

    fbclid         TEXT,
    fbc            TEXT,
    fbp            TEXT,

    event_id       TEXT,
    capi_status    TEXT,

    source         TEXT,          -- 'fr' | 'ar' (which landing page)

    notes          TEXT,

    -- legacy columns kept for backward compatibility with the old schema
    name           TEXT,
    phone          TEXT,
    bundle         INTEGER,
    total          REAL
  )
`);

// ── Migration: add any columns missing from an older DB ─────────────────────
const existingCols = new Set(
  db.prepare(`PRAGMA table_info(orders)`).all().map((c) => c.name)
);

const columnsToEnsure = {
  ref: `ref TEXT`,
  updated_at: `updated_at DATETIME`,
  customer_name: `customer_name TEXT`,
  customer_phone: `customer_phone TEXT`,
  customer_email: `customer_email TEXT`,
  country: `country TEXT`,
  city: `city TEXT`,
  address: `address TEXT`,
  product_name: `product_name TEXT`,
  product_id: `product_id TEXT`,
  quantity: `quantity INTEGER DEFAULT 1`,
  price: `price REAL DEFAULT 0`,
  currency: `currency TEXT DEFAULT 'MAD'`,
  status: `status TEXT DEFAULT 'Pending'`,
  ip_address: `ip_address TEXT`,
  user_agent: `user_agent TEXT`,
  fbclid: `fbclid TEXT`,
  fbc: `fbc TEXT`,
  fbp: `fbp TEXT`,
  event_id: `event_id TEXT`,
  capi_status: `capi_status TEXT`,
  source: `source TEXT`,
  notes: `notes TEXT`,
  name: `name TEXT`,
  phone: `phone TEXT`,
  bundle: `bundle INTEGER`,
  total: `total REAL`,
};

const migrate = db.transaction(() => {
  for (const [col, ddl] of Object.entries(columnsToEnsure)) {
    if (!existingCols.has(col)) {
      db.exec(`ALTER TABLE orders ADD COLUMN ${ddl}`);
    }
  }
  // Backfill canonical columns from legacy ones where the DB pre-dates them.
  if (existingCols.has('name')) {
    db.exec(`UPDATE orders SET customer_name = name   WHERE customer_name IS NULL AND name  IS NOT NULL`);
  }
  if (existingCols.has('phone')) {
    db.exec(`UPDATE orders SET customer_phone = phone WHERE customer_phone IS NULL AND phone IS NOT NULL`);
  }
  if (existingCols.has('total')) {
    db.exec(`UPDATE orders SET price = total WHERE (price IS NULL OR price = 0) AND total IS NOT NULL`);
  }
  // Normalise legacy 'new' status to 'Pending'.
  db.exec(`UPDATE orders SET status = 'Pending' WHERE status IN ('new', '', NULL) OR status IS NULL`);
});
migrate();

// ── Indexes ────────────────────────────────────────────────────────────────
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_phone         ON orders(customer_phone);
  CREATE INDEX IF NOT EXISTS idx_orders_country       ON orders(country);
  CREATE INDEX IF NOT EXISTS idx_orders_product       ON orders(product_name);
  CREATE INDEX IF NOT EXISTS idx_orders_event_id      ON orders(event_id);
`);

// ── Analytics: page visits ──────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  DATETIME DEFAULT (datetime('now')),
    path        TEXT,
    page        TEXT,          -- 'fr' | 'ar' | 'other'
    visitor_id  TEXT,          -- cookie uuid (unique visitors)
    ip          TEXT,
    ua          TEXT,
    device      TEXT,          -- mobile | tablet | desktop
    browser     TEXT,
    os          TEXT,
    country     TEXT,
    referrer    TEXT,
    fbclid      TEXT,
    is_owner    INTEGER DEFAULT 0
  )
`);
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);
  CREATE INDEX IF NOT EXISTS idx_visits_page       ON visits(page);
  CREATE INDEX IF NOT EXISTS idx_visits_country    ON visits(country);
  CREATE INDEX IF NOT EXISTS idx_visits_device     ON visits(device);
  CREATE INDEX IF NOT EXISTS idx_visits_browser    ON visits(browser);
  CREATE INDEX IF NOT EXISTS idx_visits_visitor    ON visits(visitor_id);
  CREATE INDEX IF NOT EXISTS idx_visits_is_owner   ON visits(is_owner);
`);

// ── Owner IPs (auto-learned from admin logins + OWNER_IPS env) — excluded from analytics ──
db.exec(`
  CREATE TABLE IF NOT EXISTS owner_ips (
    ip       TEXT PRIMARY KEY,
    added_at DATETIME DEFAULT (datetime('now')),
    source   TEXT
  )
`);

console.log(`[db] ready at ${config.databaseFile}`);

module.exports = { db };
