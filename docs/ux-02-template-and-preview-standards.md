# Part 2 — Template quality and feature standards

Proposed product standard, 2026-11-01. Companion: [buyer journey audit](ux-01-buyer-journey-audit.md). This defines the next implementation's acceptance criteria, not features already shipped.

## Product model

Keep three concepts separate:

1. **Template identity:** business fit, style, content, and signature customer experience.
2. **Functional readiness:** which interactions are demonstrative, integration-ready, or connected and tested.
3. **Purchase package:** exactly which artifacts and services the buyer receives.

Do not make cheaper templates deliberately awkward or inaccessible. Essential, Enhanced, and Advanced are internal planning categories, not replacements for Starter/Standard/Premium or automatic price changes.

## Universal release requirements

| Area | Standard | Acceptance evidence |
| --- | --- | --- |
| Business fit | State intended audience and primary visitor task | A one-sentence suitability statement plus a task walkthrough |
| Visual design | Coherent typography, spacing, imagery, and page hierarchy | Review all page types, not just home; no filler sections |
| Responsive behavior | Usable at 360px through desktop, without accidental overflow | Screenshots and manual checks; touch targets aimed at 44px |
| Accessibility | Labels, keyboard access, visible focus, semantic headings, readable contrast, reduced motion | Automated checks plus keyboard/zoom review; no unsupported conformance claim |
| Interaction | Every visible action works or clearly explains its limitation | Navigation/form walkthrough including invalid, empty, loading, and failure states |
| Demo safety | No real reservations or charges implied | Notice near forms and explicitly simulated confirmations |
| Delivery | Source ZIP reproduces the advertised site | Unpack/install/build smoke test; complete setup instructions and asset credits |
| Performance | Images sized appropriately; no unnecessary media or blocking animation | Repeatable mobile measurement and recorded baseline; regressions reviewed |
| Content | No unfinished copy, sample guides sold as finished work, or unverifiable claims | Content checklist signed off before release |
| Localization | Every advertised variant covers the complete journey | Translation inventory, functional parity, and fluent-speaker review |

## Meaningful sophistication

| Planning category | Visitor outcome | Appropriate features | Does not automatically include |
| --- | --- | --- | --- |
| Essential | Understand the business and inquire | Complete content pages, gallery, directions, validated inquiry UI | Email delivery, hosting, CRM |
| Enhanced | Compare options and build a useful request | Search/filtering, option comparison, package selection, multistep request | Live inventory or confirmed reservations |
| Advanced | Complete a connected business process | Server-validated availability, reservation lifecycle, payment/refund handling where relevant | A simulated calendar labeled as live availability |

An elaborate frontend can be Enhanced without being operationally Advanced. Connecting real services requires credentials, operational ownership, failure recovery, and integration tests. Payment UI alone does not qualify.

## Proposed direction for the eight templates

These are target differentiators, not a claim that all functionality exists today.

| Template | Best fit | Signature experience to develop | Direction |
| --- | --- | --- | --- |
| Harbor House | Owner-run B&B / guesthouse | Room choice, local guide, clear stay inquiry | Enhanced pilot; first complete language variants |
| Coral Cove | Resort | Compare villas and assemble a stay | Enhanced, then connected booking if scoped |
| Pine Ridge Lodge | Seasonal lodge | Seasonal content linked to relevant rooms and activities | Enhanced |
| Lumen Lake Villas | Small premium villa property | Villa comparison and an accessible guided tour | Enhanced; avoid adding complexity just for effect |
| Isla Verde | Heritage hotel | Editorial discovery connected to room selection | Enhanced |
| Ember & Salt | Restaurant / bar | Searchable dietary-aware menu and table request | Enhanced, then connected reservation capacity |
| Still Water | Spa | Treatment discovery, duration choices, appointment request | Enhanced, then connected staff/time availability |
| Bloomfield Gardens | Wedding / events venue | Space comparison and structured event inquiry | Enhanced, then quote/date workflow if scoped |

Use Harbor House to prove shared preview behavior and localization. Do not homogenize the templates' branding or turn every business into the same booking experience.

