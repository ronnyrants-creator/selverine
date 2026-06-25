'use strict';

/**
 * Order persistence + queries. All SQL uses parameter binding (no string
 * interpolation) so it is immune to SQL injection.
 */

const { db } = require('../db');
const { config } = require('../config');
const { ORDER_STATUSES } = require('../util');

function nowIso() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function generateRef() {
  return `SLV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e4)
    .toString()
    .padStart(4, '0')}`;
}

const insertStmt = db.prepare(`
  INSERT INTO orders (
    ref, created_at, updated_at,
    customer_name, customer_phone, customer_email,
    country, city, address,
    product_name, product_id, quantity, price, currency,
    status,
    ip_address, user_agent,
    fbclid, fbc, fbp,
    event_id, notes,
    name, phone, bundle, total
  ) VALUES (
    @ref, @created_at, @updated_at,
    @customer_name, @customer_phone, @customer_email,
    @country, @city, @address,
    @product_name, @product_id, @quantity, @price, @currency,
    @status,
    @ip_address, @user_agent,
    @fbclid, @fbc, @fbp,
    @event_id, @notes,
    @name, @phone, @bundle, @total
  )
`);

/**
 * Create an order. `data` is already validated/sanitized by the caller.
 * Returns the full inserted row.
 */
function createOrder(data) {
  const ts = nowIso();
  const row = {
    ref: data.ref || generateRef(),
    created_at: ts,
    updated_at: ts,
    customer_name: data.customer_name || '',
    customer_phone: data.customer_phone || '',
    customer_email: data.customer_email || null,
    country: data.country || config.product.country,
    city: data.city || '',
    address: data.address || null,
    product_name: data.product_name || config.product.name,
    product_id: data.product_id || config.product.id,
    quantity: Number(data.quantity) || 1,
    price: Number(data.price) || 0,
    currency: data.currency || config.product.currency,
    status: ORDER_STATUSES.includes(data.status) ? data.status : 'Pending',
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
    fbclid: data.fbclid || null,
    fbc: data.fbc || null,
    fbp: data.fbp || null,
    event_id: data.event_id || null,
    notes: data.notes || null,
    // legacy mirror columns
    name: data.customer_name || '',
    phone: data.customer_phone || '',
    bundle: Number(data.quantity) || 1,
    total: Number(data.price) || 0,
  };
  const result = insertStmt.run(row);
  return getOrderById(result.lastInsertRowid);
}

function getOrderById(id) {
  return db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
}

function getOrderByRef(ref) {
  return db.prepare(`SELECT * FROM orders WHERE ref = ?`).get(ref);
}

/**
 * List orders with optional filters, sorting and pagination.
 * Filters: { search, status, country, product, dateFrom, dateTo }
 * sort: 'newest' | 'oldest'
 */
function listOrders(opts = {}) {
  const where = [];
  const params = {};

  if (opts.search) {
    where.push(`(customer_name LIKE @q OR customer_phone LIKE @q OR ref LIKE @q
                 OR city LIKE @q OR country LIKE @q OR product_name LIKE @q)`);
    params.q = `%${opts.search}%`;
  }
  if (opts.status && ORDER_STATUSES.includes(opts.status)) {
    where.push(`status = @status`);
    params.status = opts.status;
  }
  if (opts.country) {
    where.push(`country = @country`);
    params.country = opts.country;
  }
  if (opts.product) {
    where.push(`product_name LIKE @product`);
    params.product = `%${opts.product}%`;
  }
  if (opts.dateFrom) {
    where.push(`created_at >= @dateFrom`);
    params.dateFrom = `${opts.dateFrom} 00:00:00`;
  }
  if (opts.dateTo) {
    where.push(`created_at <= @dateTo`);
    params.dateTo = `${opts.dateTo} 23:59:59`;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = opts.sort === 'oldest' ? 'ASC' : 'DESC';

  const total = db.prepare(`SELECT COUNT(*) AS n FROM orders ${whereSql}`).get(params).n;

  const limit = Math.min(Math.max(Number(opts.limit) || 50, 1), 500);
  const page = Math.max(Number(opts.page) || 1, 1);
  const offset = (page - 1) * limit;

  const rows = db
    .prepare(`SELECT * FROM orders ${whereSql} ORDER BY datetime(created_at) ${order}, id ${order} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });

  return { rows, total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) };
}

/** All matching rows (no pagination) — used by CSV/Excel export. */
function listAllForExport(opts = {}) {
  return listOrders({ ...opts, page: 1, limit: 100000 }).rows;
}

function updateStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid status');
  const info = db
    .prepare(`UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`)
    .run(status, nowIso(), id);
  return info.changes > 0;
}

const EDITABLE = [
  'customer_name', 'customer_phone', 'customer_email',
  'country', 'city', 'address',
  'product_name', 'product_id', 'quantity', 'price', 'currency',
  'status', 'notes',
];

function updateOrder(id, fields) {
  const sets = [];
  const params = { id, updated_at: nowIso() };
  for (const key of EDITABLE) {
    if (key in fields && fields[key] !== undefined) {
      sets.push(`${key} = @${key}`);
      params[key] = fields[key];
    }
  }
  if (!sets.length) return false;
  sets.push(`updated_at = @updated_at`);
  const info = db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = @id`).run(params);
  return info.changes > 0;
}

function setCapiStatus(id, status) {
  db.prepare(`UPDATE orders SET capi_status = ? WHERE id = ?`).run(status, id);
}

function deleteOrder(id) {
  return db.prepare(`DELETE FROM orders WHERE id = ?`).run(id).changes > 0;
}

/** Dashboard metrics. */
function getStats() {
  const byStatus = db
    .prepare(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status`)
    .all()
    .reduce((acc, r) => ((acc[r.status] = r.n), acc), {});

  const total = db.prepare(`SELECT COUNT(*) AS n FROM orders`).get().n;
  const today = db
    .prepare(`SELECT COUNT(*) AS n FROM orders WHERE date(created_at) = date('now')`)
    .get().n;

  // Revenue counts confirmed + delivered orders (realised revenue).
  const revenue = db
    .prepare(`SELECT COALESCE(SUM(price), 0) AS s FROM orders WHERE status IN ('Confirmed','Delivered')`)
    .get().s;
  const currency = config.product.currency;

  return {
    total,
    today,
    pending: byStatus.Pending || 0,
    confirmed: byStatus.Confirmed || 0,
    cancelled: byStatus.Cancelled || 0,
    delivered: byStatus.Delivered || 0,
    revenue,
    currency,
  };
}

function distinctCountries() {
  return db
    .prepare(`SELECT DISTINCT country FROM orders WHERE country IS NOT NULL AND country <> '' ORDER BY country`)
    .all()
    .map((r) => r.country);
}

module.exports = {
  createOrder, getOrderById, getOrderByRef,
  listOrders, listAllForExport,
  updateStatus, updateOrder, setCapiStatus, deleteOrder,
  getStats, distinctCountries, generateRef,
};
