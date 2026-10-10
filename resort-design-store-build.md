# Baybloom Studio: Build Specification

**Baybloom Studio** is a private design store where clients browse resort designs (website templates and architectural/interior packages), log in to see pricing, filter by features and price tier, and pay online.

---

## 1. Overview

**Goal:** A catalog-style storefront for resort designs. Browsing is public; pricing, full details, and checkout require a client account.

**Product types**
1. **Website designs**: ready-made resort website templates (booking pages, room galleries, packages, contact/map, etc.).
2. **Architectural / interior designs**: resort layouts, villa plans, interior concepts, shown as renders and plan previews.

**Users**
- **Visitor**: browses catalog, sees teaser info (title, hero image, category, tier badge). No prices.
- **Client** (logged in): sees prices, full galleries, feature lists, can favorite, compare, and buy.
- **Admin**: manages designs, pricing, orders, clients.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Auth.js (NextAuth) with email/password + Google |
| Styling | Tailwind CSS + shadcn/ui |
| Payments | Stripe Checkout (cards) and optionally PayMongo (GCash, Maya, local cards) |
| File storage | S3-compatible bucket (Cloudflare R2 or AWS S3) |
| Image delivery | next/image + CDN, WebP/AVIF |
| Email | Resend or Nodemailer |
| Hosting | Vercel (app) + Neon/Supabase (Postgres) |
| Validation | Zod |
| Animation | Framer Motion (Motion), plus CSS transitions for simple effects |

### Environment constraint: no Docker
**Do not use Docker for now.** Docker is not available in the dev environment, so:
- No `Dockerfile`, `docker-compose.yml`, or devcontainers. Do not add container-based scripts to `package.json`.
- **Database:** use a hosted Postgres (Neon or Supabase free tier) for development and production, or a natively installed local Postgres if available. Set `DATABASE_URL` accordingly.
- **File storage:** use Cloudflare R2 / S3 directly, or the local `/public/uploads` folder during early development. Do not use a local MinIO container.
- **Email in dev:** log emails to the console or use Resend's test mode instead of a local mail container.
- Run everything with plain `npm run dev`, `npx prisma migrate dev`, and `npx prisma db seed`.
- Deployment is through Vercel (no container image required). Revisit Docker later if it becomes available.

---

## 3. Core Features

### 3.1 Public catalog
- Grid of design cards: hero image, title, category, tier badge (Starter / Standard / Premium), short blurb.
- **Price hidden** for visitors; replaced with "Log in to see pricing".
- Filters: product type, category (beach, mountain, lake, eco, luxury, boutique), style, tier, features.
- Search by name or keyword.
- Sort: newest, popular, name (price sort available to logged-in users only).
- Pagination or infinite scroll.

### 3.2 Design detail page
- Image gallery / lightbox (renders, plan previews, mobile and desktop mockups).
- **Live demo link** or preview iframe for website designs.
- Feature checklist (see 3.3).
- Included files / deliverables list.
- Tier comparison (what each price level includes).
- Logged in: price, add-ons, "Buy now" and "Add to cart".
- Visitor: blurred or locked price panel with login/register call to action.
- Related designs.

### 3.3 Feature tags (examples)
**Website designs:** online booking, room availability calendar, payment gateway, multi-language, blog, virtual tour, gallery, event/wedding inquiry, CMS admin, SEO setup, mobile app-style PWA.

**Architectural / interior:** floor plans, 3D renders, material schedule, lighting plan, landscape plan, cost estimate, revision rounds, CAD files.

### 3.4 Pricing tiers
Each design has one or more tiers, each with its own price and inclusions.

| Tier | Typical inclusions |
|---|---|
| Starter | Base design, limited pages/renders, 1 revision |
| Standard | Full design, more features, 2-3 revisions |
| Premium | Everything, source files, priority support, custom tweaks |

Add-ons (priced separately): extra revisions, custom branding, hosting setup, additional languages.

### 3.5 Client accounts
- Register / login / password reset / email verification.
- Profile and billing details.
- **Favorites** (wishlist).
- **Compare** up to 3 designs side by side.
- **Order history** and downloadable deliverables after payment.
- Invoices/receipts.

