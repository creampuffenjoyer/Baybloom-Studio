import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { unzipSync } from "fflate";
import { captureTemplateSnapshot, packageTemplateSnapshot } from "../src/lib/personalization/export.ts";
import { phase3Exports } from "../tests/helpers/phase3-exports.mjs";

const output = path.resolve("storage/phase3/personalized");
const image = await sharp({ create: { width: 480, height: 320, channels: 3, background: "#145678" } }).webp().toBuffer();
for (const scenario of phase3Exports) {
  const slug = scenario.template;
  const archive = await readFile(`storage/phase3/release/deliverables/${slug}/${slug}-source.zip`);
  const images = [`photo:${scenario.photo}`, ...(scenario.extraAssets ?? [])].map(slot => ({ slot, image }));
  const snapshot = captureTemplateSnapshot(archive, scenario.draft, { heroImage: image, images });
  const exported = packageTemplateSnapshot(archive, snapshot);
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, `${slug}-personalized.zip`), exported);
  for (const [name, bytes] of Object.entries(unzipSync(exported))) {
    const target = path.resolve(output, name);
    if (!target.startsWith(output + path.sep)) throw new Error("Unsafe extraction path");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  console.log(`Prepared ${slug}: ${snapshot.sourceSha256}`);
}
