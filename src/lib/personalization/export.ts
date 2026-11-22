import { PHOTO_REGISTRY as bloomRegistry } from "@/templates/bloomfield-gardens/photo-placements";
import { PHOTO_REGISTRY as spaRegistry } from "@/templates/still-water-spa/photo-placements";
import { PHOTO_REGISTRY as emberRegistry } from "@/templates/ember-and-salt/photo-placements";
import { PHOTO_REGISTRY as islaRegistry } from "@/templates/isla-verde-boutique/photo-placements";
import { PHOTO_REGISTRY as lumenRegistry } from "@/templates/lumen-lake-villas/photo-placements";
import { PHOTO_REGISTRY as pineRegistry } from "@/templates/pine-ridge-lodge/photo-placements";
import { createHash } from "node:crypto";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { z } from "zod";
import definitions from "./export-templates.json";
import { parseDraft, type PersonalizationDraft } from "./harbor-draft";
import { HOUSE_PHOTO_KEYS } from "./house-photos";
import { BLOOM_PHOTO_KEYS } from "./bloom-photos";
import { HARBOR_ROOM_IMAGE_KEYS } from "./harbor-room-images";
import { CORAL_PHOTO_KEYS } from "./coral-photos";
import { CORAL_VILLA_IMAGE_KEYS } from "./coral-villa-images";
import { CORAL_GALLERY_IMAGE_KEYS } from "./coral-gallery-images";
import { PINE_PHOTO_KEYS } from "./pine-photos";
import { LUMEN_PHOTO_KEYS } from "./lumen-photos";
import { ISLA_PHOTO_KEYS } from "./isla-photos";
import { EMBER_PHOTO_KEYS } from "./ember-photos";
import { SPA_PHOTO_KEYS } from "./spa-photos";
import { CORAL_PLACEMENT_KEYS } from "@/templates/coral-cove/photo-placements";
import { HARBOR_PLACEMENT_KEYS } from "@/templates/harbor-house/photo-placements";

export type ExportTemplate = keyof typeof definitions;
export type ExportAssets = { heroImage: Uint8Array | null; images: { slot: string; image: Uint8Array }[] };
export type TemplateSnapshot = ExportAssets & { formatVersion: 1; template: ExportTemplate; templateVersion: string; contentVersion: 1; sourceSha256: string; content: PersonalizationDraft };
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const registeredTemplates = Object.keys(definitions) as [ExportTemplate, ...ExportTemplate[]];
const manifestSchema = z.strictObject({ formatVersion: z.literal(1), template: z.enum(registeredTemplates), templateVersion: z.string(), contentVersion: z.literal(1), files: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)) });
const catalogs = { bloomPlacements: bloomRegistry.placements.map(item => item.id), spaPlacements: spaRegistry.placements.map(item => item.id), emberPlacements: emberRegistry.placements.map(item => item.id), islaPlacements: islaRegistry.placements.map(item => item.id), lumenPlacements: lumenRegistry.placements.map(item => item.id), pinePlacements: pineRegistry.placements.map(item => item.id), house: HOUSE_PHOTO_KEYS, bloom: BLOOM_PHOTO_KEYS, coral: CORAL_PHOTO_KEYS,
  pine: PINE_PHOTO_KEYS, lumen: LUMEN_PHOTO_KEYS, isla: ISLA_PHOTO_KEYS, ember: EMBER_PHOTO_KEYS, spa: SPA_PHOTO_KEYS,
  harborRooms: HARBOR_ROOM_IMAGE_KEYS, coralVillas: CORAL_VILLA_IMAGE_KEYS, coralGallery: CORAL_GALLERY_IMAGE_KEYS, coralPlacements: CORAL_PLACEMENT_KEYS, harborPlacements: HARBOR_PLACEMENT_KEYS };
