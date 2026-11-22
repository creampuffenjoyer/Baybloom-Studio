// Run with: node --import tsx scripts/prepare-export-verification.mjs
// Only writes disposable artifacts below storage/phase1. No database or account access.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { unzipSync } from "fflate";
import { captureTemplateSnapshot, packageTemplateSnapshot } from "../src/lib/personalization/export.ts";

const output = path.resolve("storage/phase1/personalized");
const drafts = [
  { version: 1, template: "harbor-house", business: { name: "Export Harbor", email: "harbor@example.test" }, home: { headline: "Harbor export proof" }, theme: { accent: "#145678" }, rooms: { "lighthouse-room": { name: "Export Sea Room", price: 7654 } }, breakfast: { heading: "Export breakfast" }, housePhotoAlt: { breakfast: "Export breakfast photo" } },
  { version: 1, template: "bloomfield-gardens", business: { name: "Export Gardens", email: "gardens@example.test" }, home: { headline: "Gardens export proof" }, theme: { accent: "#145678" }, bloomSpaces: { "the-lawn": { name: "Export Lawn", ceremony: 120 } }, bloomPackages: { first: { name: "Export celebration", price: 125000 } }, bloomCopy: { "Planning your day": "Export planning" }, bloomPhotoAlt: { lawn: "Export lawn photo" } },
];
const image = await sharp({ create: { width: 480, height: 320, channels: 3, background: "#145678" } }).webp().toBuffer();
for (const content of drafts) {
  const slug = content.template;
  const archive = await readFile(`storage/phase1/release/deliverables/${slug}/${slug}-source.zip`);
  const images = [{ slot: `photo:${slug === "harbor-house" ? "breakfast" : "lawn"}`, image }];
  if (slug === "harbor-house") images.push({ slot: "lighthouse-room", image });
  const snapshot = captureTemplateSnapshot(archive, content, { heroImage: image, images });
  const exported = packageTemplateSnapshot(archive, snapshot);
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, `${slug}-personalized.zip`), exported);
  for (const [name, bytes] of Object.entries(unzipSync(exported))) {
    const target = path.resolve(output, name);
    if (!target.startsWith(output+path.sep)) throw new Error("Unsafe extraction path");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  await writeFile(path.join(output, `${slug}-snapshot.json`), JSON.stringify({ ...snapshot, heroImage: Buffer.from(image).toString("base64"), images: images.map(item => ({ slot: item.slot, base64: Buffer.from(item.image).toString("base64") })) }, null, 2));
  console.log(`Prepared ${slug}: ${snapshot.sourceSha256}`);
}
