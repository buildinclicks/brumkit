# Upgrade: Zod 3.x → 4.x

**Status:** Complete (Milestone 7, Sub-Track 3)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

Zod 4 is stable with improved error customization and performance. BrumKit defers this until M4 test coverage was in place (≥80%).

## Breaking changes (upstream)

| Zod 3                                   | Zod 4                                      |
| --------------------------------------- | ------------------------------------------ |
| `error.errors`                          | `error.issues`                             |
| `required_error` / `invalid_type_error` | `error` param                              |
| `errorMap`                              | `error` param                              |
| `z.nativeEnum()`                        | `z.enum()`                                 |
| `z.string().cuid()`                     | `z.cuid()`                                 |
| `.flatten()` / `.format()`              | `z.treeifyError()` or `zodErrorToObject()` |

## Changes in this repo

- Catalog: `zod: ^4.4.3`.
- Updated all rules in `packages/validation/src/rules/` to use `{ error: message }`.
- `error-formatter.ts` uses `error.issues`.
- `user.schema.ts`: `z.enum(UserRole)` via `@repo/database/enums`.
- Server actions (`auth.ts`, `user.ts`, `email-change.ts`) use `error.issues`.
- `account-deletion.ts` uses `zodErrorToObject()` instead of `.flatten()`.
- All 139 validation tests pass.

## Commands for downstream users

```bash
pnpm add zod@^4.4.3
```

Run a project-wide search for `.errors`, `required_error`, `nativeEnum`, and `.flatten()` on `ZodError` instances.

Reference: [Zod v4 migration guide](https://zod.dev/v4/changelog)
