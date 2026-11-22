"use client";
import { useCoral } from "../language";
import { MasonryGallery } from "../components/masonry-gallery";
import { PageIntro } from "../components/page-intro";
import { galleryOrder } from "../content";
import { usePersonalization } from "../personalization";

export function GalleryPage() {
  const { t, photo } = useCoral();
  const { galleryPhotos, galleryAlt, websitePhotos, coralPhotoAlt } = usePersonalization();
  return (
    <>
      <PageIntro title={t("Gallery")} lede={t("The cove, the reef and the villas, as our guests see them.")} />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <MasonryGallery photos={galleryOrder.map((key) => { const original = photo(key); return { ...original, placement: `gallery.${key}`, src: websitePhotos?.[key] || galleryPhotos?.[key] || original.src, alt: coralPhotoAlt?.[key] || galleryAlt?.[key] || (galleryPhotos?.[key] ? "Your selected gallery photo" : original.alt) }; })} />
      </div>
    </>
  );
}
