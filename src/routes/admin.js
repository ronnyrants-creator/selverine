'use strict';

/**
 * Admin panel routes (server-rendered). All mutations require a valid session
 * and a matching CSRF token. Login is rate-limited and learns the owner's IP
 * (so the owner's own traffic is excluded from analytics).
 *
 *   GET  /admin                      dashboard (orders + traffic overview)
 *   GET  /admin/analytics            full analytics
 *   GET  /admin/login | POST | /logout
 *   GET  /admin/orders               orders table
 *   GET  /admin/orders/:id           order details
 *   POST /admin/orders/:id/status    change status
 *   POST /admin/orders/:id/delete    delete order
 *   GET  /admin/orders/export.csv    clean CSV (business fields only)
 *   GET  /admin/orders/export.xls    styled Excel (business fields only)
 */

const orders = require('../services/orders');
const analytics = require('../services/analytics');
const views = require('../admin/views');
const auth = require('../auth');
const { sendHtml, redirect, readFormBody, cleanStr, getClientIp } = require('../util');

// ── Export: ONLY clean business fields. No IDs/secrets/technical data ever. ──
const EXPORT_FIELDS = [
  ['Date', (o) => (o.created_at || '').slice(0, 10)],
  ['Order ID', (o) => o.ref || String(o.id)],
  ['Country', (o) => o.country || ''],
  ['Customer Name', (o) => o.customer_name || o.name || ''],
  ['Phone', (o) => o.customer_phone || o.phone || ''],
  ['Product', (o) => o.product_name || ''],
  ['SKU', (o) => o.product_id || ''],
  ['Currency', (o) => o.currency || ''],
  ['Status', (o) => o.status || ''],
];
const EXPORT_HEADERS = EXPORT_FIELDS.map((f) => f[0]);
const rowValues = (o) => EXPORT_FIELDS.map((f) => f[1](o));

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

function toCsv(rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [EXPORT_HEADERS.join(',')];
  for (const o of rows) lines.push(rowValues(o).map(esc).join(','));
  return '﻿' + lines.join('\r\n'); // UTF-8 BOM for Excel
}

/** Styled SpreadsheetML 2003 (.xls) — opens natively in Excel with formatting. */
function toExcelXml(rows) {
  const esc = (v) =>
    v == null ? '' : String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/\r?\n/g, ' ');
  const numericCols = new Set(); // all business fields are text-safe (phones keep leading 0)
  const cell = (v, i, styleId) =>
    `<Cell${styleId ? ` ss:StyleID="${styleId}"` : ''}><Data ss:Type="${numericCols.has(i) ? 'Number' : 'String'}">${esc(v)}</Data></Cell>`;
  const header = `<Row ss:Height="22">${EXPORT_HEADERS.map((h) => cell(h, -1, 'hdr')).join('')}</Row>`;
  const body = rows.map((o) => `<Row>${rowValues(o).map((v, i) => cell(v, i, 'cell')).join('')}</Row>`).join('');
  const widths = [90, 130, 70, 170, 120, 150, 150, 80, 90]
    .map((w, i) => `<Column ss:Index="${i + 1}" ss:Width="${w}"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="hdr"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#1A3D32" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F2620"/></Borders></Style>
  <Style ss:ID="cell"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/></Borders></Style>
 </Styles>
 <Worksheet ss:Name="Orders"><Table>${widths}${header}${body}</Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane></WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

async function handle(req, res, url) {
  const path = url.pathname;
  const method = req.method.toUpperCase();

  // ── Login (public) ──
  if (path === '/admin/login' && method === 'GET') {
    if (auth.getSession(req)) return redirect(res, '/admin'), true;
    const note = auth.credentialsConfigured()
      ? '' : 'Admin credentials are not set. Configure ADMIN_USERNAME and ADMIN_PASSWORD.';
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
      try { analytics.rememberOwnerIp(getClientIp(req)); } catch {}
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

  // ── Session required below ──
  const session = auth.getSession(req);
  if (!session) {
    if (method === 'GET') return redirect(res, '/admin/login'), true;
    sendHtml(res, 401, views.loginPage({ error: 'Session expired. Please sign in again.' }));
    return true;
  }

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
    sendHtml(res, 200, views.dashboardPage({
      stats: orders.getStats(),
      analytics: analytics.summary(),
      trend: analytics.trends(14),
    }));
    return true;
  }

  // ── Analytics ──
  if (path === '/admin/analytics' && method === 'GET') {
    sendHtml(res, 200, views.analyticsPage({
      summary: analytics.summary(),
      landing: analytics.landingPerformance(),
      trends: analytics.trends(14),
      topCountries: analytics.topCountries(8),
      devices: analytics.breakdownBy('device'),
      browsers: analytics.breakdownBy('browser'),
      behavior: analytics.behavior(),
    }));
    return true;
  }

  // ── Exports (before :id matcher) ──
  if (path === '/admin/orders/export.csv' && method === 'GET') {
    const rows = orders.listAllForExport(filtersFromQuery(url));
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="selverine-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
    res.end(toCsv(rows));
    return true;
  }
  if (path === '/admin/orders/export.xls' && method === 'GET') {
    const rows = orders.listAllForExport(filtersFromQuery(url));
    res.writeHead(200, {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="selverine-orders-${new Date().toISOString().slice(0, 10)}.xls"`,
    });
    res.end(toExcelXml(rows));
    return true;
  }

  // ── Orders list ──
  if (path === '/admin/orders' && method === 'GET') {
    const filters = filtersFromQuery(url);
    sendHtml(res, 200, views.ordersPage({
      result: orders.listOrders(filters), filters,
      countries: orders.distinctCountries(), csrf: session.csrf,
    }));
    return true;
  }

  const detailMatch = path.match(/^\/admin\/orders\/(\d+)$/);
  if (detailMatch && method === 'GET') {
    const order = orders.getOrderById(Number(detailMatch[1]));
    if (!order) { sendHtml(res, 404, views.shell({ title: 'Not found', active: 'orders', body: '<div class="empty">Order not found.</div>' })); return true; }
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

  return false;
}

function safeRedirect(target, fallback) {
  if (typeof target === 'string' && target.startsWith('/admin')) return target;
  return fallback;
}

module.exports = { handle };