### 3.6 Cart and checkout
- Cart supports multiple designs and add-ons.
- Coupon/promo codes.
- Online payment via Stripe (and/or PayMongo).
- Order confirmation email and receipt.
- Webhook-driven order status (pending, paid, failed, refunded).
- Secure, time-limited download links for purchased files.

### 3.7 Admin dashboard
- CRUD for designs, tiers, add-ons, categories, feature tags.
- Bulk image upload and reorder.
- Publish / draft / archive toggle.
- Manage clients (view, disable).
- Orders list with filters, refund action, resend deliverables.
- Coupons management.
- Basic analytics: views per design, favorites, conversion, revenue.

---

## 4. Database Schema (Prisma sketch)

```prisma
enum Role { CLIENT ADMIN }
enum ProductType { WEBSITE ARCHITECTURE INTERIOR }
enum OrderStatus { PENDING PAID FAILED REFUNDED }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  passwordHash  String?
  role          Role     @default(CLIENT)
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  favorites     Favorite[]
  orders        Order[]
}

model Design {
  id          String      @id @default(cuid())
  slug        String      @unique
  title       String
  summary     String
  description String
  type        ProductType
  category    Category    @relation(fields: [categoryId], references: [id])
  categoryId  String
  heroImage   String
  demoUrl     String?
  status      String      @default("DRAFT") // DRAFT | PUBLISHED | ARCHIVED
  viewCount   Int         @default(0)
  createdAt   DateTime    @default(now())
  images      DesignImage[]
  tiers       Tier[]
  features    DesignFeature[]
  addons      Addon[]
  favorites   Favorite[]
}

model DesignImage {
  id       String @id @default(cuid())
  design   Design @relation(fields: [designId], references: [id])
  designId String
  url      String
  alt      String?
  position Int    @default(0)
}

model Tier {
  id         String @id @default(cuid())
  design     Design @relation(fields: [designId], references: [id])
  designId   String
  name       String          // Starter | Standard | Premium
  priceCents Int
  currency   String @default("PHP")
  inclusions String[]
  revisions  Int    @default(1)
}

model Addon {
  id         String @id @default(cuid())
  design     Design @relation(fields: [designId], references: [id])
  designId   String
  name       String
  priceCents Int
}

model Category {
  id      String   @id @default(cuid())
  name    String   @unique
  slug    String   @unique
  designs Design[]
}

model Feature {
  id      String @id @default(cuid())
  name    String @unique
  group   String           // e.g. "Booking", "Marketing"
  designs DesignFeature[]
}

model DesignFeature {
  design    Design  @relation(fields: [designId], references: [id])
  designId  String
  feature   Feature @relation(fields: [featureId], references: [id])
  featureId String
  @@id([designId, featureId])
}

model Favorite {
  user     User   @relation(fields: [userId], references: [id])
  userId   String
  design   Design @relation(fields: [designId], references: [id])
  designId String
  @@id([userId, designId])
}

model Order {
  id            String      @id @default(cuid())
  user          User        @relation(fields: [userId], references: [id])
  userId        String
  status        OrderStatus @default(PENDING)
  totalCents    Int
  currency      String
  paymentRef    String?
  couponCode    String?
  createdAt     DateTime    @default(now())
  items         OrderItem[]
}

model OrderItem {
  id         String @id @default(cuid())
  order      Order  @relation(fields: [orderId], references: [id])
  orderId    String
  designId   String
  tierId     String
  priceCents Int
  addonIds   String[]
}

model Coupon {
  id          String   @id @default(cuid())
  code        String   @unique
  percentOff  Int?
  amountOffCents Int?
  expiresAt   DateTime?
  active      Boolean  @default(true)
}
```

---

## 5. Pages and Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Hero, featured designs, categories, how it works |
| `/designs` | Public | Catalog with filters and search |
| `/designs/[slug]` | Public (price gated) | Design detail |
| `/compare` | Client | Side-by-side comparison |
| `/favorites` | Client | Saved designs |
| `/cart` | Client | Cart review |
| `/checkout` | Client | Payment |
| `/account` | Client | Profile, orders, downloads |
| `/login`, `/register`, `/forgot-password` | Public | Auth |
| `/admin` | Admin | Dashboard |
| `/admin/designs` | Admin | Manage designs |
| `/admin/orders` | Admin | Manage orders |
| `/admin/clients` | Admin | Manage clients |
| `/admin/coupons` | Admin | Manage coupons |

