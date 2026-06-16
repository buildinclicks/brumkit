# BrumKit v1.0.0 — First Stable Release

**Release Date**: June 12, 2026
**Status**: Stable — Production Ready
**Git Tag**: `v1.0.0`

---

## Overview

BrumKit v1.0.0 is the first stable open-source release. Starting from the 0.1.0 pre-release
foundation, the M1–M6 milestone track hardened the codebase with Docker support, an 80%+
automated test coverage baseline, complete OSS governance, and a release engineering pipeline —
delivering a starter kit that is ready to clone, configure, and ship.

---

## What's New in v1.0.0

### Docker Support (M3)

- **`apps/web/Dockerfile`** — multi-stage build (base → installer → builder → runner) using
  Turbo prune for minimal production images.
- **`docker-compose.full.yml`** — full production stack: Next.js app + PostgreSQL + Redis, fully
  documented in the README and installation guide.
- **CI Docker job** — `docker build` validates the image on every push to `main`.

### 80%+ Test Coverage (M4)

- Vitest thresholds (lines, functions, branches, statements) enforce ≥ 80% across all packages.
- Test suite expanded to cover middleware, server actions, API routes, query hooks, and UI components.
- Zero skipped tests — all previously skipped profile tests were replaced with Zod schema tests.
- CI runs `pnpm test:coverage` and fails if thresholds are not met.

### Complete OSS Governance (M1 + M5)

- `SECURITY.md` — supported versions and responsible disclosure policy.
- `CODE_OF_CONDUCT.md` — Contributor Covenant.
- `CONTRIBUTING.md` — comprehensive guide covering TDD workflow, changeset versioning,
  Codecov setup, PR checklist, and coding standards with `.cursor/rules/` references.
- Dependabot weekly scans and dependency-review CI gate.
- Changesets-based versioning with a GitHub Actions release pipeline (`release.yml`).

### Accurate Documentation (M1 + M5)

- README updated: correct port (4000), env file instructions, real repo URL
  (`github.com/buildinclicks/brumkit`), Docker quick-start, and community links.
- `.env.development.example` now correctly sets `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`
  to `http://localhost:4000`.
- [Installation & setup guide](docs/guide/v1.0.1-pre-release/installation-and-setup.md) covers
  both manual and Docker-based setup end-to-end.
- [ROADMAP.md](ROADMAP.md) documents the post-1.0 upgrade track.

### Release Engineering (M5 + M6)

- pnpm catalog introduced for shared dependency version management across the monorepo.
- All intra-repo `@repo/*` dependencies use `workspace:*` consistently.
- `pnpm changeset version` pipeline: two changesets (minor M5 + major M6) bumped all packages
  from `0.1.0` → `1.0.0`.

---

## Breaking Changes

**None.** The 0.1.0 → 1.0.0 version increment is a stability and maturity declaration.
There are no API changes, schema migrations, or configuration breaking changes.

---

## Migration Guide

For developers upgrading from 0.1.0:

```bash
git pull origin main
pnpm install
pnpm --filter @repo/database db:generate
pnpm build
```

No database migrations are required. Environment variables are unchanged except:

- `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` in `.env.development` should be `http://localhost:4000`
  (if you copied from an older `.env.development.example` that used port 3000, update these now).

---

## Known Issues / Deferred Items

| Item               | Status             | Notes                                                            |
| ------------------ | ------------------ | ---------------------------------------------------------------- |
| README screenshots | Deferred to v1.0.1 | Section exists; full auth-flow and dashboard screenshots pending |
| Next.js 15 → 16    | Post-1.0 M7 track  | Waiting for stable ecosystem compatibility                       |
| Prisma 6 → 7       | Post-1.0 M7 track  | Major architectural changes require dedicated migration          |
| OAuth providers    | OSS edition scope  | Google/GitHub OAuth available in Pro edition                     |
| Admin dashboard UI | Post-1.0           | Deferred to allow focus on core stability                        |

---

## What's Next

- **M7 — Post-1.0 Major Upgrades**: Next.js 16, Prisma 7, React 19 stable, and ecosystem
  upgrades tracked in [ROADMAP.md](ROADMAP.md).
