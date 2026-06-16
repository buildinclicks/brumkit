# @repo/rate-limit

## 2.0.0

### Major Changes

- [#16](https://github.com/buildinclicks/brumkit/pull/16) [`9126136`](https://github.com/buildinclicks/brumkit/commit/9126136bee11bfe49eb002093eb7c581a473b437) Thanks [@pukhrajp](https://github.com/pukhrajp)! - # BrumKit 2.0.0 — Post-1.0 Major Upgrades (Milestone 7)

  This release completes the Milestone 7 major-upgrade track (except next-auth v5 stable, which remains deferred until a non-beta release is published).

  ## Upgraded dependencies

  | Package       | From    | To     |
  | ------------- | ------- | ------ |
  | Next.js       | 15.5.x  | 16.2.x |
  | TypeScript    | 5.9.x   | 6.0.x  |
  | Prisma        | 6.19.x  | 7.8.x  |
  | Zod           | 3.23.x  | 4.4.x  |
  | @casl/ability | 6.7.x   | 7.0.x  |
  | lucide-react  | 0.469.x | 1.18.x |
  | sonner        | 1.7.x   | 2.0.x  |
  | resend        | 4.0.x   | 6.12.x |

  ## Migration summary for downstream users
  1. **Prisma 7** — Client is generated to `packages/database/src/generated/prisma`. Use `@prisma/adapter-pg` with a driver adapter. Import enums via `@repo/database/enums` in validation-only code. See `docs/development/upgrade-prisma-6-to-7.md`.
  2. **Zod 4** — Replace `error.errors` with `error.issues`, `required_error` with `error`, and `z.nativeEnum()` with `z.enum()`. See `docs/development/upgrade-zod-3-to-4.md`.
  3. **Next.js 16** — Client-only UI modules (`form`, `sonner`) require `'use client'`. See `docs/development/upgrade-next-15-to-16.md`.
  4. **TypeScript 6** — `node.json` preset uses `Bundler` resolution; deprecated `baseUrl` removed from package tsconfigs.

  ## Deferred
  - **next-auth v5 stable** — Still beta-only on npm (`5.0.0-beta.31`). Remains on `5.0.0-beta.25` until stable ships. See `docs/development/upgrade-nextauth-v5-stable.md`.

  ## Full migration guides

  See `docs/development/upgrade-*.md` for per-package step-by-step notes.

## 1.0.0

### Major Changes

- First stable open-source release of BrumKit OSS (v1.0.0) with complete auth/RBAC foundation, Docker support, 80%+ test coverage, and full OSS governance.

### Minor Changes

- 0845e72: Add release engineering infrastructure: Changesets-based versioning, automated GitHub Actions release workflow, dependency scanning via Dependabot and dependency-review action, updated CONTRIBUTING.md with changeset workflow and CODECOV setup guide, improved PR template with BrumKit Contribution Standards checklist, and README Quick Start and Community sections.
