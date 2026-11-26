"use client";

import { useState } from "react";
import { Lightbox } from "../../_kit/lightbox";
import { SitePhoto } from "../../_kit/hospitality-site";
import photos from "../photos.json";

const captures = [
  { title: "Table set for a Glasshouse wedding", category: "Arrangements", photo: photos.weddingTable },
  { title: "The Glasshouse in daylight", category: "Spaces", photo: photos.glasshouseDay },
  { title: "The Glasshouse after dark", category: "Lighting", photo: photos.glasshouseNight },
  { title: "The Gallery", category: "Spaces", photo: photos.galleryRoom },
  { title: "The Garden Court", category: "Spaces", photo: photos.court },
  { title: "Dinner by candlelight", category: "Arrangements", photo: photos.reception },
] as const;

const filters = ["All photos", "Spaces", "Lighting", "Arrangements"] as const;

export function GalleryPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All photos");
  const shown = captures.filter((item) => filter === "All photos" || item.category === filter);

  return (
    <div className="at-frame at-inner">
      <header className="at-page-heading"><p className="at-overline">The Atrium Gallery</p><h1>See the details.</h1><p>Look through spaces, lighting, and table arrangements.</p></header>
      <div className="at-options" role="group" aria-label="Filter photos">
        {filters.map((option) => <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>)}
      </div>
      <p role="status" className="sr-only">{shown.length} {shown.length === 1 ? "photo" : "photos"}</p>
      <Lightbox key={filter} photos={shown.map(({ photo }) => photo)}>
        {(open) => <ul className="at-gallery">
          {shown.map(({ title, photo }, index) => <li key={title}>
            <button type="button" onClick={() => open(index)} aria-label={`View photo: ${title}`}>
              <span className="at-gallery-photo"><SitePhoto photo={photo} sizes="(min-width: 780px) 52vw, 100vw" /></span>
              <span className="at-gallery-name">{title}<span aria-hidden="true">↗</span></span>
            </button>
          </li>)}
        </ul>}
      </Lightbox>
    </div>
  );
}
