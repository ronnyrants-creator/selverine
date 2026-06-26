'use strict';

const { GoogleAuth } = require('google-auth-library');
const { formatDate } = require('../util');

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const HEADER = ['Date', 'Order ID', 'Customer Name', 'Phone', 'City', 'Product', 'Qty', 'Price', 'Status'];

let _auth = null;
let _disabled = false;
let _checkedHeader = false;

function init() {
  const id = process.env.GOOGLE_SHEETS_ID;
  const key = process.env.GOOGLE_SHEETS_KEY;
  if (!id || !key) {
    _disabled = true;
    if (!id && !key) console.log('[sheets] Disabled — GOOGLE_SHEETS_ID and GOOGLE_SHEETS_KEY not set');
    else if (!id) console.warn('[sheets] Disabled — GOOGLE_SHEETS_ID not set');
    else console.warn('[sheets] Disabled — GOOGLE_SHEETS_KEY not set');
    return;
  }
  try {
    const credentials = JSON.parse(Buffer.from(key, 'base64').toString('utf8'));
    _auth = new GoogleAuth({ credentials, scopes: SCOPES });
    console.log('[sheets] Google Sheets sync enabled');
  } catch (e) {
    _disabled = true;
    console.error('[sheets] Disabled — failed to parse GOOGLE_SHEETS_KEY:', e.message);
  }
}

init();

async function getToken() {
  const client = await _auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

function timedFetch(url, opts) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function appendOrder(order) {
  if (_disabled) return { skipped: true };

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const tab = process.env.GOOGLE_SHEETS_TAB || 'Orders';
  const range = encodeURIComponent(`${tab}!A:I`);

  const token = await getToken();

  // First call per server lifetime: check if header row needs to be written.
  let prependHeader = false;
  if (!_checkedHeader) {
    const res = await timedFetch(`${SHEETS_BASE}/${spreadsheetId}/values/${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    prependHeader = !data.values || data.values.length === 0;
    _checkedHeader = true;
  }

  const orderRow = [
    formatDate(order.created_at, false),
    order.ref || String(order.id || ''),
    order.customer_name || '',
    order.customer_phone || '',
    order.city || '',
    order.product_name || '',
    String(order.quantity ?? 1),
    `${order.price ?? 0} ${order.currency || ''}`.trim(),
    order.status || 'Pending',
  ];

  const rows = prependHeader ? [HEADER, orderRow] : [orderRow];

  const appendRes = await timedFetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows }),
    }
  );

  if (!appendRes.ok) {
    const body = await appendRes.text().catch(() => '');
    throw new Error(`Sheets API ${appendRes.status}: ${body.slice(0, 200)}`);
  }

  console.log(`[sheets] Order ${order.ref} → "${tab}" tab`);
  return { ok: true };
}

module.exports = { appendOrder };
