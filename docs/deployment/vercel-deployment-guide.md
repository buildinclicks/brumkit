# Deploying BrumKit to Vercel

This guide covers deploying the `apps/web` Next.js application to Vercel.
BrumKit uses `output: 'standalone'` and is compatible with Vercel's managed Node.js runtime.

---

## Prerequisites

- A [Vercel](https://vercel.com) account
- A PostgreSQL database accessible from Vercel (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- An [Upstash Redis](https://upstash.com) instance (for rate limiting)
- A [Resend](https://resend.com) account with a verified sending domain

---

## 1. Import the Repository

1. Log in to Vercel and click **Add New → Project**.
2. Select your GitHub repository.
3. Set the **Framework Preset** to **Next.js**.
4. Set the **Root Directory** to `apps/web` (Vercel uses this as the build context).

---

## 2. Configure Environment Variables

Go to **Project → Settings → Environment Variables** and add the following.

All variables marked **Build** must be set before the first build (they are baked into the client bundle at build time via `next.config.js`).

| Variable                   | Environment         | Notes                                                       |
| -------------------------- | ------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`      | Production, Preview | Build-time · Your public domain, e.g. `https://brumkit.com` |
| `NEXT_PUBLIC_API_URL`      | Production, Preview | Build-time · Usually `${NEXT_PUBLIC_APP_URL}/api`           |
| `DATABASE_URL`             | Production, Preview | Runtime · Include `?sslmode=require` for managed Postgres   |
| `NEXTAUTH_URL`             | Production, Preview | Runtime · Must match `NEXT_PUBLIC_APP_URL`                  |
| `NEXTAUTH_SECRET`          | Production, Preview | Runtime · Generate: `openssl rand -base64 32`               |
| `UPSTASH_REDIS_REST_URL`   | Production, Preview | Runtime · From Upstash dashboard                            |
| `UPSTASH_REDIS_REST_TOKEN` | Production, Preview | Runtime · From Upstash dashboard                            |
| `RESEND_API_KEY`           | Production          | Runtime · From Resend dashboard                             |
| `FROM_EMAIL`               | Production          | Runtime · Verified sender address                           |
| `ADMIN_EMAIL`              | Production          | Runtime · Admin notification recipient                      |
| `CRON_SECRET`              | Production          | Runtime · Generate: `openssl rand -base64 32`               |
| `NODE_ENV`                 | Production          | Set to `production`                                         |

> **Tip:** Use the Vercel CLI to bulk-import from your local `.env.production` file:
>
> ```bash
> vercel env add < .env.production
> ```

---

## 3. Run Migrations Before the First Deploy

BrumKit's Prisma migrations must be applied to your production database before the app starts.

```bash
# Using the Prisma CLI locally (DATABASE_URL must point to production)
DATABASE_URL="postgresql://..." pnpm --filter @repo/database db:migrate:deploy
```

Or add a [Vercel release command](https://vercel.com/docs/deployments/configure-a-build#release-command) in the Vercel dashboard:

```
pnpm --filter @repo/database db:migrate:deploy
```

---

## 4. Cron Jobs

BrumKit has one scheduled job: daily cleanup of soft-deleted accounts at 02:00 UTC.

The `apps/web/vercel.json` file configures this automatically:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-deleted-accounts",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Vercel will send a `GET` request with the header `Authorization: Bearer <CRON_SECRET>` each day.
Make sure `CRON_SECRET` is set in your environment variables.

---

## 5. Custom Domain

1. Go to **Project → Settings → Domains**.
2. Add your domain and configure DNS as instructed.
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to match the new domain.
4. Redeploy to bake the updated `NEXT_PUBLIC_APP_URL` into the client bundle.

---

## 6. Deployment Ports

| Environment                                    | Port                         |
| ---------------------------------------------- | ---------------------------- |
| Local dev (`pnpm dev`)                         | 4000                         |
| Vercel managed                                 | 443 (HTTPS) via Vercel proxy |
| Docker self-hosted (`docker-compose.full.yml`) | 3000                         |

There is no app-level port change needed for Vercel — the platform handles routing.

---

## 7. Verifying the Deployment

After deploying, confirm the following:

- `GET /api/auth/providers` returns `{"credentials":{...}}` (no 500)
- `POST /api/auth/register` with a valid payload returns 201
- `POST /api/auth/signin` with credentials redirects to `/dashboard`
- Cron endpoint: `curl -H "Authorization: Bearer <CRON_SECRET>" https://yourdomain.com/api/cron/cleanup-deleted-accounts`

---

## Troubleshooting

**"PrismaClientInitializationError: Can't reach database"**

- Confirm `DATABASE_URL` is set as a runtime env var (not build-time only)
- Confirm the DB allows connections from Vercel's IP ranges or is publicly accessible with SSL

**"Invalid environment variable NEXTAUTH_URL"**

- `NEXTAUTH_URL` must be the exact URL that users see in their browser address bar (including `https://`)

**Rate limiting not working in production**

- Confirm `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- The app falls back to allowing all traffic when Redis is unreachable; see `packages/rate-limit/src/redis-limiter.ts`
