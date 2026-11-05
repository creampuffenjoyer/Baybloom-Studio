"use client";
import { useCoral } from "../language";
import { MasonryGallery } from "../components/masonry-gallery";
import { PageIntro } from "../components/page-intro";
import { galleryOrder } from "../content";

export function GalleryPage() {
  const { t, photo } = useCoral();
  return (
    <>
      <PageIntro title={t("Gallery")} lede={t("The cove, the reef and the villas, as our guests see them.")} />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <MasonryGallery photos={galleryOrder.map(photo)} />
      </div>
    </>
  );
}
