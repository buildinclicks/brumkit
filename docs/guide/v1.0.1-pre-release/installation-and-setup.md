# BrumKit — Installation & Setup Guide

**Version:** v1.0.1 pre-release  
**Last updated:** June 2026

This guide walks you through setting up BrumKit on your machine from scratch. You can run the application **manually** (Node.js on your host with Docker only for infrastructure) or **fully containerized** (app + database + Redis via Docker Compose).

---

## Table of contents

1. [What you are setting up](#1-what-you-are-setting-up)
2. [Prerequisites](#2-prerequisites)
3. [Clone the repository](#3-clone-the-repository)
4. [Environment variables](#4-environment-variables)
5. [Option A — Manual setup (recommended for development)](#5-option-a--manual-setup-recommended-for-development)
6. [Option B — Docker setup](#6-option-b--docker-setup)
7. [Verify your installation](#7-verify-your-installation)
8. [Test accounts (after seeding)](#8-test-accounts-after-seeding)
9. [Troubleshooting](#9-troubleshooting)
10. [Related documentation](#10-related-documentation)

---

## 1. What you are setting up

BrumKit is a **Turborepo monorepo**. The pieces you need locally are:

| Component                    | Purpose                       | How it runs locally                                                   |
| ---------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| **PostgreSQL 16**            | Primary database (Prisma)     | Docker (`docker-compose.yml`) or your own Postgres                    |
| **Redis 7**                  | Rate limiting / caching       | Docker (`docker-compose.yml`) or your own Redis                       |
| **Mailhog**                  | Catches outbound email in dev | Docker (`docker-compose.yml`)                                         |
| **Next.js app** (`apps/web`) | Web UI + API                  | `pnpm dev:web` on your machine, or Docker (`docker-compose.full.yml`) |

**Two common workflows:**

- **Manual dev:** Docker runs Postgres, Redis, and Mailhog; you run the Next.js app with `pnpm dev:web` on port **4000**.
- **Full Docker:** `docker-compose.full.yml` runs the production-built app plus Postgres and Redis (no Mailhog — use [Resend](https://resend.com) for email).

---

## 2. Prerequisites

Install the following before you begin.

| Tool                                                       | Minimum version | Notes                                             |
| ---------------------------------------------------------- | --------------- | ------------------------------------------------- |
| [Node.js](https://nodejs.org/)                             | **20.19.0**     | Required by `package.json` `engines`              |
| [pnpm](https://pnpm.io/)                                   | **10.0.0**      | Monorepo package manager (`packageManager` field) |
| [Git](https://git-scm.com/)                                | Latest          | Clone and contribute                              |
| [Docker Engine](https://docs.docker.com/engine/install/)   | **24+**         | Docker Desktop 4.x is fine                        |
| [Docker Compose](https://docs.docker.com/compose/install/) | **v2+**         | Bundled with Docker Desktop                       |

Optional but useful:

- **OpenSSL** (or similar) to generate secrets: `openssl rand -base64 32`
- **curl** for health checks

Check versions:

```bash
node -v    # v20.19.0 or higher
pnpm -v    # 10.0.0 or higher
docker -v
docker compose version
```

---

## 3. Clone the repository

```bash
git clone https://github.com/buildinclicks/brumkit.git
cd brumkit
```

Install all workspace dependencies from the **repository root**:

```bash
pnpm install
```

This installs `apps/web` and every `packages/*` workspace package.

---

## 4. Environment variables

BrumKit uses environment files that are **not committed** to git (see `.gitignore`). You start from the checked-in templates.

### 4.1 Create your development env files

From the repo root:

```bash
cp .env.development.example .env.development
cp .env.development packages/database/.env
cp .env.development apps/web/.env.local
```

| File                     | Who reads it                                                                 |
| ------------------------ | ---------------------------------------------------------------------------- |
| `.env.development`       | Docker Compose (`--env-file`) — Postgres/Redis/Mailhog ports and credentials |
| `packages/database/.env` | Prisma CLI (`db:migrate`, `db:seed`, `db:studio`)                            |
| `apps/web/.env.local`    | Next.js dev server (`pnpm dev:web`)                                          |

> **Why three copies?** Docker Compose reads the root file; Prisma runs from `packages/database`; Next.js loads env from `apps/web`. Keeping them in sync avoids “works in migrate but not in the app” issues.

### 4.2 Generate secrets (required)

Open `.env.development` (and sync the same values into `packages/database/.env` and `apps/web/.env.local` if you edit only one file).

Replace placeholder secrets:

```bash
# Run twice — once for NEXTAUTH_SECRET, once for CRON_SECRET
openssl rand -base64 32
```

Set:

- `NEXTAUTH_SECRET` — session/JWT encryption (Auth.js)
- `CRON_SECRET` — protects `/api/cron/cleanup-deleted-accounts`

### 4.3 Align URLs and ports for local development

The dev server runs on **port 4000** (`apps/web/package.json`). Update these in all three env files if your template still shows `3000`:

```env
NEXT_PUBLIC_APP_URL="http://localhost:4000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXTAUTH_URL="http://localhost:4000"
```

### 4.4 Align database connection with Docker Postgres

The example maps Postgres to host port **5433** by default (`POSTGRES_PORT=5433`) so it does not clash with a local Postgres on 5432. Your `DATABASE_URL` **must use the same port**:

```env
POSTGRES_PORT=5433
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/broom_kit"
```

If you change `POSTGRES_PORT`, update `DATABASE_URL` to match.

### 4.5 Redis URL (password must match Docker)

```env
REDIS_PASSWORD=redis_secret
REDIS_URL="redis://:redis_secret@localhost:6379"
```

The password in `REDIS_URL` must match `REDIS_PASSWORD` in the same file (used by `docker-compose.yml`).

### 4.6 Environment variable reference

#### Application

| Variable              | Required (dev) | Purpose                                                          |
| --------------------- | -------------- | ---------------------------------------------------------------- |
| `NODE_ENV`            | Yes            | `development` locally; `production` in Docker full stack         |
| `NEXT_PUBLIC_APP_URL` | Yes            | Public app URL baked into client bundle at **build** time        |
| `NEXT_PUBLIC_API_URL` | Yes            | Base URL for client-side API calls (defaults to `{APP_URL}/api`) |

#### Database

| Variable            | Required (dev) | Purpose                                                     |
| ------------------- | -------------- | ----------------------------------------------------------- |
| `DATABASE_URL`      | Yes            | PostgreSQL connection string for Prisma and the app         |
| `POSTGRES_USER`     | Docker only    | Postgres superuser inside container (default: `postgres`)   |
| `POSTGRES_PASSWORD` | Docker only    | Postgres password inside container                          |
| `POSTGRES_DB`       | Docker only    | Database name created on first start (default: `broom_kit`) |
| `POSTGRES_PORT`     | Docker only    | **Host** port mapped to container `5432`                    |

#### Authentication (Auth.js)

| Variable          | Required (dev) | Purpose                                                    |
| ----------------- | -------------- | ---------------------------------------------------------- |
| `NEXTAUTH_URL`    | Yes            | Canonical URL of the app (callbacks, email links)          |
| `NEXTAUTH_SECRET` | Yes            | Encrypts sessions; generate with `openssl rand -base64 32` |

#### Redis / rate limiting

| Variable                   | Required (dev) | Purpose                                       |
| -------------------------- | -------------- | --------------------------------------------- |
| `REDIS_URL`                | Yes (dev)      | Local Redis for rate limiting (`ioredis`)     |
| `REDIS_PASSWORD`           | Docker only    | Redis `requirepass` in compose                |
| `REDIS_PORT`               | Docker only    | Host port mapped to Redis `6379`              |
| `UPSTASH_REDIS_REST_URL`   | Production     | Upstash REST URL (alternative to local Redis) |
| `UPSTASH_REDIS_REST_TOKEN` | Production     | Upstash REST token                            |

In **development**, the app prefers local Redis when `NODE_ENV=development` or `REDIS_URL` is set. In **production**, Upstash is used when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set and `NODE_ENV` is not `development`.

#### Email

| Variable            | Required (dev) | Purpose                                                                          |
| ------------------- | -------------- | -------------------------------------------------------------------------------- |
| `MAILHOG_HOST`      | Dev            | SMTP host for Mailhog (default: `localhost`)                                     |
| `MAILHOG_PORT`      | Dev            | SMTP port (default: `1025`)                                                      |
| `MAILHOG_SMTP_PORT` | Docker only    | Host port for Mailhog SMTP                                                       |
| `MAILHOG_UI_PORT`   | Docker only    | Host port for Mailhog web UI (default: `8025`)                                   |
| `FROM_EMAIL`        | Yes            | Sender address on outgoing mail                                                  |
| `ADMIN_EMAIL`       | Yes            | Administrator contact for system emails                                          |
| `RESEND_API_KEY`    | Production     | Resend API key when `NODE_ENV=production`                                        |
| `USE_MAILHOG`       | No             | Documented in templates; dev email uses Mailhog when `NODE_ENV !== 'production'` |

View captured emails: [http://localhost:8025](http://localhost:8025) (Mailhog UI).

#### Cron / maintenance

| Variable      | Required (dev) | Purpose                                                   |
| ------------- | -------------- | --------------------------------------------------------- |
| `CRON_SECRET` | Yes            | Bearer token for `GET /api/cron/cleanup-deleted-accounts` |

#### Production-only (`.env.production`)

Copy `.env.production.example` to `.env.production` when using the full Docker stack or deploying. See [Self-Hosting with Docker](../../deployment/self-hosting-docker.md) for production values.

---

## 5. Option A — Manual setup (recommended for development)

Use Docker **only for infrastructure**. Run the Next.js app on your machine for fast hot reload.

### Step 1 — Start infrastructure with Docker

From the repo root:

```bash
docker compose --env-file .env.development up -d
```

This starts:

| Service    | Container     | Default host ports                               |
| ---------- | ------------- | ------------------------------------------------ |
| PostgreSQL | `bk-postgres` | `5433` → 5432 (configurable via `POSTGRES_PORT`) |
| Redis      | `bk-redis`    | `6379`                                           |
| Mailhog    | `bk-mailhog`  | SMTP `1025`, UI `8025`                           |

Wait until services are healthy:

```bash
docker compose ps
```

All services should show `healthy` (may take ~30 seconds on first run).

**Stop infrastructure when done:**

```bash
docker compose --env-file .env.development down
```

**Stop and remove volumes (deletes DB data):**

```bash
docker compose --env-file .env.development down -v
```

### Step 2 — Generate Prisma client

```bash
pnpm --filter @repo/database db:generate
```

### Step 3 — Run database migrations

```bash
pnpm --filter @repo/database db:migrate
```

On first run, Prisma creates migration history and applies all migrations.

### Step 4 — Seed the database (optional but recommended)

```bash
pnpm --filter @repo/database db:seed
```

Creates demo users and notifications. See [Test accounts](#8-test-accounts-after-seeding).

### Step 5 — Start the development server

```bash
pnpm dev:web
```

Or from the root (starts all packages that define `dev`; web is the main app):

```bash
pnpm dev
```

Open the app: **[http://localhost:4000](http://localhost:4000)**

### Step 6 — Optional: Prisma Studio

Inspect or edit data in a GUI:

```bash
pnpm --filter @repo/database db:studio
```

Opens [http://localhost:5555](http://localhost:5555).

### Manual production build (without Docker app image)

```bash
pnpm build
pnpm --filter web start
```

The `web` package `build` script runs migrations deploy + Prisma generate + `next build`. Ensure `DATABASE_URL` points to a reachable database before building.

---

## 6. Option B — Docker setup

BrumKit provides two Compose files:

| File                      | What it runs                                   | Typical use                                                                                       |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `docker-compose.yml`      | Postgres, Redis, Mailhog only                  | Local dev with `pnpm dev:web` ([Option A](#5-option-a--manual-setup-recommended-for-development)) |
| `docker-compose.full.yml` | Postgres, Redis, **and** the Next.js app image | Self-hosted production / staging                                                                  |

### 6.1 Docker infrastructure only (same as Option A Step 1)

Already covered in [Step 1 — Start infrastructure](#step-1--start-infrastructure-with-docker).

Verify connectivity (optional):

```bash
node scripts/test-docker-services.js
```

Run with `NODE_ENV=development` from the repo root after `pnpm install`.

### 6.2 Full stack — app + Postgres + Redis in Docker

For a **production-like** run where the app itself is containerized.

#### Step 1 — Configure production environment

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with real values. Generate secrets:

```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -base64 32   # CRON_SECRET
```

**Important — internal service hostnames**

When the app runs **inside** Docker Compose, use Docker service names instead of `localhost`:

```env
# Example when using compose-managed Postgres and Redis
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/broom_kit"
REDIS_URL="redis://:redis_secret@redis:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="production"
RESEND_API_KEY="re_your_key"
FROM_EMAIL="noreply@your-domain.com"
ADMIN_EMAIL="admin@your-domain.com"
```

Mailhog is **not** included in the full stack; set `RESEND_API_KEY` for transactional email.

#### Step 2 — Start Postgres and Redis first

```bash
docker compose -f docker-compose.full.yml --env-file .env.production up -d postgres redis
```

Wait until both are `healthy`:

```bash
docker compose -f docker-compose.full.yml ps
```

#### Step 3 — Run database migrations (first time and after schema changes)

```bash
docker compose -f docker-compose.full.yml --env-file .env.production run --rm app \
  pnpm --filter @repo/database db:migrate:deploy
```

Or against a managed database from your host (no app container yet):

```bash
export $(grep -v '^#' .env.production | xargs)
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  -v "$(pwd)":/app \
  -w /app \
  node:20-alpine \
  sh -c "npm install -g pnpm@10.0.0 && pnpm --filter @repo/database db:migrate:deploy"
```

#### Step 4 — Build and start the full stack

```bash
docker compose -f docker-compose.full.yml --env-file .env.production up -d --build
```

Services:

| Service    | Container     | Port                             |
| ---------- | ------------- | -------------------------------- |
| `app`      | `bk-app`      | Host `3000` → container `3000`   |
| `postgres` | `bk-postgres` | From `POSTGRES_PORT` in env file |
| `redis`    | `bk-redis`    | From `REDIS_PORT` in env file    |

Follow logs:

```bash
docker compose -f docker-compose.full.yml logs -f app
```

#### Step 5 — Health check

```bash
curl -s http://localhost:3000/api/auth/providers
```

Expect HTTP **200** with a JSON list of auth providers.

#### Updating the full stack

```bash
git pull origin main
docker compose -f docker-compose.full.yml --env-file .env.production up -d --build
```

Re-run migrations if the release includes schema changes (see Step 3).

#### Cron job (self-hosted)

Account cleanup runs via `GET /api/cron/cleanup-deleted-accounts` with header `Authorization: Bearer <CRON_SECRET>`. See [Self-Hosting with Docker](../../deployment/self-hosting-docker.md#vercel-cron-alternative) for cron alternatives.

#### Build the Docker image only (CI / smoke test)

```bash
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000/api \
  -t brumkit-web:local .
```

`NEXT_PUBLIC_*` values are **baked in at image build time**. Rebuild the image if your public URL changes.

---

## 7. Verify your installation

### Development (manual)

| Check            | Command / action                                    | Expected                                               |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------ |
| Docker services  | `docker compose ps`                                 | `postgres`, `redis`, `mailhog` healthy                 |
| App loads        | Open [http://localhost:4000](http://localhost:4000) | Home or auth page loads                                |
| Register / login | Create account or use seed credentials              | Redirect to dashboard                                  |
| Email            | Trigger password reset or verification              | Message appears in [Mailhog UI](http://localhost:8025) |
| Auth API         | `curl -s http://localhost:4000/api/auth/providers`  | HTTP 200                                               |

### Full Docker stack

| Check        | Command / action                                   | Expected                           |
| ------------ | -------------------------------------------------- | ---------------------------------- |
| All services | `docker compose -f docker-compose.full.yml ps`     | `app`, `postgres`, `redis` healthy |
| Auth API     | `curl -s http://localhost:3000/api/auth/providers` | HTTP 200                           |

### Quality gates (contributors)

```bash
pnpm lint
pnpm type-check
pnpm test
```

---

## 8. Test accounts (after seeding)

After `pnpm --filter @repo/database db:seed`:

| Role               | Email                    | Password         |
| ------------------ | ------------------------ | ---------------- |
| Super Admin        | `superadmin@brumkit.com` | `SuperAdmin123!` |
| Admin              | `admin@brumkit.com`      | `Admin123!`      |
| Moderator          | `moderator@brumkit.com`  | `Moderator123!`  |
| Example user       | `user@example.com`       | `User123!`       |
| Other seeded users | `*.com` (faker emails)   | `User123!`       |

---

## 9. Troubleshooting

### `pnpm install` fails

- Confirm Node **≥ 20.19.0** and pnpm **≥ 10.0.0**.
- Enable Corepack if needed: `corepack enable && corepack prepare pnpm@10.0.0 --activate`.

### Cannot connect to database

1. Ensure Postgres container is running: `docker compose ps`.
2. Match `DATABASE_URL` host/port to `POSTGRES_PORT` in `.env.development`.
3. Test from host (replace port if needed):

   ```bash
   docker exec -it bk-postgres pg_isready -U postgres
   ```

4. Re-run migrations: `pnpm --filter @repo/database db:migrate`.

### Redis / rate limiting errors

1. Confirm `bk-redis` is healthy.
2. Verify `REDIS_URL` includes the password: `redis://:redis_secret@localhost:6379`.
3. Install is already in the monorepo; if you see `ioredis` errors, run `pnpm install` from the root.

### Emails not sending in development

- Mailhog is used when `NODE_ENV` is not `production`.
- Open [http://localhost:8025](http://localhost:8025).
- Ensure `docker compose` started the `mailhog` service.
- For production Docker, configure `RESEND_API_KEY` (see [email setup](../../setup/email-password-reset-setup.md)).

### Next.js does not see env variables

- Confirm `apps/web/.env.local` exists and matches root `.env.development`.
- Restart `pnpm dev:web` after changing env files.
- `NEXT_PUBLIC_*` changes require a dev server restart (they are inlined at build time).

### Port already in use

- **4000:** Another process is using the dev port — stop it or change `apps/web` `dev` script port.
- **5433 / 6379:** Change `POSTGRES_PORT` / `REDIS_PORT` in `.env.development` and update `DATABASE_URL` / `REDIS_URL`.

### Docker full stack: app exits immediately

```bash
docker compose -f docker-compose.full.yml logs app
```

Common causes: missing `NEXTAUTH_SECRET`, wrong `DATABASE_URL` (use `postgres` hostname inside compose), or migrations not applied.

### Prisma client out of date after schema pull

```bash
pnpm --filter @repo/database db:generate
```

---

## 10. Related documentation

- [README — Getting Started](../../../README.md)
- [CONTRIBUTING — Development setup](../../../CONTRIBUTING.md)
- [Self-Hosting with Docker](../../deployment/self-hosting-docker.md)
- [Email & password reset setup](../../setup/email-password-reset-setup.md)
- [Upstash Redis setup](../../setup/upstash-redis-setup.md)
- [TDD & testing conventions](../../../.cursor/rules/tdd-testing.mdc)

---

**Built by [BuildInClicks](https://buildinclicks.com)** · MIT License
