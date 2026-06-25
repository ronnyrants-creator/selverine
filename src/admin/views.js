'use strict';

/**
 * Server-rendered admin views. Pure functions returning HTML strings.
 * All dynamic values pass through escapeHtml() to prevent stored XSS.
 */

const { escapeHtml, ORDER_STATUSES } = require('../util');
const { config } = require('../config');

const STATUS_COLORS = {
  Pending: '#b8731b',
  Confirmed: '#1d6fb8',
  Delivered: '#1f9254',
  Cancelled: '#c0392b',
};

function statusBadge(status) {
  const color = STATUS_COLORS[status] || '#666';
  return `<span class="badge" style="--c:${color}">${escapeHtml(status || 'Pending')}</span>`;
}

const STYLES = `
:root{--bg:#0f1115;--panel:#171a21;--panel2:#1e222b;--line:#2a2f3a;--txt:#e7e9ee;--muted:#9aa3b2;--accent:#b99a5a;--accent2:#1a3d32}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--txt);font-size:15px}
a{color:inherit}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;background:var(--panel);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:10}
.brand{font-weight:800;letter-spacing:.14em;color:var(--accent)}
.brand small{display:block;font-weight:500;letter-spacing:.06em;color:var(--muted);font-size:11px}
.topnav a{margin-left:18px;color:var(--muted);text-decoration:none;font-weight:600;font-size:14px}
.topnav a.active,.topnav a:hover{color:var(--txt)}
.btn{display:inline-block;padding:9px 16px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--txt);cursor:pointer;text-decoration:none;font-weight:600;font-size:14px}
.btn--accent{background:var(--accent);border-color:var(--accent);color:#1a1a1a}
.btn--danger{background:#3a1d1d;border-color:#5c2b2b;color:#f0b8b8}
.btn--sm{padding:5px 10px;font-size:13px}
.wrap{max-width:1280px;margin:0 auto;padding:22px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:22px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px}
.card h3{margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600}
.card .num{font-size:26px;font-weight:800}
.card--accent{background:linear-gradient(135deg,#1a3d32,#142b24);border-color:#28503f}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.panel__head{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line)}
.filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.filters input,.filters select{background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:8px 10px;font-size:14px}
table{width:100%;border-collapse:collapse}
th,td{padding:11px 12px;text-align:left;font-size:14px;border-bottom:1px solid var(--line);white-space:nowrap}
th{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.05em}
tr:hover td{background:#1b1f27}
.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;color:#fff;background:var(--c)}
.muted{color:var(--muted)}
.right{text-align:right}
.actions{display:flex;gap:6px}
.pagination{display:flex;gap:8px;align-items:center;justify-content:center;padding:14px}
.detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.detail-grid .card h3{color:var(--accent)}
.kv{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}
.kv:last-child{border-bottom:0}
.kv span:first-child{color:var(--muted)}
.kv span:last-child{text-align:right;word-break:break-all;max-width:60%}
form.inline{display:inline}
select.status-select{background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:6px 8px;font-size:13px}
.login-box{max-width:360px;margin:9vh auto;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:28px}
.login-box h1{margin:0 0 4px;font-size:20px}
.login-box p{color:var(--muted);margin:0 0 20px;font-size:14px}
.field{margin-bottom:14px}
.field label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}
.field input{width:100%;padding:11px 12px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--txt);font-size:15px}
.error{background:#3a1d1d;border:1px solid #5c2b2b;color:#f0b8b8;padding:10px 12px;border-radius:9px;margin-bottom:14px;font-size:14px}
.empty{padding:40px;text-align:center;color:var(--muted)}
@media(max-width:640px){.wrap{padding:14px}th:nth-child(4),td:nth-child(4),th:nth-child(7),td:nth-child(7){display:none}}
`;

function layout({ title, body, active }) {
  const nav = config.facebookPixelId; // unused placeholder to keep config referenced
  void nav;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeHtml(title)} · SELVERINE Admin</title>
<style>${STYLES}</style></head><body>
<div class="topbar">
  <div class="brand">SELVERINE <small>Admin Dashboard</small></div>
  <div class="topnav">
    <a href="/admin" class="${active === 'dashboard' ? 'active' : ''}">Dashboard</a>
    <a href="/admin/orders" class="${active === 'orders' ? 'active' : ''}">Orders</a>
    <a href="/admin/logout">Logout</a>
  </div>
</div>
<div class="wrap">${body}</div>
</body></html>`;
}

function loginPage({ error, csrfNote } = {}) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Admin Login · SELVERINE</title>
<style>${STYLES}</style></head><body>
<div class="login-box">
  <h1>SELVERINE Admin</h1>
  <p>Sign in to manage orders.</p>
  ${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}
  <form method="POST" action="/admin/login">
    <div class="field"><label>Username</label><input name="username" autocomplete="username" required autofocus></div>
    <div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required></div>
    <button class="btn btn--accent" style="width:100%" type="submit">Sign in</button>
  </form>
  ${csrfNote ? `<p style="margin-top:14px">${escapeHtml(csrfNote)}</p>` : ''}
</div></body></html>`;
}

