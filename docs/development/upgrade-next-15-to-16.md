# Upgrade: Next.js 15.x → 16.x

**Status:** Complete (Milestone 7, Sub-Track 1)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

Next.js 16 is stable; `next-intl`, `@tailwindcss/postcss`, and `@auth/nextjs` compatibility confirmed for BrumKit's dependency set.

## Breaking changes (upstream)

- Stricter React Server Components boundaries — client-only modules must declare `'use client'`.
- Turbopack improvements for `next dev` (optional `--turbo` flag).
- `eslint-config-next` must match Next major version.

## Changes in this repo

- `next: ^16.2.9` in `apps/web` and `@repo/auth` devDependencies.
- `eslint-config-next: ^16.2.9` in `@repo/config-eslint`.
- Added `'use client'` to:
  - `packages/ui/src/components/ui/form.tsx`
  - `packages/ui/src/components/ui/sonner.tsx`
  - `packages/ui/src/components/forms/form-helpers.tsx`
- `pnpm build` succeeds with all routes.

## Commands for downstream users

```bash
pnpm --filter web add next@^16.2.9
pnpm add -D eslint-config-next@^16.2.9
```

Audit any barrel imports from `@repo/ui` in Server Components — client-only exports need `'use client'` in their source files.

Reference: [Next.js 16 release notes](https://nextjs.org/blog)