function supportedVersion(template: ExportTemplate, version: string) {
  const registration = definitions[template];
  return version === registration.templateVersion || ("previousVersions" in registration && registration.previousVersions.includes(version));
}
function imageGroups(template: ExportTemplate, version: string) {
  const registration = definitions[template];
  return [{ prefix: "photo:", catalog: registration.photoCatalog, property: registration.photoProperty, directory: "photos" }, ...registration.additionalImageGroups.filter(group => !("templateVersions" in group) || (Array.isArray(group.templateVersions) && group.templateVersions.includes(version)))];
}
function imageSlot(template: ExportTemplate, slot: string, version: string) {
  const group = imageGroups(template, version).find(item => slot.startsWith(item.prefix));
  const key = group ? slot.slice(group.prefix.length) : "";
  if (!group || !(catalogs[group.catalog as keyof typeof catalogs] as readonly string[]).includes(key)) throw new Error("Invalid image slot");
  return { ...group, key };
}
const safePath = (name: string) => !name.includes("\\") && !name.includes(":") && !name.startsWith("/") && name.split("/").every(part => part !== "." && part !== "..");

function readSource(archive: Uint8Array) {
  if (archive.length > 64 * 1024 * 1024) throw new Error("Source archive too large");
  let total = 0; let count = 0;
  const files = unzipSync(archive, { filter: file => {
    total += file.originalSize; count++;
    if (total > 160 * 1024 * 1024 || count > 5000 || !safePath(file.name)) throw new Error("Unsafe source archive");
    return true;
  } });
  const manifestNames = Object.keys(files).filter(name => /^[^/]+\/baybloom-template\.json$/.test(name));
  if (manifestNames.length !== 1) throw new Error("Source archive does not support the versioned export format; regenerate it");
  const manifest = manifestSchema.parse(JSON.parse(strFromU8(files[manifestNames[0]])));
  const registration = definitions[manifest.template];
  if (!supportedVersion(manifest.template, manifest.templateVersion) || manifest.contentVersion !== registration.contentVersion) throw new Error("Unsupported template version");
  const root = `${manifest.template}/`;
  if (manifestNames[0] !== `${root}baybloom-template.json`) throw new Error("Source template mismatch");
  for (const [name, bytes] of Object.entries(files)) {
    if (!name.startsWith(root) || /(^|\/)(\.env[^/]*|node_modules|\.next|\.git)(\/|$)/.test(name)) throw new Error("Unsafe source file");
    if (name === manifestNames[0]) continue;
    const relative = name.slice(root.length);
    if (digest(bytes) !== manifest.files[relative]) throw new Error(`Source integrity mismatch: ${relative}`);
  }
  for (const name of Object.keys(manifest.files)) if (!safePath(name) || !files[`${root}${name}`]) throw new Error("Missing source file");
  for (const name of ["package.json", "package-lock.json", "src/app/layout.tsx", "src/app/personalized-provider.tsx", "src/app/personalized.json", `src/templates/${manifest.template}/personalization.tsx`]) if (!files[`${root}${name}`]) throw new Error(`Incomplete standalone source: ${name}`);
  return { files, manifest, root, registration };
}

/** Copy a validated draft and its owned assets against the exact source release. */
export function captureTemplateSnapshot(archive: Uint8Array, content: unknown, assets: ExportAssets): TemplateSnapshot {
  const { manifest } = readSource(archive);
  return captureReleaseSnapshot({ template: manifest.template, templateVersion: manifest.templateVersion,
    contentVersion: manifest.contentVersion, sourceSha256: digest(archive) }, content, assets);
}

/** Metadata must come from a previously validated, immutable trusted release.
 * Checkout uses this contract without transferring/compressing source ZIPs in a transaction.
 * Packaging still verifies the actual retained source and all manifest hashes.
 */
export function captureReleaseSnapshot(release: Pick<TemplateSnapshot, "template" | "templateVersion" | "contentVersion" | "sourceSha256">, content: unknown, assets: ExportAssets): TemplateSnapshot {
  const registration = definitions[release.template];
  if (!registration || !supportedVersion(release.template, release.templateVersion) || release.contentVersion !== registration.contentVersion || !/^[a-f0-9]{64}$/.test(release.sourceSha256)) throw new Error("Unsupported source release");
  const parsed = parseDraft(content, release.template);
  if (!parsed.success) throw new Error("Invalid saved personalization or template mismatch");
  if ("photoPlacements" in parsed.data && Object.keys(parsed.data.photoPlacements ?? {}).length && !imageGroups(release.template, release.templateVersion).some(group => group.property === "placementPhotos")) throw new Error("A newer reviewed source release is required for location-specific photos.");
  validateAssets(release.template, assets, release.templateVersion);
  return { formatVersion: 1, ...release, content: parsed.data, heroImage: assets.heroImage ? Uint8Array.from(assets.heroImage) : null, images: assets.images.map(item => ({ slot: item.slot, image: Uint8Array.from(item.image) })) };
}

