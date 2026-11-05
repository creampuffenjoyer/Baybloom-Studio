# Part 1 — Buyer journey and preview audit

Reviewed 2026-11-01. This is the first step of the UX improvement plan, separate from the technical audit phases. No storefront behavior, pricing policy, or template implementation changes are made here.

## Evidence and limits

- Inspected catalog cards/filters, design detail, pricing, comparison, checkout, demo chrome, shared demo forms, catalog seed definitions, and deliverable generation.
- Used the existing production build locally at desktop 1440×900 and mobile 390×900 for the catalog, Harbor House detail, demo home, and booking page. Inspected mobile screenshots. Browser mutation requests and view tracking were blocked. No orders, real bookings, or messages were submitted.
- Harbor House detail and demo pages rendered without horizontal overflow at those widths. This is a representative walkthrough, not accessibility certification or validation of every template.
- The catalog displayed the error boundary because the local server could not reach the database. The alternate local host also generated Auth.js trust errors. These are local test limitations, not evidence of a production outage. Live catalog filtering, authenticated comparison, checkout, and post-purchase journeys need a configured test environment; their findings below are based on code.
- Screenshots from this inspection are temporary under `node_modules/.cache/ux-audit/`. No new public marketing screenshots were generated.

## Buyer journey

| Stage | Buyer's question | Current support | Main opportunity |
| --- | --- | --- | --- |
| Discover | Is this for my business? | Industry/style metadata, summaries, filters | Lead with suitability and a distinctive capability |
| Shortlist | Which option fits best? | Favorites, three-design comparison | Allow evaluation without account friction; distinguish functional readiness |
| Explore | What will customers experience? | Public multipage demos and real screenshots | Add device controls, task shortcuts, and clear demo limitations |
| Choose | What does each package actually add? | Public inclusion lists, signed-in prices | Reconcile package promises with downloadable artifacts |
| Purchase | What happens after I pay? | Cart totals, verification gate, checkout recovery | Make setup responsibilities and next steps explicit |
| Launch | How do I make this my website? | Source ZIP and seeded guides | Supply complete documentation and honest integration requirements |

## Prioritized findings

### U1 — Package descriptions and deliverables do not establish a reliable distinction

**Priority: first. Evidence: code.** `prisma/catalog.ts:81` describes Starter as core pages, Standard as every demo page and booking flows, and Premium as payment/multilanguage setup. `prisma/seed.ts:96` assigns the same full source ZIP to the lowest tier. Seeded tier guides are sample PDFs (`prisma/seed.ts:79`). This does not establish that all advertised paid services are delivered; deployed artifacts and any manual service process still need review.

**Impact:** a buyer cannot reliably infer what an upgrade purchases. More polished marketing would amplify this mismatch.

**Recommendation:** make full template source the shared baseline. Differentiate packages by documented, deliverable setup/customization services only when those services actually exist. If selling different code editions instead, build and test distinct artifacts first. Do not imply that a source download includes hosted operations.

**Acceptance:** every inclusion maps to a shipped file, verified integration, or explicitly scoped service; no sample guide is presented as finished documentation; supported pages and requirements are visible before purchase.

### U2 — Working demo interactions can be mistaken for operational features

**Priority: first. Evidence: browser and code.** The detail page says “Every page works, including the booking flow.” Harbor House booking introduces a real-looking reservation flow and payment-at-arrival copy. `src/templates/_kit/demo-form.ts` simulates successful submission without sending data. `src/app/demo/demo-bar.tsx` identifies a live demo but does not explain submission behavior.

**Recommendation:** use a concise notice beside every demo form: “Sample booking — no reservation will be made.” Confirmations must repeat that distinction. Product features must distinguish interface, integration-ready work, and connected services.

**Acceptance:** a visitor can complete the demonstration without believing a booking/payment/message occurred; no demo asks for real payment credentials; buyer requirements explain the backend work remaining.

### U3 — Preview chrome interferes with mobile evaluation

**Priority: high. Evidence: browser.** At 390×900 the fixed demo bar overlaps the booking guest/control area and truncates the title. Source: `src/app/demo/demo-bar.tsx` uses a fixed bottom bar, with no reserved layout area in that component.