function dashboardPage(stats) {
  const money = `${Number(stats.revenue || 0).toLocaleString('en-US')} ${escapeHtml(stats.currency)}`;
  const body = `
  <div class="cards">
    <div class="card card--accent"><h3>Total Orders</h3><div class="num">${stats.total}</div></div>
    <div class="card"><h3>Today</h3><div class="num">${stats.today}</div></div>
    <div class="card"><h3>Pending</h3><div class="num" style="color:${STATUS_COLORS.Pending}">${stats.pending}</div></div>
    <div class="card"><h3>Confirmed</h3><div class="num" style="color:${STATUS_COLORS.Confirmed}">${stats.confirmed}</div></div>
    <div class="card"><h3>Delivered</h3><div class="num" style="color:${STATUS_COLORS.Delivered}">${stats.delivered}</div></div>
    <div class="card"><h3>Cancelled</h3><div class="num" style="color:${STATUS_COLORS.Cancelled}">${stats.cancelled}</div></div>
    <div class="card card--accent"><h3>Revenue (confirmed+delivered)</h3><div class="num">${money}</div></div>
  </div>
  <div class="panel">
    <div class="panel__head"><strong>Quick actions</strong>
      <div class="actions">
        <a class="btn btn--sm" href="/admin/orders?status=Pending">Review pending</a>
        <a class="btn btn--sm" href="/admin/orders">All orders</a>
      </div>
    </div>
    <div class="empty">Use the <a href="/admin/orders" style="color:var(--accent)">Orders</a> page to search, filter, edit, export and update statuses.</div>
  </div>`;
  return layout({ title: 'Dashboard', body, active: 'dashboard' });
}

