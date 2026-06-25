'use strict';

/**
 * Webhook system.
 *
 * Outbound: dispatch() fires a signed POST to OUTBOUND_WEBHOOK_URL (if set)
 *           whenever an order is created / updated / changes status.
 *
 * Inbound:  verifySignature() validates the `X-Webhook-Signature` header against
 *           WEBHOOK_SECRET using a constant-time HMAC-SHA256 compare. Used by the
 *           /api/webhooks/* endpoints so only trusted callers can post events.
 */

const crypto = require('crypto');
const { config } = require('../config');

/** Compute the hex HMAC-SHA256 signature of a raw body. */
function sign(rawBody) {
  return crypto.createHmac('sha256', config.webhookSecret).update(rawBody).digest('hex');
}

/**
 * Verify an inbound webhook. Returns false if no secret is configured (fail
 * closed — never accept unsigned writes in production).
 * Accepts `sha256=<hex>` or a bare `<hex>` signature header.
 */
function verifySignature(rawBody, signatureHeader) {
  if (!config.webhookSecret) return false;
  if (!signatureHeader) return false;
  const provided = String(signatureHeader).replace(/^sha256=/i, '').trim();
  const expected = sign(rawBody);
  const a = Buffer.from(provided, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Fire an outbound webhook. Non-blocking: errors are logged, never thrown, so
 * the order flow is unaffected. Returns a promise the caller may ignore.
 */
async function dispatch(event, payload) {
  if (!config.outboundWebhookUrl) return { skipped: true };
  const body = JSON.stringify({ event, sentAt: new Date().toISOString(), data: payload });
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(config.outboundWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': `sha256=${sign(body)}`,
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error(`[webhook] outbound dispatch failed (${event}):`, err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sign, verifySignature, dispatch };
