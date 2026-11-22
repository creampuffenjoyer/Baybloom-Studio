# Phase 2: durable purchases and delivery

This phase connects the two verified export pilots, Harbor House and Bloomfield Gardens, to checkout and purchaser-authorized delivery. It does not register the other six templates. No production deployment, source-file replacement, application database migration, or payment-provider change is part of the local implementation.

## Purchase contract

Checkout defaults to original template content. Buyers can explicitly choose their saved content and photos for either pilot, after saving their editor changes and confirming photo permissions. The server accepts template choices only, never another account's draft identifier, uploaded bytes, source location, order total, or purchaser identity from the browser.

Before creating a payable order, checkout validates the active trusted release metadata, draft, allowed image slots, normalized images, and export compatibility. Source archive integrity is validated during registration and the immutable source is verified again when packaged. Checkout never transfers or compresses source ZIPs inside its transaction. A serializable transaction captures content and owned image bytes consistently. Serialization conflicts and competing checkout-key insertions retry the whole transaction. Existing retry keys return their original order before reading current drafts or active releases. The order fingerprint includes source/content/image digests and the original/saved choice. Both pilots use the same capture and package functions.

`TemplateRelease` retains the trusted source ZIP bytes, SHA-256, template identity, template version and content version. `ActiveTemplateRelease` chooses the release for future purchases. Changing it does not affect past orders. Source releases and purchase snapshot rows reject updates at the database level. Referenced releases cannot be deleted. The order snapshot contains copied content and image bytes, source identity, snapshot format, a canonical content/asset digest, mode and the saved-photo permission confirmation time. Draft deletion does not cascade into purchases. Database JSON key order and image row order do not change the digest.

New pilot checkouts require an activated versioned release even for original content. An unversioned or missing release blocks payment. Existing purchases without snapshots retain their previous downloads. Prototype personalization rows with no pinned release require support and cannot silently fall back to a current source ZIP. The six other templates continue their existing original-file purchase path; personalized checkout choices for them are rejected.

## Delivery and authorization

Checkout writes an `OrderDelivery` job in the same transaction as its snapshot. Workers join the order and claim only paid purchases, so the payment transition makes existing jobs eligible atomically. Duplicate Stripe reconciliation and fully discounted order retries do not create duplicate jobs.

The authenticated `/api/jobs/maintenance` endpoint generates one package per invocation, alongside two confirmation-email attempts, with a 120-second execution budget. Configure its existing authenticated scheduler to run every minute when this phase is eventually released, on a host that supports that budget. Claiming uses `FOR UPDATE SKIP LOCKED`, a three-minute lease and a unique lease token. Packaging and source/artifact transfers run outside the transaction using only retained source bytes and the captured snapshot. Publishing requires the same lease token and a still-paid order. A refunded order cannot publish or authorize a new download.

Failures back off from one minute to one hour and stop after eight claims. Expired leases recover crashed workers; obsolete workers cannot overwrite a new claim. ZIP output is deterministic, including image/file ordering and timestamps, so retries use the same digest-addressed artifact key. Upload must finish before the database atomically publishes the private storage key and SHA-256. Finished packages are reused on repeated downloads. The worker does not compile each purchase: it packages the source releases whose independent production builds were verified in Phase 1.

The order page shows preparation, ready downloads, or support-needed status. Ready source packages use `/api/downloads/<order-item-id>?file=purchased-source`. This endpoint authenticates the account and checks ownership and current `PAID` status before issuing each private five-minute download link, matching the existing storage service. It has no membership check, so editor membership changes cannot remove purchased access. Refunds block new links; already issued links remain usable until expiry. Additional guide files retain their tier checks; mutable catalog `*-source.zip` files cannot substitute for a pinned purchase source. Confirmation emails acknowledge payment and link to package status without promising an unfinished ZIP is ready.

PostgreSQL retains trusted source bytes, purchase content, copied images and delivery metadata. Generated artifacts use the existing private S3/R2 service in production, or `storage/purchases/artifacts/` in development. Production delivery requires configured S3 credentials with private-object write/read permissions. Browser downloads go directly to storage so large ZIPs do not pass through server response limits. Local downloads verify the digest before serving; object keys and upload metadata record the same SHA-256. Preserve database backups and artifact storage together; do not expire purchased objects when editor access ends.

Registration warms an optional, digest-verified source cache in `storage/purchases/releases/`. Missing or corrupt cache entries fall back to authoritative retained database bytes and are rebuilt. No checkout transaction reads a source ZIP. Put workers near the database to keep cold source transfers within the execution budget. A crash after upload but before publishing can leave an unreferenced private artifact; retain ready objects and audit references before any future garbage collection. The existing archive and image bounds apply. Future template/content versions must preserve readers for retained releases; do not remove a supported decoder while purchases reference it.