function ordersPage({ result, filters, countries, csrf }) {
  const qs = (overrides) => {
    const p = new URLSearchParams();
    const merged = { ...filters, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `?${p.toString()}`;
  };

  const rows = result.rows.map((o) => {
    const name = escapeHtml(o.customer_name || o.name || '');
    const phone = escapeHtml(o.customer_phone || o.phone || '');
    const price = `${Number(o.price || o.total || 0).toLocaleString('en-US')}`;
    const statusOptions = ORDER_STATUSES.map(
      (s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
    ).join('');
    return `<tr>
      <td><a href="/admin/orders/${o.id}" style="color:var(--accent);font-weight:700">#${o.id}</a><div class="muted" style="font-size:12px">${escapeHtml(o.ref || '')}</div></td>
      <td>${name}</td>
      <td>${phone}</td>
      <td>${escapeHtml(o.country || '')}</td>
      <td>${escapeHtml(o.city || '')}</td>
      <td>${escapeHtml(o.product_name || '')}</td>
      <td class="right">${escapeHtml(String(o.quantity || 1))}</td>
      <td class="right">${price} ${escapeHtml(o.currency || '')}</td>
      <td>
        <form class="inline" method="POST" action="/admin/orders/${o.id}/status">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}">
          <input type="hidden" name="redirect" value="${escapeHtml(qs({}))}">
          <select class="status-select" name="status" onchange="this.form.submit()">${statusOptions}</select>
        </form>
      </td>
      <td class="muted">${escapeHtml((o.created_at || '').slice(0, 16))}</td>
      <td>
        <div class="actions">
          <a class="btn btn--sm" href="/admin/orders/${o.id}">View</a>
          <form class="inline" method="POST" action="/admin/orders/${o.id}/delete" onsubmit="return confirm('Delete order #${o.id}? This cannot be undone.')">
            <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}">
            <input type="hidden" name="redirect" value="${escapeHtml(qs({}))}">
            <button class="btn btn--sm btn--danger" type="submit">Delete</button>
          </form>
        </div>
      </td>
    </tr>`;
  }).join('');

  const countryOpts = countries.map(
    (c) => `<option value="${escapeHtml(c)}" ${filters.country === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
  ).join('');
  const statusOpts = ORDER_STATUSES.map(
    (s) => `<option value="${s}" ${filters.status === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  const prevDisabled = result.page <= 1 ? 'style="opacity:.4;pointer-events:none"' : '';
  const nextDisabled = result.page >= result.pages ? 'style="opacity:.4;pointer-events:none"' : '';

  const body = `
  <div class="panel">
    <div class="panel__head">
      <form class="filters" method="GET" action="/admin/orders">
        <input name="search" placeholder="Search name, phone, ref…" value="${escapeHtml(filters.search || '')}">
        <select name="status"><option value="">All statuses</option>${statusOpts}</select>
        <select name="country"><option value="">All countries</option>${countryOpts}</select>
        <input name="product" placeholder="Product" value="${escapeHtml(filters.product || '')}">
        <input type="date" name="dateFrom" value="${escapeHtml(filters.dateFrom || '')}">
        <input type="date" name="dateTo" value="${escapeHtml(filters.dateTo || '')}">
        <select name="sort"><option value="newest" ${filters.sort !== 'oldest' ? 'selected' : ''}>Newest</option><option value="oldest" ${filters.sort === 'oldest' ? 'selected' : ''}>Oldest</option></select>
        <button class="btn btn--sm btn--accent" type="submit">Filter</button>
        <a class="btn btn--sm" href="/admin/orders">Reset</a>
      </form>
      <div class="actions">
        <a class="btn btn--sm" href="/admin/orders/export.csv${qs({})}">Export CSV</a>
        <a class="btn btn--sm" href="/admin/orders/export.xls${qs({})}">Export Excel</a>
      </div>
    </div>
    <div style="overflow-x:auto">
    <table>
      <thead><tr>
        <th>Order</th><th>Customer</th><th>Phone</th><th>Country</th><th>City</th>
        <th>Product</th><th class="right">Qty</th><th class="right">Price</th><th>Status</th><th>Date</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="11"><div class="empty">No orders match your filters.</div></td></tr>`}</tbody>
    </table>
    </div>
    <div class="pagination">
      <a class="btn btn--sm" ${prevDisabled} href="${qs({ page: result.page - 1 })}">‹ Prev</a>
      <span class="muted">Page ${result.page} / ${result.pages} · ${result.total} orders</span>
      <a class="btn btn--sm" ${nextDisabled} href="${qs({ page: result.page + 1 })}">Next ›</a>
    </div>
  </div>`;
  return layout({ title: 'Orders', body, active: 'orders' });
}

function orderDetailPage({ order, csrf }) {
  const kv = (label, value) => `<div class="kv"><span>${escapeHtml(label)}</span><span>${escapeHtml(value ?? '') || '—'}</span></div>`;
  const statusOptions = ORDER_STATUSES.map(
    (s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`
  ).join('');

  const body = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <h2 style="margin:0">Order #${order.id} ${statusBadge(order.status)}</h2>
    <div class="actions">
      <a class="btn btn--sm" href="/admin/orders">← Back</a>
      <form class="inline" method="POST" action="/admin/orders/${order.id}/delete" onsubmit="return confirm('Delete this order?')">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}">
        <input type="hidden" name="redirect" value="/admin/orders">
        <button class="btn btn--sm btn--danger" type="submit">Delete</button>
      </form>
    </div>
  </div>

  <form method="POST" action="/admin/orders/${order.id}/status" style="margin-bottom:16px">
    <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}">
    <input type="hidden" name="redirect" value="/admin/orders/${order.id}">
    <span class="muted">Change status:</span>
    <select class="status-select" name="status">${statusOptions}</select>
    <button class="btn btn--sm btn--accent" type="submit">Update</button>
  </form>

  <div class="detail-grid">
    <div class="card"><h3>Customer Information</h3>
      ${kv('Name', order.customer_name || order.name)}
      ${kv('Phone', order.customer_phone || order.phone)}
      ${kv('Email', order.customer_email)}
    </div>
    <div class="card"><h3>Shipping Information</h3>
      ${kv('Country', order.country)}
      ${kv('City', order.city)}
      ${kv('Address', order.address)}
    </div>
    <div class="card"><h3>Product Information</h3>
      ${kv('Product', order.product_name)}
      ${kv('Product ID', order.product_id)}
      ${kv('Quantity', order.quantity)}
      ${kv('Price', `${order.price} ${order.currency || ''}`)}
    </div>
    <div class="card"><h3>Tracking Information</h3>
      ${kv('Reference', order.ref)}
      ${kv('Status', order.status)}
      ${kv('Created', order.created_at)}
      ${kv('Updated', order.updated_at)}
    </div>
    <div class="card"><h3>Facebook Information</h3>
      ${kv('Event ID', order.event_id)}
      ${kv('fbclid', order.fbclid)}
      ${kv('fbc', order.fbc)}
      ${kv('fbp', order.fbp)}
      ${kv('CAPI status', order.capi_status)}
    </div>
    <div class="card"><h3>Browser Information</h3>
      ${kv('IP address', order.ip_address)}
      ${kv('User agent', order.user_agent)}
    </div>
    <div class="card"><h3>Notes</h3>
      <div class="muted" style="white-space:pre-wrap">${escapeHtml(order.notes || '') || '—'}</div>
    </div>
  </div>`;
  return layout({ title: `Order #${order.id}`, body, active: 'orders' });
}

module.exports = { layout, loginPage, dashboardPage, ordersPage, orderDetailPage, statusBadge };
