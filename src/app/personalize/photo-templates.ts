import { PHOTO_REGISTRY as bloomRegistry } from "@/templates/bloomfield-gardens/photo-placements";
import { PHOTO_REGISTRY as spaRegistry } from "@/templates/still-water-spa/photo-placements";
import { PHOTO_REGISTRY as emberRegistry } from "@/templates/ember-and-salt/photo-placements";
import { PHOTO_REGISTRY as islaRegistry } from "@/templates/isla-verde-boutique/photo-placements";
import { PHOTO_REGISTRY as lumenRegistry } from "@/templates/lumen-lake-villas/photo-placements";
import { PHOTO_REGISTRY as pineRegistry } from "@/templates/pine-ridge-lodge/photo-placements";
import type { CoralDraft, PersonalizationDraft } from "@/lib/personalization/harbor-draft";
import { CORAL_PHOTO_PAGES, CORAL_PHOTO_PLACEMENTS, getCoralPhotoPlacement, isCoralPhotoPlacement, originalCoralPhoto } from "@/templates/coral-cove/photo-placements";
import { HARBOR_PHOTO_PAGES, HARBOR_PHOTO_PLACEMENTS, getHarborPhotoPlacement, isHarborPhotoPlacement, originalHarborPhoto } from "@/templates/harbor-house/photo-placements";
import { villas } from "@/templates/coral-cove/content";
import { rooms } from "@/templates/harbor-house/content";
import { isCoralGalleryImageKey } from "@/lib/personalization/coral-gallery-images";

export type PhotoPlacement = { id: string; page: string; pageName: string; name: string; photo: string; ratio: string };
export type LegacyPhotos = { hero?: string; library: Record<string, string>; rooms: Record<string, string>; villas: Record<string, string>; gallery: Record<string, string> };
export const PHOTO_TEMPLATES = {
  "bloomfield-gardens": { template: "bloomfield-gardens", prefix: "bloom", panelId: "bloom-photo-panel", ...bloomRegistry },
  "still-water-spa": { template: "still-water-spa", prefix: "spa", panelId: "spa-photo-panel", ...spaRegistry },
  "ember-and-salt": { template: "ember-and-salt", prefix: "ember", panelId: "ember-photo-panel", ...emberRegistry },
  "isla-verde-boutique": { template: "isla-verde-boutique", prefix: "isla", panelId: "isla-photo-panel", ...islaRegistry },
  "lumen-lake-villas": { template: "lumen-lake-villas", prefix: "lumen", panelId: "lumen-photo-panel", ...lumenRegistry },
  "pine-ridge-lodge": { template: "pine-ridge-lodge", prefix: "pine", panelId: "pine-photo-panel", ...pineRegistry },
  "coral-cove": { template: "coral-cove", prefix: "coral", panelId: "coral-photo-panel", pages: CORAL_PHOTO_PAGES, placements: CORAL_PHOTO_PLACEMENTS, get: getCoralPhotoPlacement, is: isCoralPhotoPlacement, original: originalCoralPhoto },
  "harbor-house": { template: "harbor-house", prefix: "harbor", panelId: "harbor-photo-panel", pages: HARBOR_PHOTO_PAGES, placements: HARBOR_PHOTO_PLACEMENTS, get: getHarborPhotoPlacement, is: isHarborPhotoPlacement, original: originalHarborPhoto },
} as const;
export type PhotoTemplate = typeof PHOTO_TEMPLATES[keyof typeof PHOTO_TEMPLATES];

export function legacyPhoto(item: PhotoPlacement, draft: PersonalizationDraft, legacy: LegacyPhotos) {
  if (draft.template === "harbor-house") {
    const original = originalHarborPhoto(item.id)!;
    const room = rooms.find(room => item.id.endsWith(`.${room.slug}`) || item.id === `room.${room.slug}.photo.1`);
    return { src: (item.id === "home.hero" ? legacy.hero : undefined) || legacy.library[item.photo] || (room ? legacy.rooms[room.slug] : undefined) || original.src,
      alt: draft.housePhotoAlt?.[item.photo] || original.alt };
  }
  if (draft.template !== "coral-cove") {
    const config = PHOTO_TEMPLATES[draft.template]; const original = config.original(item.id)!;
    const alt = (draft as unknown as Record<string, Record<string, string> | undefined>)[`${config.prefix}PhotoAlt`]?.[item.photo];
    const hero = item.id === "home.hero" || item.id.startsWith("home.hero.") && (draft.template !== "bloomfield-gardens" || item.id === "home.hero.1");
    return { src: (hero ? legacy.hero : undefined) || legacy.library[item.photo] || original.src, alt: alt || original.alt };
  }
  const coral = draft as CoralDraft;
  const original = originalCoralPhoto(item.id)!;
  const villa = villas.find(v => item.id.endsWith(v.slug) || item.id === `villa.${v.slug}.photo.1`);
  const gallery = item.page === "gallery" || (item.id === "home.reef" && coral.homeSections?.useGalleryReef) || (item.id.startsWith("home.strip.") && coral.homeSections?.useGalleryStrip);
  return { src: (item.id === "home.hero" ? legacy.hero : undefined) || legacy.library[item.photo] || (villa ? legacy.villas[villa.slug] : undefined) || (gallery ? legacy.gallery[item.photo] : undefined) || original.src,
    alt: coral.coralPhotoAlt?.[item.photo] || (gallery && isCoralGalleryImageKey(item.photo) ? coral.galleryAlt?.[item.photo] : undefined) || original.alt };
}
