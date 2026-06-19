# Web — Next.js 16 Application

The main full-stack application for BrumKit OSS.

## Features

- Authentication: email/password login, registration, password reset, email verification
- Dashboard: user overview, role-based permissions display, account management
- Profile Management: name/username/bio, change password, change email, delete account
- Notifications: in-app notification list with read/unread tracking
- Rate limiting on all sensitive actions via Redis

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 6 (strict mode)
- Tailwind CSS v4
- Auth.js v5
- Prisma 7 ORM
- React Hook Form + Zod

## Getting Started

### Prerequisites

1. Node.js >= 20.19.0 and pnpm >= 10.0.0
2. Docker (for PostgreSQL + Redis + Mailhog)

### Environment Setup

BrumKit uses **three separate env file locations**. Copy the root example to all three:

```bash
# 1. Root — used by Docker Compose for infrastructure vars (POSTGRES_*, REDIS_*, MAILHOG_*)
cp ../../.env.development.example ../../.env.development

# 2. Prisma CLI — used when running migrations, seed, studio from packages/database
cp ../../.env.development.example ../../packages/database/.env

# 3. Next.js — REQUIRED; Next.js only reads env files from the app directory
cp ../../.env.development.example .env.local
```

Key values to update in `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/broom_kit
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=replace-me-with-openssl-rand-base64-32
REDIS_URL=redis://:redis_secret@localhost:6379
FROM_EMAIL=noreply@brumkit.local
```

See the root `.env.development.example` for the full variable list.

### Running the App

```bash
# From the monorepo root — starts all packages
pnpm dev

# Or for this package only
pnpm dev:web
```

The app runs at http://localhost:4000.

## Project Structure

```
apps/web/
├── app/
│   ├── (auth)/                 # Authentication pages (public)
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── forgot-password/    # Password reset request
│   │   ├── reset-password/     # Password reset with token
│   │   ├── verify-email/       # Email verification landing
│   │   ├── verify-email-change/ # Email change verification
│   │   └── layout.tsx          # Auth layout
│   ├── (dashboard)/            # Dashboard pages (protected)
│   │   ├── dashboard/          # Main dashboard
│   │   ├── notifications/      # Notification list
│   │   ├── profile/            # Profile management
│   │   └── layout.tsx          # Dashboard layout (auth enforced here)
│   ├── actions/                # Server actions
│   │   ├── auth.ts             # Auth actions (register, login, reset)
│   │   ├── email-change.ts     # Email change flow
│   │   ├── account-deletion.ts # Account deletion
│   │   ├── notification.ts     # Notification actions
│   │   └── user.ts             # User profile updates
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/  # Auth.js API routes
│   │   │   └── register/       # REST registration endpoint
│   │   ├── cron/
│   │   │   └── cleanup-deleted-accounts/ # Scheduled deletion
│   │   └── user/
│   │       └── profile/        # Profile update endpoint
│   ├── global.css              # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── providers.tsx           # Client providers
├── components/                 # Shared UI components
├── docs/                       # Documentation
│   └── SCHEDULED_DELETION.md  # Cron job documentation
├── lib/
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Business logic services
│   └── utils/                  # Utility functions
├── messages/
│   └── en.json                 # i18n message keys
├── proxy.ts                    # Next.js 16 route guard (optimistic redirects)
├── vercel.json                 # Vercel cron configuration
├── next.config.js
└── tsconfig.json
```

### Route Protection Architecture

BrumKit uses **defense-in-depth** for auth:

1. `proxy.ts` — lightweight optimistic redirects (replaces deprecated `middleware.ts` per Next.js 16)
2. `(dashboard)/layout.tsx` — server-side `auth()` + `redirect('/login')` (primary enforcement)
3. Server actions — each action calls `auth()` or `getCurrentUser()` independently

The proxy is **not** the security boundary. It provides UX redirects before page render; layouts and server actions are the real gate.

## Security Features

- **Rate Limiting**: Redis-based on register, login, password reset, email change, account deletion
- **Email enumeration prevention**: password reset returns success even for unknown addresses
- **Soft delete with grace period**: 30-day recovery window before permanent deletion
- **Cron protection**: `CRON_SECRET` bearer token (required in production)

## Package Integration

| Package            | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| `@repo/auth`       | Auth.js v5 instance, CASL permissions, proxy helper     |
| `@repo/database`   | Prisma 7 client                                         |
| `@repo/email`      | Email templates and sending (Mailhog dev / Resend prod) |
| `@repo/rate-limit` | Redis rate limiting                                     |
| `@repo/ui`         | shadcn/ui components                                    |
| `@repo/validation` | Zod schemas                                             |
| `@repo/types`      | Shared TypeScript types                                 |
| `@repo/utils`      | Utility functions                                       |

## Troubleshooting

### Database connection errors

1. Start infrastructure: `docker compose --env-file .env.development up -d`
2. Confirm `DATABASE_URL` in `.env.local` uses port `5433` (Docker maps to this port)
3. Run migrations: `pnpm --filter @repo/database db:migrate`

### Auth.js / session errors

1. Confirm `NEXTAUTH_SECRET` is set in **`apps/web/.env.local`** (not only in the root `.env.development`)
2. Confirm `NEXTAUTH_URL=http://localhost:4000` (app runs on port 4000, not 3000)

### Email not arriving

1. Start Mailhog: `docker compose --env-file .env.development up -d mailhog`
2. Open the Mailhog UI at http://localhost:8025

## License

MIT
