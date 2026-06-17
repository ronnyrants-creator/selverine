import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'prisma', 'selverine.db');

mkdirSync(join(__dirname, '..', 'prisma'), { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Order" (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ref       TEXT    NOT NULL UNIQUE,
    name      TEXT    NOT NULL,
    phone     TEXT    NOT NULL,
    city      TEXT    NOT NULL,
    bundle    INTEGER NOT NULL DEFAULT 1,
    total     INTEGER NOT NULL DEFAULT 0,
    status    TEXT    NOT NULL DEFAULT 'new',
    createdAt DATETIME NOT NULL DEFAULT (datetime('now'))
  );
`);

db.close();
console.log('✅  Database ready at prisma/selverine.db');
