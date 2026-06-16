# Upgrade: TypeScript 5.x → 6.x

**Status:** Complete (Milestone 7, Sub-Track 9)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

TypeScript 6 is stable. This sub-track runs last to catch remaining type issues after all other upgrades.

## Breaking changes (upstream)

- `moduleResolution: "Node"` (Node10) is deprecated — use `Bundler` or `NodeNext`.
- `baseUrl` in tsconfig is deprecated — removed unused `baseUrl`/`paths` from `@repo/ui` and `@repo/auth` tsconfigs.

## Changes in this repo

- Catalog: `typescript: ^6.0.3`.
- `packages/config-typescript/node.json`: `module: ESNext`, `moduleResolution: Bundler`.
- `packages/config-eslint` peer: `typescript: ^6.0.0`.
- Full monorepo `pnpm type-check` passes.

## Commands for downstream users

```bash
pnpm add -D typescript@^6.0.3
pnpm type-check
```

Reference: [TypeScript 6 migration](https://aka.ms/ts6)
