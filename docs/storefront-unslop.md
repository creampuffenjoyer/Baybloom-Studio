# Storefront polish: closing invitation

Scope: the homepage's final call to action in `src/app/(store)/(public)/page.tsx`. Template source files and the other storefront sections are outside this pass.

## Audit and direction

The original section used two blurred color blobs, a generic headline, centered text and two pill-shaped buttons. The existing sand/teal palette and serif typography already suit the product, so this is a focused polish.

- Product: website templates for hospitality owners.
- Character: warm, considered, welcoming.
- World: a printed hospitality welcome card.
- Moment: the invitation to browse or create an account.
- Signature: a quiet rule connecting the headline and actions.

## Changes

1. Spacing: 32px between stacked groups, 64px between desktop columns, 24px before actions and 48/64px vertical padding.
2. Color: remove the colored blobs and use the existing sand background, teal text/action and muted body text.
3. Icons: use the existing Lucide arrow at 16px with a 1.5 stroke for the secondary destination.
4. Copy: name hospitality directly and explain what an account enables without promising launch timing.
5. Type: retain the brand serif at 36/48px and body text at 16px, with sentence case and restrained weights.
6. Layout: left-aligned headline and actions in two desktop columns; stack in reading order on mobile. Keep the section in its original position.
7. Details: 48px action heights, 8px primary-button corners and explicit keyboard focus. Preserve anonymous and signed-in destinations and the existing session/Suspense boundary.
8. Visuals: remove decorative filler. No new imagery is needed for this closing section.
9. Motion: keep the section static; use color feedback on actions instead of an entrance animation.

Before/after screenshots are generated under ignored `storage/unslop/`.

Verified the rendered section at 1440px desktop and 390px mobile widths, mobile horizontal overflow, keyboard focus, anonymous register/catalog links, and signed-in catalog/favourites links through a temporary account in the isolated test database. Both account states passed with no browser exceptions; the account and preview server were removed afterward.

Method adapted from **unslop by Damir Sokolovsky** ([@heydamir](https://x.com/heydamir)), [source](https://github.com/heydamir/unslop), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This report describes the Baybloom-specific adaptation.
