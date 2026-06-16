# BrumKit OSS Roadmap

**Current version:** 2.0.0  
**Latest stable release:** [v2.0.0](https://github.com/buildinclicks/brumkit/releases/tag/v2.0.0)  
**Last updated:** June 2026

This document tracks milestone progress for BrumKit OSS and outlines what comes next. For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Release status

BrumKit OSS reached **v1.0.0** (first stable release) in June 2026 and **v2.0.0** (Milestone 7 major upgrades) shortly after. The pre-1.0 milestone track (M1–M6) and the post-1.0 upgrade track (M7) are complete.

| Milestone                     | Focus                                                          | Status      |
| ----------------------------- | -------------------------------------------------------------- | ----------- |
| M1 — Repo hygiene & Pro scrub | Community files, accurate README, route cleanup                | ✅ Complete |
| M2 — Dependency alignment     | pnpm catalog, safe minor/patch upgrades                        | ✅ Complete |
| M3 — Docker & deployment      | Production Dockerfile, full-stack compose, CI smoke test       | ✅ Complete |
| M4 — Quality & coverage       | 80%+ coverage, middleware/hook/API tests, CI coverage gate     | ✅ Complete |
| M5 — Release engineering      | Changesets, release workflow, Dependabot, CONTRIBUTING refresh | ✅ Complete |
| M6 — v1.0.0 cut               | Version bump, release notes, GitHub Release                    | ✅ Complete |
| M7 — Post-1.0 major upgrades  | Next.js 16, Prisma 7, Zod 4, TypeScript 6, ecosystem majors    | ✅ Complete |

---

## Recently shipped (v2.0.0 — M7)

### Major stack upgrades

- **Next.js 16.2.x** — App Router, Turbopack build; client boundaries on shared UI modules
- **Prisma 7.8.x** — Driver adapter architecture, generated client at `packages/database/src/generated/prisma`
- **Zod 4.4.x** — Updated error handling, enum APIs, and schema options
- **TypeScript 6.0.x** — `Bundler` module resolution in shared presets
- **@casl/ability 7**, **lucide-react 1**, **sonner 2**, **resend 6**

### Migration guides

Nine step-by-step upgrade docs under [`docs/development/`](docs/development/):

- [`upgrade-next-15-to-16.md`](docs/development/upgrade-next-15-to-16.md)
- [`upgrade-prisma-6-to-7.md`](docs/development/upgrade-prisma-6-to-7.md)
- [`upgrade-zod-3-to-4.md`](docs/development/upgrade-zod-3-to-4.md)
- [`upgrade-typescript-5-to-6.md`](docs/development/upgrade-typescript-5-to-6.md)
- Plus guides for CASL, lucide-react, sonner, resend, and next-auth stable (deferred)

### Deferred from M7

- **next-auth v5 stable** — Still beta-only on npm; remains on `5.0.0-beta.25` until stable ships

---

## v1.0.0 — first stable release (M6) ✅

The v1.0.0 release was a **stability declaration** for the 0.1.x foundation:

- All linked packages bumped from `0.1.x` → `1.0.0` via changesets
- Git tag `v1.0.0` and [GitHub Release](https://github.com/buildinclicks/brumkit/releases/tag/v1.0.0) published
- Docker support, 80%+ test coverage, and full OSS governance shipped

---

## After v2.0.0

### Planned (maintainer track)

| Item                    | Description                                       | Target         |
| ----------------------- | ------------------------------------------------- | -------------- |
| next-auth v5 stable     | Bump when non-beta release ships on npm           | When available |
| E2E tests               | Playwright coverage for critical auth flows       | Post-2.0       |
| README screenshots      | Login, dashboard, profile demo images             | Post-2.0       |
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
