const http = require('http');
const fs   = require('fs');
const path = require('path');
const db   = require('./database');

const PORT   = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'frontend');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method.toUpperCase();
  const route  = url.pathname;

  // ── CORS for local dev ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API: POST /api/orders ──
  if (route === '/api/orders' && method === 'POST') {
    try {
      const body = await readBody(req);
      const { name, phone, city, bundle = 1, total = 0, ref } = body;
      if (!name?.trim() || !phone?.trim() || !city?.trim()) {
        return json(res, 400, { error: 'Champs requis manquants' });
      }
      const order = db.createOrder({ name: name.trim(), phone: phone.trim(), city: city.trim(), bundle: Number(bundle), total: Number(total), ref });
      console.log(`[ORDER] #${order.ref} — ${name} — ${city} — ${total} DH`);
      return json(res, 201, { success: true, id: order.id, ref: order.ref });
    } catch (err) {
      console.error('[POST /api/orders]', err.message);
      return json(res, 500, { error: 'Erreur serveur' });
    }
  }

  // ── API: GET /api/orders ──
  if (route === '/api/orders' && method === 'GET') {
    return json(res, 200, db.getAllOrders());
  }

  // ── API: PATCH /api/orders/:id ──
  const patchMatch = route.match(/^\/api\/orders\/(\d+)$/);
  if (patchMatch && method === 'PATCH') {
    try {
      const body = await readBody(req);
      db.updateOrderStatus(Number(patchMatch[1]), body.status || 'new');
      return json(res, 200, { success: true });
    } catch (err) {
      return json(res, 500, { error: 'Erreur serveur' });
    }
  }

  // ── STATIC FILES ──
  let filePath = path.join(PUBLIC, route === '/' ? 'index.html' : route);

  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // If directory, serve index.html inside it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Try .html extension if file not found
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const withHtml = filePath + '.html';
    if (fs.existsSync(withHtml)) filePath = withHtml;
  }

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`\n  SELVERINE running at http://localhost:${PORT}\n`);
});
