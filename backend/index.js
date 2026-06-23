const http = require('http');
const fs   = require('fs');
const path = require('path');
const db   = require('../database');

const PORT     = process.env.PORT || 3000;
const FRONTEND = path.join(__dirname, '..', 'frontend');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css',
  '.js'  : 'application/javascript',
  '.json': 'application/json',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
  '.webp': 'image/webp',
};

// ── Helpers ──────────────────────────────────────────────────────
function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': mime };
    // HTML: never cache — always serve latest version
    if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma']        = 'no-cache';
      headers['Expires']       = '0';
    } else {
      // CSS/JS/images: cache 1 year (cache-busted via ?v= query string)
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

// ── Server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method.toUpperCase();
  const route  = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // POST /api/orders — create order
  if (route === '/api/orders' && method === 'POST') {
    try {
      const { name, phone, city, bundle = 1, total = 0, ref } = await readBody(req);
      if (!name?.trim() || !phone?.trim() || !city?.trim())
        return json(res, 400, { error: 'Champs requis manquants' });
      const order = db.createOrder({ name: name.trim(), phone: phone.trim(), city: city.trim(), bundle: Number(bundle), total: Number(total), ref });
      console.log(`[ORDER] ${order.ref} · ${name} · ${city} · ${total} DH`);
      return json(res, 201, { success: true, id: order.id, ref: order.ref });
    } catch (err) {
      console.error(err.message);
      return json(res, 500, { error: 'Erreur serveur' });
    }
  }

  // GET /api/orders — list all orders
  if (route === '/api/orders' && method === 'GET') {
    return json(res, 200, db.getAllOrders());
  }

  // PATCH /api/orders/:id — update status
  const patch = route.match(/^\/api\/orders\/(\d+)$/);
  if (patch && method === 'PATCH') {
    try {
      const { status } = await readBody(req);
      db.updateStatus(Number(patch[1]), status || 'new');
      return json(res, 200, { success: true });
    } catch { return json(res, 500, { error: 'Erreur serveur' }); }
  }

  // Static files — serve from frontend/
  let filePath = path.join(FRONTEND, route === '/' ? 'index.html' : route);
  if (!filePath.startsWith(FRONTEND)) { res.writeHead(403); res.end('Forbidden'); return; }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())
    filePath = path.join(filePath, 'index.html');

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`\n  SELVERINE · http://localhost:${PORT}\n`);
});
