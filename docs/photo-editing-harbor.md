# Harbor House photo editing

Harbor House is the second template using location-based photo controls, following the [Coral Cove pilot](photo-editing-pilot.md). Open `/personalize/harbor-house` and click a photo in **Edit photos** mode, or use **Page** and **Photo location**. A thumbnail confirms the selection. Replace it, optionally describe it, then choose **Save changes**. Only the selected location changes unless other matching locations are explicitly selected before upload.

The 34 locations cover the home banner, room postcards, breakfast and guide sections; the room listing and three photos on each room page; breakfast photos; guide photos; the contact photo; and the four sample-booking choices. The Guestbook page remains reachable and explains that it has no editable photos. Guide photos now retain a visible shape on mobile. Editing booking photos exposes the room choices without requiring dates, including after completing a sample booking; normal booking behavior is preserved.

The shared inspector, mobile sheet, selection overlays, pending-change guards and sequential upload queue now serve both templates. Photo registries and public image resolvers remain inside each template so exported projects work independently. The inspector supports descriptions, original-image restoration, discarding a pending change, explicit reuse, per-location status, and retries that retain successful saves. Mobile save failures and sign-in links appear inside the sheet.

Existing private hero, library and room uploads remain fallbacks. A location replacement takes priority over them, while **Restore original** explicitly bypasses them at that location. The older uploads are preserved. Room content has an **Edit this room’s photos** shortcut; separate hero/library/room upload controls are replaced by the common inspector.

The optional Harbor `photoPlacements` draft map accepts only its own fixed location IDs, descriptions and original-image flags. Other templates cannot inherit these fields through the shared draft schema. Assets use existing `placement:<id>` draft-image slots, so no migration is needed. The new image route enforces authentication and ownership, same-origin writes, rate limits, bounded uploads and decoded WebP normalization. Placement writes serialize on the draft and enforce the existing 100 MB export asset limit across saved photos.

Harbor House source **1.1.0** supports the new location overrides. Retained **1.0.0** sources still deliver legacy snapshots; checkout rejects new location data against those older sources before payment. Purchased packages copy images into local `public/personalized/placements/` files. Existing deliverables and active application releases are preserved. Activate the reviewed, locked 1.1.0 source separately before enabling live purchases using the new photo controls.

## Verification

For current shared-controller regression checks, prefer `npm run test:photos:pilots -- harbor-house`. The original individual runner below remains available, but cold development-server startup can make it intermittent.

Run heavy checks sequentially at BelowNormal priority on two logical processors, with `RAYON_NUM_THREADS=2` and `UV_THREADPOOL_SIZE=2`. Use the supported local Node 24 runtime or another supported runtime.

1. `node scripts/pack-templates.mjs harbor-house --keep --output-root=storage/photo-selection/release --lockfiles=storage/phase1/build`
2. `npm run test:photos:harbor` — authenticates two temporary accounts against the guarded isolated test database, checks every photo location, interrupted uploads and retry, shared-photo isolation, restoration, explicit reuse, private API boundaries, saved reload, preview navigation, mobile saving/session recovery, actual checkout and purchaser download after draft deletion. Fixtures and the prior isolated source release are restored afterward.
3. `npm run test:photos:harbor:export` — builds the downloaded project, starts its production server with Baybloom/provider credentials empty, and checks local assets, explicit reuse on a room page, unchanged breakfast fallback, no private requests/editor controls/browser exceptions, and mobile overflow. The local helper reuses the independently installed Phase 1 Harbor dependencies after checking each direct dependency against the exported lockfile, avoiding another installation and file scan.
4. `npm run test:photos:coral` — verifies the original pilot after the shared controls were extracted.
5. Run the standard regression suite, repository type checking and scoped lint. Five new Harbor regression cases cover registry identity, strict validation, independent resolution, deterministic snapshots/packaging, and retained release compatibility.

Harbor proof artifacts are ignored under `storage/photo-selection/harbor-house/`: screenshots, editor and standalone verification JSON, the purchased ZIP and its extracted project. Tests do not use the application database or live payment services. The older combined `test:personalization:e2e` script still targets the legacy Harbor/Coral photo controls; use the dedicated photo suites for these two templates while that historical combined scenario is migrated.

[The other six templates now share these controls](photo-editing-rollout.md). Cropping and focal-point tools remain outside this rollout.

Verified on 2026-11-11 with Node 24.22.2: all 95 standard regression tests, repository type checking and scoped lint passed. Harbor's authenticated editor/checkout test reached all 34 photo locations and passed; its text/reset/save/load smoke test passed; Coral's authenticated photo/checkout test passed after the shared-control extraction; and the purchased Harbor project passed its production build and standalone browser checks. Cold development startup required an explicit readiness wait in the browser tests. Checks ran sequentially at lower priority on two logical processors. No deployment, push, application database change or live release activation was performed.
