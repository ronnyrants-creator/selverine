# SELVERINE — Ecommerce Backend

Production landing pages (French `/` + Arabic `/arabic`) with a real ecommerce
backend: order capture → SQLite → admin dashboard, plus Facebook **Pixel** and
**Meta Conversion API** with browser/server event **deduplication**.

Plain Node.js (no framework) + `better-sqlite3` + `bcryptjs`. Everything is
configured through environment variables and runs as-is on **EasyPanel**.

---

## Architecture

```
server.js                 HTTP entrypoint: static + API + webhooks + /admin
src/
  config.js               loads & validates all env vars
  db.js                   SQLite connection, schema + migrations + indexes
  util.js                 http/cookie/crypto/validation helpers
  auth.js                 admin sessions, bcrypt, CSRF, login rate-limit
  services/
    orders.js             order CRUD, stats, filtering, export queries
    meta.js               Meta Conversion API (server Purchase)
    webhooks.js           inbound signature verify + outbound dispatch
    pixel.js              builds the Pixel snippet injected into HTML
  routes/
    api.js                /api/orders, /api/health
    webhooks.js           /api/webhooks/*
    admin.js              /admin/* (dashboard, orders, exports)
  admin/views.js          server-rendered dashboard HTML
frontend/                 static site (index.html, arabic.html, script.js, …)
```

## Order flow

1. Customer submits checkout (inline form or modal).
2. Browser generates a shared `event_id`, captures `_fbp` / `_fbc` / `fbclid`.
3. `POST /api/orders` → validate + sanitize → save to DB.
4. Server responds (`201`) with `event_id`, value, currency, contents.
5. Browser fires Pixel **Purchase** with that `event_id`.
6. Server fires **Meta CAPI Purchase** with the *same* `event_id` → deduplicated.
7. Outbound webhook `order.created` is dispatched (if configured).

---

## Install (local)

```bash
cp .env.example .env        # then edit values
npm install                 # better-sqlite3 + bcryptjs
npm start                   # http://localhost:3000  (admin at /admin)
```

Health check: `GET /api/health` → `{ status, pixel, capi }`.

## Deploy on EasyPanel

The live service is **project `hh` → service `backend`** (the domain
`selverine.com` proxies to it on port 3000). It builds this repo
(`selverine-v2@main`) with the included **Dockerfile**.

1. **Environment** (Service → Environment): paste the variables from
   `.env.example` with real values. At minimum set `ADMIN_USERNAME`,
   `ADMIN_PASSWORD`, `SESSION_SECRET`, `JWT_SECRET`, `WEBHOOK_SECRET`,
   `FACEBOOK_PIXEL_ID`, `META_ACCESS_TOKEN`.
2. **Persistent volume** (Service → Mounts): add a **Volume** mounted at
   `/data`. The Dockerfile already defaults `DB_PATH=/data/selverine.db`, so
   orders survive redeploys. *Without a volume the SQLite DB is wiped on every
   deploy.*
3. **Deploy**: push to `main`, then trigger the service deploy. Build takes
   ~2–3 min (native `better-sqlite3` compile).

No secrets are hard-coded; no local-only paths (DB path is env-driven).

---

## Facebook Pixel (browser)

- The Pixel is injected into **every HTML page** from `FACEBOOK_PIXEL_ID`.
  If the variable is empty, nothing is injected (graceful).
- Events fired client-side (`frontend/script.js`):
  - `PageView` — on load (in the injected snippet)
  - `ViewContent` — on page ready
  - `InitiateCheckout` — when the order modal opens
  - `Purchase` — on successful order, with the shared `event_id`
- To change the Pixel ID, update `FACEBOOK_PIXEL_ID` in EasyPanel and redeploy
  (or just restart — it is read at boot). No code change required.

## Meta Conversion API (server)

- Configured via `META_PIXEL_ID` (defaults to `FACEBOOK_PIXEL_ID`) and
  `META_ACCESS_TOKEN`. If either is missing it **fails gracefully** (the order
  still saves; CAPI is marked `skipped`).
- On each order the server sends a `Purchase` event to
  `graph.facebook.com/<version>/<pixel_id>/events` including
  `event_id`, `event_time`, `event_source_url`, `client_ip_address`,
  `client_user_agent`, `fbp`, `fbc`, hashed PII (phone/email/name/city/country),
  `currency`, `value`, `contents`, `content_type`.
- **Deduplication**: the browser Pixel `Purchase` and the server CAPI `Purchase`
  use the **same `event_id`**, so Meta counts them once.
- While testing, set `META_TEST_EVENT_CODE` and watch
  Events Manager → Test Events. Remove it for production traffic.

## Webhooks

Inbound endpoints are signed with `WEBHOOK_SECRET` (HMAC-SHA256 over the raw
body, header `X-Webhook-Signature: sha256=<hex>`):

| Method & path                         | Action                          |
|---------------------------------------|---------------------------------|
| `POST /api/webhooks/order-created`    | create an order                 |
| `POST /api/webhooks/order-updated`    | patch fields of an order (`id`) |
| `POST /api/webhooks/order-status`     | change status (`id`, `status`)  |

Example:

```bash
BODY='{"customer_name":"Test","customer_phone":"0612345678","city":"Casablanca"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')
curl -X POST https://selverine.com/api/webhooks/order-created \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=$SIG" \
  -d "$BODY"
```

An **outbound** webhook (`order.created`) is sent to `OUTBOUND_WEBHOOK_URL` if
set, signed with the same secret.

---

## Admin dashboard

`/admin` — session-authenticated (HttpOnly + Secure cookie, CSRF-protected,
login rate-limited).

- **Dashboard**: total / today / pending / confirmed / cancelled / delivered /
  revenue.
- **Orders**: searchable, filterable (status, country, product, date),
  sortable (newest/oldest), paginated table with inline status change,
  view / delete actions and **CSV** + **Excel** export.
- **Order details**: customer, shipping, product, tracking, Facebook
  (event_id / fbclid / fbc / fbp / CAPI status) and browser (IP / user agent).

### Change the admin password

Update `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`) in EasyPanel → Environment
and redeploy/restart. The plain password is bcrypt-hashed in memory at boot and
never written to disk.

## Security

- Parameterized SQL everywhere (no injection).
- All rendered values HTML-escaped (no stored XSS).
- bcrypt password hashing; signed HttpOnly/Secure session cookies.
- CSRF token on every admin mutation; per-IP login rate limiting.
- HMAC-verified inbound webhooks (fail closed without a secret).
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- Request body size caps.

## Database schema (`orders`)

`id, ref, created_at, updated_at, customer_name, customer_phone, customer_email,
country, city, address, product_name, product_id, quantity, price, currency,
status (Pending|Confirmed|Cancelled|Delivered), ip_address, user_agent, fbclid,
fbc, fbp, event_id, capi_status, notes` — indexed on status, created_at, phone,
country, product, event_id.
