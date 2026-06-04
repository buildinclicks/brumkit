# Self-Hosting BrumKit with Docker

This guide walks you through deploying BrumKit on your own infrastructure using Docker and Docker Compose.

---

## Prerequisites

| Requirement                                                | Minimum Version | Notes                                                    |
| ---------------------------------------------------------- | --------------- | -------------------------------------------------------- |
| [Docker Engine](https://docs.docker.com/engine/install/)   | 24+             | Docker Desktop 4.x includes this                         |
| [Docker Compose](https://docs.docker.com/compose/install/) | v2+             | Bundled with Docker Desktop                              |
| PostgreSQL                                                 | 16+             | Managed (Neon, Supabase, RDS) or self-hosted via compose |
| Redis                                                      | 7+              | Upstash, Redis Cloud, or self-hosted via compose         |
| [Resend](https://resend.com) API key                       | —               | For transactional email                                  |

---

## Architecture

```
                ┌─────────────────────┐
                │   brumkit-web:latest │  (Next.js 15 standalone)
                │   node:20-alpine     │
                │   Port 3000          │
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌──────────────────┐      ┌──────────────────┐
   │  PostgreSQL 16   │      │   Redis 7         │
   │  (bk-postgres)   │      │   (bk-redis)      │
   └──────────────────┘      └──────────────────┘
```

All services share the `bk-network` bridge network.

---

## Step 1 — Clone the repository

```bash
git clone https://github.com/buildinclicks/brumkit.git
cd brumkit
```

---

## Step 2 — Configure environment variables

Copy the production example and fill in real values:

```bash
cp .env.production.example .env.production
```

Open `.env.production` and set every variable:

```dotenv
# Database — PostgreSQL connection string (with sslmode=require for managed DBs)
DATABASE_URL="postgresql://user:password@db.example.com:5432/broom_kit_prod?sslmode=require"

# Auth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"   # generate a strong secret

# Redis
REDIS_URL="rediss://default:password@your-redis-host:6380"

# Email (Resend)
RESEND_API_KEY="re_your_resend_api_key"
FROM_EMAIL="noreply@your-domain.com"
ADMIN_EMAIL="admin@your-domain.com"

# Cron secret — protects the cleanup endpoint
CRON_SECRET="$(openssl rand -base64 32)"

# Public URLs — baked into the client bundle at build time
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_API_URL="https://your-domain.com/api"

NODE_ENV="production"
```

> **Security:** Never commit `.env.production` to version control. It is listed in `.gitignore`.

---

## Step 3 — Run database migrations

Migrations must be applied before starting the application for the first time (and after each release that contains schema changes).

### Option A — Against a managed database (recommended)

```bash
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  -v "$(pwd)":/app \
  -w /app \
  node:20-alpine \
  sh -c "npm install -g pnpm@10.0.0 && pnpm --filter @repo/database db:migrate:deploy"
```

### Option B — Against the compose-managed PostgreSQL

Start only the database first, then run migrations:

```bash
docker compose -f docker-compose.full.yml --env-file .env.production up -d postgres

docker compose -f docker-compose.full.yml --env-file .env.production run --rm app \
  pnpm --filter @repo/database db:migrate:deploy
```

---

## Step 4 — Build and start the full stack

```bash
docker compose -f docker-compose.full.yml --env-file .env.production up -d
```

This starts:

- **`app`** — BrumKit web application on port `3000`
- **`postgres`** — PostgreSQL 16 (if not using a managed DB)
- **`redis`** — Redis 7 (if not using a managed Redis)

Check that all services are healthy:

```bash
docker compose -f docker-compose.full.yml ps
```

Tail the application logs:

```bash
docker compose -f docker-compose.full.yml logs -f app
```

---

## Step 5 — Verify the deployment

```bash
# Health check — should return HTTP 200 with a JSON list of providers
curl http://localhost:3000/api/auth/providers

# Or, if behind a reverse proxy:
curl https://your-domain.com/api/auth/providers
```

---

## Vercel Cron Alternative

BrumKit ships a `vercel.json` that schedules the account-cleanup job on Vercel. For self-hosted deployments you need an external scheduler to call the same endpoint.

### What it does

`GET /api/cron/cleanup-deleted-accounts` permanently removes user accounts that were soft-deleted more than 30 days ago. It must be called with a `Bearer` token matching `CRON_SECRET`.

### Option A — System cron (Linux/macOS)

Add a crontab entry that runs at 02:00 UTC every day:

```cron
0 2 * * * curl -s -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/cleanup-deleted-accounts \
  >> /var/log/brumkit-cron.log 2>&1
```

### Option B — Docker `ofelia` scheduler (containerised)

Add the [ofelia](https://github.com/mcuadros/ofelia) service to your compose file:

```yaml
ofelia:
  image: mcuadros/ofelia:latest
  depends_on:
    - app
  command: daemon --docker
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  labels:
    ofelia.job-run.cleanup.schedule: '0 2 * * *'
    ofelia.job-run.cleanup.container: bk-app
    ofelia.job-run.cleanup.command: >
      wget -q -O-
      --header="Authorization: Bearer ${CRON_SECRET}"
      http://localhost:3000/api/cron/cleanup-deleted-accounts
```

### Option C — External scheduler (Render Cron Jobs, Railway Cron, EasyCron)

Configure a HTTP cron job to make a `GET` request to:

```
https://your-domain.com/api/cron/cleanup-deleted-accounts
```

With header:

```
Authorization: Bearer <CRON_SECRET>
```

Schedule: `0 2 * * *` (daily at 02:00 UTC).

---

## Updating

Pull the latest image and recreate the container in-place:

```bash
git pull origin main
docker compose -f docker-compose.full.yml --env-file .env.production pull
docker compose -f docker-compose.full.yml --env-file .env.production up -d --build
```

Run migrations if the release includes schema changes:

```bash
docker compose -f docker-compose.full.yml --env-file .env.production run --rm app \
  pnpm --filter @repo/database db:migrate:deploy
```

---

## Environment Variable Reference

| Variable              | Required | Description                                               |
| --------------------- | -------- | --------------------------------------------------------- |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string                              |
| `NEXTAUTH_SECRET`     | Yes      | Secret for session encryption (`openssl rand -base64 32`) |
| `NEXTAUTH_URL`        | Yes      | Canonical URL of your deployment                          |
| `REDIS_URL`           | Yes      | Redis connection string                                   |
| `RESEND_API_KEY`      | Yes      | Resend API key for transactional email                    |
| `FROM_EMAIL`          | Yes      | Sender address for transactional email                    |
| `ADMIN_EMAIL`         | Yes      | Administrator email address                               |
| `CRON_SECRET`         | Yes      | Bearer token for cron endpoints                           |
| `NEXT_PUBLIC_APP_URL` | Yes      | Public application URL (baked into client bundle)         |
| `NEXT_PUBLIC_API_URL` | No       | Public API base URL (defaults to `APP_URL/api`)           |
| `NODE_ENV`            | Yes      | Set to `production`                                       |

---

## Troubleshooting

### Container exits immediately

```bash
docker compose -f docker-compose.full.yml logs app
```

Common causes:

- Missing required environment variables (`NEXTAUTH_SECRET`, `DATABASE_URL`)
- Database unreachable (check `DATABASE_URL` and network connectivity)

### Port 3000 already in use

Change the host port in `docker-compose.full.yml`:

```yaml
ports:
  - '8080:3000' # map host:8080 → container:3000
```

### Database migration fails

Ensure `DATABASE_URL` points to the correct database and the user has `CREATE TABLE` / `ALTER TABLE` privileges.

---

## Related

- [Vercel Deployment Guide](vercel-deployment-guide.md)
- [Docker Compose reference](https://docs.docker.com/compose/)
- [Auth.js self-hosting](https://authjs.dev/getting-started/deployment)
