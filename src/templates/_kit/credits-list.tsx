import type { PhotoRecord } from "./photos";

/**
 * Attribution for every photo a template uses. Most demo photos are CC BY or
 * CC BY-SA, which require this; keep the page (or replace the photos with
 * your own) when you launch.
 */
export function CreditsList({ photos, className }: { photos: PhotoRecord[]; className?: string }) {
  return (
    <ul className={className}>
      {photos.map((p) => (
        <li key={p.src} className="flex gap-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.src} alt="" className="size-20 shrink-0 rounded-lg object-cover" loading="lazy" />
          <p className="text-sm leading-relaxed">
            <span className="block font-semibold">{p.alt}</span>
            Photo by{" "}
            <a href={p.source} className="underline underline-offset-2" rel="noopener noreferrer" target="_blank">
              {p.author}
            </a>
            ,{" "}
            {p.licenseUrl ? (
              <a href={p.licenseUrl} className="underline underline-offset-2" rel="license noopener noreferrer" target="_blank">
                {p.license}
              </a>
            ) : (
              p.license
            )}
            . Cropped and resized.
          </p>
        </li>
      ))}
    </ul>
  );
}
