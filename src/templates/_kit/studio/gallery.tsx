"use client";

import { Lightbox } from "../lightbox";
import { SitePhoto } from "../hospitality-site";
import type { StudioCard, StudioPhoto } from "./types";

export function StudioGallery({ items, photos }: { items: StudioCard[]; photos: Record<string, StudioPhoto> }) {
  return (
    <Lightbox photos={items.map((item) => photos[item.image])}>
      {(open) => (
        <div className="st-gallery">
          {items.map((item, index) => (
            <figure key={item.title}>
              <button type="button" className="st-gallery-button" onClick={() => open(index)} aria-label={`View ${item.title}`}>
                <SitePhoto photo={photos[item.image]} sizes="(min-width: 760px) 50vw, 100vw" className="st-image" />
                <span aria-hidden="true">↗</span>
              </button>
              <figcaption><strong>{item.title}</strong><span>{item.meta}</span>{item.description && <p>{item.description}</p>}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </Lightbox>
  );
}
