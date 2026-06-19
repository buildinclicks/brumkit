![BrumKit Banner](apps/web/public/images/brumkit_banner.png)

# 🚀 BrumKit - Open Source Edition (Lite)

**Version 2.0.1** (stable) | A production-ready Next.js 16 starter kit with authentication, authorization, and essential features. See [ROADMAP.md](ROADMAP.md) for what's planned next.

Start building your SaaS faster with our Next.js 16 + Prisma 7 + Tailwind CSS v4 starter kit.

👉 **Looking for a full-featured SaaS Starter Kit?** [Check out BrumKit Pro](#comparing-oss-vs-pro-version)

⭐️ **Why Developers Trust BrumKit:**

- 🏗️ **Production-grade architecture**: Scalable monorepo with Turborepo.
- 🔐 **Comprehensive Security**: Built-in RBAC and CASL-powered permissions.
- 🧪 **Strict Quality**: 80%+ test coverage requirement with Vitest.
- ⚡ **Modern Stack**: Next.js 16, Prisma 7, TypeScript 6, Tailwind CSS 4.
- 📦 **Type-Safe**: End-to-end TypeScript implementation.

---

## 🏗️ What's Included

### Core Architecture

- 📦 **Turborepo monorepo**: Optimized build system and pnpm workspaces.
- 🏗️ **Next.js 16 (App Router)**: The latest features of React server components.
- 🎨 **Shadcn UI + Tailwind 4**: Clean, modern, and highly customizable UI system.
- 🗄️ **PostgreSQL + Prisma**: Reliable and type-safe database management.
- 🔐 **Auth.js v5**: Robust authentication for Next.js applications.
- 🌐 **next-intl**: Full i18n support for global applications.

### Key Features

- 👤 **Complete Auth Flow**: Email/password, verification, and password reset.
- 🛡️ **RBAC Authorization**: Fine-grained permissions (USER, MODERATOR, ADMIN, SUPER_ADMIN).
- 👤 **User Profiles**: Profile management, avatar uploads, and account settings.
- 🔔 **Notifications**: Real-time ready notification system with read/unread tracking.
- 🚀 **Rate Limiting**: Redis-based protection for sensitive routes.
- 🛡️ **Defense-in-depth auth**: Next.js 16 `proxy.ts` for optimistic redirects; server layouts and actions enforce sessions.
- 🏥 **Health checks**: `/api/health` endpoint for Docker Compose, load balancers, and monitoring.
- 🐳 **Docker-Ready**: Local infrastructure and production self-hosting via Docker.
- 🔄 **Release automation**: Changesets versioning with GitHub Actions release pipeline.

---

## 🛠️ Technology Stack

BrumKit provides a rock-solid foundation for high-performance applications:

| Category       | Technology                                   | Description                                                            |
| -------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| **Framework**  | [Next.js 16](https://nextjs.org/)            | Modern React framework with App Router and Server Components.          |
| **Styling**    | [Tailwind CSS 4](https://tailwindcss.com/)   | A utility-first CSS framework for rapid UI development.                |
| **Database**   | [Prisma 7](https://www.prisma.io/)           | Type-safe ORM for Node.js and TypeScript.                              |
| **Auth**       | [Auth.js](https://authjs.dev/)               | Authentication for Next.js applications (formerly NextAuth).           |
| **Monorepo**   | [Turborepo](https://turbo.build/)            | High-performance build system for JavaScript and TypeScript codebases. |
| **Validation** | [Zod](https://zod.dev/)                      | TypeScript-first schema validation with static type inference.         |
| **State**      | [TanStack Query](https://tanstack.com/query) | Powerful asynchronous state management for TS/JS.                      |
| **Testing**    | [Vitest](https://vitest.dev/)                | Blazing fast unit test framework powered by Vite.                      |

---

## 📉 Comparing OSS vs Pro Version

BrumKit OSS is the **"Lite"** foundation, focused on the core authentication, authorization, and architectural essentials.

| Feature                     | OSS (Lite) | Pro Version |
| --------------------------- | ---------- | ----------- |
| **Authentication**          | ✅         | ✅          |
| **Authorization (RBAC)**    | ✅         | ✅          |
| **Global i18n**             | ✅         | ✅          |
| **Database (Prisma)**       | ✅         | ✅          |
| **Team Management**         | ❌         | ✅          |
| **Billing & Subscriptions** | ❌         | ✅          |
| **Advanced Admin Panel**    | ❌         | ✅          |
| **Priority Support**        | ❌         | ✅          |

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: >= 20.19.0
- **PNPM**: >= 10.0.0
- **Docker**: For running infrastructure (PostgreSQL, Redis)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/buildinclicks/brumkit.git
   cd brumkit
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   BrumKit uses **three separate env file locations** — each consumer reads from its own directory:

   ```bash
   # Root — Docker Compose infrastructure (POSTGRES_*, REDIS_*, MAILHOG_*)
   cp .env.development.example .env.development

   # Prisma CLI — migrations, seed, studio from packages/database
   cp .env.development.example packages/database/.env

   # Next.js — REQUIRED; Next.js only reads env files from apps/web/
   cp .env.development.example apps/web/.env.local
   ```

   > **Important:** The root `.env.development` is NOT loaded automatically by Next.js.
   > You must also copy it to `apps/web/.env.local` for the application to access
   > `DATABASE_URL`, `NEXTAUTH_*`, `REDIS_URL`, and other runtime variables.
   >
   > When you update a secret or URL, update **all three copies** (or use a symlink:
   > `ln -sf ../../.env.development apps/web/.env.local`).

4. **Start infrastructure (Docker):**

   ```bash
   docker compose --env-file .env.development up -d
   ```

5. **Run migrations & setup:**

   ```bash
   pnpm --filter @repo/database db:migrate
   pnpm --filter @repo/database db:seed
   ```

6. **Start development server:**

   ```bash
   pnpm dev
   ```

The application will be available at [http://localhost:4000](http://localhost:4000).

---

## 📂 Project Structure

```
brumkit/
├── apps/
│   └── web/                 # Next.js 16 application
├── packages/
│   ├── auth/                # Auth.js v5 + CASL
│   ├── database/            # Prisma 7 schema & client
│   ├── email/               # Templates & sending
│   ├── rate-limit/          # Redis rate limiting
│   ├── ui/                  # Shared Shadcn components
│   ├── validation/          # Zod schemas
│   ├── types/               # Shared TS types
│   └── utils/               # Shared utilities
├── docker-compose.yml        # Dev infrastructure (PostgreSQL, Redis, Mailhog)
├── docker-compose.full.yml   # Full production stack
├── .env.development.example  # Template for local development
└── .env.production.example   # Template for production
```

---

## 🔑 Environment Variables

BrumKit env variables are loaded from **three locations** depending on the consumer:

| Location                  | Used by                            | Copy command                                         |
| ------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `.env.development` (root) | Docker Compose                     | `cp .env.development.example .env.development`       |
| `packages/database/.env`  | Prisma CLI (migrate, seed, studio) | `cp .env.development.example packages/database/.env` |
| `apps/web/.env.local`     | Next.js app runtime                | `cp .env.development.example apps/web/.env.local`    |

Key variables — see `.env.development.example` for the full list with defaults:

| Variable                            |       Required in prod       | Description                                                      |
| ----------------------------------- | :--------------------------: | ---------------------------------------------------------------- |
| `DATABASE_URL`                      |             yes              | PostgreSQL connection string                                     |
| `NEXTAUTH_URL`                      |             yes              | Application base URL for Auth.js                                 |
| `NEXTAUTH_SECRET`                   |             yes              | Session encryption secret (`openssl rand -base64 32`)            |
| `NEXT_PUBLIC_APP_URL`               |             yes              | Public-facing app URL (also needed in `.env.production.example`) |
| `REDIS_URL`                         | optional (prod uses Upstash) | Redis for rate limiting                                          |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` |          yes (prod)          | Upstash Redis for production                                     |
| `RESEND_API_KEY`                    |          yes (prod)          | Email sending in production                                      |
| `FROM_EMAIL`                        |             yes              | Sender address for transactional email                           |
| `CRON_SECRET`                       |          yes (prod)          | Bearer token for cron endpoint                                   |
| `ADMIN_EMAIL`                       |             yes              | Recipient for admin notifications                                |

---

## 🧪 Testing Strategy

BrumKit follows Test-Driven Development (TDD) with strict quality standards:

- **Minimum Coverage**: 80%+ across all packages.
- **Framework**: Vitest 4 + React Testing Library.

```bash
pnpm test             # Run all tests
pnpm test:coverage    # Generate coverage report
pnpm test:watch       # Watch mode for development
```

---

## 🚀 Deployment

### Vercel (recommended for managed hosting)

BrumKit is optimized for deployment on **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/buildinclicks/brumkit)

1. Push your code to GitHub.
2. Link your repository to Vercel.
3. Add your environment variables in the Vercel Dashboard.
4. Set the build command to `pnpm run build`.

See the [Vercel Deployment Guide](docs/deployment/vercel-deployment-guide.md) for full instructions.

### Docker (self-hosted)

BrumKit ships a production-grade multi-stage `Dockerfile` and a `docker-compose.full.yml` that spins up the complete stack (app + PostgreSQL + Redis) with a single command.

```bash
docker compose -f docker-compose.full.yml --env-file .env.production up -d
```

See the [Self-Hosting with Docker guide](docs/deployment/self-hosting-docker.md) for prerequisites, migration steps, cron job setup, and update instructions.

---

## 🖼️ Screenshots

### Login Page

![Login Page](apps/web/public/images/brumkit_banner.png)

> Full screenshots of the auth flow, dashboard, and profile pages are planned for a future release.

---

## ⚡ Quick Start

Clone and run BrumKit in under 5 minutes:

```bash
git clone https://github.com/buildinclicks/brumkit.git
cd brumkit
pnpm install
cp .env.development.example .env.development           # Docker Compose infra
cp .env.development.example packages/database/.env     # Prisma CLI
cp .env.development.example apps/web/.env.local        # Next.js app runtime
docker compose --env-file .env.development up -d
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:seed
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## 📖 Documentation

| Guide                                                                           | Description                               |
| ------------------------------------------------------------------------------- | ----------------------------------------- |
| [Installation & setup](docs/guide/v1.0.1-pre-release/installation-and-setup.md) | Full manual and Docker setup walkthrough  |
| [Self-hosting with Docker](docs/deployment/self-hosting-docker.md)              | Production Docker deployment              |
| [Vercel deployment](docs/deployment/vercel-deployment-guide.md)                 | Managed hosting on Vercel                 |
| [@repo/auth README](packages/auth/README.md)                                    | Auth.js setup, proxy.ts, CASL permissions |
| [ROADMAP.md](ROADMAP.md)                                                        | Milestone progress and what's next        |
| [CHANGELOG.md](CHANGELOG.md)                                                    | Version history and migration notes       |
| [RELEASE_NOTES.md](RELEASE_NOTES.md)                                            | Detailed release notes (v1.0.0, v2.0.0)   |

---

## 🤝 Contributing & Support

- **Contributing**: Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our TDD workflow, changeset process, and coding standards.
- **Roadmap**: See [ROADMAP.md](ROADMAP.md) for release milestones and what's planned next.
- **Issues**: Report bugs via [GitHub Issues](https://github.com/buildinclicks/brumkit/issues).
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/buildinclicks/brumkit/discussions).
- **Documentation**: Explore the [docs/](docs/) folder for detailed guides.

---

## 🔒 Security

To report a security vulnerability, please use [GitHub Security Advisories](https://github.com/buildinclicks/brumkit/security/advisories/new) rather than a public issue. See [SECURITY.md](SECURITY.md) for our full disclosure policy and response SLA.

---

## 🌐 Community

- [GitHub Discussions](https://github.com/buildinclicks/brumkit/discussions) — questions, ideas, and announcements
- [GitHub Issues](https://github.com/buildinclicks/brumkit/issues) — bug reports and feature requests
- [Security Advisories](https://github.com/buildinclicks/brumkit/security/advisories/new) — private vulnerability reports

---

## ⚖️ License

Licensed under the [MIT License](LICENSE).

---

**Built and maintained by [BuildInClicks](https://buildinclicks.com)**
