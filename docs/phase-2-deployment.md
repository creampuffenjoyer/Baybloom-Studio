# Phase 2 deployment and operations

Code is implemented locally. Production migrations, scheduling, and alert rules are not applied by this change.

For the later personalized purchase snapshots, release registration and package delivery, also follow [template export Phase 2](template-export-phase2.md). Its migration and activation steps are additional to this earlier commerce reliability phase.

## Deploy

1. Follow the historical-data preflight and backup requirements in [Phase 1](phase-1-deployment.md). Run `npm run db:deploy` before deploying this code. The additional migration is `20261031120000_delivery_and_limits`.
2. Configure `RESEND_API_KEY`, a verified `EMAIL_FROM`, the canonical HTTPS `NEXT_PUBLIC_SITE_URL`, and a random `MAINTENANCE_SECRET` of at least 32 characters. Never expose the secret as a public environment variable.
3. Configure your scheduler to POST `/api/jobs/maintenance` every minute with `Authorization: Bearer <MAINTENANCE_SECRET>`. Store this header in the scheduler's secret store. The endpoint deliberately does not accept unauthenticated requests or query-string credentials. With personalized package delivery, a 120-second execution limit is required. Check the scheduler's first successful response after deployment.
4. Configure your existing log platform to alert on `maintenance_failed`, `confirmation_exhausted`, nonzero `exhausted`/`overdue` counts in `maintenance_completed`, repeated `stripe_handler_failed`, and spikes in `request_failed`. Alert if no `maintenance_completed` event arrives for five minutes. These rules require infrastructure configuration; the code emits events but does not provision an alerting service.
5. Run CI with its disposable PostgreSQL service before release. No integration test may point to the application database. CI runs migrations, lint, route type generation, type checking, unit tests, PostgreSQL integration tests, seed, and a production build.

## Delivery behavior

Order columns form a transactional confirmation-email outbox. Payment fulfillment marks the order paid and queues delivery in the same transaction. Webhooks no longer wait for email. The migration queues previously paid orders with no `confirmationSentAt`; existing non-null markers are preserved and may require review if an old worker crashed after setting one.

The worker locks due rows with `FOR UPDATE SKIP LOCKED`, acquires a two-minute lease, freezes the email payload, and sends outside the transaction. Confirmation is marked sent only after the provider accepts the request. A crashed worker's lease expires automatically. Provider requests have a 15-second timeout. Failures use exponential backoff, stopping after eight attempts for operator review. An order refunded before claiming is skipped; a refund racing an already-started send cannot recall that email.

Delivery is at least once. A stable provider idempotency key suppresses duplicate sends within [Resend's 24-hour retention window](https://resend.com/docs/dashboard/emails/idempotency-keys). A long outage or crash after provider acceptance but before the database update can still cause a duplicate outside that window. Do not promise exactly-once delivery. Preserve the configured sender while retries are outstanding.

The endpoint now processes up to two confirmation messages and one purchased package per call, and removes up to 1,000 expired rate-limit rows. Package jobs use a separate three-minute lease; confirmation leases remain two minutes. Monitor backlog; for higher traffic, increase scheduler frequency or use multiple workers within provider limits. Row leases permit concurrent workers.

To inspect failed jobs, query paid orders with null `confirmationSentAt` and `confirmationAttempts >= 8`. Check delivery with the provider using `order-confirmation/<order-id>` before manually requeueing an individual order. Once the provider issue is resolved, reset that order's attempts to zero, clear both lease fields, and set `confirmationNextAt` to now. Preserve its frozen payload. Never blindly reset sent markers or bulk replay confirmations.

## Shared limits and cart recovery

Rate limits now use atomic PostgreSQL upserts and database time across server instances. Keys are SHA-256 digests of the existing limiter identifiers (not a substitute for database access controls). A database outage fails closed. The scheduled cleanup bounds expired-row retention. This adds one database round-trip per limiter check; monitor latency and connection utilization, and consider Redis if load justifies another service. IP-based rules still require a trusted ingress that overwrites forwarding headers.

Cart reads and writes are serialized within each mounted provider. Network failures preserve the last snapshot but block checkout until a successful refresh. Signed-out state has a login link, and navigation/focus triggers resynchronization. Server validation errors remain visible in the initiating form. Changes in other tabs are reconciled on focus; this is not a cross-tab transaction lock.

## Validation and remaining work

`npm test` covers commerce/security behavior, request queue ordering after failures, fail-closed rate limiting, and maintenance authorization. `npm run test:integration` adds PostgreSQL coupon concurrency, authorization, shared-limit concurrency/expiry, outbox leases, retries, payload stability, exhaustion, and refund suppression. Locally it requires an explicitly supplied migrated `TEST_DATABASE_URL` with `_test` in its database name and different from `DATABASE_URL`; without it, the suite reports skipped. CI supplies that database automatically.

Browser end-to-end coverage, real provider sandbox exercises, hosted error dashboards, and production scheduler verification remain follow-up work. Existing development-tool dependency advisories from Phase 1 remain a separate upgrade task; no forced major-version downgrades were introduced here.
