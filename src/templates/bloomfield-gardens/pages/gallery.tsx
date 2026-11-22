"use client";
import { useBloomCopy } from "../copy";
import { useBloomfield } from "../language";

import { GalleryGrid } from "../components/gallery-grid";


export function GalleryPage() {
  const copy = useBloomCopy();
  const { galleryOrder, photo } = useBloomfield();
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-10 text-center sm:px-8">
        <h1 className="font-tpl-display text-6xl font-medium italic sm:text-7xl">{copy("Gallery")}</h1>
        <p className="mx-auto mt-5 max-w-[50ch] text-lg text-tpl-muted">{copy("The gardens through the seasons, and a few of the days they’ve hosted.")}</p>
      </section>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <GalleryGrid placements={galleryOrder.map(key => `gallery.${key}`)} photos={galleryOrder.map(photo)} />
      </div>
    </>
  );
}
