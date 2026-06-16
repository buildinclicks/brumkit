# Upgrade: resend 4.x → 6.x

**Status:** Complete (Milestone 7, Sub-Track 8)  
**Branch:** `upgrade/m7-post-1.0-major-upgrades`

## Why now

Resend 6.x is the current stable line. BrumKit's email client uses the `Resend` constructor and `client.emails` API — both remain compatible.

## Breaking changes (upstream)

- v5 and v6 changelogs include attachment and batch API changes; BrumKit does not use affected APIs.
- `packages/email/src/client.ts` required no code changes beyond the version bump.

## Changes in this repo

- Bumped `resend` to `^6.12.4` in `packages/email/package.json`.
- `packages/email/test/client.test.ts` passes with the new client.

## Commands for downstream users

```bash
pnpm --filter @repo/email add resend@^6.12.4
pnpm --filter @repo/email test
```

Production still requires `RESEND_API_KEY`; development continues to use Mailhog via nodemailer.