---

## 6. API (Route Handlers / Server Actions)

- `GET /api/designs?type=&category=&tier=&features=&q=&sort=&page=`
- `GET /api/designs/[slug]` (price fields stripped unless session exists)
- `POST /api/favorites` and `DELETE /api/favorites/[designId]`
- `POST /api/cart` (or client-side cart synced to DB)
- `POST /api/checkout` creates a Stripe Checkout session
- `POST /api/webhooks/stripe` marks the order paid and issues download access
- `GET /api/downloads/[orderItemId]` returns a signed, time-limited URL after ownership check
- Admin: `POST/PATCH/DELETE /api/admin/designs`, `/tiers`, `/coupons`, `/orders/[id]/refund`

**Price gating rule:** enforce on the server. Never send price data to the client for unauthenticated requests; hiding it in the UI alone is not enough.

---

## 7. UI / Design Direction

- Premium, airy resort aesthetic: large imagery, generous whitespace, soft neutral palette with one accent.
- Serif headings, clean sans-serif body.

**Brand: Baybloom Studio** (the "bay" for coastal calm, the "bloom" for tropical flowers and growth)

| Role | Color | Hex (starting point) |
|---|---|---|
| Primary | Deep bay teal | `#0F4C5C` |
| Accent | Hibiscus coral | `#E36A5D` |
| Secondary | Sea-glass green | `#9CC5B4` |
| Background | Warm sand | `#FAF6F0` |
| Surface | White | `#FFFFFF` |
| Text | Ink | `#1B2A2F` |

- Logo idea: a simple wordmark with a small bloom (hibiscus or frangipani) replacing or accenting the "o" in "Bloom". Provide light and dark versions.
- Tagline options: "Designs for resorts that bloom." or "Your resort, beautifully designed."
- Use the accent color sparingly (CTAs, favorite hearts, active filters); keep the teal for headings and nav.
- Card hover shows quick-view and favorite heart.
- Sticky filter sidebar on desktop, drawer on mobile.
- Locked-price state: blurred price chip with a lock icon and "Log in to view pricing".
- Fully responsive, WCAG AA contrast, keyboard-navigable gallery.

### 7.1 Animations
Animations should feel smooth and premium, never distracting. Use Framer Motion for orchestrated effects and CSS for simple ones.

- **Hero:** slow Ken Burns zoom or parallax on the hero image, headline and CTA fade-up with a staggered delay.
- **Scroll reveals:** sections, cards, and feature lists fade and slide in as they enter the viewport (`whileInView`, animate once).
- **Catalog grid:** staggered card entrance; animated layout transitions when filters change (`AnimatePresence` + `layout`).
- **Card hover:** subtle image zoom, lift with shadow, favorite heart pop, quick-view button sliding up.
- **Design detail gallery:** animated lightbox open/close, smooth slide between images, thumbnail strip with active-state transition.
- **Locked price:** gentle blur-to-reveal animation after login; lock icon shake on click when logged out.
- **Page transitions:** short fade/slide between routes.
- **Cart and checkout:** slide-in cart drawer, animated item add/remove, success checkmark animation on payment.
- **Skeletons and loaders:** shimmer placeholders while images and data load.
- **Number counters** on the home page stats (designs available, happy clients).
- **Accessibility:** respect `prefers-reduced-motion` and disable or simplify all non-essential motion for those users. Keep durations around 200-600 ms with ease-out curves, and animate only `transform` and `opacity` for performance.

---

## 7A. Image Sourcing (done by Claude Code)

Claude Code should find and add all catalog pictures itself by searching the web. Do not leave placeholder gray boxes in the final seed data.

