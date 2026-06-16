# Upgrade: @casl/ability 6.x → 7.x

**Status:** Complete (Milestone 7, Sub-Track 5)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

CASL 7 improves `AbilityBuilder` typings. BrumKit's ability definitions in `packages/auth/src/permissions/abilities.ts` use the standard `createMongoAbility` pattern, which remains supported.

## Breaking changes (upstream)

- `AbilityBuilder` generic parameter changes (class-based inference).
- Stricter condition field typing in `can`/`cannot`.
- `@casl/react` 7.x aligns with `@casl/ability` 7.x.

## Changes in this repo

- Bumped `@casl/ability` to `^7.0.0` and `@casl/react` to `^7.0.0`.
- `defineAbilitiesFor()` in `abilities.ts` — no syntax changes required; existing `AbilityBuilder<AppAbility>(createMongoAbility)` pattern type-checks.
- `packages/auth/test/abilities.test.ts` passes.

## Commands for downstream users

```bash
pnpm --filter @repo/auth add @casl/ability@^7.0.0 @casl/react@^7.0.0
pnpm --filter @repo/auth test
```

Review the [CASL v7 guide](https://casl.js.org/) if you extend ability rules with custom conditions.
