# Baybloom Studio

The storefront is under active development.

A storefront for ready-made **website templates for hospitality brands**: resorts, hotels and B&Bs, restaurants, spas and wedding venues. Every template is a complete multi-page site with a working live demo at `/demo/<slug>`; buyers download its standalone source code. Browsing and demos are public; prices, tier details and checkout require a client account.

The original spec is [`resort-design-store-build.md`](./resort-design-store-build.md). Since 2026-10-11 the store sells websites only: the architecture and interior products in that spec were removed.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Prisma 6 + Neon Postgres · Auth.js v5 · Tailwind CSS v4 + shadcn/ui · Motion · Zod. No Docker.

> Prisma 6 is used because Prisma 7 requires Node ≥ 22.12. Upgrade Node first if you want Prisma 7.

## Getting started

```bash
cp .env.example .env        # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET
npm install
npm run db:deploy           # apply migrations (use db:migrate while changing the schema)
npm run templates:pack      # build the source zips buyers download (storage/deliverables)
npm run db:seed             # industries, features, add-ons, 8 templates with screenshots and files
npm run dev
```

## Scripts

On this workspace, run tools through `node scripts/workspace-run.mjs npm ...`
(or `node scripts/workspace-run.mjs node ...`) to keep temporary files and caches
on E:. The wrapper removes its own temporary folder after each run. See
[workspace tools](docs/workspace-tools.md).

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `typecheck`, `lint` | `tsc --noEmit`, ESLint |
| `db:migrate` | `prisma migrate dev` (create + apply a migration) |
| `db:deploy` | `prisma migrate deploy` (production) |
| `db:seed` | Idempotent seed from `prisma/seed.ts` (catalog data in `prisma/catalog.ts`) |
| `templates:pack` | Packs each template into a standalone Next.js project zip in `storage/deliverables/<slug>/` |
| `templates:capture` | With the app running, screenshots every demo into `public/images/designs/<slug>/` (catalog images) |

## How price gating works

- Public data functions in `src/lib/catalog.ts` never select price columns.
- Prices are only read by `getDesignPricing()` / `getFromPrices()`, which check the session first (`src/lib/session.ts`).
- Pages render a static, cached shell; the price panel and account menu stream in behind `<Suspense>` per request.
- Price sorting is ignored for visitors (falls back to "newest").
- `GET /api/designs` and `GET /api/designs/[slug]` follow the same rules.

## Accounts & sessions

- Sessions are JWT cookies (required for email/password with Auth.js), but every request re-checks the user in the database, so disabling a client takes effect immediately.
- Changing or resetting a password sets `sessionsValidAfter`, which signs out every session that started earlier (the device that changed it is signed straight back in).
- Verification and reset links are single-use; only a SHA-256 hash of each token is stored. Reset links last 1 hour, verification links 24 hours.
- Email goes through Resend when `RESEND_API_KEY` is set (sender: `EMAIL_FROM`); otherwise emails are printed to the dev server console.
- Console email delivery is allowed only with `NODE_ENV=development`; all other environments require Resend configuration.
- Google never automatically links to an existing password account. Existing customers should use their password or email recovery.
- New passwords require at least 15 Unicode characters and at most 72 UTF-8 bytes; existing login credentials remain compatible.
- Registration, password changes and resets screen submitted passwords against Pwned Passwords using a padded five-character hash-prefix lookup. No full password/hash is sent. If screening is unavailable, setting a password waits for a retry; existing login remains available.
- Signup attempts share database-backed hourly limits: five per IP, three per email, and 100 account-creation attempts across password and Google signup. Existing linked Google logins do not consume signup capacity. IP limits depend on trusted ingress headers.
- Saving drafts or uploading photos requires a verified email. Existing saved content can still be read and existing photo-delete endpoints remain available; resend the verification link from My account.
- Administrators must enroll an authenticator and use a fresh code or a single-use recovery code to sign in. Password resets preserve MFA. See [administrative MFA](docs/admin-mfa.md) for migration/key requirements, recovery and rollout; client login behavior is unchanged.

## Payments (Stripe)

1. Put your **test-mode** keys in `.env`: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Forward webhooks locally with the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, then copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.
3. Pay with test card `4242 4242 4242 4242`, any future date, any CVC.

How it fits together:

- `POST /api/checkout` recomputes the cart on the server, creates a **PENDING** order (with item and billing snapshots) and a Stripe Checkout Session in PHP. A promo code becomes a one-off Stripe coupon.
- `POST /api/webhooks/stripe` verifies the signature and marks orders **PAID / FAILED / REFUNDED**. Every transition is a conditional update, so retries and duplicate events are safe; errors return 500 so Stripe retries.
- The success page also asks Stripe for the session status (server-side), so orders complete even if the webhook is late or not running in development.
- Paying clears the purchased designs from the cart, counts the coupon redemption and sends one confirmation email.
- Fully discounted (₱0) orders skip Stripe.

Checkout now persists buyer-scoped retry keys and immutable Stripe parameters.
Identical cart snapshots reuse an order across tabs. Coupon capacity is reserved
under a database row lock, then redeemed once at fulfillment or released after a
confirmed failure/expiration. Full refunds are terminal even if their webhook
arrives before checkout completion.

