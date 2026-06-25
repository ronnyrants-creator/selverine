'use strict';

/**
 * Admin panel routes (server-rendered). All mutations require a valid session
 * and a matching CSRF token. Login is rate-limited.
 *
 *   GET  /admin                      dashboard (stats)
 *   GET  /admin/login                login form
 *   POST /admin/login                authenticate
 *   GET  /admin/logout               destroy session
 *   GET  /admin/orders               orders table (filters/sort/paginate)
 *   GET  /admin/orders/:id           order details
 *   POST /admin/orders/:id/status    change status
 *   POST /admin/orders/:id/delete    delete order
 *   GET  /admin/orders/export.csv    CSV export
 *   GET  /admin/orders/export.xls    Excel export
 */

const { config } = require('../config');
const orders = require('../services/orders');
const views = require('../admin/views');
const auth = require('../auth');
const {
  sendHtml, redirect, readFormBody, escapeHtml, cleanStr,
} = require('../util');

const EXPORT_COLUMNS = [
  'id', 'ref', 'created_at', 'updated_at',
  'customer_name', 'customer_phone', 'customer_email',
  'country', 'city', 'address',
  'product_name', 'product_id', 'quantity', 'price', 'currency',
  'status', 'ip_address', 'user_agent',
  'fbclid', 'fbc', 'fbp', 'event_id', 'notes',
];

function filtersFromQuery(url) {
  const q = url.searchParams;
  return {
    search: cleanStr(q.get('search'), 120),
    status: cleanStr(q.get('status'), 20),
    country: cleanStr(q.get('country'), 80),
    product: cleanStr(q.get('product'), 120),
    dateFrom: cleanStr(q.get('dateFrom'), 12),
    dateTo: cleanStr(q.get('dateTo'), 12),
    sort: q.get('sort') === 'oldest' ? 'oldest' : 'newest',
    page: Number(q.get('page')) || 1,
  };
}

// ── CSV / Excel builders ────────────────────────────────────────────────────
function toCsv(rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = EXPORT_COLUMNS.join(',');
  const lines = rows.map((r) => EXPORT_COLUMNS.map((c) => esc(r[c])).join(','));
  return '﻿' + [header, ...lines].join('\r\n'); // BOM for Excel UTF-8
}

function toExcelXml(rows) {
  const esc = (v) =>
    v == null ? '' : String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/\r?\n/g, ' ');
  const cell = (v) =>
    `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${esc(v)}</Data></Cell>`;
  const headerRow = `<Row>${EXPORT_COLUMNS.map((c) => cell(c)).join('')}</Row>`;
  const bodyRows = rows
    .map((r) => `<Row>${EXPORT_COLUMNS.map((c) => cell(r[c])).join('')}</Row>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Orders"><Table>${headerRow}${bodyRows}</Table></Worksheet>
</Workbook>`;
}

// ── Route dispatcher ─────────────────────────────────────────────────────────
/**
 * Handle an /admin request. Returns true if the request was handled.
 */
async function handle(req, res, url) {
  const path = url.pathname;
  const method = req.method.toUpperCase();

  // ── Login (public) ──
  if (path === '/admin/login' && method === 'GET') {
    if (auth.getSession(req)) return redirect(res, '/admin'), true;
    const note = auth.credentialsConfigured()
      ? ''
      : 'Admin credentials are not set. Configure ADMIN_USERNAME and ADMIN_PASSWORD in the environment.';
    sendHtml(res, 200, views.loginPage({ csrfNote: note }));
    return true;
  }

  if (path === '/admin/login' && method === 'POST') {
    if (auth.isRateLimited(req)) {
      sendHtml(res, 429, views.loginPage({ error: 'Too many attempts. Try again in a few minutes.' }));
      return true;
    }
    const form = await readFormBody(req);
    if (auth.verifyCredentials(form.username, form.password)) {
      auth.resetAttempts(req);
      auth.createSession(res, form.username);
      return redirect(res, '/admin'), true;
    }
    auth.recordFailedAttempt(req);
    sendHtml(res, 401, views.loginPage({ error: 'Invalid username or password.' }));
    return true;
  }

  if (path === '/admin/logout') {
    auth.destroySession(res);
    return redirect(res, '/admin/login'), true;
  }

  // ── Everything below requires a session ──
  const session = auth.getSession(req);
  if (!session) {
    if (method === 'GET') return redirect(res, '/admin/login'), true;
    sendHtml(res, 401, views.loginPage({ error: 'Session expired. Please sign in again.' }));
    return true;
  }

  // CSRF check for all admin mutations.
  let form = null;
  if (method === 'POST') {
    form = await readFormBody(req);
    if (!auth.validCsrf(session, form._csrf)) {
      sendHtml(res, 403, views.loginPage({ error: 'Invalid CSRF token. Please retry.' }));
      return true;
    }
  }

  // ── Dashboard ──
  if (path === '/admin' && method === 'GET') {
    sendHtml(res, 200, views.dashboardPage(orders.getStats()));
    return true;
  }

  // ── Exports (before the :id matcher) ──
  if (path === '/admin/orders/export.csv' && method === 'GET') {
    const rows = orders.listAllForExport(filtersFromQuery(url));
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="selverine-orders-${Date.now()}.csv"`,
    });
    res.end(toCsv(rows));
    return true;
  }
  if (path === '/admin/orders/export.xls' && method === 'GET') {
    const rows = orders.listAllForExport(filtersFromQuery(url));
    res.writeHead(200, {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="selverine-orders-${Date.now()}.xls"`,
    });
    res.end(toExcelXml(rows));
    return true;
  }

  // ── Orders list ──
  if (path === '/admin/orders' && method === 'GET') {
    const filters = filtersFromQuery(url);
    const result = orders.listOrders(filters);
    sendHtml(res, 200, views.ordersPage({
      result, filters, countries: orders.distinctCountries(), csrf: session.csrf,
    }));
    return true;
  }

  // ── Order detail / mutations ──
  const detailMatch = path.match(/^\/admin\/orders\/(\d+)$/);
  if (detailMatch && method === 'GET') {
    const order = orders.getOrderById(Number(detailMatch[1]));
    if (!order) { sendHtml(res, 404, views.layout({ title: 'Not found', body: '<div class="empty">Order not found.</div>', active: 'orders' })); return true; }
    sendHtml(res, 200, views.orderDetailPage({ order, csrf: session.csrf }));
    return true;
  }

  const statusMatch = path.match(/^\/admin\/orders\/(\d+)\/status$/);
  if (statusMatch && method === 'POST') {
    try { orders.updateStatus(Number(statusMatch[1]), form.status); } catch {}
    return redirect(res, safeRedirect(form.redirect, '/admin/orders')), true;
  }

  const deleteMatch = path.match(/^\/admin\/orders\/(\d+)\/delete$/);
  if (deleteMatch && method === 'POST') {
    orders.deleteOrder(Number(deleteMatch[1]));
    return redirect(res, safeRedirect(form.redirect, '/admin/orders')), true;
  }

  return false; // not an admin route we recognise
}

/** Only allow same-site relative redirects (prevents open-redirect). */
function safeRedirect(target, fallback) {
  if (typeof target === 'string' && target.startsWith('/admin')) return target;
  return fallback;
}

module.exports = { handle };
