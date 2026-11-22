import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import sharp from "sharp";
import { CORAL_PHOTO_PLACEMENTS, getCoralPhotoPlacement, originalCoralPhoto, resolveCoralPhoto } from "../src/templates/coral-cove/photo-placements.ts";
import { emptyDraft, parseDraft } from "../src/lib/personalization/harbor-draft.ts";
import { captureTemplateSnapshot, captureReleaseSnapshot, packageTemplateSnapshot } from "../src/lib/personalization/export.ts";

const image = await sharp({ create: { width: 20, height: 12, channels: 3, background: "#125588" } }).webp().toBuffer();
function source(version = "1.1.0") {
  const root = "coral-cove/";
  const files = Object.fromEntries(["package.json", "package-lock.json", "src/app/layout.tsx", "src/app/personalized-provider.tsx", "src/app/personalized.json", "src/templates/coral-cove/personalization.tsx"].map(name => [root + name, strToU8("{}")]));
  files[root + "baybloom-template.json"] = strToU8(JSON.stringify({ formatVersion: 1, template: "coral-cove", templateVersion: version, contentVersion: 1, files: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name.slice(root.length), createHash("sha256").update(bytes).digest("hex")])) }));
  return zipSync(files);
}
test("Coral photo locations have unique stable IDs, page names and known originals", () => {
  assert.equal(new Set(CORAL_PHOTO_PLACEMENTS.map(item => item.id)).size, CORAL_PHOTO_PLACEMENTS.length);
  for (const item of CORAL_PHOTO_PLACEMENTS) {
    assert.match(item.id, /^[a-z0-9.-]+$/); assert.ok(item.pageName && item.name && originalCoralPhoto(item.id));
  }
  assert.equal(getCoralPhotoPlacement("../escape"), undefined);
  assert.equal(getCoralPhotoPlacement("home.reef").photo, getCoralPhotoPlacement("gallery.snorkeler").photo);
});
test("Coral validates location descriptions and original flags, rejecting unknown locations and URLs", () => {
  const draft = { ...emptyDraft("coral-cove"), photoPlacements: { "home.reef": { alt: "Our lagoon reef", original: true } } };
  assert.equal(parseDraft(draft, "coral-cove").success, true);
  for (const photoPlacements of [{ "not-a-location": { alt: "No" } }, { "home.reef": { url: "https://example.com/secret" } }, { "home.reef": { alt: "x".repeat(121) } }]) assert.equal(parseDraft({ ...draft, photoPlacements }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, template: "harbor-house" }, "harbor-house").success, false);
});
test("A location replacement does not change another use of the same library photo", () => {
  const original = originalCoralPhoto("home.reef"); const legacy = { ...original, src: "/older-private-photo.webp" };
  const context = { placementPhotos: { "home.reef": "/personalized/placements/home.reef.webp" }, photoPlacements: { "home.reef": { alt: "Our reef" } } };
  assert.equal(resolveCoralPhoto("home.reef", legacy, context).src, context.placementPhotos["home.reef"]);
  assert.equal(resolveCoralPhoto("home.reef", legacy, context).alt, "Our reef");
  assert.equal(resolveCoralPhoto("gallery.snorkeler", legacy, context).src, legacy.src);
  context.photoPlacements["home.reef"].original = true;
  assert.equal(resolveCoralPhoto("home.reef", legacy, context).src, original.src);
});
test("Location assets and restore-original metadata survive snapshots and deterministic packaging", () => {
  const archive = source();
  const draft = { ...emptyDraft("coral-cove"), photoPlacements: { "home.reef": { alt: "Private reef image" }, "gallery.snorkeler": { original: true } } };
  const snapshot = captureTemplateSnapshot(archive, draft, { heroImage: null, images: [{ slot: "placement:home.reef", image }] });
  draft.photoPlacements["home.reef"].alt = "Changed after capture";
  const bytes = packageTemplateSnapshot(archive, snapshot);
  assert.deepEqual(bytes, packageTemplateSnapshot(archive, snapshot));
  const files = unzipSync(bytes); const value = JSON.parse(strFromU8(files["coral-cove/src/app/personalized.json"]));
  assert.equal(value.photoPlacements["home.reef"].alt, "Private reef image");
  assert.equal(value.photoPlacements["gallery.snorkeler"].original, true);
  assert.equal(value.placementPhotos["home.reef"], "/personalized/placements/home.reef.webp");
  assert.deepEqual(files["coral-cove/public/personalized/placements/home.reef.webp"], new Uint8Array(image));
  assert.doesNotMatch(JSON.stringify(value), /blob:|\/api\/personalization/);
});
test("Retained 1.0 Coral sources still deliver legacy drafts and refuse new photo locations before payment", () => {
  const archive = source("1.0.0");
  const draft = emptyDraft("coral-cove");
  const old = captureTemplateSnapshot(archive, draft, { heroImage: null, images: [{ slot: "photo:snorkeler", image }] });
  const value = JSON.parse(strFromU8(unzipSync(packageTemplateSnapshot(archive, old))["coral-cove/src/app/personalized.json"]));
  assert.equal("placementPhotos" in value, false);
  assert.throws(() => captureReleaseSnapshot({ template: "coral-cove", templateVersion: "1.0.0", contentVersion: 1, sourceSha256: old.sourceSha256 }, { ...draft, photoPlacements: { "home.reef": { original: true } } }, { heroImage: null, images: [] }), /newer reviewed source/);
  assert.throws(() => captureTemplateSnapshot(archive, draft, { heroImage: null, images: [{ slot: "placement:home.reef", image }] }), /image slot/);
});
