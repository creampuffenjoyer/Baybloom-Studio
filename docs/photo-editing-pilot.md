# Coral Cove photo editing pilot

Coral Cove is the first template with location-based photo editing. [Harbor House is now the second](photo-editing-harbor.md), using the shared controls extracted from this pilot. [The other six editors now share these controls](photo-editing-rollout.md).

## Try the editor

Open `/personalize/coral-cove`. In **Edit photos** mode, click a photo in the preview. The inspector selects its page and named location, such as **Home · Reef section** or **Villas · Overwater Villa — Main photo**. The **Page** and **Photo location** dropdowns offer the same selection without clicking the preview. A thumbnail confirms the current photo.

Choose **Replace photo**, add an optional photo description, and check the result in the preview. Only that location changes. To reuse the next replacement, expand **Use the next replacement in other locations** and choose the matching locations before uploading. No locations are selected automatically.

**Restore original** bypasses both current and older uploads at that location. **Discard pending change** returns that location to its saved state. **Save changes** saves pending text and photos; successful uploads stay saved if another upload fails, and retrying sends only the failed photos. Status is shown for each selected location. Loading a saved draft and leaving for packages guard against losing pending changes; browser navigation also warns when changes are pending.

On mobile, clicking a photo opens a sheet with the same controls and a **Save changes** button. Close it with **Close** or Escape. **Browse preview** allows sample links and booking navigation while keeping the current editor draft. Use the preview page dropdown for direct page selection. Pages without photos show an explanation.

Recommended photo shape is shown for each location. Uploads accept JPEG, PNG and WebP up to 5 MB. Cropping and focal-point controls are outside this pilot; check the displayed crop in desktop and mobile previews.

## Data and compatibility

- `src/templates/coral-cove/photo-placements.ts` declares 75 stable, allowlisted locations with page, purpose, original photo and suggested shape. The template resolves location overrides after existing hero, library, villa and gallery fallbacks.
- The version-1 Coral draft gains optional `photoPlacements` entries containing a description and/or an explicit original-image flag. It cannot contain image URLs. Existing saved drafts remain valid.
- New private assets use `placement:<location-id>` slots in `PersonalizationDraftImage`. No database migration is needed. Existing uploads remain available as fallbacks, and restoring an original leaves unrelated saved locations intact.
- The image route authenticates ownership, enforces same-origin writes and rate limits, bounds streamed input, decodes and re-encodes photos, and limits total saved photo bytes to 100 MB for placement writes. Draft locking serializes placement uploads. Descriptions and location IDs are validated separately.
- Editor messages validate both origin and the exact parent/iframe source. Click controls are separate overlay buttons, avoiding nested links or buttons in template markup. They are mounted only in the live editor.
- The source release is Coral Cove **1.1.0**. The export registry still accepts retained **1.0.0** sources for older snapshots. New location assets or metadata against a 1.0.0 source are rejected before payment. Existing source releases and purchased artifacts are preserved.
- Snapshots copy owned image bytes. Purchased projects use local `/personalized/placements/` files and do not need the draft, account or Baybloom image API at runtime.

The pilot does not activate a release in the application database. Before offering purchases using these controls, register the reviewed, locked Coral Cove 1.1.0 source through the existing release workflow. Application database changes and deployment remain separate operations.

## Verification

For current shared-controller regression checks, prefer `npm run test:photos:pilots -- coral-cove`. The original individual runner below remains available, but cold development-server startup can make it intermittent.

Use Node 24+ or a supported Node 22 runtime. On this shared Windows computer, run heavy commands sequentially at BelowNormal priority with two logical processors, `RAYON_NUM_THREADS=2` and `UV_THREADPOOL_SIZE=2`. The local runtime is `storage/phase1/tooling/node_modules/node/bin/node.exe`.

1. Pack a locked source without replacing customer deliverables:

   `node scripts/pack-templates.mjs coral-cove --keep --output-root=storage/photo-selection/release --lockfiles=storage/phase3/build`

2. Run `npm run test:photos:coral` with the explicitly configured isolated test database. The shared guard refuses application database URLs. This test exercises direct selection, dropdowns, independent replacement, interrupted uploads and retry, restoration, explicit reuse, owner isolation, reload, mobile saving, checkout and purchaser download after draft deletion. It restores the prior isolated release and deletes its temporary records.

3. Run `npm run test:photos:coral:export`. This builds the purchased project and starts its production server with Baybloom database/provider credentials empty. It checks local replacement assets, unchanged shared fallback photos, explicit reuse, mobile overflow, absence of editor controls/private requests, and browser exceptions. To reduce file scans, this local helper links the independently installed Coral dependencies from the Phase 3 proof directory after comparing every direct dependency to the exported lockfile. For a separate machine, install the purchased project's dependencies with `npm ci` first and adapt the helper's dependency path.

4. Run the standard regression suite, type checking and lint for the changed files. The five new regression cases cover location identity, strict draft validation, independent resolution, deterministic snapshots/packaging and retained source compatibility.

Ignored proof artifacts are under `storage/photo-selection/`: editor and standalone verification JSON files, desktop/mobile screenshots, the purchased source ZIP and its extracted project. No live payment provider or application database is used by the browser test.

Verified on 2026-11-11 using Node 24.22.2: all 90 standard regression tests, repository type checking and scoped lint passed; the authenticated editor/checkout browser scenario passed, including mobile session recovery and cleanup; and the purchased project passed its production build and standalone browser checks. Heavy checks ran sequentially at lower priority on two logical processors. The application database, existing deliverables and deployed application were not changed.
