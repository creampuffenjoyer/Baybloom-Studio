import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import sharp from "sharp";
import { packageHarborDraft } from "../src/lib/personalization/package.ts";
import { captureTemplateSnapshot, packageTemplateSnapshot } from "../src/lib/personalization/export.ts";
import { phase3Exports } from "./helpers/phase3-exports.mjs";

const image = await sharp({ create: { width: 8, height: 8, channels: 3, background: "#125588" } }).webp().toBuffer();
const draft = template => ({ version: 1, template, business: { name: "</script> & a guest's venue" }, home: { headline: "A saved website" }, theme: { accent: "#112233" } });
function source(template) {
  const root = `${template}/`;
  const entries = { "package.json": "{}", "package-lock.json": "{}", "src/app/layout.tsx": "<PersonalizedProvider><Shell>{children}</Shell></PersonalizedProvider>", "src/app/personalized-provider.tsx": "provider", "src/app/personalized.json": "{}", [`src/templates/${template}/personalization.tsx`]: "context" };
  const files = Object.fromEntries(Object.entries(entries).map(([key, value]) => [root+key, strToU8(value)]));
  files[root+"baybloom-template.json"] = strToU8(JSON.stringify({ formatVersion: 1, template, templateVersion: "1.0.0", contentVersion: 1, files: Object.fromEntries(Object.entries(files).map(([key, bytes]) => [key.slice(root.length), createHash("sha256").update(bytes).digest("hex")])) }));
  return zipSync(files);
}

for (const [template, slot, property] of [["harbor-house", "breakfast", "websitePhotos"], ["bloomfield-gardens", "lawn", "bloomPhotos"]]) test(`${template}: shared export preserves saved copy and owns its local images`, () => {
  const archive = source(template); const content = draft(template);
  const assets = { heroImage: image, images: [{ slot: `photo:${slot}`, image }] };
  const snapshot = captureTemplateSnapshot(archive, content, assets);
  content.home.headline = "Later edit";
  const files = unzipSync(packageTemplateSnapshot(archive, snapshot));
  const value = JSON.parse(strFromU8(files[`${template}/src/app/personalized.json`]));
  assert.equal(value.business.name, "</script> & a guest's venue");
  assert.equal(value.home.headline, "A saved website");
  assert.equal(value[property][slot], `/personalized/photos/${slot}.webp`);
  assert.equal(value.heroImage, "/personalized/hero.webp");
  assert.deepEqual(files[`${template}/public/personalized/photos/${slot}.webp`], new Uint8Array(image));
  assert.ok(files[`${template}/baybloom-export.json`]);
  assert.doesNotMatch(JSON.stringify(value), /blob:|\/api\/personalization/);
});

for (const scenario of phase3Exports) test(`${scenario.template}: versioned source, domain copy and every owned photo slot use the shared pipeline`, async () => {
  const { readFile } = await import("node:fs/promises");
  const photos = JSON.parse(await readFile(`src/templates/${scenario.template}/photos.json`, "utf8"));
  const archive = source(scenario.template);
  const images = [...Object.keys(photos).map(key => `photo:${key}`), ...(scenario.extraAssets ?? [])].map(slot => ({ slot, image }));
  const snapshot = captureTemplateSnapshot(archive, scenario.draft, { heroImage: image, images });
  const files = unzipSync(packageTemplateSnapshot(archive, snapshot));
  const value = JSON.parse(strFromU8(files[`${scenario.template}/src/app/personalized.json`]));
  assert.equal(value.home.headline, scenario.heading);
  for (const [key, overrides] of Object.entries(scenario.overrides)) assert.deepEqual(value[key], overrides);
  for (const key of Object.keys(photos)) {
    const url = `/personalized/photos/${key}.webp`;
    assert.equal(value[scenario.property][key], url);
    assert.deepEqual(files[`${scenario.template}/public${url}`], new Uint8Array(image));
  }
  const manifest = JSON.parse(strFromU8(files[`${scenario.template}/baybloom-export.json`]));
  assert.equal(Object.keys(manifest.assets).length, images.length + 1);
  assert.equal(manifest.sourceSha256, snapshot.sourceSha256);
  assert.throws(() => packageTemplateSnapshot(archive, { ...snapshot, images: [...images, { slot: "gallery:../escape", image }] }), /image slot/);
  assert.throws(() => captureTemplateSnapshot(source("harbor-house"), scenario.draft, { heroImage: null, images: [] }), /template mismatch/);
  assert.doesNotMatch(JSON.stringify(value), /blob:|\/api\/personalization/);
});

