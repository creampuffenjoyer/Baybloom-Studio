import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PIXELS = 20_000_000;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

/** Decode and re-encode an upload; never trust the browser's MIME type. */
export async function normalizeHeroImage(input: Buffer): Promise<Buffer> {
  if (!input.length || input.length > MAX_IMAGE_BYTES) throw new Error("Image size is invalid.");
  const image = sharp(input, { limitInputPixels: MAX_PIXELS, animated: false, failOn: "error" });
  const metadata = await image.metadata();
  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) !== 1) throw new Error("Image format is invalid.");
  const output = await image.rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  if (output.length > MAX_OUTPUT_BYTES) throw new Error("Processed image is too large.");
  return output;
}
