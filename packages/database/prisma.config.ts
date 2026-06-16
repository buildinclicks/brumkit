import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma CLI loads this config for generate/migrate/studio. `prisma generate`
// does not connect to the database, so a placeholder URL is used when DATABASE_URL
// is unset (e.g. CI type-check job before services start).
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5432/postgres';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
