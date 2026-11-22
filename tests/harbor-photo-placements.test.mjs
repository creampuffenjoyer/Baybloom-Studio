import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import sharp from "sharp";
import { HARBOR_PHOTO_PLACEMENTS, getHarborPhotoPlacement, originalHarborPhoto, resolveHarborPhoto } from "../src/templates/harbor-house/photo-placements.ts";
import { emptyDraft, parseDraft } from "../src/lib/personalization/harbor-draft.ts";
import { captureTemplateSnapshot, captureReleaseSnapshot, packageTemplateSnapshot } from "../src/lib/personalization/export.ts";

const image = await sharp({ create: { width: 20, height: 12, channels: 3, background: "#125588" } }).webp().toBuffer();
function source(version = "1.1.0") {
  const root = "harbor-house/";
  const files = Object.fromEntries(["package.json", "package-lock.json", "src/app/layout.tsx", "src/app/personalized-provider.tsx", "src/app/personalized.json", "src/templates/harbor-house/personalization.tsx"].map(name => [root + name, strToU8("{}")]));
  files[root + "baybloom-template.json"] = strToU8(JSON.stringify({ formatVersion: 1, template: "harbor-house", templateVersion: version, contentVersion: 1, files: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name.slice(root.length), createHash("sha256").update(bytes).digest("hex")])) }));
  return zipSync(files);
}
test("Harbor photo locations have unique stable IDs, page names and known originals", () => {
  assert.equal(new Set(HARBOR_PHOTO_PLACEMENTS.map(item => item.id)).size, HARBOR_PHOTO_PLACEMENTS.length);
  assert.equal(HARBOR_PHOTO_PLACEMENTS.length, 34);
  for (const item of HARBOR_PHOTO_PLACEMENTS) {
    assert.match(item.id, /^[a-z0-9.-]+$/); assert.ok(item.pageName && item.name && originalHarborPhoto(item.id));
  }
  assert.equal(getHarborPhotoPlacement("../escape"), undefined);
  assert.equal(getHarborPhotoPlacement("home.breakfast").photo, getHarborPhotoPlacement("breakfast.breakfast").photo);
});
test("Harbor validates location descriptions and original flags, rejecting unknown locations and URLs", () => {
  const draft = { ...emptyDraft("harbor-house"), photoPlacements: { "home.breakfast": { alt: "Our lagoon reef", original: true } } };
  assert.equal(parseDraft(draft, "harbor-house").success, true);
  for (const photoPlacements of [{ "not-a-location": { alt: "No" } }, { "home.breakfast": { url: "https://example.com/secret" } }, { "home.breakfast": { alt: "x".repeat(121) } }]) assert.equal(parseDraft({ ...draft, photoPlacements }, "harbor-house").success, false);
  assert.equal(parseDraft({ ...draft, template: "coral-cove" }, "coral-cove").success, false);
});
test("A location replacement does not change another use of the same library photo", () => {
  const original = originalHarborPhoto("home.breakfast"); const legacy = { ...original, src: "/older-private-photo.webp" };
  const context = { placementPhotos: { "home.breakfast": "/personalized/placements/home.breakfast.webp" }, photoPlacements: { "home.breakfast": { alt: "Our reef" } } };
  assert.equal(resolveHarborPhoto("home.breakfast", legacy, context).src, context.placementPhotos["home.breakfast"]);
  assert.equal(resolveHarborPhoto("home.breakfast", legacy, context).alt, "Our reef");
  assert.equal(resolveHarborPhoto("breakfast.breakfast", legacy, context).src, legacy.src);
  context.photoPlacements["home.breakfast"].original = true;
  assert.equal(resolveHarborPhoto("home.breakfast", legacy, context).src, original.src);
});
test("Location assets and restore-original metadata survive snapshots and deterministic packaging", () => {
  const archive = source();
  const draft = { ...emptyDraft("harbor-house"), photoPlacements: { "home.breakfast": { alt: "Private reef image" }, "breakfast.breakfast": { original: true } } };
  const snapshot = captureTemplateSnapshot(archive, draft, { heroImage: null, images: [{ slot: "placement:home.breakfast", image }] });
  draft.photoPlacements["home.breakfast"].alt = "Changed after capture";
  const bytes = packageTemplateSnapshot(archive, snapshot);
  assert.deepEqual(bytes, packageTemplateSnapshot(archive, snapshot));
  const files = unzipSync(bytes); const value = JSON.parse(strFromU8(files["harbor-house/src/app/personalized.json"]));
  assert.equal(value.photoPlacements["home.breakfast"].alt, "Private reef image");
  assert.equal(value.photoPlacements["breakfast.breakfast"].original, true);
  assert.equal(value.placementPhotos["home.breakfast"], "/personalized/placements/home.breakfast.webp");
  assert.deepEqual(files["harbor-house/public/personalized/placements/home.breakfast.webp"], new Uint8Array(image));
  assert.doesNotMatch(JSON.stringify(value), /blob:|\/api\/personalization/);
});
test("Retained 1.0 Harbor sources still deliver legacy drafts and refuse new photo locations before payment", () => {
  const archive = source("1.0.0");
  const draft = emptyDraft("harbor-house");
  const old = captureTemplateSnapshot(archive, draft, { heroImage: null, images: [{ slot: "photo:breakfast", image }] });
  const value = JSON.parse(strFromU8(unzipSync(packageTemplateSnapshot(archive, old))["harbor-house/src/app/personalized.json"]));
  assert.equal("placementPhotos" in value, false);
  assert.throws(() => captureReleaseSnapshot({ template: "harbor-house", templateVersion: "1.0.0", contentVersion: 1, sourceSha256: old.sourceSha256 }, { ...draft, photoPlacements: { "home.breakfast": { original: true } } }, { heroImage: null, images: [] }), /newer reviewed source/);
  assert.throws(() => captureTemplateSnapshot(archive, draft, { heroImage: null, images: [{ slot: "placement:home.breakfast", image }] }), /image slot/);
});
