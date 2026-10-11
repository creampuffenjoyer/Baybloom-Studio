import { MasonryGallery } from "../components/masonry-gallery";
import { PageIntro } from "../components/page-intro";
import { galleryOrder, photo } from "../content";

export function GalleryPage() {
  return (
    <>
      <PageIntro title="Gallery" lede="The cove, the reef and the villas, as our guests see them." />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <MasonryGallery photos={galleryOrder.map(photo)} />
      </div>
    </>
  );
}