- **Pro edition**: Full-featured starter with OAuth, admin dashboard, real-time features,
  background jobs, and advanced RBAC — see [buildinclicks.com](https://buildinclicks.com) for
  comparison.

---

## Technology Stack

| Layer           | Package        | Version       |
| --------------- | -------------- | ------------- |
| Framework       | Next.js        | 15.5.19       |
| Runtime         | React          | 19.2.7        |
| Language        | TypeScript     | 5.9.3         |
| Styling         | Tailwind CSS   | 4.3.0         |
| Auth            | Auth.js        | 5.0.0-beta.25 |
| ORM             | Prisma         | 6.19.2        |
| Validation      | Zod            | 3.23.8        |
| Data fetching   | TanStack Query | 5.101.0       |
| i18n            | next-intl      | 4.13.0        |
| Testing         | Vitest         | 4.1.8         |
| Monorepo        | Turborepo      | 2.9.16        |
| Package manager | pnpm           | 10.0.0        |
| Node.js         | —              | ≥ 20.19.0     |

---

## Contributors

- [@buildinclicks](https://github.com/buildinclicks) — BuildInClicks Team

---

## Support

- **Docs**: [Installation & setup guide](docs/guide/v1.0.1-pre-release/installation-and-setup.md)
- **Issues**: [github.com/buildinclicks/brumkit/issues](https://github.com/buildinclicks/brumkit/issues)
- **Discussions**: [github.com/buildinclicks/brumkit/discussions](https://github.com/buildinclicks/brumkit/discussions)
- **License**: MIT

---

**Release Date**: February 17, 2026  
**Status**: Production Ready

---

## Overview

First open-source release of BrumKit - a production-ready Next.js 15 starter kit with authentication, authorization, and essential features. Built with modern best practices and comprehensive testing.

---

## Features Included

### Authentication & Security

- ✅ Email/password authentication with bcryptjs
- ✅ JWT-based session management via Auth.js (NextAuth) v5
- ✅ Password reset with email verification
- ✅ Email verification flow
- ✅ Account deletion with 30-day grace period
- ✅ Redis-based rate limiting
- ✅ Secure password requirements (8+ chars, complexity validation)
- ✅ CSRF protection built-in
- ✅ XSS protection via React and input validation

### User Management

- ✅ Complete profile management (name, username, bio, avatar)
- ✅ Password change functionality
- ✅ Email change with verification
- ✅ Avatar upload support with validation
- ✅ Username system with uniqueness validation
- ✅ User roles (USER, MODERATOR, ADMIN, SUPER_ADMIN)

### Notifications

- ✅ Basic notification system
- ✅ Mark as read functionality (single and bulk)
- ✅ Unread count badge in navigation
- ✅ Notification types (System, Account, Security)
- ✅ Responsive notification list

### Authorization

- ✅ Role-based access control (RBAC)
- ✅ CASL-powered permissions system
- ✅ Four roles with hierarchical permissions
- ✅ Server-side permission enforcement
- ✅ Resource-level access control

### UI/UX

- ✅ Modern UI with shadcn/ui components
- ✅ Dark mode support with persistence
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Loading skeletons for better UX
- ✅ Form validation with React Hook Form + Zod
- ✅ Toast notifications (Sonner)
- ✅ Error boundaries for graceful error handling

### Architecture

- ✅ Turborepo monorepo structure
- ✅ Next.js 15 with App Router
- ✅ Prisma ORM with PostgreSQL
- ✅ TypeScript throughout
- ✅ Vitest + React Testing Library
- ✅ 80%+ test coverage (unit tests)
- ✅ ESLint + Prettier configured
- ✅ Husky pre-commit hooks
- ✅ Path aliases for clean imports

### Developer Experience

- ✅ Docker Compose for local development
- ✅ Comprehensive documentation
- ✅ Test database setup scripts
- ✅ Seed data for development
- ✅ Hot reload for rapid development
- ✅ Type-safe API with Zod validation
- ✅ Reusable validation schemas

---

## What's Not Included

The following features are intentionally not included in this open-source version:

- ❌ OAuth providers (Google, GitHub) - credentials only
- ❌ Article/Blog system
- ❌ Comment system
- ❌ Social features (Follow, Bookmark, Reaction)
- ❌ Admin dashboard UI
- ❌ Real-time features (WebSockets)
- ❌ Background job processing (queues)
- ❌ Multi-language support (i18n placeholder only)

---

## Technology Stack

### Frontend

- **Next.js**: 15.5.10
- **React**: 19.2.4
- **TypeScript**: 5.9.3
- **Tailwind CSS**: 4.1.18
- **shadcn/ui**: Latest components
- **React Hook Form**: 7.71.0
- **Zod**: 3.23.8
- **TanStack Query**: 5.90.16

### Backend

- **Next.js API Routes**: Server actions
- **Auth.js (NextAuth)**: 5.0.0-beta.30
- **Prisma**: 6.1.0
- **PostgreSQL**: 15+ (via Docker)
- **Redis/Upstash**: Rate limiting
- **Resend/Mailhog**: Email delivery

### Testing & Quality

- **Vitest**: 4.0.18
- **React Testing Library**: 16.3.2
- **MSW**: 2.12.7 (API mocking)
- **ESLint**: 9.39.2
- **Prettier**: 3.8.1

### DevOps

- **Turborepo**: 2.8.9
- **Docker**: Compose v2
- **pnpm**: 10.0.0
- **Husky**: 9.1.7

---

## Setup Instructions

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** (via Docker or local)
- **Redis** (via Upstash or local)
- **SMTP server** (Resend or Mailhog)

### Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd brumkit

# 2. Install dependencies
pnpm install

# 3. Copy environment file
cp .env.example .env

# 4. Configure .env file with your values
# - DATABASE_URL
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL
# - Redis credentials
# - Email service credentials

# 5. Start Docker services (PostgreSQL, Redis, Mailhog)
docker compose -f docker/docker-compose.yml up -d

# 6. Run database migrations
pnpm --filter @repo/database db:migrate

# 7. Seed database (optional)
pnpm --filter @repo/database db:seed

# 8. Start development server
pnpm dev

# 9. Open browser
# http://localhost:4000
```

### Test Database Setup

```bash
# Setup test database for running tests
pnpm --filter @repo/database test:setup

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

---

## Known Limitations

### v0.1.0 Limitations

- **No OAuth authentication**: Only email/password supported
- **No pagination on notifications**: All loaded at once (suitable for moderate usage)
- **No real-time notification updates**: Manual refresh or polling required
- **Email sending requires SMTP**: Resend account or Mailhog for development
- **No background job processing**: Account cleanup via cron endpoint

### Not Critical (Future Enhancements)

- Search functionality not included
- Advanced filtering not included
- Bulk operations limited
- Analytics/metrics not included

---

## Breaking Changes from Internal Version

This is the first open-source release. If you've used an internal version, note:

- OAuth providers removed (Google, GitHub)
- Article/Comment/Tag systems removed
- Permissions simplified to User + Notification only
- Rate limiting configuration may differ
- Database schema changes (removed article/comment tables)
- Some validation rules adjusted

---

## Security

### ✅ Security Features

- Bcryptjs password hashing (10 rounds)
- JWT session tokens (30-day expiration)
- Rate limiting on authentication endpoints
- CSRF protection via Auth.js
- SQL injection prevention via Prisma
- XSS protection via React + input validation
- Secure session cookies (httpOnly, sameSite)
- Environment variables for secrets
- No vulnerabilities in dependencies (pnpm audit clean)

### Security Review Completed

- ✅ No hardcoded secrets
- ✅ All dependencies updated
- ✅ Zero known vulnerabilities
- ✅ .gitignore configured correctly
- ✅ Input validation comprehensive
- ✅ Authentication/authorization secure

See: `docs/open-source-version/release-0.0/security-review.md`

---

## Testing

### Test Coverage

- **Total test files**: 43+
- **Test coverage**: 80%+ (unit tests)
- **All critical paths covered**
- **Integration tests**: Database operations
- **Component tests**: React components
- **API tests**: Server actions

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter web test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

See: `docs/open-source-version/release-0.0/test-results.md`

---

## Documentation

### Available Documentation

- **README.md**: Project overview and setup
- **TESTING.md**: Testing guide and patterns
- **CONTRIBUTING.md**: Contribution guidelines
- **docs/deployment/**: Deployment guides (Vercel, Docker)
- **docs/open-source-version/**: Release documentation
- **docs/development/**: Phase-by-phase development docs

### Key Documentation Files

- `docs/open-source-version/release-0.0/milestone-6.md`: This milestone
- `docs/open-source-version/release-0.0/test-results.md`: Test results
- `docs/open-source-version/release-0.0/security-review.md`: Security audit
- `docs/open-source-version/release-0.0/manual-test-results.md`: Manual testing checklist

---

## Contributing

We welcome contributions! Please see:

- **CONTRIBUTING.md**: Guidelines for contributors
- **Code of Conduct**: Community guidelines (in CONTRIBUTING.md)
- **Development workflow**: TDD approach documented

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Write tests first (TDD)
4. Implement feature
5. Ensure all tests pass
6. Submit pull request

---

## License

**MIT License**

Copyright (c) 2026 BuildInClicks

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

See: `LICENSE` file for full text.

---

## Credits

**Built and maintained by BuildInClicks**

### Core Technologies

- Next.js by Vercel
- React by Meta
- Prisma by Prisma Data
- Auth.js by Auth.js team
- Tailwind CSS by Tailwind Labs
- shadcn/ui by shadcn

### Special Thanks

- Open source community for amazing tools
- Contributors and early testers
- Everyone who provided feedback

---

## Support

### Getting Help

- **Documentation**: Check `docs/` folder first
- **GitHub Issues**: <repository-url>/issues
- **Discussions**: <repository-url>/discussions
- **Email**: support@buildinclicks.com (if applicable)

### Reporting Issues

Please include:

- BrumKit version
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs

---

## Roadmap

### Potential Future Enhancements (Not Committed)

- OAuth provider support (Google, GitHub)
- Article/blog system
- Comment system with threading
- Real-time notifications (WebSockets)
- Advanced search and filtering
- Admin dashboard UI
- Background job processing
- Multi-language support (full i18n)
- Email templates customization
- Two-factor authentication (2FA)
- API rate limiting dashboard

**Note**: These are potential enhancements. No timeline committed.

---

## Migration Guide

### From Internal Version

If you're migrating from an internal version:

1. **Remove OAuth code** if present
2. **Update database schema** (run migrations)
3. **Update environment variables** (check .env.example)
4. **Remove article/comment features** if used
5. **Test authentication flows** thoroughly
6. **Verify rate limiting** configuration

---

## Performance

### Benchmarks (Development)

- **Home page load**: < 500ms (cached)
- **Dashboard load**: < 1s (with data)
- **API response**: < 100ms (avg)
- **Database queries**: < 50ms (avg)

### Production Recommendations

- Use CDN for static assets
- Enable Next.js production mode
- Use connection pooling for database
- Implement caching strategy (Redis)
- Monitor performance with APM tool

---

## Deployment

### Supported Platforms

- **Vercel**: Recommended (guides included)
- **Docker**: Full Docker support
- **Self-hosted**: Any Node.js host
- **AWS/GCP/Azure**: Via Docker or Node.js

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Configure domain and SSL
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test authentication flows
- [ ] Verify email delivery
- [ ] Check rate limiting

See: `docs/deployment/README.md`

---

## Changelog

### v0.1.0 (2026-02-17)

**Initial Open Source Release**

- Complete authentication system
- User profile management
- Notification system
- Role-based authorization
- Comprehensive testing
- Full documentation
- Docker support
- Production-ready

---

## Conclusion

BrumKit v0.1.0 is a production-ready Next.js 15 starter kit that provides a solid foundation for building modern web applications. With comprehensive testing, security best practices, and excellent developer experience, it's ready for your next project.

**Happy coding! 🎉**

---

**Repository**: <repository-url>  
**Documentation**: <repository-url>/tree/main/docs  
**Issues**: <repository-url>/issues  
**License**: MIT  
**Version**: 0.1.0  
**Release Date**: February 17, 2026
