import { experiences, galleryOrder, offers, villas, type PhotoKey } from "./content";
import photos from "./photos.json";

export type CoralPhotoPlacement = { id: string; page: string; pageName: string; name: string; photo: PhotoKey; ratio: string; reveal?: "villa-gallery" | "booking-villas" };
const placement = (id: string, page: string, pageName: string, name: string, photo: PhotoKey, ratio = "4:3", reveal?: CoralPhotoPlacement["reveal"]): CoralPhotoPlacement => ({ id, page, pageName, name, photo, ratio, ...(reveal ? { reveal } : {}) });

/** Locations, rather than filenames: the same library photo can occur in many locations. */
export const CORAL_PHOTO_PLACEMENTS: readonly CoralPhotoPlacement[] = [
  placement("home.hero", "home", "Home", "Main banner", "hero", "16:9"),
  ...villas.map(v => placement(`home.villa.${v.slug}`, "home", "Home", `${v.name} — Card photo`, v.photos[0], "4:5")),
  placement("home.reef", "home", "Home", "Reef section", "snorkeler"),
  placement("home.offer", "home", "Home", "Featured offer", offers[0].photo),
  ...(["coral", "beach-bar", "sandbar", "pool", "paraw"] as const).map((key, i) => placement(`home.strip.${key}`, "home", "Home", `Photo strip — Photo ${i + 1}`, key, "1:1")),
  ...villas.flatMap(v => [
    placement(`villas.${v.slug}`, "villas", "Villas", `${v.name} — Main photo`, v.photos[0]),
    ...v.photos.map((key, i) => placement(`villa.${v.slug}.photo.${i + 1}`, v.slug, v.name, i === 0 ? "Main villa photo" : `Villa gallery — Photo ${i + 1}`, key, "4:3", "villa-gallery")),
    ...villas.filter(other => other.slug !== v.slug).map(other => placement(`villa.${v.slug}.other.${other.slug}`, v.slug, v.name, `${other.name} — Related villa`, other.photos[0])),
  ]),
  placement("experiences.banner", "experiences", "Experiences", "Main banner", "sandbar", "21:8"),
  ...experiences.map(x => placement(`experiences.${x.slug}`, "experiences", "Experiences", x.name, x.photo)),
  ...offers.map(o => placement(`offers.${o.slug}`, "offers", "Offers", o.name, o.photo)),
  ...galleryOrder.map((key, i) => placement(`gallery.${key}`, "gallery", "Gallery", `Photo ${i + 1} — ${key.split("-").join(" ")}`, key, `${photos[key].width}:${photos[key].height}`)),
  ...villas.flatMap(v => [
    placement(`book.villa.${v.slug}`, "book", "Sample booking", `${v.name} — Choice photo`, v.photos[0], "4:3", "booking-villas"),
    placement(`book.summary.${v.slug}`, "book", "Sample booking", `${v.name} — Stay summary`, v.photos[0], "16:9", "booking-villas"),
  ]),
];
export const CORAL_PLACEMENT_KEYS = CORAL_PHOTO_PLACEMENTS.map(item => item.id);
const byId = new Map(CORAL_PHOTO_PLACEMENTS.map(item => [item.id, item]));
export const getCoralPhotoPlacement = (id: string) => byId.get(id);
export const isCoralPhotoPlacement = (id: unknown): id is string => typeof id === "string" && byId.has(id);
export const CORAL_PHOTO_PAGES = [
  { id: "home", name: "Home" }, { id: "villas", name: "Villas" }, { id: "experiences", name: "Experiences" }, { id: "offers", name: "Offers" }, { id: "gallery", name: "Gallery" }, { id: "book", name: "Sample booking" }, { id: "contact", name: "Contact" },
  ...villas.map(v => ({ id: v.slug, name: v.name })),
];
export const originalCoralPhoto = (id: string) => { const item = byId.get(id); return item ? photos[item.photo] : undefined; };

export function resolveCoralPhoto<T extends { src: string; alt: string }>(id: string, photo: T, personalization: {
  photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>;
  placementPhotos?: Record<string, string | undefined>;
}): T {
  const options = personalization.photoPlacements?.[id]; const original = originalCoralPhoto(id);
  return { ...photo,
    src: options?.original && original ? original.src : personalization.placementPhotos?.[id] || photo.src,
    alt: options?.alt ?? (options?.original && original ? original.alt : photo.alt),
  };
}
