"use client";

import { useState } from "react";
import { SitePhoto } from "../../_kit/hospitality-site";
import photos from "../photos.json";

const views = [
  { id: "day", label: "By day", caption: "The courtyard", photo: photos.hero },
  { id: "night", label: "At dusk", caption: "The veranda", photo: photos.evening },
] as const;

export function GallerySwitch() {
  const [view, setView] = useState<"day" | "night">("day");
  const selected = views.find(({ id }) => id === view) ?? views[0];

  return (
    <figure className="bk-hero-gallery">
      <div className="bk-view-image"><SitePhoto key={selected.id} photo={selected.photo} priority={view === "day"} sizes="(min-width: 920px) 68vw, 100vw" /></div>
      <figcaption>
        <span aria-live="polite">{selected.caption}</span>
        <div className="bk-view-controls" role="group" aria-label="Property view">
          {views.map((option) => <button type="button" aria-pressed={view === option.id} key={option.id} onClick={() => setView(option.id)}>{option.label}</button>)}
        </div>
      </figcaption>
    </figure>
  );
}
