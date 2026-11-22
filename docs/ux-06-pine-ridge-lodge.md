# Pine Ridge Lodge UX and language upgrade

Implemented locally after Coral Cove. Nothing has been deployed or uploaded to production storage.

## Experience

- `/preview/pine-ridge-lodge` uses the shared preview workspace with all fourteen page shortcuts, desktop/mobile widths, and English, Tagalog, and Taglish. Pine Ridge also carries its season through preview page selection and reloads. Frame messages still check origin, source, and the page allowlist.
- Winter and summer are shareable URL choices. The default is winter, rather than a changing client-clock default. Changing season clears the previous activity interest; changing language preserves it.
- The activities page combines season, activity level, and guest count. Visitors can add or remove an activity interest and see rooms with sufficient capacity. Room detail and booking links retain the plan.
- The stay planner validates real dates, a 1–30 night limit, and every occupied night against the illustrative season: December–April or June–October. Conditions and activity arrangements still require confirmation with the lodge.
- Corrected add-on quantities: lift passes and dinner are per guest per night; rental is one set per night. Summer hides lift passes and offers a bicycle. Estimates stay in Canadian dollars and exclude taxes.
- Booking controls now flow with the form instead of obscuring it in a fixed bottom bar. No-match states explain the next step. The demo notice is also in normal page flow.
- Confirmation and gear requests explicitly say nothing was booked, charged, or sent. Guest input survives language changes, and the completed sample includes the estimate and activity interest.
- Retained the forest/amber palette, serif typography, contour artwork, winter/summer imagery, and lodge editorial content. Mobile headlines are shorter, navigation fits phone widths, and the seasonal transition respects reduced-motion preferences.

## Languages

`src/templates/pine-ridge-lodge/translations.ts` covers page/UI copy, seasonal descriptions, room features, activities, menus, journal articles, accessible photo descriptions, dates, validation, and sample outcomes. English source strings are keys, so update the dictionary whenever source wording changes. Slugs, activity IDs, season keys, dates, and price calculation fields stay independent of translations.

Tagalog and Taglish are drafts that need fluent editorial review before publication. Brand names, place names, currency, and photo attribution are preserved. Native form controls can follow the visitor's browser language.

## Validation and export

- `npm test`: 39 passing regression tests, including translation completeness, calendar/season boundaries, and nightly add-on calculations.
- `tests/pine-ridge.browser.mjs`: all fourteen pages in all three languages at 360px; seasonal activity filtering and empty state; guest-capacity matches; plan handoff through room details; form state across language changes; summer add-ons and estimate arithmetic; sample outcomes; invalid-email feedback; preview device/language/season/page persistence.
- Existing Harbor House and Coral Cove browser suites are included when validating the shared preview workspace.
- Lint, production build, standalone export build, and local standalone browser smoke checks are part of completion validation.
- Rebuild the source ZIP with `node scripts/pack-templates.mjs pine-ridge-lodge`. Artifact: `storage/deliverables/pine-ridge-lodge/pine-ridge-lodge-source.zip`.
- Generated README includes language setup, seasonal planning rules, add-on quantity rules, and integration boundaries. The export requires Node 22.13+ in the 22.x line or Node 24+. Standalone validation uses Node 22.23.4; the system Node 22.4 is below the declared requirement.

Real inventory, activity scheduling, gear sizing, guide allocation, payments, messages, tax rules, and deployment remain integrations. No package prices, access policy, or production data were changed. The next template in the proposed rollout is Lumen Lake Villas: villa comparison and an accessible guided tour.
