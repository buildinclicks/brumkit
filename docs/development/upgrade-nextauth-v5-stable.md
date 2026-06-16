# Upgrade: next-auth v5 Beta → Stable

**Status:** Deferred (Milestone 7, Sub-Track 4)  
**Blocked on:** npm stable `5.x.x` (non-beta) release

## Current state

As of June 2026, `next-auth` v5 remains in beta (`5.0.0-beta.31` latest). BrumKit stays on `5.0.0-beta.25` per milestone sequencing — do not bump to stable until a non-beta tag ships.

## When to start

1. Confirm `npm view next-auth version` returns `5.0.0` or higher without `-beta`.
2. Compare release notes from `beta.25` → stable for breaking changes.
3. Update `next-auth` and `@auth/prisma-adapter` in `apps/web` and `packages/auth`.
4. Verify JWT session callbacks (`id`, `role`, `username`) and `PrismaAdapter`.
5. Run `packages/auth/test/`.

## Acceptance criteria (unchanged)

- [ ] Stable tag published on npm
- [ ] Migration doc updated with delta from beta.25
- [ ] `pnpm test` green in `@repo/auth` and `apps/web`
- [ ] Changeset with appropriate version bump

## Branch naming

`upgrade/nextauth-v5-stable`
