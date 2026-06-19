# Contributing to BrumKit

Thank you for your interest in contributing to BrumKit! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, inclusive, and constructive in all interactions.

## Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 20.19.0
- **pnpm**: >= 10.0.0
- **Git**: Latest version
- **Docker**: For running infrastructure (PostgreSQL, Redis)

### Setup Instructions

1. Fork the repository and clone your fork:

```bash
git clone https://github.com/<your-username>/brumkit.git
cd brumkit
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

   BrumKit uses **three separate env file locations** — each consumer reads from its own directory:

```bash
# Root — Docker Compose infrastructure (POSTGRES_*, REDIS_*, MAILHOG_*)
cp .env.development.example .env.development

# Prisma CLI — migrations, seed, studio from packages/database
cp .env.development.example packages/database/.env

# Next.js — REQUIRED; Next.js only reads env files from apps/web/
cp .env.development.example apps/web/.env.local
```

> **Important:** The root `.env.development` is **not** loaded by Next.js. Skipping the
> `apps/web/.env.local` copy will cause the app to fail with missing `DATABASE_URL`,
> `NEXTAUTH_*`, and `REDIS_URL` at runtime.
>
> When you change any value, update all three copies. A symlink is a DRY alternative:
> `ln -sf ../../.env.development apps/web/.env.local`

4. Start infrastructure (Docker):

```bash
docker compose --env-file .env.development up -d
```

5. Run migrations and seed the database:

```bash
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:seed
```

6. Generate Prisma client:

```bash
pnpm --filter @repo/database db:generate
```

7. Start the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:4000](http://localhost:4000).

8. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

## TDD Workflow

BrumKit strictly follows Test-Driven Development. **Never write implementation code before a failing test exists for it.**

### Red-Green-Refactor Cycle

1. **RED** — Write a failing test that describes the expected behaviour
2. **GREEN** — Write the minimal code that makes the test pass
3. **REFACTOR** — Clean up code and tests while keeping them green

### Test Structure (Arrange-Act-Assert)

```tsx
it('should create user', async () => {
  // ARRANGE
  const userData = await createUserWithPasswordFixture();
  // ACT
  const user = await db.user.create({ data: userData });
  // ASSERT
  expect(user.email).toBe(userData.email);
});
```

### Naming Convention

Test names must use the `should` prefix:

```tsx
describe('LoginPage', () => {
  describe('Rendering', () => {
    it('should render form with all fields');
  });
  describe('Validation', () => {
    it('should show error for invalid email');
  });
  describe('Submission', () => {
    it('should redirect on success');
    it('should show error toast on failure');
  });
});
```

### Coverage Requirement

**Minimum 80%** — enforced in CI via `pnpm test:coverage`. New features must maintain or improve this threshold.

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage report
pnpm test:coverage

# Specific package
pnpm --filter @repo/auth test

# Specific file
pnpm --filter web test -- login
```

## Coding Standards

This project follows specific coding patterns defined in `.cursor/rules/`. Key rules:

- [`00-project-overview.mdc`](.cursor/rules/00-project-overview.mdc) — workspace layout, import aliases
- [`tdd-testing.mdc`](.cursor/rules/tdd-testing.mdc) — TDD approach, test structure, coverage requirements
- [`code-consistency.mdc`](.cursor/rules/code-consistency.mdc) — TypeScript patterns, `ActionResult`, Zod schemas
- [`react-nextjs.mdc`](.cursor/rules/react-nextjs.mdc) — App Router patterns, Server Actions
- [`forms-validation-i18n.mdc`](.cursor/rules/forms-validation-i18n.mdc) — React Hook Form, i18n
- [`shadcn-ui-theming.mdc`](.cursor/rules/shadcn-ui-theming.mdc) — component usage, theming
- [`tailwindcss.mdc`](.cursor/rules/tailwindcss.mdc) — Tailwind v4 patterns

Key patterns at a glance:

- Use Server Actions for mutations (not REST APIs)
- Use `ActionResult<T>` for all server action return types
- Use React Hook Form + Zod for form validation
- Use `<FieldError>` component for validation errors
- Use Tailwind CSS v4 (CSS-first configuration)
- Use `useTranslations()`/`getTranslations()` — never hardcode user-facing strings
- Import from `@repo/*` aliases — never use relative paths across packages

### Code Style

