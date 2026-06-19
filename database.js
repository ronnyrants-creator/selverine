const Database = require('better-sqlite3');
const path = require('path');

// DB path is configurable so the host can point it at a persistent volume
// (e.g. DB_PATH=/data/selverine.db). Defaults to a file next to the app.
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'selverine.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ref       TEXT    UNIQUE NOT NULL,
    name      TEXT    NOT NULL,
    phone     TEXT    NOT NULL,
    city      TEXT    NOT NULL,
    bundle    INTEGER DEFAULT 1,
    total     INTEGER DEFAULT 0,
    status    TEXT    DEFAULT 'new',
    created_at DATETIME DEFAULT (datetime('now'))
  )
`);

module.exports = {
  createOrder(data) {
    const ref = data.ref || `SLV-${Date.now().toString(36).toUpperCase()}`;
    const stmt = db.prepare(`
      INSERT INTO orders (ref, name, phone, city, bundle, total, status)
      VALUES (@ref, @name, @phone, @city, @bundle, @total, 'new')
    `);
    const result = stmt.run({ ...data, ref });
    return { id: result.lastInsertRowid, ref };
  },

  getAllOrders() {
    return db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
  },

  getOrderById(id) {
    return db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
  },

  updateOrderStatus(id, status) {
    db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(status, id);
  },
};
