# Photo editing across the remaining templates

The location-based controls established in [Coral Cove](photo-editing-pilot.md) and [Harbor House](photo-editing-harbor.md) now extend to the other six templates. Click a photo in **Edit photos**, or select **Page** and **Photo location**. Replace it, describe it, and choose **Save changes**. Only that location changes unless you explicitly select matching locations for reuse before uploading.

| Template | Route | Photo locations |
| --- | --- | ---: |
| Pine Ridge Lodge | `/personalize/pine-ridge-lodge` | 49 |
| Lumen Lake Villas | `/personalize/lumen-lake-villas` | 35 |
| Isla Verde Boutique | `/personalize/isla-verde-boutique` | 47 |
| Ember & Salt | `/personalize/ember-and-salt` | 19 |
| Still Water Spa | `/personalize/still-water-spa` | 29 |
| Bloomfield Gardens | `/personalize/bloomfield-gardens` | 50 |

There are 338 named photo locations across all eight templates. The shared controls include a thumbnail, suggested shape, optional accessible description, original restoration, discarding a pending edit, explicit reuse, per-photo status, and a save queue that preserves successful uploads when another fails. Mobile selection opens the same controls in a sheet with its own save button. Existing uploads remain fallbacks and are not replaced merely by visiting the new editor. Cropping and focal-point tools remain outside this rollout.

Pine has separate winter and summer hero locations; selecting a seasonal location reveals that season in the editor. Editing exposes all activity photos and sample-booking choices without requiring date selections. Lumen's selected tour location reveals its matching scene, and editing exposes every villa in the finder. Bloomfield's gallery resolves location replacements for both thumbnails and the lightbox. Pages with no photos explain this in the inspector. Normal browsing, filters, season selection, booking demonstrations and tour controls remain available through **Browse preview**.

Each template keeps its registry, image wrapper and resolver in its standalone source. Common pure registry logic lives in `src/templates/_kit/photo-placements.ts`. The application shares the inspector, selection overlays and authenticated image handler. Selection overlays are clipped to the visible photo area, including clipped galleries, comparison tables and panorama viewers; they do not create nested buttons inside template links.

Each draft accepts only its own allowlisted location IDs, descriptions and original-image flags. Images use existing `placement:<id>` slots, normalized private WebP storage, same-origin writes, owner authorization, rate limits and a 100 MB saved-photo limit for placement writes. No database migration is needed. Saved images are copied into durable purchase snapshots and delivered as local files in the purchased project.

All six source versions become **1.1.0**, retaining **1.0.0** support for existing purchases. Checkout rejects location data against a source that cannot render it. Existing active application releases and customer deliverables are preserved. The reviewed, locked 1.1.0 sources must be activated separately before live checkout uses the new controls. There is no deployment or application database change in this rollout.

## Reproduce checks

Use Node 24+ or another supported runtime. On the shared Windows computer, keep heavy checks sequential at BelowNormal priority on two logical processors, with `RAYON_NUM_THREADS=2` and `UV_THREADPOOL_SIZE=2`.

1. Pack Pine, Lumen, Isla, Ember and Still Water with `scripts/pack-templates.mjs`, `--keep --output-root=storage/photo-selection/release --lockfiles=storage/phase3/build`. Pack Bloomfield with the same output root and `--lockfiles=storage/phase1/build`.
2. Run `npm run test:photos:remaining`. The browser cases run sequentially against the guarded isolated test database. They check every location, click selection, independent replacement, interrupted uploads and retry, restore, explicit reuse, owner isolation, saved reload, mobile saving, checkout and authorized delivery after draft deletion. Temporary users, orders, coupons and source activation are cleaned up or restored.
3. Run `npm run test:photos:remaining:export`. Each purchased ZIP is extracted, built and browser-checked in sequence with Baybloom/provider credentials empty. The local helper reuses the independently installed Phase 1/3 dependencies after comparing direct versions to the exported lockfiles; it does not reinstall thousands of files. Proofs verify local replacement images, explicit reuse, mobile overflow, absence of editor controls/private requests, and browser exceptions.
4. Run `npm run test:photos:pilots` to check Coral and Harbor sequentially on the same isolated server. Pass `-- coral-cove` or `-- harbor-house` to check just one. This shared harness avoids repeated development-server restarts; it also retries the initial read-only database connection before fixture work.
5. Run the standard regressions, repository type checking and scoped lint. Thirty new regression cases cover the six registries, strict validation, independent resolution and original restoration, immutable deterministic packaging, and retained source compatibility.

Set `PHOTO_TEMPLATE` to one of the six slugs to run only that template's browser or standalone proof; unknown values are rejected. Proof projects, purchased ZIPs, verification JSON and screenshots are ignored under `storage/photo-selection/<template>/`.

## Verified results

Verified on 2026-11-13 with Node 24.22.2: all 125 standard regression tests, repository type checking and scoped lint passed without warnings. All six authenticated editor/checkout cases passed, reaching every one of their 229 photo locations. Coral's 75 locations and Harbor's 34 also passed through the shared harness, including authorized downloads after draft deletion. All six newly purchased projects passed production builds and standalone browser checks with database/provider credentials empty. Bloomfield's gallery replacement also passed the full-size viewer check.

Initial test failures exposed an oversized fixture coupon and development startup/reload timing; these were corrected in the harness. Coral's preview now imports the shared overlays directly, matching the other templates. The original individual pilot runners remain susceptible to cold development startup; the shared pilot runner is the current regression command. One initial pilot database connection also failed while the isolated database was unavailable; the shared harness now retries the initial read-only connection before creating fixtures.

Pine's first build succeeded but the browser verifier initially used the wrong room-detail route. Its browser proof was resumed against that successful build only after comparing the downloaded source and local assets byte-for-byte. For this bounded resume mode, set both `PHOTO_TEMPLATE` and `PHOTO_REUSE_BUILD` to the same slug; generated `next-env.d.ts` is excluded from the source comparison. The other five builds ran normally.

Heavy checks ran sequentially at lower priority on two logical processors. No deployment, push, application database migration, or live release activation was performed. The final security audit remains the roadmap's separate launch phase.
