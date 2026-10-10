# Baybloom Studio

A private storefront for resort designs (website templates, architecture and interior packages). Browsing is public; prices, tier details and checkout require a client account. See [`resort-design-store-build.md`](./resort-design-store-build.md) for the full spec.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Prisma 6 + Neon Postgres · Auth.js v5 · Tailwind CSS v4 + shadcn/ui · Motion · Zod. No Docker.

> Prisma 6 is used because Prisma 7 requires Node ≥ 22.12. Upgrade Node first if you want Prisma 7.

## Getting started

```bash
cp .env.example .env        # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET
npm install
npm run db:deploy           # apply migrations (use db:migrate while changing the schema)
npm run db:seed             # categories, features, add-ons, 8 designs with images
npm run dev
```

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `typecheck`, `lint` | `tsc --noEmit`, ESLint |
| `db:migrate` | `prisma migrate dev` (create + apply a migration) |
| `db:deploy` | `prisma migrate deploy` (production) |
| `db:seed` | Idempotent seed from `prisma/seed.ts` |

## How price gating works

- Public data functions in `src/lib/catalog.ts` never select price columns.
- Prices are only read by `getDesignPricing()` / `getFromPrices()`, which check the session first (`src/lib/session.ts`).
- Pages render a static, cached shell; the price panel and account menu stream in behind `<Suspense>` per request.
- Price sorting is ignored for visitors (falls back to "newest").
- `GET /api/designs` and `GET /api/designs/[slug]` follow the same rules.

## Images

Seed photos are freely licensed images from Wikimedia Commons, stored in `public/images/designs/<slug>/` as WebP (hero 1920px, gallery 1400px, `thumbs/` 400×300). Each folder has a `credits.json` with author, source and license; `/credits` lists them all. They are illustrative samples to be replaced with real work through the admin (phase 5).

## Status

- [x] Phase 1 — foundation, auth (email/password + optional Google), schema, seed with images
- [x] Phase 2 — catalog (filters, search, sort, pagination), detail page (gallery, lightbox, mockups, tiers), price gating
- [ ] Phase 3 — favorites page, compare, account area, email verification, password reset
- [ ] Phase 4 — cart, coupons, Stripe checkout, webhooks, downloads
- [ ] Phase 5 — admin
- [ ] Phase 6 — polish, legal pages, Sentry, launch
