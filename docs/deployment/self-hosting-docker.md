# Self-Hosting BrumKit with Docker

This guide covers running the full BrumKit production stack (Next.js app + PostgreSQL + Redis)
on your own server using `docker-compose.full.yml`.

---

## Architecture Overview

```
                        ┌─────────────────────────────────┐
                        │  docker-compose.full.yml         │
                        │                                  │
  Client  ──HTTP──►     │  nginx / reverse-proxy (optional)│
                        │        │                         │
                        │        ▼                         │
                        │  ┌──────────┐   :3000            │
                        │  │  bk-app  │  (Next.js)         │
                        │  └────┬─────┘                    │
                        │       │                          │
                        │  ┌────┴────┐  ┌──────────┐      │
                        │  │postgres │  │  redis   │      │
                        │  │  :5432  │  │  :6379   │      │
                        │  └─────────┘  └──────────┘      │
                        └─────────────────────────────────┘
```

The app image is built from `apps/web/Dockerfile` using a multi-stage build
(prune → install → build → runner). The final image contains only the
Next.js standalone output and is based on `node:20-alpine`.

---

## Prerequisites

- Docker Engine >= 24 and Docker Compose V2 (`docker compose`, not `docker-compose`)
- A server with at least 1 GB RAM
- Ports 3000, 5432 (optional external), 6379 (optional external) available

---

## 1. Clone and Configure

```bash
git clone https://github.com/buildinclicks/brumkit.git
cd brumkit

# Create production env file from the template
cp .env.production.example .env.production
```

Edit `.env.production` and fill in all values:

```bash
# PostgreSQL
DATABASE_URL="postgresql://user:secure_password@postgres:5432/broom_kit_prod?sslmode=disable"
POSTGRES_USER=user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=broom_kit_prod

# Redis
REDIS_URL="redis://:your_redis_password@redis:6379"
REDIS_PASSWORD=your_redis_password

# Auth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# App URLs (baked into client bundle at build time)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
FROM_EMAIL="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"

# Cron
CRON_SECRET="$(openssl rand -base64 32)"
```

> **Note:** In `docker-compose.full.yml`, the app connects to Postgres and Redis using
> the Docker service hostnames (`postgres` and `redis`), not `localhost`.

---

## 2. Build the Application Image

`NEXT_PUBLIC_*` variables are baked into the client bundle at build time. Pass them as
Docker build arguments:

```bash
docker compose -f docker-compose.full.yml \
  --env-file .env.production \
  build \
  --build-arg NEXT_PUBLIC_APP_URL="$(grep NEXT_PUBLIC_APP_URL .env.production | cut -d= -f2)" \
  --build-arg NEXT_PUBLIC_API_URL="$(grep NEXT_PUBLIC_API_URL .env.production | cut -d= -f2)"
```

Or export them first:

```bash
export $(grep -E "^NEXT_PUBLIC_" .env.production | xargs)
docker compose -f docker-compose.full.yml --env-file .env.production build
```

---

## 3. Run Database Migrations

Migrations must run **before** the app starts. Use the built image with a separate command:

```bash
# Start only the database service
docker compose -f docker-compose.full.yml --env-file .env.production up -d postgres

# Wait for Postgres to be healthy, then run migrations
docker run --rm \
  --network bk-network \
  -e DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d= -f2)" \
  brumkit-brumkit-web \
  node -e "require('child_process').execSync('pnpm --filter @repo/database db:migrate:deploy', { stdio: 'inherit' })"
```

Or if you have Node.js and pnpm available on the host:

```bash
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d= -f2)" \
  pnpm --filter @repo/database db:migrate:deploy
```

---

## 4. Start the Full Stack

```bash
docker compose -f docker-compose.full.yml --env-file .env.production up -d
```

The app will be available on **port 3000**. Set up a reverse proxy (nginx, Caddy, Traefik)
to handle TLS and forward to `localhost:3000`.

---

## 5. Docker Healthcheck Note

The production Dockerfile's runner stage uses `node:20-alpine`, which does **not** include
`wget` or `curl` by default. The healthcheck in `docker-compose.full.yml` uses `wget`. To
avoid healthcheck failures, either:

**Option A — Install `wget` in the runner stage** (update `apps/web/Dockerfile`):

```dockerfile
FROM node:20-alpine AS runner
RUN apk add --no-cache wget
```

**Option B — Use `nc` (netcat) instead** (available in alpine):

```yaml
healthcheck:
  test: ['CMD-SHELL', 'nc -z localhost 3000 || exit 1']
```

**Option C — Use `/api/health` endpoint** (once wired in ops-hardening):

```yaml
healthcheck:
  test:
    [
      'CMD-SHELL',
      'wget -qO- http://localhost:3000/api/health | grep -q ok || exit 1',
    ]
```

---

## 6. Setting Up the Cron Job

BrumKit cleans up soft-deleted accounts daily via `GET /api/cron/cleanup-deleted-accounts`.
With self-hosting, trigger this with a host-level cron job instead of Vercel Cron:

```bash
# Add to crontab (crontab -e)
0 2 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/cleanup-deleted-accounts
```

Or use a Docker-internal scheduled container (e.g. `ofelia`).

---

## 7. Updating BrumKit

```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild the image (with updated NEXT_PUBLIC_* if changed)
docker compose -f docker-compose.full.yml --env-file .env.production build

# 3. Run any new migrations
DATABASE_URL="..." pnpm --filter @repo/database db:migrate:deploy

# 4. Restart with zero-downtime (replace the app container)
docker compose -f docker-compose.full.yml --env-file .env.production up -d --no-deps app
```

---

## 8. Port Reference

| Service                    | Internal port | Default external port  |
| -------------------------- | :-----------: | ---------------------- |
| Next.js app (`bk-app`)     |     3000      | 3000                   |
| PostgreSQL (`bk-postgres`) |     5432      | not exposed by default |
| Redis (`bk-redis`)         |     6379      | not exposed by default |
| Local dev (`pnpm dev`)     |     4000      | 4000                   |

The production Compose file does not expose Postgres or Redis externally.
Connect to them from the host only via `docker exec` if needed.

---

## Troubleshooting

**App container keeps restarting**

- Check logs: `docker compose -f docker-compose.full.yml logs app`
- Verify `DATABASE_URL` and `NEXTAUTH_SECRET` are set and correct
- Confirm migrations ran successfully

**`pnpm: command not found` in migration step**

- Use the DB migration approach via the built image (see Step 3) rather than host pnpm
- The production runner image contains only the standalone Next.js output and does not have pnpm

**Healthcheck failing (`wget` not found)**

- See Section 5 above for options to fix the healthcheck
