import { GalleryGrid } from "../components/gallery-grid";
import { galleryOrder, photo } from "../content";

export function GalleryPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-10 text-center sm:px-8">
        <h1 className="font-t-display text-6xl font-medium italic sm:text-7xl">Gallery</h1>
        <p className="mx-auto mt-5 max-w-[50ch] text-lg text-t-muted">The gardens through the seasons, and a few of the days they’ve hosted.</p>
      </section>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <GalleryGrid photos={galleryOrder.map(photo)} />
      </div>
    </>
  );
}
