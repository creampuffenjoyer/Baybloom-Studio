# Coral Cove UX and language upgrade

Completed locally. No deployment, database mutation, or production storage upload was performed.

## Visitor experience

- `/preview/coral-cove` offers page selection, desktop/mobile widths, English, Tagalog, and Taglish. The same workspace component now serves Harbor House. Frame messages check both origin and source and accept only known demo paths.
- Changing device width or language keeps the current frame and form state. Explicit page selection navigates even after an internal link changed the frame page. Reloading restores the page, device, and language, but starts a fresh form session.
- The demo has an in-flow preview notice instead of the floating sales bar. Template navigation stays below it; mobile booking remains available in the menu.
- Villa comparison filters by guest count and pool type, shows space, beds, view, capacity, and nightly rates, and passes chosen dates and guests into the sample planner. A family villa correctly has a **shared** pool; pool type is explicit data rather than inferred from translated amenity text.
- The planner validates real calendar dates and stays of 1–30 nights from today onward. It uses sample availability, calculates extras, and discounts every fifth night for the stay-longer example. Other packages explicitly require a separate quote and do not silently promise package pricing.
- Prices are labeled as estimated subtotals excluding tax and service fees. Confirmation, contact, and newsletter outcomes explicitly say nothing was reserved, charged, or sent.

## Languages and maintenance

All twelve pages include English, Tagalog, and Taglish display copy, including villa descriptions, activities, offers, FAQs, photo alternatives, calendars, form validation, and confirmation messages. Brand names, addresses, IDs, routes, and photo attribution remain intact.

Translations live in `src/templates/coral-cove/translations.ts`, keyed by English source text. Update the dictionary when changing source copy. Keep `slug`, `pool`, `per`, and photo identifiers independent of translations. Tests cover explicit UI messages and editorial data. Translation completeness is not a substitute for fluent editorial review; **Tagalog and Taglish need that review before publication**. Native date-input formatting follows the visitor's browser.

The shared preview uses `src/components/catalog/template-preview.tsx`; template routes are allowlisted in `src/lib/coral-preview.ts`. The exported site keeps its language picker and sample flows and excludes storefront preview controls.

## Validation

- `npm test`: 35 passing commerce, security, reliability, Harbor translation, and Coral tests.
- `node --test tests/coral-cove.browser.mjs tests/harbor-preview.browser.mjs tests/harbor-language.browser.mjs`: all passing against the local production server.
- Coral browser coverage: all twelve pages in both added languages, mobile overflow, comparison filters and empty state, date handoff, translated invalid-email feedback, form state across language changes, sample completion, newsletter, gallery keyboard close, and preview navigation/device/language/reload behavior.
- Lint, type checks through the production build, and standalone export build validated. Browser checks use installed Chrome via `playwright-core`; use `PREVIEW_BASE` for a local test server on a different port.
- Download: `storage/deliverables/coral-cove/coral-cove-source.zip`. Rebuild with `node scripts/pack-templates.mjs coral-cove` after source changes.

Fresh export dependencies exposed an outdated minimum Node version in the generated README. Generated projects now declare Node 22.13+ within 22.x, or Node 24+, and document it. The standalone build was verified with Node 22.23.4, including child processes on that runtime. The workspace's older Node 22.4 cannot build the freshly resolved export dependencies.

## Release boundaries

Real inventory, tax/service rules, offer eligibility, payment collection, message delivery, and hosting still need integration. Package tiers and access policy were not changed. Rebuild/upload the ZIP through the deployment workflow when publishing; this local artifact has not replaced any production download. Other templates retain their existing experience until upgraded individually.
