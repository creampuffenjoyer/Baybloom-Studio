"use client";

import Image from "next/image";
import { Lightbox, type Photo } from "../../_kit/lightbox";

/** One large photo and up to two smaller ones; any photo opens the viewer. */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <Lightbox photos={photos} overlayClassName="bg-[#062a28]/96 text-white">
      {(open) => (
        <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
          {photos.slice(0, 3).map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => open(i)}
              className={`group relative overflow-hidden rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tpl-accent ${
                i === 0 ? "aspect-[4/3] sm:col-span-3 sm:row-span-2 sm:aspect-auto sm:min-h-[460px]" : "hidden aspect-[4/3] sm:block"
              }`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={i === 0 ? "(min-width: 640px) 75vw, 100vw" : "25vw"}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {i === 0 && (
                <span className="absolute right-4 bottom-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-tpl-ink">
                  View {photos.length} photos
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </Lightbox>
  );
}