**Recommendation:** a compact preview header with template identity, back-to-details, page navigation, and a collapsible purchase action. Reserve its space. On real mobile screens use the available viewport; do not shrink a desktop canvas into an unreadable phone frame.

**Acceptance:** toolbar never covers fields, calendar controls, consent notices, or sticky CTAs; full template identity is accessible; hide/show and return-to-details work by keyboard and touch.

### U4 — Device mockups are screenshots, not interactive device previews

**Priority: high. Evidence: code.** `src/components/design/device-showcase.tsx` renders desktop/phone screenshots, both linking to the same demo URL. The phone link does not force a phone-width preview. Existing demo chrome has no device or page selector.

**Recommendation:** keep screenshots for fast scanning and add an explicit live-preview workspace with desktop/mobile widths on larger screens, direct page shortcuts, and an open-fullscreen escape. Clearly label screenshot galleries.

**Acceptance:** selecting mobile changes the live viewport; page, device, and supported language survive navigation/reload; opening the demo directly remains functional; focus does not become trapped in the preview.

### U5 — Evaluation is interrupted by account gates

**Priority: medium; product-policy decision. Evidence: code.** `src/components/compare/compare-toggle.tsx` requires login for comparison. `price-panel.tsx` and README document deliberate price gating. Visitors can inspect public tier inclusions, but cannot easily compare budget or save a comparison without an account.

**Recommendation:** public, browser-local comparison; public starting prices and package prices are the preferred UX direction. Require accounts for purchase and account-synced saves. Price visibility is an existing business rule, so this document proposes rather than silently changes it.

**Acceptance:** selected designs and intended destination survive login; a visitor can compare fit and functional readiness. If prices stay private, clearly explain the gate without fake numeric prices or repeated login prompts.

### U6 — Cards and comparison emphasize tiers more than meaningful capability

**Priority: medium. Evidence: code.** `design-card.tsx` has category/style/summary and a highest-tier badge. Quick view is exposed on hover/focus and repeats the hero image. Filters have industry, style, tier, and features, but no language. `compare-table.tsx` mixes price, revisions, inclusions, and binary feature checks without integration status.

**Recommendation:** show “Best for,” one signature capability, supported languages, and a clear preview action. Replace vague feature checks with explicit status. Provide touch-visible actions. Add language filtering only when real variants are shipped.

**Acceptance:** buyers can explain why two templates differ without opening every detail page; labels do not claim unavailable languages or operational booking systems.

### U7 — Checkout recovery exists, but the next action can be clearer

**Priority: medium. Evidence: code only.** Checkout blocks unverified email with explanatory text, while cart recovery now offers retry and signed-out states. `checkout-panel.tsx` uses generic completion/payment messaging and the payment request has no client timeout.

**Recommendation:** provide a verification action beside the blocked payment action, preserve checkout context, and use a bounded waiting/recovery state that retains the existing payment retry key. Distinguish instant source downloads from any later service delivery.

**Acceptance:** verification returns the customer to their cart; a slow checkout never encourages a fresh duplicate payment attempt; confirmation explains downloads and any remaining setup work.

## Keep what already works

- Public multipage demos with individual visual identities and industry-specific content.
- Screenshots generated from actual demos and gallery labels describing their source.
- Public tier inclusion lists, feature grouping, and an existing comparison foundation.
- Mobile filter sheet, labeled controls, and empty/error recovery foundations.
- Server-calculated totals and the Phase 1/2 retry protections; the UX work must preserve these.

## Implementation order after the standards are agreed

1. Resolve package truth and add explicit demo boundaries.
2. Build preview chrome and device/page navigation around Harbor House.
3. Improve card/detail information hierarchy and comparison.
4. Add the pilot's complete language variants, then language discovery.
5. Rehearse guest browsing, sign-in, verification, cart recovery, sandbox payment, and download in a configured test environment.

## Validation plan

Test at 360/390px mobile, tablet, and desktop, with touch, keyboard, zoom, and reduced motion. Include long Tagalog labels, unavailable variants, offline cart requests, and returning from a preview. Have representative buyers find a suitable template, identify included versus simulated features, compare two choices, and locate setup requirements. Record completion, misunderstandings, and backtracking before setting conversion targets. Do not claim measured conversion improvements from this audit.
