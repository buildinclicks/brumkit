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
- **PostgreSQL**: For database
- **Redis**: For rate limiting (Docker recommended)

### Setup Instructions

1. Fork the repository

2. Clone your fork:

```bash
git clone https://github.com/<your-username>/brumkit.git
cd brumkit
```

3. Install dependencies:

```bash
pnpm install
```

4. Set up environment variables:

```bash
cp .env.development.example .env.development
# Edit .env.development with your configuration
```

5. Generate Prisma Client:

```bash
cd packages/database && pnpm db:generate
```

6. Start development server:

```bash
pnpm dev:web
```

4. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### 1. Follow TDD (Test-Driven Development)

We strictly follow the TDD cycle:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Clean up code while keeping tests green

### 2. Code Style

We use ESLint 10 and Prettier for code formatting:

- **ESLint 10**: Flat config (eslint.config.js)
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode enabled
- Single quotes
- 2-space indentation
- Semicolons required
- Run `pnpm lint` to check for issues
- Run `pnpm format` to auto-format code

### 3. Commit Messages

Use conventional commit format:

```
feat: add notification badge to header
fix: resolve login redirect issue
docs: update README installation steps
test: add tests for notification actions
refactor: simplify permission logic
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 4. Testing

Testing is critical to maintaining code quality:

- **All new features must have tests**
- **Maintain 80%+ test coverage** across all packages
- **Follow TDD approach**: Write tests before implementation
- Run tests before committing: `pnpm test`
- Check coverage: `pnpm test:coverage`
- Component tests should use Testing Library best practices
- Use Vitest 4.0.18 as the testing framework

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Test specific package
pnpm --filter @repo/auth test
```

### 5. Code Review

- Keep pull requests focused and small
- Reference related issues
- Respond to feedback constructively
- Update documentation as needed

## Cursor Rules

This project follows specific coding patterns defined in `.cursor/rules`. Key points:

- Use Server Actions for mutations (not REST APIs)
- Use `ActionResult<T>` pattern for server action returns
- Use React Hook Form + Zod for form validation
- Use `<FieldError>` component for validation errors
- Use Tailwind CSS v4 (CSS-first configuration)
- Follow Next.js App Router patterns
- Use i18n for all user-facing strings
- ESLint 10 with flat config
- TypeScript strict mode

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
pnpm lint             # Lint all packages (ESLint 10)
pnpm type-check       # Type check all packages
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting

# Database
pnpm --filter @repo/database db:generate      # Generate Prisma Client
pnpm --filter @repo/database db:migrate       # Run migrations
pnpm --filter @repo/database db:seed          # Seed database
pnpm --filter @repo/database db:studio        # Open Prisma Studio

# Clean
pnpm clean            # Remove node_modules and build artifacts
```

## Pull Request Process

1. **Write Tests First** (TDD):
   - Write failing tests for new features
   - Implement code to pass tests
   - Refactor while keeping tests green

2. **Ensure Quality**:
   - All tests pass: `pnpm test`
   - Coverage ≥80%: `pnpm test:coverage`
   - No linting errors: `pnpm lint`
   - No type errors: `pnpm type-check`
   - Code formatted: `pnpm format`

3. **Update Documentation**:
   - Update README if adding features
   - Add JSDoc comments for public APIs
   - Update CHANGELOG.md if needed

4. **Create Pull Request**:
   - Clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - List testing steps
   - Ensure CI passes

## Project Structure

```
brumkit/
├── apps/
│   └── web/                 # Next.js application (Next.js 15, React 19)
├── packages/
│   ├── auth/                # Authentication & authorization (Auth.js 5, CASL)
│   ├── database/            # Prisma schema & client (Prisma 6.19.2)
│   ├── email/               # Email templates & sending (Resend, React Email)
│   ├── rate-limit/          # Redis rate limiting (ioredis, Upstash)
│   ├── ui/                  # Shared UI components (shadcn/ui, Tailwind CSS 4)
│   ├── validation/          # Zod schemas (Zod 3.23.8)
│   ├── types/               # Shared TypeScript types
│   ├── utils/               # Utility functions
│   ├── config-eslint/       # ESLint 10 configurations (flat config)
│   ├── config-typescript/   # TypeScript configurations (strict mode)
│   ├── config-tailwind/     # Tailwind CSS 4 configurations
│   └── config-vitest/       # Vitest 4 configurations
├── docs/                    # Documentation
│   └── open-source-version/
│       └── release-0.1/     # Release 0.1 documentation
└── docker/                  # Docker configurations
```

## Technology Stack

### Core

- **Next.js**: 15.5.12 (App Router)
- **React**: 19.2.4
- **TypeScript**: 5.9.3 (strict mode)
- **Node.js**: >= 20.19.0

### Styling

- **Tailwind CSS**: 4.1.18 (CSS-first config)
- **shadcn/ui**: Component library

### Backend

- **Prisma**: 6.19.2 (PostgreSQL)
- **Auth.js**: 5.0.0-beta.25
- **CASL**: Authorization

### Testing

- **Vitest**: 4.0.18
- **React Testing Library**: 16.3.1
- **Coverage**: 80%+ required

### Tooling

- **pnpm**: 10.0.0 (workspace management)
- **Turborepo**: Monorepo orchestration
- **ESLint**: 10.0.0 (flat config)
- **Prettier**: Code formatting

## Questions?

- Check existing issues and discussions
- Open a new issue for bugs or feature requests
- Join our community discussions

Thank you for contributing! 🎉
