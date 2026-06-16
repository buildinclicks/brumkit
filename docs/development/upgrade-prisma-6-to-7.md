# Upgrade: Prisma 6.x → 7.x

**Status:** Complete (Milestone 7, Sub-Track 2)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

Prisma 7 ships a Rust-free client with driver adapters, smaller bundles, and faster queries. BrumKit adopts the PostgreSQL adapter with direct TCP (local Docker / Neon).

## Breaking changes (upstream)

- Generator: `prisma-client-js` → `prisma-client` with required `output` path.
- `datasource url` moves to `prisma.config.ts`.
- `PrismaClient` requires a driver adapter (`@prisma/adapter-pg` for PostgreSQL).
- Client middleware (`$use`) removed — use Client Extensions.
- `migrate dev` no longer auto-runs `generate` or `seed`.

## Changes in this repo

### Schema (`packages/database/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

### Config (`packages/database/prisma.config.ts`)

- Database URL from `DATABASE_URL` via `prisma/config`.
- Seed script: `tsx prisma/seed.ts`.

### Client (`packages/database/src/client.ts`)

- Lazy singleton via `Proxy` (avoids `DATABASE_URL` at import time).
- `PrismaPg` adapter from `@prisma/adapter-pg`.

### Imports

- Types and client: `@repo/database` (re-exports generated client).
- Enums only (no DB connection): `@repo/database/enums`.

### Tests

- Integration tests use `postgresql://postgres:postgres@127.0.0.1:5433/broom_kit_test`.
- Run `DATABASE_URL=... pnpm exec prisma db push` before first test run.

## Commands for downstream users

```bash
pnpm add @prisma/client@^7.8.0 @prisma/adapter-pg@^7.8.0 pg
pnpm add -D prisma@^7.8.0 dotenv
pnpm --filter @repo/database db:generate
```

Reference: [Prisma 7 upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
