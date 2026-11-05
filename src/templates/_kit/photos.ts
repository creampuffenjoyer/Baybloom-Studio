/** A photo record as written by the image pipeline into each template's photos.json. */
export type PhotoRecord = {
  src: string;
  alt: string;
  width: number;
  height: number;
  author: string;
  source: string;
  license: string;
  licenseUrl: string | null;
};

export function definePhotos<K extends string>(photos: Record<K, PhotoRecord>) {
  return photos;
}
