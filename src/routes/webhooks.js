'use strict';

/**
 * Inbound webhook endpoints — secured by HMAC signature (WEBHOOK_SECRET).
 *
 *   POST /api/webhooks/order-created   create an order from a trusted system
 *   POST /api/webhooks/order-updated   patch fields of an existing order
 *   POST /api/webhooks/order-status    change an order's status
 *
 * Every request must carry `X-Webhook-Signature: sha256=<hmac>` computed over
 * the raw request body. Requests with a missing/invalid signature get 401.
 */

const orders = require('../services/orders');
const webhooks = require('../services/webhooks');
const { sendJson, readJsonBody, isValidStatus, cleanStr } = require('../util');

async function readVerified(req, res) {
  let raw, json;
  try {
    ({ raw, json } = await readJsonBody(req));
  } catch (err) {
    sendJson(res, 400, { error: err.message || 'Invalid JSON' });
    return null;
  }
  const sig = req.headers['x-webhook-signature'];
  if (!webhooks.verifySignature(raw, sig)) {
    sendJson(res, 401, { error: 'Invalid or missing signature' });
    return null;
  }
  return json;
}

async function orderCreated(req, res) {
  const data = await readVerified(req, res);
  if (!data) return;
  const name = cleanStr(data.customer_name || data.name, 120);
  const phone = cleanStr(data.customer_phone || data.phone, 40);
  const city = cleanStr(data.city, 120);
  if (!name || !phone || !city) {
    return sendJson(res, 422, { error: 'Missing required fields (name, phone, city)' });
  }
  try {
    const order = orders.createOrder({
      ref: cleanStr(data.ref, 60) || undefined,
      customer_name: name,
      customer_phone: phone,
      customer_email: cleanStr(data.customer_email || data.email, 160) || null,
      country: cleanStr(data.country, 80) || null,
      city,
      address: cleanStr(data.address, 300) || null,
      product_name: cleanStr(data.product_name, 160) || null,
      product_id: cleanStr(data.product_id, 120) || null,
      quantity: Number(data.quantity) || 1,
      price: Number(data.price) || 0,
      currency: cleanStr(data.currency, 8) || undefined,
      status: isValidStatus(data.status) ? data.status : 'Pending',
      notes: cleanStr(data.notes, 1000) || null,
    });
    return sendJson(res, 201, { success: true, id: order.id, ref: order.ref });
  } catch (err) {
    console.error('[webhook] order-created failed:', err.message);
    return sendJson(res, 500, { error: 'Could not create order' });
  }
}

async function orderUpdated(req, res) {
  const data = await readVerified(req, res);
  if (!data) return;
  const id = Number(data.id);
  if (!id) return sendJson(res, 422, { error: 'Missing order id' });
  if (!orders.getOrderById(id)) return sendJson(res, 404, { error: 'Order not found' });
  try {
    const ok = orders.updateOrder(id, sanitizePatch(data));
    return sendJson(res, ok ? 200 : 400, { success: ok });
  } catch (err) {
    return sendJson(res, 500, { error: 'Could not update order' });
  }
}

async function orderStatus(req, res) {
  const data = await readVerified(req, res);
  if (!data) return;
  const id = Number(data.id);
  if (!id) return sendJson(res, 422, { error: 'Missing order id' });
  if (!isValidStatus(data.status)) return sendJson(res, 422, { error: 'Invalid status' });
  if (!orders.getOrderById(id)) return sendJson(res, 404, { error: 'Order not found' });
  const ok = orders.updateStatus(id, data.status);
  return sendJson(res, ok ? 200 : 400, { success: ok });
}

function sanitizePatch(data) {
  const patch = {};
  const strFields = {
    customer_name: 120, customer_phone: 40, customer_email: 160,
    country: 80, city: 120, address: 300,
    product_name: 160, product_id: 120, currency: 8, notes: 1000,
  };
  for (const [k, max] of Object.entries(strFields)) {
    if (k in data) patch[k] = cleanStr(data[k], max);
  }
  if ('quantity' in data) patch.quantity = Number(data.quantity) || 1;
  if ('price' in data) patch.price = Number(data.price) || 0;
  if ('status' in data && isValidStatus(data.status)) patch.status = data.status;
  return patch;
}

module.exports = { orderCreated, orderUpdated, orderStatus };
