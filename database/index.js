const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'selverine.db'));

// Auto-create tables on first run
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    ref        TEXT     UNIQUE NOT NULL,
    name       TEXT     NOT NULL,
    phone      TEXT     NOT NULL,
    city       TEXT     NOT NULL,
    bundle     INTEGER  DEFAULT 1,
    total      INTEGER  DEFAULT 0,
    status     TEXT     DEFAULT 'new',
    created_at DATETIME DEFAULT (datetime('now'))
  )
`);

module.exports = {
  createOrder({ ref, name, phone, city, bundle, total }) {
    const orderRef = ref || `SLV-${Date.now().toString(36).toUpperCase()}`;
    const result = db.prepare(`
      INSERT INTO orders (ref, name, phone, city, bundle, total)
      VALUES (@ref, @name, @phone, @city, @bundle, @total)
    `).run({ ref: orderRef, name, phone, city, bundle, total });
    return { id: result.lastInsertRowid, ref: orderRef };
  },

  getAllOrders() {
    return db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
  },

  getOrderById(id) {
    return db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
  },

  updateStatus(id, status) {
    db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(status, id);
  },
};
