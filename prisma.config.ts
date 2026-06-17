import path from 'path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrate: {
    url: `file:${path.join(process.cwd(), 'prisma', 'selverine.db')}`,
    async adapter() {
      const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
      const dbPath = path.join(process.cwd(), 'prisma', 'selverine.db');
      return new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    },
  },
});
