# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-12

> **First stable open-source release.** BrumKit v1.0.0 is a production-ready Next.js 15 starter kit
> delivering a complete auth/RBAC foundation, Docker-first developer experience, 80%+ automated test
> coverage, and full OSS governance — ready to clone, build on, and ship.

### Highlights (M1–M6 cumulative)

- **Full auth foundation** — email/password authentication, email verification, password reset, JWT
  sessions via Auth.js v5, Redis rate limiting, and CASL-powered RBAC with four roles
  (USER, MODERATOR, ADMIN, SUPER_ADMIN)
- **Docker support** — `apps/web/Dockerfile` (multi-stage, Turbo prune) and
  `docker-compose.full.yml` for a one-command production stack
- **80%+ test coverage** — enforced by Vitest thresholds and CI (`pnpm test:coverage`); zero skipped
  tests; coverage includes middleware, server actions, API routes, hooks, and UI components
- **OSS governance** — `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `LICENSE`,
  Changesets versioning, Dependabot weekly scans, and a GitHub Actions release pipeline
- **Accurate documentation** — README with correct ports (4000), env setup, Docker instructions,
  installation guide, and ROADMAP

### Added

- Changesets-based versioning with linked `@repo/*` packages and `web` app
- GitHub Actions release workflow (Version Packages PR, tags, GitHub Releases)
- Dependabot weekly dependency updates and dependency-review CI gate
- Comprehensive test suite expansion: middleware, hooks, API routes, UI components, and validation schemas
- CI coverage enforcement at 80% threshold via Vitest thresholds
- [Installation & setup guide](docs/guide/v1.0.1-pre-release/installation-and-setup.md) for manual and Docker workflows
- [ROADMAP.md](ROADMAP.md) tracking progress toward v1.0.0
- `apps/web/Dockerfile` multi-stage build (base → installer → builder → runner) with Turbo prune
- `docker-compose.full.yml` full production stack (app + PostgreSQL + Redis)

### Changed

- Updated `CONTRIBUTING.md` with changeset workflow, TDD standards, and Codecov setup
- Improved PR template with BrumKit Contribution Standards checklist
- Expanded `apps/web` Vitest coverage to include `app/actions/**` and `app/api/**`
- README: documentation index, deployment links, and v1.0.0 stable status
- `.env.development.example` aligned to port 4000 (`NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`)

### Fixed

- Database port configuration in `docker-compose.yml` for local development
- Removed skipped profile form tests; replaced HTML5 email validation tests with Zod schema tests

### Breaking Changes

None. 0.1.0 → 1.0.0 is a stability and maturity declaration, not an API break.

### Migration Guide

```bash
git pull origin main
pnpm install
pnpm --filter @repo/database db:generate
pnpm build
```

### Known Issues / Deferred

- **README screenshots**: Section exists; full auth-flow and dashboard screenshots deferred to v1.0.1.
- **Next.js 15 → 16 upgrade**: Deferred to post-1.0 major upgrade track (M7).
- **Prisma 6 → 7 upgrade**: Deferred; major architectural changes require a dedicated migration.
- **OAuth providers** (Google, GitHub): Not included in OSS edition.

### Contributors

- [@buildinclicks](https://github.com/buildinclicks) — BuildInClicks Team

## [0.1.0] - 2026-02-17

### Added

- Comprehensive codebase audit and documentation system
- ESLint 10 support with flat config across monorepo
- Testing strategy with 80%+ coverage requirement
- Test-Driven Development (TDD) approach documentation
- Vitest 4.0.18 test suite with comprehensive coverage
- Milestone-based release management system
- Release 0.1 documentation with 6 detailed milestones
- Version 0.1.0 release artifacts and documentation

### Changed

- **Dependencies - Node Types Alignment**:
  - Updated `@types/node` to `^25.0.6` across all packages (auth, email, validation)
  - Eliminated version conflicts between packages (was scattered across 3 versions)

- **Dependencies - Zod Alignment**:
  - Updated `zod` to `^3.23.8` in auth package
  - Aligned with validation and web packages

- **Dependencies - React Ecosystem**:
  - Updated React to `19.2.4` (from 19.2.3)
  - Updated React DOM to `19.2.4` (from 19.2.3)
  - Updated `@types/react` to `^19.2.8` in UI package
  - Updated `@types/react-dom` to `^19.2.3` in UI package

- **Dependencies - TanStack React Query**:
  - Updated `@tanstack/react-query` to `^5.90.21` (from 5.90.16)
  - Updated `@tanstack/react-query-devtools` to `^5.90.21`

- **Dependencies - Testing**:
  - Updated `vitest` to `^4.0.18` (from 4.0.16)
  - Updated `@vitest/coverage-v8` to `^4.0.18`
  - Updated `@vitest/ui` to `^4.0.18`

- **Dependencies - Internationalization**:
  - Updated `next-intl` to `^4.8.3` (from 4.7.0)

- **Dependencies - Next.js & Prisma**:
  - Updated Next.js to latest `15.5.12` patch
  - Updated Prisma to latest `6.19.2` patch
  - Applied latest security patches

- **Build Tools**:
  - Updated ESLint to `^10.0.0` (major version upgrade)
  - Updated `@eslint/js` to `^10.0.0`
  - Migrated all packages to ESLint 10 flat config
  - Improved monorepo linting with better config lookup

- **Node.js Requirement**:
  - Updated minimum Node.js version to `>=20.19.0` (from >=20.0.0)
  - Updated pnpm requirement to `>=10.0.0` (from >=9.0.0)

### Fixed

- Version inconsistencies across monorepo packages
- `@repo/email` package version (0.0.0 → 0.1.0)
- Type checking issues from outdated `@types/node` versions
- React dev dependency mismatches in UI package
- ESLint configuration issues in monorepo
- Build and type-checking errors across packages

### Security

- Applied latest security patches for all dependencies
- Updated Next.js to latest 15.x patch with security fixes
- Updated Prisma to latest 6.x patch with security improvements
- Updated React to 19.2.4 with bug fixes and security patches
- Updated all `@types/node` to eliminate security vulnerabilities

### Documentation

- Created comprehensive codebase audit report (Milestone 1)
- Documented dependency alignment strategy (Milestone 2)
- Created ESLint 10 migration guide (Milestone 3)
- Documented minor/patch update strategy (Milestone 4)
- Created test suite verification checklist (Milestone 5)
- Updated all README files with current versions
- Updated CONTRIBUTING.md with TDD approach
- Created comprehensive CHANGELOG.md
- Created release notes for Release 0.1.0
- Updated root README with version 0.1.0 information

### Testing

- Established 80% minimum code coverage requirement
- Implemented TDD (Test-Driven Development) approach
- Comprehensive test suite with Vitest 4.0.18
- Full test coverage verification across all packages
- Integration testing setup
- Performance testing guidelines

### Deferred to 0.2+

The following items were evaluated but deferred to future releases:

- **Next.js 15 → 16 upgrade**: Ecosystem not ready, waiting for stable release and plugin compatibility
- **Prisma 6 → 7 upgrade**: Major architectural changes, requires careful migration planning
- **Admin application scaffold**: Deferred to allow focus on core stability
- **Workers application scaffold**: Deferred to allow focus on core stability

## [0.0.0] - Previous Releases

See [release-0.0 documentation](./docs/open-source-version/release-0.0/) for previous release history.

---

## Release Information

### Version 0.1.0 Milestones

1. **Milestone 1**: Codebase Audit and Dependency Analysis ✅
2. **Milestone 2**: Dependency Version Alignment ✅
3. **Milestone 3**: ESLint 10 Migration ✅
4. **Milestone 4**: Minor and Patch Updates ✅
5. **Milestone 5**: Test Suite Verification ✅
6. **Milestone 6**: Documentation and Release ✅

### Breaking Changes

**None** - Release 0.1 maintains full backward compatibility with 0.0.x releases.

### Migration Guide

No migration required - this is a drop-in update for existing installations:

```bash
git pull origin main
pnpm install
cd packages/database && pnpm db:generate
pnpm build
pnpm test
```

### Known Issues

No known critical issues at release time.

### Contributors

- BuildInClicks Team
- Community Contributors

### Support

- **Documentation**: [docs/open-source-version/release-0.1/](./docs/open-source-version/release-0.1/)
- **Issues**: [GitHub Issues](https://github.com/buildinclicks/brumkit/issues)
- **License**: MIT

---

**For detailed information about Release 0.1.0, see the [Release Notes](./docs/open-source-version/release-0.1/RELEASE-NOTES.md).**
