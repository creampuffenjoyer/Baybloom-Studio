# Personalize before purchase

Baybloom customers will try a template with their own content, then purchase a specific website. A membership governs editor access and benefits; purchasing a website delivers its code. Hosted setup and ongoing live-site updates require separately defined service terms.

## Delivery phases

1. **Draft foundation:** establish a versioned, validated Harbor House draft format. Overrides leave original content intact.
2. **Pilot editor:** the early workspace previews selected home page text, brand details, a color, and a temporary photo. Expand coverage to all intended pages and fields, and implement true responsive preview. Preserve original content and provide reset. Edited copy must not be represented as translated automatically.
3. **Accounts and trial:** one Harbor House draft and one normalized hero photo per account can be saved and loaded after applying migrations `20261105090000_personalization_drafts` and `20261105100000_personalization_hero_image`. Before launching the trial, enforce a server-timed one-day trial and make expired drafts viewable but read-only. Define anonymous trial abuse controls, retention, deletion notifications, and account conversion. Do not enable expiry until a working upgrade path exists.
4. **Memberships:** implement monthly and yearly plans, entitlements, billing lifecycle, and a cancellation grace period once plan prices, benefits, and retention duration are decided. Verify entitlement on the server. Protect paid purchases from subscription cancellation.
5. **Purchase and delivery:** attach an immutable draft snapshot to a specific website purchase and produce a tested source package containing that snapshot and owned assets. Confirm image permissions and ensure purchased downloads remain available after membership cancellation.
6. **Setup services:** define and sell specific setup deliverables, hosting and domain ownership, integrations, revisions, and recurring costs. Live-site updates need an explicit support workflow.

Before each release, test its full customer journey and the boundary between sample and operational features. Expand beyond Harbor House after the pilot and delivery path are validated.

## Draft format

Version 1 in `src/lib/personalization/harbor-draft.ts` describes a small initial set of English content and accent-color overrides. It intentionally does not cover every template field or image. The editor and packaged site must use the same validated data and version migration policy before drafts are stored long-term. Arbitrary external URLs and browser-local file paths are not durable assets.

The pilot save endpoint stores one draft per account and template. One private hero photo is re-encoded and stored in PostgreSQL with the draft, with bounded input, pixel count, and output size. This is a deliberately limited pilot; expanding image coverage requires an asset storage and lifecycle design. Loading replaces the current content; saving replaces the previous saved version. It does not affect purchased packages. Deploy both migrations using the project's documented migration procedure before exposing the save feature, and regenerate the Prisma client during deployment. No automatic retention or deletion policy is implemented.
