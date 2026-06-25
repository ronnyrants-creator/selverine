'use strict';

/**
 * SELVERINE — HTTP entrypoint.
 *
 * Plain Node HTTP server (no framework) that serves the static frontend and
 * mounts the modular API / webhook / admin routers. The Facebook Pixel is
 * injected into every HTML response from the FACEBOOK_PIXEL_ID env var.
 *
 * Modules:
 *   src/config.js          env config            src/db.js            database
 *   src/routes/api.js      /api/*                src/routes/webhooks  /api/webhooks/*
 *   src/routes/admin.js    /admin/*              src/services/*       business logic
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const { config } = require('./src/config');
require('./src/db'); // initialise schema/migrations on boot

const apiRoutes = require('./src/routes/api');
const webhookRoutes = require('./src/routes/webhooks');
const adminRoutes = require('./src/routes/admin');
const pixel = require('./src/services/pixel');

const FRONTEND = path.join(__dirname, 'frontend');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.pdf': 'application/pdf',
};

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
}

function serveStatic(req, res, route) {
  let filePath = path.join(FRONTEND, route === '/' ? 'index.html' : decodeURIComponent(route));

  // Path traversal protection.
  if (!filePath.startsWith(FRONTEND)) { res.writeHead(403); res.end('Forbidden'); return; }

  // Directory → index.html inside it.
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  // Extensionless → try .html (so /arabic → arabic.html).
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) filePath += '.html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA-style fallback: unknown path → 404 page or index.
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 — Not found</h1>');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    if (ext === '.html') {
      const html = pixel.injectInto(data.toString('utf8'));
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(html);
    } else {
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' });
      res.end(data);
    }
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, config.appUrl);
    const route = url.pathname;
    const method = req.method.toUpperCase();

    securityHeaders(res);

    // CORS (API only).
    if (route.startsWith('/api/')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Signature');
      if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    }

    // ── Admin ──
    if (route === '/admin' || route.startsWith('/admin/')) {
      const handled = await adminRoutes.handle(req, res, url);
      if (!handled) { res.writeHead(404); res.end('Not found'); }
      return;
    }

    // ── Webhooks ──
    if (route === '/api/webhooks/order-created' && method === 'POST') return void webhookRoutes.orderCreated(req, res);
    if (route === '/api/webhooks/order-updated' && method === 'POST') return void webhookRoutes.orderUpdated(req, res);
    if (route === '/api/webhooks/order-status' && method === 'POST') return void webhookRoutes.orderStatus(req, res);

    // ── API ──
    if (route === '/api/health' && method === 'GET') return void apiRoutes.health(req, res);
    if (route === '/api/orders' && method === 'POST') return void apiRoutes.createOrder(req, res);
    if (route === '/api/orders' && method === 'GET') return void apiRoutes.listOrders(req, res);

    if (route.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    // ── Static frontend ──
    serveStatic(req, res, route);
  } catch (err) {
    console.error('[server] unhandled error:', err);
    if (!res.headersSent) { res.writeHead(500, { 'Content-Type': 'application/json' }); }
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(config.port, () => {
  console.log(`\n  SELVERINE running at http://localhost:${config.port}`);
  console.log(`  Admin:   ${config.appUrl}/admin`);
  console.log(`  Pixel:   ${config.facebookPixelId ? 'enabled (' + config.facebookPixelId + ')' : 'disabled'}`);
  console.log(`  CAPI:    ${config.meta.enabled ? 'enabled' : 'disabled'}`);
  console.log(`  DB:      ${config.databaseFile}\n`);
});
