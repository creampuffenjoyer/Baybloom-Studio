"use client";

import Image from "next/image";
import { Lightbox, type Photo } from "../../_kit/lightbox";

/** Rhythmic grid: every fifth photo spans two columns. */
export function GalleryGrid({ photos }: { photos: Photo[] }) {
  return (
    <Lightbox photos={photos} overlayClassName="bg-[#2a1d26]/96 text-[#fffaf6]">
      {(open) => (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p.src} className={i % 5 === 0 ? "col-span-2 row-span-2" : ""}>
              <button
                type="button"
                onClick={() => open(i)}
                className="group relative block aspect-square w-full overflow-hidden rounded-[1.25rem] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-t-alt"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={i % 5 === 0 ? "50vw" : "25vw"}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Lightbox>
  );
}
