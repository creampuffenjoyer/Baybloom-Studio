# Phase 1: shared standalone exports

## Audit

The existing Harbor House and Bloomfield source ZIPs did not contain a personalization provider or an export manifest. They predated the editor and cannot be used for personalized delivery. The packer also selected a different bundler for Harbor, and Bloomfield imported application-only draft types that were missing from a standalone project. Those type dependencies are now local, and both exports use the same build commands.

Existing private deliverables have not been overwritten. Verification artifacts are generated under the ignored `storage/phase1` directory. No database or payment service is involved.

## Contract

`src/lib/personalization/export-templates.json` initially registered the two pilot templates and now registers all eight through Phase 3. Each entry declares its release version, content version, photo catalog, context property for library images, and additional image groups for dedicated room/villa/gallery uploads. The exported template keeps its own layout and domain-specific content. The export algorithm does not branch on template names.

A source release contains `baybloom-template.json`: format version, template identity, template release version, content version and SHA-256 hashes of its source files. A release used for exports must contain a dependency lockfile and the standard `src/app/personalized-provider.tsx` and `personalized.json` entry points. Changed, mismatched, incomplete and unversioned sources are rejected. The manifest detects accidental changes; the caller must supply a trusted source archive. Phase 2 must pin that trusted archive and its digest durably for each purchase.

`captureTemplateSnapshot(source, content, assets)` validates a draft against the source's registered template and copies its data and image bytes. The snapshot identifies the exact source ZIP by SHA-256, so later draft changes do not affect the captured copy. This is an in-memory export contract, not yet an order persistence or billing API.

`packageTemplateSnapshot(source, snapshot)` verifies source identity and integrity, checks the draft and allowed image slots, and writes:

- Saved content and theme overrides to `src/app/personalized.json`.
- Owned WebP images to `public/personalized/`, with local URLs in the context data.
- `baybloom-export.json`, recording source/content/image hashes for verification.
- `PERSONALIZATION.md`, explaining customization and the remaining demonstration flows.

Source paths cannot escape the archive root. Unknown or duplicate image slots, non-WebP assets, oversized archives and mismatched releases are rejected. Image inputs are the normalized, owner-scoped assets captured by the application; Phase 2 must enforce ownership before calling this API. No browser blob URLs or account-protected image endpoints are needed at runtime.

Harbor's existing `packageHarborDraft` function delegates to the common pipeline. It intentionally rejects the older source ZIP format. At Phase 1 completion, checkout/download UI was not yet connected; the subsequent integration is documented in `docs/template-export-phase2.md`.

## Reproduce the verification

Use Node 22.13+ in the 22.x line, or Node 24+. The local audit used an isolated Node 24 installation because the machine default was Node 22.4.1.

1. Generate fresh bootstrap projects without replacing existing deliverables:

   `node scripts/pack-templates.mjs harbor-house bloomfield-gardens --keep --output-root=storage/phase1`

2. Run `npm install` and `npm run build` in each `storage/phase1/build/<template>` directory using the supported Node runtime. These are unpersonalized baseline builds and create lockfiles. Google Fonts are fetched at build time.

3. Produce locked, versioned source releases:

   `node scripts/pack-templates.mjs harbor-house bloomfield-gardens --keep --output-root=storage/phase1/release --lockfiles=storage/phase1/build`

4. Generate personalized proof projects with the common pipeline:

   `node --import tsx scripts/prepare-export-verification.mjs`

5. In each `storage/phase1/personalized/<template>` directory, run `npm ci` and `npm run build` using the supported Node runtime. Each project has its own dependencies; it does not use a linked Baybloom installation.

6. From the repository root, using the supported Node runtime, run:

   `node --test tests/template-export.browser.mjs`

The browser checks start the exported production sites directly, with database/auth configuration empty. They verify edited home and inner-page content, local uploaded images, desktop/mobile rendering and absence of Baybloom demo/private-image requests. Screenshots are written to `storage/phase1/screenshots`.

`npm test` covers both templates through the same packager, source mismatch/tampering, unsafe assets and the Harbor compatibility entry point.

## Verification results

Verified on 2026-11-10 using Node 24.22.2:

- Both unpersonalized source projects installed independently and passed production builds.
- Both personalized projects installed from their exported lockfiles with `npm ci` and passed production builds.
- Both production browser scenarios passed, including inner-page edits, local images, mobile overflow checks and no private Baybloom image requests or browser exceptions.
- Repository type checking, lint and all 66 standard tests passed.

Review `storage/phase1/personalized/harbor-house-personalized.zip` and `storage/phase1/personalized/bloomfield-gardens-personalized.zip`. Desktop and mobile screenshots are in `storage/phase1/screenshots`. Generated artifacts are ignored by Git; the code, tests and reproduction instructions are tracked source files.

The source manifest describes the original release before personalization. The export manifest records the changed content and local uploaded-image hashes; personalized ZIPs are finished artifacts and should not be reused as source releases.

## Remaining work

Phase 2 implements durable purchase snapshots, source-release retention, checkout integration, purchaser authorization and delivery jobs; see `docs/template-export-phase2.md` for its separate verification and release prerequisites. Phase 3 registers the remaining six templates; see `docs/template-export-phase3.md` for their standalone and purchase verification. Forms, availability, subscriptions and booking flows inside the exported websites remain demonstrations. Default page metadata and photo credit pages still come from the template source; review these when preparing a customer launch. Google Fonts currently require network access during builds, but exported runtime assets are served locally.
