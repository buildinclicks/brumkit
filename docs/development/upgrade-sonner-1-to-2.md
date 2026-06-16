# Upgrade: sonner 1.x → 2.x

**Status:** Complete (Milestone 7, Sub-Track 7)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

Sonner 2.x is stable. BrumKit uses the standard `toast()` API and the `Toaster` wrapper — both remain compatible.

## Breaking changes (upstream)

- Internal API refinements for dismiss behaviour and theme integration.
- `toast()` call sites in `apps/web/` required no changes.

## Changes in this repo

- Updated pnpm catalog: `sonner: ^2.0.7`.
- Added `'use client'` to `packages/ui/src/components/ui/sonner.tsx` (required for Next.js 16 RSC boundaries).
- Verified toast usage in auth and profile forms — no API changes needed.

## Commands for downstream users

```bash
# In pnpm catalog or package.json
pnpm add sonner@^2.0.7
```

Ensure your `Toaster` wrapper is a Client Component (`'use client'`).