## Operator preparation for a future release

Use the project's documented migration procedure and regenerate Prisma before enabling this code. The new migrations are `20261110100000_purchase_delivery` and `20261110110000_purchase_artifact_storage`, following the previously unapplied personalization migrations. Review backups and historical purchases first. They leave prototype snapshot fields null; they do not guess historical source identity or enqueue historical purchases.

Register only a reviewed, locked source archive that passed Phase 1 verification:

```text
node --conditions=react-server --import tsx scripts/register-template-release.mjs harbor-house <trusted-source.zip>
node --conditions=react-server --import tsx scripts/register-template-release.mjs bloomfield-gardens <trusted-source.zip>
```

These commands write the configured application database and intentionally activate releases. They have not been run against the application database during this phase. For an isolated rehearsal, append `--test`; this uses the guarded `.env.test.local` connection and rejects the application database. Registering a digest again is safe. The immutable source insert commits before activation; an interruption can leave an inactive retained release, and rerunning completes activation. Do not reseed the catalog or overwrite old private deliverables to activate a release.

Alert on `purchase_delivery_retry`, `purchase_delivery_exhausted`, `maintenance_failed`, missing maintenance heartbeats, and nonzero `purchaseExhausted` / `purchaseOverdue` in `maintenance_completed`. Existing confirmation monitoring remains applicable. Inspect the retained release and snapshot before retrying an exhausted job. Once the cause is fixed, reset only the selected undelivered job's attempts, clear its lease fields and `lastError`, and set `nextAt` to now. Preserve its snapshot, source release, and any ready artifact. Do not bulk replay or delete source releases referenced by purchases.

## Local verification

Use the supported Node runtime described in Phase 1. Standard checks are `npm test`, `npm run typecheck`, and `npm run lint`.

`npm run test:database` calls the guarded runner, applies migrations only to the isolated `_test` database, removes application URLs from child test processes and runs commerce, draft, and purchase-delivery integration suites sequentially. These tests cover simultaneous checkout/coupon reservations, source switching, immutable data, copied owned images, duplicate payment events, purchaser isolation, refunds, corruption, retry backoff, lease recovery and fencing, and exhaustion. No live Stripe or email requests are needed.

`npm run test:purchase:e2e` requires Chrome, migrated isolated test tables, and the two real locked archives under `storage/phase1/release/deliverables/`. It starts a separate Next server with only test database credentials, creates temporary accounts and cart fixtures, saves drafts/photos through their authenticated APIs, completes a fully discounted order through the checkout UI, invokes authenticated maintenance, downloads both packages, verifies their contents and revokes downloads after a refund. It restores the previous active releases and removes its own database fixtures. ZIP proofs and desktop/mobile screenshots go to ignored `storage/phase2/`. Positive-value payment confirmation is separately exercised with the Stripe test gateway in the database integration suite; no live payment was made.

## Verification results

Verified on 2026-11-10 with Node 24.22.2:

- All 72 standard regression tests passed, including deterministic retry artifacts and both pilots' shared packaging contract.
- All 24 guarded PostgreSQL checks passed against `baybloom_test`, with no skipped checks. This includes source-cache corruption recovery from retained bytes, private-storage failure backoff, snapshot/source immutability, lease recovery and fencing, and refund authorization.
- Type checking, lint and the storefront production build passed. An existing missing Suspense boundary in editor previews was corrected with a shared `/personalize` layout so the installed Next.js version can prerender them.
- One authenticated Chrome journey exercised both real locked source releases, saved content and normalized photos, the fully discounted checkout UI, retries after draft deletion, preparation/ready order states, authenticated maintenance, both full-sized ZIP downloads, cross-account/anonymous denial, and refund denial. Desktop and mobile checks passed without browser exceptions or horizontal overflow. The journey completed in about 128 seconds, including fixture setup and cleanup.
- Review `storage/phase2/harbor-house-purchased.zip`, `storage/phase2/bloomfield-gardens-purchased.zip`, and the four screenshots under `storage/phase2/screenshots/`. The database fixtures were removed and the previous active releases restored. Generated private objects and cache files remain in ignored storage for inspection.

The browser uses development private-file storage. No external S3/R2 upload, live payment, real email, production scheduler, application database migration, deployment, or push was performed. Rehearse S3/R2 uploads and presigned downloads with an isolated provider sandbox before launch. Positive-value payment confirmation uses the existing Stripe test gateway in the PostgreSQL suite. Subsequent Phase 3 work extends this contract to the remaining six templates; see `docs/template-export-phase3.md`. The results above describe the original two-pilot Phase 2 verification.
