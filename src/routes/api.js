'use strict';

/**
 * Public + JSON API routes.
 *
 *   POST /api/orders   create an order (the checkout flow)
 *   GET  /api/orders   list orders (admin session required)
 *   GET  /api/health   liveness probe
 *
 * Order flow on POST /api/orders:
 *   1. validate + sanitize     2. persist to DB
 *   3. fire outbound webhook    4. respond (with event_id for dedup)
 *   5. send Meta CAPI Purchase (async)   — browser Pixel fires with same event_id
 */

const { config } = require('../config');
const orders = require('../services/orders');
const meta = require('../services/meta');
const webhooks = require('../services/webhooks');
const sheets = require('../services/googleSheets');
const { getSession } = require('../auth');
const {
  sendJson, readJsonBody, getClientIp, generateEventId,
  cleanStr, isValidPhone, isValidEmail,
} = require('../util');

async function createOrder(req, res) {
  let body;
  try {
    ({ json: body } = await readJsonBody(req));
  } catch (err) {
    return sendJson(res, 400, { error: err.message || 'Invalid request body' });
  }

  // Accept both the legacy frontend shape ({name, total, bundle}) and the new one.
  const customer_name = cleanStr(body.customer_name || body.name, 120);
  const customer_phone = cleanStr(body.customer_phone || body.phone, 40);
  const city = cleanStr(body.city, 120);

  if (!customer_name || !customer_phone || !city) {
    return sendJson(res, 400, { error: 'Missing required fields (name, phone, city)' });
  }
  if (!isValidPhone(customer_phone)) {
    return sendJson(res, 422, { error: 'Invalid phone number' });
  }
  const customer_email = cleanStr(body.customer_email || body.email, 160);
  if (customer_email && !isValidEmail(customer_email)) {
    return sendJson(res, 422, { error: 'Invalid email' });
  }

  const quantity = Number(body.quantity || body.bundle) || 1;
  const price = Number(body.price ?? body.total) || 0;
  const eventId = cleanStr(body.event_id, 80) || generateEventId();
  // Which landing page produced the order (for per-LP conversion analytics).
  const referer = String(req.headers.referer || '');
  const source = body.lang || (referer.includes('/arabic') ? 'ar' : 'fr');

  const orderData = {
    ref: cleanStr(body.ref, 60) || undefined,
    customer_name,
    customer_phone,
    customer_email: customer_email || null,
    country: cleanStr(body.country, 80) || config.product.country,
    city,
    address: cleanStr(body.address, 300) || null,
    product_name: cleanStr(body.product_name, 160) || config.product.name,
    product_id: cleanStr(body.product_id, 120) || config.product.id,
    quantity,
    price,
    currency: cleanStr(body.currency, 8) || config.product.currency,
    status: 'Pending',
    ip_address: getClientIp(req),
    user_agent: cleanStr(req.headers['user-agent'], 400),
    fbclid: cleanStr(body.fbclid, 255) || null,
    fbc: cleanStr(body.fbc, 255) || null,
    fbp: cleanStr(body.fbp, 255) || null,
    event_id: eventId,
    source,
    notes: cleanStr(body.notes, 1000) || null,
  };

  let order;
  try {
    order = orders.createOrder(orderData);
  } catch (err) {
    console.error('[api] createOrder failed:', err.message);
    return sendJson(res, 500, { error: 'Could not save order' });
  }

  console.log(`[order] #${order.id} ${order.ref} — ${order.customer_name} — ${order.city} — ${order.price} ${order.currency}`);

  // Respond immediately so the browser can fire the Pixel Purchase with event_id.
  sendJson(res, 201, {
    success: true,
    id: order.id,
    ref: order.ref,
    event_id: order.event_id,
    value: order.price,
    currency: order.currency,
    contents: [{ id: order.product_id, quantity: order.quantity }],
    content_name: order.product_name,
  });

  // ── Fire-and-forget side effects (never block / break the response) ──
  webhooks.dispatch('order.created', publicOrderView(order)).catch(() => {});
  sheets.appendOrder(publicOrderView(order)).catch((e) =>
    console.error('[sheets] append failed:', e.message)
  );

  meta
    .sendPurchase(order, {
      ip: order.ip_address,
      userAgent: order.user_agent,
      sourceUrl: req.headers.referer || config.appUrl,
    })
    .then((r) => {
      const status = r.skipped ? 'skipped' : r.ok ? 'sent' : 'error';
      try { orders.setCapiStatus(order.id, status); } catch {}
      if (r.ok) console.log(`[capi] Purchase sent for #${order.id} (event_id ${order.event_id})`);
    })
    .catch((err) => {
      try { orders.setCapiStatus(order.id, 'error'); } catch {}
      console.error('[capi] unexpected:', err.message);
    });
}

function listOrders(req, res) {
  const session = getSession(req);
  if (!session) return sendJson(res, 401, { error: 'Unauthorized' });
  const url = new URL(req.url, config.appUrl);
  const result = orders.listOrders({
    search: url.searchParams.get('search') || '',
    status: url.searchParams.get('status') || '',
    sort: url.searchParams.get('sort') || 'newest',
    page: url.searchParams.get('page') || 1,
    limit: url.searchParams.get('limit') || 50,
  });
  return sendJson(res, 200, result);
}

/** A safe subset of the order for outbound payloads (no raw UA/IP noise). */
function publicOrderView(o) {
  return {
    id: o.id, ref: o.ref, status: o.status,
    customer_name: o.customer_name, customer_phone: o.customer_phone,
    country: o.country, city: o.city, address: o.address,
    product_name: o.product_name, quantity: o.quantity,
    price: o.price, currency: o.currency, event_id: o.event_id,
    created_at: o.created_at,
  };
}

function health(req, res) {
  return sendJson(res, 200, {
    status: 'ok',
    pixel: Boolean(config.facebookPixelId),
    capi: config.meta.enabled,
    sheets: Boolean(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_KEY),
    time: new Date().toISOString(),
  });
}

module.exports = { createOrder, listOrders, health, publicOrderView };
