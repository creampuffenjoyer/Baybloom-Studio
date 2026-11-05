import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { normalizeHeroImage, MAX_IMAGE_BYTES } from "../src/lib/personalization/image.ts";

test("hero uploads are decoded and normalized to bounded WebP images", async () => {
  const original = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: "#24557f" } }).png().toBuffer();
  const normalized = await normalizeHeroImage(original);
  const info = await sharp(normalized).metadata();
  assert.equal(info.format, "webp");
  assert.equal(info.width, 1800);
  assert.equal(info.height, 900);
});

test("hero uploads reject corrupt and oversized data", async () => {
  await assert.rejects(normalizeHeroImage(Buffer.from("not an image")));
  await assert.rejects(normalizeHeroImage(Buffer.alloc(MAX_IMAGE_BYTES + 1)));
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
  await assert.rejects(normalizeHeroImage(svg));
});