function validateAssets(template: ExportTemplate, assets: ExportAssets, version: string) {
  const seen = new Set<string>();
  let imageBytes = 0;
  const validateImage = (bytes: Uint8Array) => {
    imageBytes += bytes.length;
    if (imageBytes > 100 * 1024 * 1024 || bytes.length > 5 * 1024 * 1024 || bytes.length < 12 || strFromU8(bytes.slice(0, 4)) !== "RIFF" || strFromU8(bytes.slice(8, 12)) !== "WEBP") throw new Error("Invalid normalized WebP asset");
  };
  for (const { slot, image } of assets.images) {
    imageSlot(template, slot, version);
    if (seen.has(slot)) throw new Error("Duplicate image slot");
    seen.add(slot);
    validateImage(image);
  }
  if (assets.heroImage) validateImage(assets.heroImage);
}

/** Same packaging algorithm for every registered template. No account or database access. */
export function packageTemplateSnapshot(archive: Uint8Array, snapshot: TemplateSnapshot) {
  const { files, manifest, root } = readSource(archive);
  if (snapshot.formatVersion !== 1 || snapshot.template !== manifest.template || snapshot.templateVersion !== manifest.templateVersion || snapshot.contentVersion !== manifest.contentVersion || snapshot.sourceSha256 !== digest(archive)) throw new Error("Snapshot does not match source release");
  const parsed = parseDraft(snapshot.content, manifest.template);
  if (!parsed.success) throw new Error("Invalid saved personalization");
  if ("photoPlacements" in parsed.data && Object.keys(parsed.data.photoPlacements ?? {}).length && !imageGroups(manifest.template, manifest.templateVersion).some(group => group.property === "placementPhotos")) throw new Error("A newer reviewed source release is required for location-specific photos.");
  validateAssets(manifest.template, snapshot, manifest.templateVersion);
  const imageMaps: Record<string, Record<string, string>> = Object.fromEntries(imageGroups(manifest.template, manifest.templateVersion).map(group => [group.property, {}]));
  const assetHashes: Record<string, string> = {};
  function putImage(relative: string, bytes: Uint8Array) {
    files[`${root}public${relative}`] = Uint8Array.from(bytes); assetHashes[relative] = digest(bytes);
  }
  for (const { slot, image } of [...snapshot.images].sort((a, b) => a.slot < b.slot ? -1 : a.slot > b.slot ? 1 : 0)) {
    const { key, property, directory } = imageSlot(manifest.template, slot, manifest.templateVersion);
    const url = `/personalized/${directory}/${key}.webp`;
    putImage(url, image); imageMaps[property][key] = url;
  }
  const heroImage = snapshot.heroImage ? "/personalized/hero.webp" : undefined;
  if (snapshot.heroImage) putImage(heroImage!, snapshot.heroImage);
  const value = { ...parsed.data, accent: parsed.data.theme.accent, ...(heroImage ? { heroImage } : {}), ...imageMaps };
  files[`${root}src/app/personalized.json`] = strToU8(JSON.stringify(value, null, 2));
  files[`${root}baybloom-export.json`] = strToU8(JSON.stringify({ formatVersion: 1, template: manifest.template, templateVersion: manifest.templateVersion, contentVersion: manifest.contentVersion, sourceSha256: snapshot.sourceSha256, contentSha256: digest(files[`${root}src/app/personalized.json`]), assets: assetHashes }, null, 2));
  files[`${root}PERSONALIZATION.md`] = strToU8("Your saved content is in src/app/personalized.json. Uploaded images are local files in public/personalized/. This project needs no Baybloom account or database. Forms, availability and booking flows remain demonstrations until connected to your services. Build and deploy using README.md. Keep attribution for sample images you retain.\n");
  const ordered = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return zipSync(ordered, { level: 6, mtime: new Date(2020, 0, 1) });
}