- **Prettier** auto-formats on save (single quotes, configured in `.prettierrc`)
- **ESLint** flat config (`eslint.config.js`) enforces code quality
- Run `pnpm lint` to check for issues
- Run `pnpm format` to auto-format all files
- Run `pnpm format:check` to verify formatting without writing

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add notification badge to header
fix: resolve login redirect issue
docs: update README installation steps
test: add tests for notification actions
refactor: simplify permission logic
chore: upgrade dependencies
```

## Changeset Workflow

BrumKit uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

**Every PR to `main` must include a changeset file** (except the automated "Version Packages" PR created by the release bot).

### Creating a Changeset

Before opening a PR, run:

```bash
pnpm changeset
```

The interactive prompt will ask you to:

1. Select which packages are affected by your change
2. Choose the bump type: `patch` (bug fix), `minor` (new feature), or `major` (breaking change)
3. Write a summary of the change (this becomes the CHANGELOG entry)

This generates a `.changeset/<random-name>.md` file — commit it alongside your code changes.

### Versioning Strategy

All `@repo/*` packages and the `web` app are **linked** and versioned together. A `minor` changeset bumps all of them to the same version. The `config-*` packages version independently on their own patch cycle.

### Release Flow

1. Contributor creates a changeset and opens a PR
2. CI verifies the changeset is present
3. PR is merged to `main`
4. The release workflow automatically creates a "chore: version packages" PR
5. Merging that PR bumps all package versions, updates `CHANGELOG.md`, creates a git tag `v{version}`, and publishes a GitHub Release

## Available Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:web          # Start web app only

# Build
pnpm build            # Build all packages
pnpm build:web        # Build web app only

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage report

# Code Quality
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type check
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting without writing

# Database
pnpm --filter @repo/database db:generate      # Generate Prisma client
pnpm --filter @repo/database db:migrate       # Run migrations
pnpm --filter @repo/database db:push          # Push schema without migration file
pnpm --filter @repo/database db:seed          # Seed database
pnpm --filter @repo/database db:studio        # Open Prisma Studio

# Changesets
pnpm changeset                                # Create a new changeset
pnpm changeset status                         # Show pending changesets
pnpm changeset version                        # Apply changesets and bump versions (CI only)

# Clean
pnpm clean            # Remove node_modules and build artifacts
```

## Submitting a Pull Request

1. **Write tests first** (TDD Red-Green-Refactor)
2. Ensure all checks pass locally:

```bash
pnpm lint
pnpm type-check
pnpm test:coverage
pnpm build
```

3. **Create a changeset** (required for all feature/fix PRs):

```bash
pnpm changeset
```

4. Push your branch and open a PR. The PR template at [`.github/pull_request_template.md`](.github/pull_request_template.md) guides you through the required checklist.

5. Ensure CI passes. The CI pipeline runs: lint (including changeset check), type-check, test (with coverage), build, and Docker smoke test.

## Setting Up Code Coverage (CODECOV_TOKEN)

The CI pipeline uploads coverage reports to [Codecov](https://codecov.io/) after each test run.

### For Repository Maintainers

1. Sign in to [codecov.io](https://codecov.io/) with your GitHub account.
2. Add the `buildinclicks/brumkit` repository.
3. Copy the **CODECOV_TOKEN** from the Codecov repository settings.
4. Add it as a GitHub Actions secret: **Settings → Secrets and variables → Actions → New repository secret** — name: `CODECOV_TOKEN`.

### For Fork Contributors

Coverage uploads are optional for forks. The CI step uses `fail_ci_if_error: false`, so a missing `CODECOV_TOKEN` will not block your PR. If you want coverage reports on your fork:

1. Sign in to [codecov.io](https://codecov.io/) with your GitHub account.
2. Add your forked repository.
3. Add the `CODECOV_TOKEN` secret to your fork's GitHub Actions secrets.

Coverage reports are visible in the PR checks once the token is configured.

## Package Structure

```
brumkit/
├── apps/
│   └── web/                 # Next.js 15 application (App Router)
├── packages/
│   ├── auth/                # Auth.js v5 + CASL authorization
│   ├── database/            # Prisma schema & client (PostgreSQL)
│   ├── email/               # Email templates & sending (Resend, React Email)
│   ├── rate-limit/          # Redis rate limiting (ioredis, Upstash)
│   ├── ui/                  # Shared shadcn/ui components (Tailwind CSS 4)
│   ├── validation/          # Zod schemas shared across apps
│   ├── types/               # Shared TypeScript types
│   ├── utils/               # Shared utility functions
│   ├── config-eslint/       # ESLint 10 flat config
│   ├── config-typescript/   # TypeScript strict config
│   ├── config-tailwind/     # Tailwind CSS 4 config
│   └── config-vitest/       # Vitest 4 config
├── docs/                    # Documentation
└── .changeset/              # Pending changeset files
```

## Technology Stack

| Concern         | Technology                     | Version       |
| --------------- | ------------------------------ | ------------- |
| Framework       | Next.js (App Router)           | 15.5.19       |
| Language        | TypeScript (strict)            | 5.9.3         |
| Runtime         | Node.js                        | ≥ 20.19.0     |
| Package manager | pnpm                           | ≥ 10.0.0      |
| Styling         | Tailwind CSS (CSS-first)       | 4.3.0         |
| Database ORM    | Prisma                         | 6.19.2        |
| Authentication  | Auth.js                        | 5.0.0-beta.25 |
| Testing         | Vitest + React Testing Library | 4.1.8         |
| Monorepo        | Turborepo + pnpm workspaces    | 2.9.16        |
| Linting         | ESLint (flat config)           | 10.x          |
| Formatting      | Prettier                       | 3.x           |
| Versioning      | Changesets                     | 2.x           |

## Questions?

- Check [existing issues](https://github.com/buildinclicks/brumkit/issues) and [discussions](https://github.com/buildinclicks/brumkit/discussions)
- Open a new issue for bugs or feature requests
- Report security vulnerabilities privately via [GitHub Security Advisories](https://github.com/buildinclicks/brumkit/security/advisories/new) — see [SECURITY.md](SECURITY.md)

Thank you for contributing!