## Purchase package recommendation

The current packer/seed delivers full source at the lowest tier. Prefer a common complete-source baseline, with higher packages adding concrete services or artifacts. For example: documented configuration assistance, a scoped brand customization deliverable, or a verified integration project. These are proposed directions; service capacity, prices, timelines, revision definitions, and support terms must be established before selling them.

Never advertise “payment gateway setup,” “multi-language setup,” or a working CMS merely because code could later support it. Every package must list: delivered files, pages, supported variants, connected services, buyer responsibilities, third-party costs, delivery timing, and support boundaries. Retain current prices until the commercial model is resolved.

## Preview workspace specification

Suggested desktop arrangement:

`Back to details | Harbor House | Page | Desktop / Mobile | Language | View packages`

- Preview state contains a validated template slug, allowlisted internal page, device choice, and supported language. Never accept arbitrary iframe URLs.
- Larger screens may use a constrained live viewport for mobile inspection. On small screens show the template at native width with compact controls; do not squeeze a desktop frame into a phone screen.
- Reserve toolbar space rather than covering template navigation/forms. Respect safe areas and virtual-keyboard behavior. The identity remains readable or has an accessible full label.
- Provide page shortcuts for Home, Rooms, Local guide, and Booking in the pilot. Changing device or language preserves the current equivalent page where available.
- Keep direct demo URLs usable. Include “Open full preview” if embedded viewing causes limitations.
- “View packages” returns to the matching product, never an unrelated checkout or assumed package. Previewing a more complex flow must not imply that it is connected in the purchased package.
- Label sample interactions near the action and in the outcome. Screenshot galleries remain distinct from live previews.
- Do not expose a language choice until that full variant exists. A missing translation must produce an explicit fallback, not silently claim complete coverage.

## English, Tagalog, and Taglish standard

Treat these as three editorial variants of the same template, with shared behavior and separately maintained copy. Taglish is a tone choice, not random untranslated strings.

- Inventory navigation, body copy, room descriptions, CTAs, form labels, validation, empty/loading/error/success states, accessibility text, dates, and delivery/setup instructions.
- Use stable content keys and a single variant source of truth. Avoid scattering language conditionals through components. Keep the current page and language selection in shareable navigation state.
- Use appropriate document language metadata for English and Filipino/Tagalog content; Taglish should use a documented predominant-language policy and language annotations where needed, not an invented standard language code.
- Preserve brand names, proper place names, currency amounts, and legally necessary terminology. Pure Tagalog means complete, natural Tagalog interface copy, not awkward translation of names.
- Have a fluent reviewer approve each variant and terminology glossary. Review long labels, small screens, calendar formatting, and screen-reader names.
- Start with Harbor House. Baybloom storefront localization is a separate scope; do not imply that translating the template translates the store or provider checkout.

Draft tone examples for review:

| Intent | English | Tagalog | Taglish |
| --- | --- | --- | --- |
| Explore rooms | View rooms | Tingnan ang mga kuwarto | Tingnan ang rooms |
| Check dates | Check available dates | Tingnan ang mga bakanteng petsa | Check ang available dates |
| Submit inquiry | Send inquiry | Ipadala ang iyong tanong | Send ng inquiry |
| Demo boundary | Sample only. No reservation will be made. | Halimbawa lamang. Walang magagawang reserbasyon. | Demo lang ito. Walang actual reservation. |

These examples establish tone only; they are not a finished translation set.

## Next implementation slice

1. Correct the pilot's product/demo claims and establish its actual deliverables.
2. Build the reusable preview workspace and Harbor House page shortcuts.
3. Improve Harbor House's product page around fit, signature experience, inclusions, and setup requirements.
4. Implement all three language variants with complete form states.
5. Validate responsive layouts, keyboard use, preserved navigation state, simulated submissions, and exported source.
6. Roll out shared improvements across the catalog only after the pilot passes.

Price visibility, service-package scope, and production backend/provider integrations remain explicit product decisions. They are not prerequisites to making preview navigation and demo labeling clearer, and should not silently expand that work.