Before deploying these changes, read [the Phase 1 deployment guide](docs/phase-1-deployment.md).
`db:deploy` and `db:migrate` run a read-only safety gate for the older websites-only
migration. Do not bypass that gate on a populated database.

## Tests

`npm test` runs isolated security/payment regression tests using the existing
tsx loader and Node test runner. `npm run test:integration` additionally
requires an explicit `TEST_DATABASE_URL` pointing to a migrated disposable database
whose name contains `_test`. It never falls back to `.env` or the application database.

`npm run test:security:e2e` builds an isolated production app and tests browser
CSRF, XSS, object authorization, uploads, checkout and session revocation over
local HTTPS. It requires Chrome, OpenSSL and the guarded `.env.test.local`
database configuration. See [the security audit](docs/security-audit.md) for
findings, reproduction details and remaining public-launch requirements.

`npm run test:storage` tests photo quota races and rollback using tiny fixtures
in that same guarded test database. Saved draft photos, including hero and legacy
photo controls, share limits of 100 MiB per draft and 200 MiB per account.
Replacing a photo counts its resulting size; restoring photos frees capacity.
Purchased snapshots and delivered files are outside this draft quota.

Hosting is still in planning. The [restricted staging checklist](docs/staging-checklist.md)
records the infrastructure and provider checks to complete once a target is selected.

The [draft retention plan](docs/storage-retention.md) includes an aggregate,
read-only storage report. Automatic draft deletion remains disabled.

## Downloads

Audit Phase 2 adds a durable email worker, shared rate limits, cart recovery, structured error events, and PostgreSQL CI. Before deploying, follow [Phase 2 deployment and operations](docs/phase-2-deployment.md), including the migration and authenticated scheduler setup.

- Each design has `DeliverableFile`s with a minimum tier; a purchase unlocks files from Starter up to the tier bought.
- `GET /api/downloads/[orderItemId]?file=…` checks ownership, payment and tier, then redirects to a link that expires in 5 minutes.
- Production: set `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` (and `S3_REGION`, `auto` for R2) to serve presigned URLs from a **private** bucket.
- Development without S3: files live in `./storage` (git-ignored, written by the seed) and are served by `/api/files` only with a valid HMAC signature.

All eight templates now have explicit original/saved-content purchase choices, retained source releases, immutable purchase snapshots and a leased package-delivery queue. Generated packages use private storage with purchaser-authorized links. Follow [template export Phase 2](docs/template-export-phase2.md) for migrations, reviewed release activation, S3 write access and maintenance, and [template export Phase 3](docs/template-export-phase3.md) for the six additional standalone exports and verification commands. Existing private deliverables are preserved.

## Templates

| Template | Industry | Demo |
|---|---|---|
| Coral Cove | Beach resort | `/demo/coral-cove` |
| Pine Ridge Lodge | Mountain lodge | `/demo/pine-ridge-lodge` |
| Lumen Lake Villas | Lakeside villas | `/demo/lumen-lake-villas` |
| Isla Verde | Heritage hotel | `/demo/isla-verde-boutique` |
| Harbor House | Bed & breakfast | `/demo/harbor-house` |
| Ember & Salt | Restaurant & bar | `/demo/ember-and-salt` |
| Still Water | Day spa | `/demo/still-water-spa` |
| Bloomfield Gardens | Wedding venue | `/demo/bloomfield-gardens` |

How they're built:

- `src/templates/<slug>/` holds each template: `site.ts` (business details, nav, theme colours, base path), `content.ts` (rooms, menus, prices, copy), `fonts.ts`, `shell.tsx`, `pages/` and `components/`. Each has its own look; nothing is shared visually.
- `src/templates/_kit/` holds unstyled building blocks: a range/single calendar, deterministic demo availability, a headless room-booking hook, a lightbox, demo form submission and the credits list.
- Theme colours are CSS variables set by each template and exposed to Tailwind as `bg-tpl-*`, `text-tpl-*`, `font-tpl-*` (see `src/app/globals.css`).
- `src/app/demo/<slug>/` are thin route files. Demos render without the store chrome (store routes live under `src/app/(store)`), are `noindex`, and show a dismissible Baybloom bar.
- `npm run templates:pack` turns a template into a standalone project (routes moved to `/`, base path cleared, the demo bar dropped, README, style guide and photo credits added) and zips it. The seed attaches the zip to every tier, plus a guide per tier.

## Images

- Demo photography: freely licensed Wikimedia Commons photos in `public/templates/<slug>/`, with author, source and licence in `src/templates/<slug>/photos.json`. Each demo has a `/credits` page and `/credits` in the store lists them all.
- Catalog images are screenshots of the demos (`npm run templates:capture`), desktop pages plus one mobile home, stored with a `credits.json` the seed reads.

## Status

- [x] Phase 1 — foundation, auth (email/password + optional Google), schema, seed with images
- [x] Phase 2 — catalog (filters, search, sort, pagination), detail page (gallery, lightbox, mockups, tiers), price gating
- [x] Phase 3 — account area (profile, billing, orders, password), email verification, password reset, favorites page, compare (up to 3)
- [x] Phase 4 — cart & drawer, coupons, Stripe Checkout, webhooks, receipts, secure tiered downloads
- [x] Websites-only pivot — 8 hospitality templates with live demos, catalog screenshots, packaged source downloads
- [ ] Phase 5 — admin
- [ ] Phase 6 — polish, legal pages, Sentry, launch
