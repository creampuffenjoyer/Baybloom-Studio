# Template polish

Each template keeps its own palette, typography, photographs, content order and personalization fields. Work proceeds one template at a time, using sequential checks at lower priority on two logical processors.

## Coral Cove

Direction: an island-resort site for guests planning a stay; barefoot, open and welcoming; a world of boat crossings, sand and reef. Real lagoon and reef photography carry the color. The perforated boarding-pass booking bar remains the signature.

Audit: the full-viewport hero pushed booking below the opening screen; heavy type competed with photography; pill controls and large card radii repeated throughout the homepage; date fields suppressed keyboard focus; image hover zooms and entrance animations added movement without helping the guest. The shared mobile menu lacked Escape handling.

Passes: normalized group spacing; retained the lagoon/sand/coral colors while quieting travel-step markers; kept the existing icon vocabulary and translated copy; reduced heading weights and hero scale; preserved the section order and image-led layout; used 8px controls and 16px cards/ticket corners; reduced the ticket shadow; removed image zoom and hero entrance motion. Shared page introductions, header, footer and newsletter controls follow the same restrained treatment. Date fields and links have visible focus. Escape closes the mobile menu, restores scrolling and returns focus to its toggle.

Verification: desktop at 1440px and mobile at 390px; no horizontal overflow or browser exceptions; booking dates/guest parameters survive navigation; villas page and language switching work; menu Escape/focus and sample newsletter work. All five Coral translation/stay-plan regressions and lint of the seven changed files passed. Screenshots: `storage/unslop/coral-cove/`.

This pass changes template source. Previously retained source releases and purchased artifacts remain pinned to their existing bytes. Package and verify a new reviewed release before activating these changes for future purchases; do not overwrite retained archives.

## Pine Ridge Lodge

Direction: a seasonal lodge for mountain guests; rugged, warm and practical; timber, trail maps and snow. Preserve the slab-serif type, forest/amber palette, contour map and seasonal photos. Audit: competing hero links shared one destination, seasonal controls used a glass surface and lacked explicit focus, room images zoomed on hover, and fixed-width journal thumbnails crowded mobile titles.

Pass: quiet bordered season controls with 40px targets and focus rings; direct the primary stay action to booking with its season; keep activities as the secondary destination; remove hero fly-in and room zoom; use tabular prices and responsive 96/140px journal thumbnails. Desktop/mobile overflow and browser-error checks, all four Pine regressions and scoped lint passed. Screenshots: `storage/unslop/pine-ridge-lodge/`.

## Lumen Lake Villas

Direction: a lakefront retreat for guests seeking stillness; quiet, spare and reflective; lake water, jetty timber and a waterline annotation. Preserve the serif type, cool neutrals, staggered villa photographs and waterline detail. Audit: 160px section gaps were excessive on mobile, a long image zoom added needless motion, and villa names competed with prices on narrow screens.

Pass: 96px mobile / 128px desktop section gaps and a smaller hero-image gap; wrapping villa metadata with tabular prices; static photos with text hover feedback; explicit keyboard focus and a 48px booking target. Give the waterline caption a dark backing for legibility. Desktop/mobile overflow and browser-error checks and scoped lint passed. Screenshots: `storage/unslop/lumen-lake-villas/`.

## Isla Verde

Direction: a heritage house for guests interested in Vigan; storied, gracious and tactile; capiz windows, courtyard arches and old paper. Keep the authentic italic typography, arches, cream/forest palette and founding-year detail. Audit and pass: remove room-photo hover zoom, use 48px group spacing and 32px before actions, add action/card focus rings and tabular room prices. Desktop/mobile overflow and browser-error checks, the Isla translation regression and scoped lint passed. Screenshots: `storage/unslop/isla-verde-boutique/`.

## Ember & Salt

Direction: a wood-fired restaurant for diners; bold, warm and editorial; coals, wine and a printed menu. Keep the wine/brass palette, large display type and fire photography. Audit and pass: remove the staggered headline fly-in, clarify primary/secondary action weight and focus, add mobile press-row separators, use a shared two-column hours grid and normalize the menu-section gap. Desktop/mobile overflow and browser-error checks and scoped lint passed. Screenshots: `storage/unslop/ember-and-salt/`.

## Still Water Spa

Direction: a day spa for guests seeking rest; calm, botanical and unhurried; pools, timber and smooth stones. Keep the pool photograph, organic photo masks, dusk accent and purposeful breathing guide. Audit and pass: replace repeated pill actions with 8px controls, reduce 32/48px panel corners to 16px, align group spacing and package padding, remove ritual-photo zoom, and add keyboard focus and tabular package prices. Desktop/mobile overflow and browser-error checks and scoped lint passed. Screenshots: `storage/unslop/still-water-spa/`.

## Harbor House

Direction: a small guesthouse for travellers; personal, homely and tactile; handwritten notes, postcards and postage stamps. Preserve the handwritten welcome, static postcard tilts, stamp prices and harbour-blue/butter palette. Audit and pass: quieter neutral shadows, 16px hero-photo corners, an 8px primary control, explicit focus, and text feedback instead of card lift. Room postcard details stack on mobile and retain their divided columns on wider screens; prices use tabular figures. Desktop/mobile overflow and browser-error checks and scoped lint passed. Screenshots: `storage/unslop/harbor-house/`.

## Bloomfield Gardens

Direction: a garden estate for couples; romantic, botanical and composed; a wedding invitation and photo album. Preserve the centered invitation, sprig, italic type, tilted photograph frames and olive/blush palette. Audit and pass: 8px hero controls with focus rings, quieter neutral photo shadows, compact 80px mobile venue thumbnails alongside their copy, static photo hover behavior, 16px package corners and consistent padding/prices. Keep the central photo preloaded and load the other above-fold photos eagerly. Desktop/mobile overflow checks completed; screenshots are in `storage/unslop/bloomfield-gardens/`.

## Verification scope

These are focused homepage passes. Coral's shared navigation, booking ticket, page introduction, footer and newsletter and Harbor's shared postcard received related changes. Other template pages retain their existing designs. No generated image assets were needed: existing photography and the templates' own material details carry their identity.

All eight templates were captured before and after at 1440px desktop and checked at 390px mobile. Coral additionally passed keyboard/date-parameter, inner-page, language, menu and newsletter checks. A final focused check verified both Pine seasons, its primary booking navigation with the selected season, and Lumen's caption backing. An initial Pine assertion ran before the URL-driven React update committed; the check now waits for the selected state, and the focused rerun passed without browser exceptions.

Final checks on 2026-11-11: all 85 standard regressions, repository type checking, scoped lint for all 16 changed template files, and the scoped whitespace check passed. Preview servers were stopped. Checks ran sequentially at lower priority with two logical processors available. The local review gallery is `storage/unslop/index.html`; select a template and toggle before, after or mobile.

Previously built source releases and delivered ZIPs were preserved. This pass does not claim that new source archives were built or activated; new release packaging and standalone verification remain part of release preparation.

Method adapted from **unslop by Damir Sokolovsky** ([@heydamir](https://x.com/heydamir)), [source](https://github.com/heydamir/unslop), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