**Process**
1. For each seeded design, search the web for fitting resort imagery (beach resort, mountain lodge, lake villa, eco resort, luxury suite, pool, lobby, spa, villa floor plan style, interior concepts, website mockup-style screenshots).
2. **Use only freely licensed sources:** Unsplash, Pexels, Pixabay, or Wikimedia Commons (CC0 / free-to-use licenses). Do not scrape copyrighted resort or competitor sites.
3. Download each chosen image into `/public/images/designs/<slug>/` (or upload to the storage bucket), optimized to WebP/AVIF at sensible sizes (hero about 1920 px wide, gallery about 1400 px, thumbnails about 400 px).
4. Save descriptive filenames and `alt` text for every image.
5. Record **attribution data** (photographer, source URL, license) in a `credits.json` per design, and show a credits page or footer link where the license requires it.
6. Insert the image records into `DesignImage` through `prisma/seed.ts`, with the first image as `heroImage`.
7. Aim for 1 hero + 4 to 6 gallery images per design, with variety (exterior, room, pool, dining, detail).
8. If an image fails to download or the source blocks automated requests, skip it and pick another from a different allowed source, then report which ones failed.

**Notes**
- Website-template designs need mockup-style visuals. Where no suitable photo exists, compose device mockups (laptop/phone frames) around the resort photos using CSS/SVG rather than copying someone else's site design.
- Architectural/interior designs can use renders-style photos; clearly treat them as illustrative samples, not real deliverables, until the admin uploads actual work.
- The admin dashboard must still let the owner replace seed images with their own uploads later.

---

## 8. Security and Compliance

- Hash passwords (Argon2 or bcrypt); rely on Auth.js for sessions.
- Server-side authorization on every price, order, and download endpoint.
- Rate-limit login, register, and checkout endpoints.
- CSRF protection, input validation with Zod, parameterized queries via Prisma.
- Verify Stripe webhook signatures; never trust client-reported payment status.
- Signed URLs for paid files; private bucket for deliverables.
- Store no card data (handled by the payment provider).
- Privacy policy, terms, and refund policy pages.

---

## 9. Performance and SEO

- Static generation / ISR for catalog and detail pages.
- Image optimization, lazy loading, blur placeholders.
- Metadata, Open Graph tags, sitemap, structured data (Product schema without price for visitors).
- Target Lighthouse 90+.

---

## 10. Build Phases

**Phase 1: Foundation**
- Project setup (no Docker), Tailwind, shadcn/ui, Framer Motion, Prisma + hosted Postgres, Auth.js.
- Seed data (categories, features, sample designs).
- Claude Code searches the web for free-license images and wires them into the seed (see section 7A).

**Phase 2: Catalog**
- Design list with filters, search, sort.
- Design detail with gallery and feature list.
- Price gating logic.

**Phase 3: Client features**
- Favorites, compare, account area.

**Phase 4: Commerce**
- Cart, coupons, Stripe/PayMongo checkout, webhooks, order emails.
- Secure downloads.

**Phase 5: Admin**
- Design/tier/add-on CRUD, image upload, orders, clients, coupons, analytics.

**Phase 6: Polish and launch**
- Responsive QA, accessibility, SEO, security review, error monitoring (Sentry), deploy.

---

## 11. Folder Structure

```
/src
  /app
    /(public)  page.tsx, designs/, designs/[slug]/
    /(client)  favorites/, compare/, cart/, checkout/, account/
    /admin     designs/, orders/, clients/, coupons/
    /api       designs/, favorites/, checkout/, webhooks/, downloads/
  /components  ui/, catalog/, design/, checkout/, admin/
  /lib         db.ts, auth.ts, stripe.ts, storage.ts, validators.ts
  /prisma      schema.prisma, seed.ts
```

---

## 12. Environment Variables

```
NEXT_PUBLIC_SITE_NAME="Baybloom Studio"
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
RESEND_API_KEY=
```

---

## 13. Acceptance Criteria

- Visitors can browse and filter designs but never receive price data.
- Logged-in clients see prices, tiers, and add-ons.
- A client can add designs to the cart, pay online, and download purchased files.
- Admin can create, edit, publish, and archive designs with multiple tiers and images.
- Webhook failures do not leave orders in an inconsistent state.
- All pages pass basic accessibility checks and work on mobile.
- The project runs and deploys with no Docker dependency.
- Animations are present on hero, catalog, gallery, and checkout, and are disabled under `prefers-reduced-motion`.
- Every seeded design has real, freely licensed images with alt text and recorded attribution.

---

## 14. Open Items / Future Ideas

- Custom design request form (quote for bespoke work).
- Client project dashboard with revision requests and file delivery.
- Reviews and testimonials.
- Multi-currency support.
- AI-assisted design recommendations based on budget and style quiz.
