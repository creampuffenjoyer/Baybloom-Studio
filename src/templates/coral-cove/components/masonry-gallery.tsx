"use client";
import { useCoral } from "../language";

import { PlacementImage as Image, resolveCoralPhoto } from "./placement-image";
import { usePersonalization } from "../personalization";
import { Lightbox, type Photo } from "../../_kit/lightbox";

export function MasonryGallery({ photos: originals }: { photos: (Photo & { width: number; height: number; placement: string })[] }) {
  const personalization = usePersonalization();
  const photos = originals.map(photo => resolveCoralPhoto(photo.placement, photo, personalization));
  const { t } = useCoral();
  return (
    <Lightbox labels={{viewer: t("Photo viewer"), close: t("Close"), previous: t("Previous photo"), next: t("Next photo")}} photos={photos} overlayClassName="bg-[#062a28]/96 text-white">
      {(open) => (
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {photos.map((p, i) => (
            <li key={p.placement} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => open(i)}
                className="group block w-full overflow-hidden rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tpl-accent"
              >
                <Image
                  placement={p.placement}
                  src={p.src}
                  unoptimized={(p.src).startsWith("blob:") || (p.src).startsWith("/api/personalization/")}
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
