# Storefront UI/UX improvements

Scope: Baybloom's storefront, catalog, product detail pages, authentication, favorites, comparison, cart, checkout and account pages. Template source, demo routes, previews and personalization workspaces are outside this pass.

## Direction

Applied the local UI/UX Pro Max skill. The design-system search returned an Apple navigation/glass treatment twice, which did not fit this hospitality marketplace. No verified visual-direction match was found, so that output was not persisted or applied. The implementation uses the skill's general accessibility, responsive-layout, form and navigation guidance, plus its verified Next.js stack results.

Retain the existing Fraunces/Manrope typography and sand, teal and terracotta palette. Use readable sentence-case labels, restrained borders, consistent page introductions and clear primary actions. Keep essential content visible immediately and use the existing real product screenshots and photography.

## Changes

- Rebuilt the homepage introduction around a large website preview and an eight-design selector that wraps on phones. The selector supports arrow keys, Home and End; its preview and links follow the selection.
- Improved homepage section spacing, feature descriptions, booking/integration expectations and FAQ controls.
- Moved full desktop navigation to a width where it fits. Mobile and tablet navigation includes account and collection links; login remains directly available on phones.
- Made catalog quick view, favorite and comparison controls consistently discoverable. Added larger filter rows, less-truncated search text and a mobile filter drawer with a persistent “View results” action.
- Added shared page-heading and empty-state components across browsing and client pages.
- Simplified signed-out pricing information and replaced simulated radio buttons with native tier radios for standard keyboard navigation.
- Added password visibility controls, submission feedback and focus on authentication errors. Repaired the authentication photo's invalid asset path.
- Fixed long-email overflow in account forms, made the sign-in email a labeled read-only field, wrapped account navigation and improved the active orders state on order-detail pages.
- Reflowed cart lines on narrow screens and gave coupon fields unique IDs so the page and cart drawer can coexist. Coupon errors are linked to the correct field and announced.
- Improved comparison scrolling, removal controls, the disabled comparison action and spacing for the floating selection tray.
- Kept input sizing, focus, touch behavior and heading rules under an explicit `.baybloom-store` scope in a route stylesheet. This project's custom CSS loader emits plain CSS, so an explicit wrapper is used instead of module class mapping. Shared template UI primitives and global template styles are unchanged.

## Verification

Browser checks and screenshots are kept under ignored `storage/uiux/`. Public routes are checked at 375, 768, 1024 and 1440 pixels, including keyboard selection, mobile navigation, quick view, filters, FAQs, password visibility, image loading and document overflow. Signed-in checks use temporary fixtures in the existing isolated test database, with cleanup afterward; no checkout payment is submitted.

Run `npm run typecheck`, `npm run lint -- src`, `npm test` and `npm run build` for source and production checks. The repository-wide lint command also includes pre-existing `.agents` helper scripts that fail the application's CommonJS import rule.

Completed checks: production build (191 generated pages), TypeScript, source lint, all 125 existing tests, 28 public responsive page checks and 36 signed-in responsive page checks. The production build also passed nine page checks across 375, 768 and 1440 pixels, including computed storefront styles, mobile input size, keyboard focus and filter completion. A demo-page check confirmed that the storefront wrapper is absent. Temporary browser servers and test fixtures were cleaned up.
