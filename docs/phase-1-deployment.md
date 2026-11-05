# Phase 1 deployment and verification

The checkout safety migration is additive. No application database was migrated
as part of this change. Deploy this migration before starting the new app version.
Drain old checkout writers during deployment: they do not participate in the new
coupon reservation locks. Keep webhook delivery enabled and reconcile old pending
orders with Stripe before reopening checkout traffic.

## Historical migration gate

Use `npm run db:deploy` (or `npm run db:migrate` in development). Both run a read-only
preflight before Prisma. Do not bypass it with a direct Prisma migration command.
The original `20261011090000_websites_only` migration is deliberately unchanged to
preserve checksums on databases where it is already applied.

If that migration is pending and historical non-website purchases or empty orders
exist, deployment stops. Take a verified backup and rehearse recovery on a copy.
Preserve discontinued designs as archived records and preserve all receipt line
items/totals. A database-specific archival/baseline migration is required before
proceeding; do not delete purchases to make the gate pass. The preflight is not an
automatic repair and should not be used concurrently with old catalog writers.

If the migration already ran, deleted records cannot be reconstructed from the
current schema. Compare a pre-migration backup and Stripe receipts; prepare a
reviewed forward restoration of affected order snapshots. No historical data has
been restored automatically.

## Configuration

- `RESEND_API_KEY` is required outside `NODE_ENV=development`. Missing configuration
  throws without logging email content or recovery links. Verify sender/domain
  configuration with a real delivery test before enabling registration.
- Set the canonical HTTPS `NEXT_PUBLIC_SITE_URL`, Stripe secret and webhook secret.
- Subscribe to checkout completion, asynchronous success/failure, expiration, and
  `charge.refunded`. Fully refunded orders are terminal; partial refunds retain
  access as before.
- Google sign-in accepts an already linked Google identity or creates a new user.
  Existing password accounts are never implicitly linked, even with a verified
  email. Users can log in with their password or recover it via email instead.
  For accounts linked under the old policy, review mixed Google/password accounts;
  invalidate sessions and require password recovery if prior pre-hijacking is
  suspected. A verified row alone cannot establish historical credential ownership.

## Dependency patches and remaining advisory triage

Next.js and its ESLint configuration are pinned to 16.4.3, and the application's
Zod is pinned to 4.6.6. Next.js 16.4.0 is affected by the October 2026 Cache
Components RCE and Server Actions DoS advisories; the vendor's patched floor is
16.4.1. See https://nextjs.org/blog/nextjs-security-update-october-14-2026.

The full npm audit still reports development/tooling advisory paths, including
shadcn's nested Zod and its tool-server dependencies, ESLint/minimatch, and Prisma's
deepmerge-ts. No blanket `npm audit fix --force` was applied: its proposed Prisma
and ESLint downgrades would break the current configuration. Prisma's merge path
loads the trusted local `prisma.config.ts`; the recursive-object issue is not
reachable from plain JSON or the application's HTTP handlers. This is a scoped
reachability assessment, not a claim that all dependencies are vulnerability-free.
Track the remaining tooling upgrades in Phase 2, and do not expose development CLI
servers to untrusted networks or run untrusted project configurations.

## Checkout and coupon lifecycle

The browser persists a UUID retry key for the current cart in session storage.
The server scopes keys to the authenticated user and also deduplicates identical
server-priced cart snapshots across tabs. Stripe parameters and their one-hour
expiration are immutable. Failed/ambiguous requests retain the same order and
coupon reservation. A changed cart may start a separate checkout; an earlier
open Stripe session remains payable until it expires.

Coupon capacity is `redemptions + reserved orders`. Reservations convert to
redemptions transactionally, including zero-total orders. Refunds do not restore
previously counted redemptions. Confirmed expired/failed sessions release capacity.
Checkout requests also reconcile up to twenty expired attempts per request. Stripe
API uncertainty keeps the slot reserved. For an orphaned session response, recovery
lists Stripe sessions created since that order and matches both order and user
metadata before releasing a slot. Reservations with no Stripe session are released
only after fixed expiry plus a five-minute in-flight buffer.

Legacy pending orders are conservatively reserved by the new migration. Their
expiry is unknown; reconcile their `paymentRef` against Stripe and replay the
appropriate events. Never bulk-release them merely because they are old. A periodic
reconciliation worker and a durable email outbox remain Phase 2 work.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run lint`.

For real database concurrency tests, provision a separate disposable PostgreSQL
database, apply migrations to that database, and set `TEST_DATABASE_URL` explicitly
before `npm run test:integration`. The runner refuses to use `DATABASE_URL` as its
test target and never loads `.env`. Do not point it at a real customer database.
The tests create and delete only their own fixture records.

Before release, exercise Stripe test-mode success, abandoned checkout, a lost
checkout response, duplicate webhooks, refund-before-completion, and expiration.
Confirm that a refunded order cannot download files. Never use live charges for
these checks.
