export type PhotoLocation = { id: string; page: string; pageName: string; name: string; photo: string; ratio: string };
export type PhotoOverrides = { photoPlacements?: Record<string, { alt?: string; original?: boolean } | undefined>; placementPhotos?: Record<string, string | undefined> };

/** Pure metadata and resolution, usable by the editor, validator and standalone project. */
export function createPhotoRegistry(pages: readonly { id: string; name: string }[], placements: readonly PhotoLocation[], photos: Record<string, { src: string; alt: string }>) {
  const byId = new Map(placements.map(item => [item.id, item]));
  const get = (id: string) => byId.get(id);
  const is = (id: unknown): id is string => typeof id === "string" && byId.has(id);
  const original = (id: string) => { const item = get(id); return item ? photos[item.photo] : undefined; };
  function resolve<T extends { src: string; alt: string }>(id: string, photo: T, overrides: PhotoOverrides): T {
    const options = overrides.photoPlacements?.[id], source = original(id);
    return { ...photo, src: options?.original && source ? source.src : overrides.placementPhotos?.[id] || photo.src,
      alt: options?.alt ?? (options?.original && source ? source.alt : photo.alt) };
  }
  return { pages, placements, get, is, original, resolve };
}