test("Coral villa and gallery images keep separate context maps and remain exclusive to Coral", () => {
  const archive = source("coral-cove");
  const snapshot = captureTemplateSnapshot(archive, draft("coral-cove"), { heroImage: null,
    images: [{ slot: "overwater-villa", image }, { slot: "gallery:snorkeler", image }, { slot: "photo:snorkeler", image }],
  });
  const value = JSON.parse(strFromU8(unzipSync(packageTemplateSnapshot(archive, snapshot))["coral-cove/src/app/personalized.json"]));
  assert.equal(value.villaPhotos["overwater-villa"], "/personalized/villas/overwater-villa.webp");
  assert.equal(value.galleryPhotos.snorkeler, "/personalized/gallery/snorkeler.webp");
  assert.equal(value.websitePhotos.snorkeler, "/personalized/photos/snorkeler.webp");
  assert.throws(() => captureTemplateSnapshot(source("pine-ridge-lodge"), draft("pine-ridge-lodge"), snapshot), /image slot/);
});

test("source versions, integrity and template identity are checked", () => {
  const archive = source("harbor-house"); const snapshot = captureTemplateSnapshot(archive, draft("harbor-house"), { heroImage: null, images: [] });
  assert.throws(() => packageTemplateSnapshot(source("bloomfield-gardens"), snapshot), /match source/);
  assert.throws(() => captureTemplateSnapshot(archive, draft("bloomfield-gardens"), { heroImage: null, images: [] }), /template mismatch/);
  assert.throws(() => captureTemplateSnapshot(zipSync({}), draft("harbor-house"), { heroImage: null, images: [] }), /versioned export/);
  const entries = unzipSync(archive); entries["harbor-house/package.json"] = strToU8("tampered");
  assert.throws(() => packageTemplateSnapshot(zipSync(entries), snapshot), /integrity/);
  assert.throws(() => packageTemplateSnapshot(archive, { ...snapshot, templateVersion: "9" }), /match source/);
});

test("unsafe image slots, duplicates and non-normalized assets are rejected", () => {
  const archive = source("harbor-house"); const snapshot = captureTemplateSnapshot(archive, draft("harbor-house"), { heroImage: null, images: [] });
  for (const slot of ["../escape", "photo:../escape", "photo:unknown"]) assert.throws(() => packageTemplateSnapshot(archive, { ...snapshot, images: [{ slot, image }] }), /image slot/);
  assert.throws(() => packageTemplateSnapshot(archive, { ...snapshot, images: [{ slot: "photo:breakfast", image }, { slot: "photo:breakfast", image }] }), /Duplicate/);
  assert.throws(() => packageTemplateSnapshot(archive, { ...snapshot, heroImage: new Uint8Array([1]) }), /WebP/);
  const entries = unzipSync(archive); entries["../escape"] = image;
  assert.throws(() => packageTemplateSnapshot(zipSync(entries), snapshot), /Unsafe/);
});

test("Harbor compatibility entry point includes legacy room assets", () => {
  const files = unzipSync(packageHarborDraft(source("harbor-house"), { content: draft("harbor-house"), heroImage: null, images: [{ slot: "rose-room", image }] }));
  const value = JSON.parse(strFromU8(files["harbor-house/src/app/personalized.json"]));
  assert.equal(value.roomPhotos["rose-room"], "/personalized/rooms/rose-room.webp");
});

test("retries produce identical artifact bytes regardless of database image row order", () => {
  const archive = source("harbor-house");
  const snapshot = captureTemplateSnapshot(archive, draft("harbor-house"), { heroImage: image,
    images: [{ slot: "photo:breakfast", image }, { slot: "rose-room", image }],
  });
  assert.deepEqual(packageTemplateSnapshot(archive, snapshot), packageTemplateSnapshot(archive, { ...snapshot, images: [...snapshot.images].reverse() }));
});
