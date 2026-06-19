# BrumKit OSS Roadmap

**Current version:** 2.0.1  
**Latest stable release:** [v2.0.0](https://github.com/buildinclicks/brumkit/releases/tag/v2.0.0) (v2.0.1 pending)  
**Last updated:** June 2026

This document tracks milestone progress for BrumKit OSS and outlines what comes next. For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Release status

BrumKit OSS reached **v1.0.0** (first stable release) in June 2026 and **v2.0.0** (Milestone 7 major upgrades) shortly after. The pre-1.0 milestone track (M1–M6), the post-1.0 upgrade track (M7), and the post-v2.0 enterprise readiness pass (M8) are complete.

| Milestone                     | Focus                                                            | Status      |
| ----------------------------- | ---------------------------------------------------------------- | ----------- |
| M1 — Repo hygiene & Pro scrub | Community files, accurate README, route cleanup                  | ✅ Complete |
| M2 — Dependency alignment     | pnpm catalog, safe minor/patch upgrades                          | ✅ Complete |
| M3 — Docker & deployment      | Production Dockerfile, full-stack compose, CI smoke test         | ✅ Complete |
| M4 — Quality & coverage       | 80%+ coverage, proxy/hook/API tests, CI coverage gate            | ✅ Complete |
| M5 — Release engineering      | Changesets, release workflow, Dependabot, CONTRIBUTING refresh   | ✅ Complete |
| M6 — v1.0.0 cut               | Version bump, release notes, GitHub Release                      | ✅ Complete |
| M7 — Post-1.0 major upgrades  | Next.js 16, Prisma 7, Zod 4, TypeScript 6, ecosystem majors      | ✅ Complete |
| M8 — Enterprise readiness     | Proxy migration, env docs, security hardening, deployment guides | ✅ Complete |

---

## Recently shipped (v2.0.1 — M8)

Post-v2.0 hardening pass closing gaps between documented behaviour and actual implementation.

### Next.js 16 proxy migration

- Replaced deprecated `middleware.ts` with `proxy.ts` (Next.js 16 convention)
- `@repo/auth` exports `authProxy` from `@repo/auth/edge`; `authMiddleware` is a deprecated shim
- Defense-in-depth: proxy handles optimistic redirects; server layouts and actions enforce auth

### Environment configuration

- Documented the **three env file locations** (root, `packages/database/.env`, `apps/web/.env.local`) in README, CONTRIBUTING, and `apps/web/README.md`
- Reconciled stale templates: `apps/web/env.template`, `packages/database/.env.example`, test env template, `.env.production.example`

### Security & ops hardening

- Login rate limiting wired through `useLogin` → `loginUser` server action
- Soft-deleted user sessions invalidated on every `auth()` call (JWT re-check)
- Server-side Zod validation in `changePassword` and `verifyEmail` actions
- Register REST API hardened against email enumeration
- Security headers in `next.config.js` (HSTS, X-Frame-Options, CSP-adjacent policies)
- `/api/health` endpoint for Docker Compose healthchecks and load balancers
- CI uses `db:migrate:deploy` instead of `db:push` to catch migration drift

### Deployment documentation

- [`docs/deployment/self-hosting-docker.md`](docs/deployment/self-hosting-docker.md) — production Docker stack
- [`docs/deployment/vercel-deployment-guide.md`](docs/deployment/vercel-deployment-guide.md) — managed Vercel hosting

### Docs cleanup

- Removed `docs/development/upgrade-*.md` from the public repo (migration notes remain in [CHANGELOG.md](CHANGELOG.md) and [RELEASE_NOTES.md](RELEASE_NOTES.md); full guides are preserved in the [v2.0.0 release tag](https://github.com/buildinclicks/brumkit/releases/tag/v2.0.0))

---

## v2.0.0 — M7 major upgrades ✅

### Major stack upgrades

- **Next.js 16.2.x** — App Router, Turbopack build; client boundaries on shared UI modules
- **Prisma 7.8.x** — Driver adapter architecture, generated client at `packages/database/src/generated/prisma`
- **Zod 4.4.x** — Updated error handling, enum APIs, and schema options
- **TypeScript 6.0.x** — `Bundler` module resolution in shared presets
- **@casl/ability 7**, **lucide-react 1**, **sonner 2**, **resend 6**

### Deferred from M7

- **next-auth v5 stable** — Still beta-only on npm; remains on `5.0.0-beta.25` until stable ships

---

## v1.0.0 — first stable release (M6) ✅

The v1.0.0 release was a **stability declaration** for the 0.1.x foundation:

- All linked packages bumped from `0.1.x` → `1.0.0` via changesets
- Git tag `v1.0.0` and [GitHub Release](https://github.com/buildinclicks/brumkit/releases/tag/v1.0.0) published
- Docker support, 80%+ test coverage, and full OSS governance shipped

---

## After v2.0.1

### Planned (maintainer track)

| Item                    | Description                                       | Target         |
| ----------------------- | ------------------------------------------------- | -------------- |
| next-auth v5 stable     | Bump when non-beta release ships on npm           | When available |
| E2E tests               | Playwright coverage for critical auth flows       | Post-2.0       |
| README screenshots      | Login, dashboard, profile demo images             | Post-2.0       |
| Register API parity     | Rate limiting + verification email on REST route  | Post-2.0       |
| Release workflow polish | Canonical tag creation for private packages in CI | Post-2.0       |

### Community-driven (welcome contributions)

| Feature                  | Description                  |
| ------------------------ | ---------------------------- |
| OAuth providers          | Google, GitHub sign-in       |
| Article / content system | Basic CRUD with markdown     |
| Additional i18n locales  | Beyond English               |
| Admin UI                 | In-app user management panel |

See [GitHub Discussions](https://github.com/buildinclicks/brumkit/discussions) for feature proposals.

---

## OSS vs Pro

BrumKit OSS (Lite) ships auth, RBAC, profiles, notifications, Docker, and full test coverage. [BrumKit Pro](#) adds team management, billing, advanced admin, and priority support — see the comparison table in [README.md](README.md).

---

## How to follow progress

- **Issues & bugs:** [GitHub Issues](https://github.com/buildinclicks/brumkit/issues)
- **Feature ideas:** [GitHub Discussions](https://github.com/buildinclicks/brumkit/discussions)
- **Releases:** [GitHub Releases](https://github.com/buildinclicks/brumkit/releases)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Release notes:** [RELEASE_NOTES.md](RELEASE_NOTES.md)

---

**Built and maintained by [BuildInClicks](https://buildinclicks.com)**
