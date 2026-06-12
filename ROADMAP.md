# BrumKit OSS Roadmap

**Current version:** 0.1.0  
**Target stable release:** 1.0.0  
**Last updated:** June 2026

This document tracks progress toward the first stable open-source release and outlines what comes after v1.0.0. For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Release status

BrumKit OSS is actively moving from the **0.1.0 foundation release** to a production-ready **1.0.0 stable release**. The work is organized into milestones; most pre-release milestones are complete or in final review.

| Milestone                     | Focus                                                          | Status      |
| ----------------------------- | -------------------------------------------------------------- | ----------- |
| M1 — Repo hygiene & Pro scrub | Community files, accurate README, route cleanup                | ✅ Complete |
| M2 — Dependency alignment     | pnpm catalog, safe minor/patch upgrades                        | ✅ Complete |
| M3 — Docker & deployment      | Production Dockerfile, full-stack compose, CI smoke test       | ✅ Complete |
| M4 — Quality & coverage       | 80%+ coverage, middleware/hook/API tests, CI coverage gate     | ✅ Complete |
| M5 — Release engineering      | Changesets, release workflow, Dependabot, CONTRIBUTING refresh | ✅ Complete |
| M6 — v1.0.0 cut               | Version bump, release notes, GitHub Release                    | 🔄 Next     |
| M7 — Post-1.0 major upgrades  | Next.js 16, Prisma 7 (deferred until after 1.0.0)              | ⏳ Deferred |

---

## Recently shipped (0.1.x → pre-1.0.0)

### Quality & testing (M4)

- Expanded test coverage across `@repo/ui`, `@repo/utils`, `@repo/validation`, and `apps/web`
- Middleware route-protection tests for auth and admin access
- Hook tests (`use-auth`, `use-user`, `use-server-action-form`)
- API route tests for registration and profile endpoints
- Removed skipped tests; CI enforces 80% coverage threshold
- Expanded Vitest coverage scope to include `app/actions/**` and `app/api/**`

### Docker & deployment (M3)

- Multi-stage production `Dockerfile` for `apps/web`
- `docker-compose.full.yml` for self-hosted full-stack deployment
- Docker build validation in CI
- [Self-hosting with Docker](docs/deployment/self-hosting-docker.md) guide

### Release engineering (M5)

- [Changesets](https://github.com/changesets/changesets) for linked monorepo versioning
- Automated [release workflow](.github/workflows/release.yml) (Version Packages PR → tag → GitHub Release)
- Dependabot weekly dependency updates
- Dependency review action blocking high/critical vulnerabilities on PRs
- Updated [CONTRIBUTING.md](CONTRIBUTING.md) with changeset workflow and Codecov setup
- Improved PR template with BrumKit Contribution Standards checklist

### Developer experience

- [Installation & setup guide](docs/guide/v1.0.1-pre-release/installation-and-setup.md) (manual and Docker workflows)
- Corrected local dev port (**4000**) and env file conventions (`.env.development`)
- Root `docker-compose.yml` for Postgres, Redis, and Mailhog infrastructure

---

## v1.0.0 — first stable release (M6)

The v1.0.0 release is a **stability declaration**, not a breaking API change. When M6 ships:

- All packages bump from `0.1.x` → `1.0.0` via changesets
- `CHANGELOG.md` and GitHub Release published automatically
- Git tag `v1.0.0` created on merge of the Version Packages PR
- Cursor rules and public docs updated to reflect the stable version

**Remaining before cut:**

- [ ] Final clean-clone verification checklist (see M6 acceptance criteria)
- [ ] README screenshots for login, dashboard, and profile pages
- [ ] Major changeset and Version Packages PR merge

---

## After v1.0.0

### Planned (maintainer track)

| Item                      | Description                                        | Target               |
| ------------------------- | -------------------------------------------------- | -------------------- |
| Major dependency upgrades | Next.js 16, Prisma 7 — separate migration branches | Post-1.0             |
| E2E tests                 | Playwright coverage for critical auth flows        | Community / post-1.0 |
| README screenshots        | Login, dashboard, profile demo images              | Before or with 1.0.0 |

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

---

**Built and maintained by [BuildInClicks](https://buildinclicks.com)**
