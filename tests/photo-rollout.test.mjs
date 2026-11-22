import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import { emptyDraft, parseDraft } from "../src/lib/personalization/harbor-draft.ts";
import { captureTemplateSnapshot, packageTemplateSnapshot } from "../src/lib/personalization/export.ts";
import { photoRollout } from "./helpers/photo-rollout.mjs";
const bytes = await sharp({ create: { width: 16, height: 16, channels: 3, background: "#24557f" } }).webp().toBuffer();
function source(template, version) {
  const files = Object.fromEntries(["package.json", "package-lock.json", "src/app/layout.tsx", "src/app/personalized-provider.tsx", "src/app/personalized.json", `src/templates/${template}/personalization.tsx`].map(name => [`${template}/${name}`, strToU8("{}")]));
  files[`${template}/baybloom-template.json`] = strToU8(JSON.stringify({ formatVersion: 1, template, templateVersion: version, contentVersion: 1, files: Object.fromEntries(Object.entries(files).map(([name, value]) => [name.slice(template.length + 1), createHash("sha256").update(value).digest("hex")])) }));
  return zipSync(files);
}
for (const { template, registry, primary, shared, hero } of photoRollout) {
  test(`${template}: unique named locations reference real photos and pages`, () => {
    assert.ok(primary && shared && hero); assert.equal(new Set(registry.placements.map(p => p.id)).size, registry.placements.length);
    for (const item of registry.placements) { assert.ok(registry.original(item.id)); assert.match(item.id, /^[a-z0-9.-]+$/); assert.ok(item.name && registry.pages.some(p => p.id === item.page)); }
    assert.equal(registry.is("../escape"), false);
  });
  test(`${template}: strict location validation rejects unknown IDs and URLs`, () => {
    for (const options of [{ [primary.id]: { url: "https://example.com" } }, { "unknown": { original: true } }, { [primary.id]: { alt: "x".repeat(121) } }]) assert.equal(parseDraft({ ...emptyDraft(template), photoPlacements: options }, template).success, false);
    assert.equal(parseDraft({ ...emptyDraft(template), photoPlacements: { [primary.id]: { alt: "Our photo", original: true } } }, template).success, true);
  });
  test(`${template}: replacements remain local and restore bypasses legacy uploads`, () => {
    const original = registry.original(primary.id), legacy = { ...original, src: "/old.webp" }, overrides = { placementPhotos: { [primary.id]: "/new.webp" } };
    assert.equal(registry.resolve(primary.id, legacy, overrides).src, "/new.webp"); assert.equal(registry.resolve(shared.id, legacy, overrides).src, "/old.webp");
    assert.equal(registry.resolve(primary.id, legacy, { ...overrides, photoPlacements: { [primary.id]: { original: true } } }).src, original.src);
  });
  test(`${template}: immutable snapshots package local assets deterministically`, () => {
    const archive = source(template, "1.1.0"), draft = { ...emptyDraft(template), photoPlacements: { [primary.id]: { alt: "Our photo" } } };
    const snapshot = captureTemplateSnapshot(archive, draft, { heroImage: null, images: [{ slot: `placement:${primary.id}`, image: bytes }] }); draft.photoPlacements[primary.id].alt = "Later";
    const output = packageTemplateSnapshot(archive, snapshot); assert.deepEqual(output, packageTemplateSnapshot(archive, snapshot));
    const files = unzipSync(output), value = JSON.parse(strFromU8(files[`${template}/src/app/personalized.json`]));
    assert.equal(value.photoPlacements[primary.id].alt, "Our photo"); assert.equal(value.placementPhotos[primary.id], `/personalized/placements/${primary.id}.webp`); assert.deepEqual(files[`${template}/public/personalized/placements/${primary.id}.webp`], new Uint8Array(bytes));
  });
  test(`${template}: retained 1.0 sources accept older drafts and reject new location data`, () => {
    const archive = source(template, "1.0.0"), draft = emptyDraft(template), assets = { heroImage: null, images: [] };
    const snapshot = captureTemplateSnapshot(archive, draft, assets); const value = JSON.parse(strFromU8(unzipSync(packageTemplateSnapshot(archive, snapshot))[`${template}/src/app/personalized.json`])); assert.equal("placementPhotos" in value, false);
    assert.throws(() => captureTemplateSnapshot(archive, { ...draft, photoPlacements: { [primary.id]: { original: true } } }, assets), /newer reviewed source/);
    assert.throws(() => captureTemplateSnapshot(archive, draft, { ...assets, images: [{ slot: `placement:${primary.id}`, image: bytes }] }), /image slot/);
  });
}
