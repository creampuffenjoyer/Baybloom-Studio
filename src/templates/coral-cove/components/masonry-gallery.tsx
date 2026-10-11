"use client";

import Image from "next/image";
import { Lightbox, type Photo } from "../../_kit/lightbox";

export function MasonryGallery({ photos }: { photos: (Photo & { width: number; height: number })[] }) {
  return (
    <Lightbox photos={photos} overlayClassName="bg-[#062a28]/96 text-white">
      {(open) => (
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {photos.map((p, i) => (
            <li key={p.src} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => open(i)}
                className="group block w-full overflow-hidden rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tpl-accent"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Lightbox>
  );
}
