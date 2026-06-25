'use strict';

/**
 * Meta Conversion API (server-side) integration.
 *
 * Sends a server `Purchase` event that is deduplicated against the browser
 * Pixel event via a shared `event_id`. If credentials are missing it fails
 * gracefully (logs + returns {skipped:true}) so the order flow never breaks.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

const { config } = require('../config');
const { hashNormalized } = require('../util');

/** Normalise a Moroccan phone to digits-with-country-code for hashing. */
function normalizePhone(phone) {
  if (!phone) return undefined;
  let d = String(phone).replace(/[^\d]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `212${d.slice(1)}`; // local MA → +212
  return d;
}

/**
 * Build the Conversions API payload for a Purchase event from an order row.
 */
function buildPurchaseEvent(order, meta = {}) {
  const userData = {
    client_ip_address: order.ip_address || meta.ip || undefined,
    client_user_agent: order.user_agent || meta.userAgent || undefined,
    fbp: order.fbp || undefined,
    fbc: order.fbc || undefined,
  };
  // Hashed PII improves match quality (Meta requires SHA-256 of normalized values).
  const ph = normalizePhone(order.customer_phone);
  if (ph) userData.ph = hashNormalized(ph);
  if (order.customer_email) userData.em = hashNormalized(order.customer_email);
  if (order.customer_name) {
    const parts = String(order.customer_name).trim().split(/\s+/);
    if (parts[0]) userData.fn = hashNormalized(parts[0]);
    if (parts.length > 1) userData.ln = hashNormalized(parts[parts.length - 1]);
  }
  if (order.city) userData.ct = hashNormalized(order.city);
  if (order.country) userData.country = hashNormalized(order.country);

  // Strip undefined keys so we don't send empty fields.
  for (const k of Object.keys(userData)) if (userData[k] === undefined) delete userData[k];

  return {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: order.event_id,
    action_source: 'website',
    event_source_url: meta.sourceUrl || config.appUrl,
    user_data: userData,
    custom_data: {
      currency: order.currency || config.product.currency,
      value: Number(order.price) || 0,
      content_type: 'product',
      contents: [
        {
          id: order.product_id || config.product.id,
          quantity: Number(order.quantity) || 1,
          item_price: (Number(order.price) || 0) / (Number(order.quantity) || 1),
        },
      ],
      content_name: order.product_name || config.product.name,
      content_ids: [order.product_id || config.product.id],
      order_id: order.ref,
    },
  };
}

/**
 * Send a Purchase event to the Conversions API.
 * @returns {Promise<{ok:boolean, skipped?:boolean, status?:number, body?:any, error?:string}>}
 */
async function sendPurchase(order, meta = {}) {
  if (!config.meta.enabled) {
    return { ok: false, skipped: true, error: 'Meta CAPI not configured' };
  }

  const event = buildPurchaseEvent(order, meta);
  const payload = { data: [event] };
  if (config.meta.testEventCode) payload.test_event_code = config.meta.testEventCode;

  const url = `https://graph.facebook.com/${config.meta.apiVersion}/${config.meta.pixelId}/events` +
    `?access_token=${encodeURIComponent(config.meta.accessToken)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let body;
    try { body = await res.json(); } catch { body = await res.text(); }

    if (!res.ok) {
      console.error('[meta] CAPI error', res.status, JSON.stringify(body));
      return { ok: false, status: res.status, body };
    }
    return { ok: true, status: res.status, body };
  } catch (err) {
    console.error('[meta] CAPI request failed:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendPurchase, buildPurchaseEvent };
