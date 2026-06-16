# Upgrade: lucide-react 0.x → 1.x

**Status:** Complete (Milestone 7, Sub-Track 6)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

lucide-react 1.x is stable and backward-compatible for the icon names used in BrumKit. This is an isolated UI-only upgrade with no schema or API surface changes.

## Breaking changes (upstream)

- Major version bump; some legacy icon aliases were removed upstream.
- Import paths remain `lucide-react`.

## Changes in this repo

- Bumped `lucide-react` to `^1.18.0` in `apps/web/package.json` and `packages/ui/package.json`.
- Audited all icon imports under `apps/web/` and `packages/ui/` — no renamed icons required changes.
- `pnpm type-check` confirms all icon imports resolve.

## Commands for downstream users

```bash
pnpm add lucide-react@^1.18.0
pnpm type-check
```

If type-check reports missing icons, consult the [lucide migration guide](https://lucide.dev/guide/packages/lucide-react).
