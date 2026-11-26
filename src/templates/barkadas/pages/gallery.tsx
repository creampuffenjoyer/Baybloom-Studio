"use client";

import { useState } from "react";
import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import { Lightbox } from "../../_kit/lightbox";
import photos from "../photos.json";
import { href } from "../site";

const scenes = [
  { name: "The courtyard", group: "Outside", photo: photos.hero },
  { name: "Garden bedroom", group: "Bedrooms", photo: photos.detail },
  { name: "The veranda at dusk", group: "Outside", photo: photos.evening },
  { name: "Upstairs bedroom", group: "Bedrooms", photo: photos.upstairs },
  { name: "A morning on the ridge", group: "Nearby", photo: photos.ridge },
] as const;
const categories = ["All photos", "Outside", "Bedrooms", "Nearby"] as const;

export function GalleryPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All photos");
  const visible = scenes.filter((scene) => category === "All photos" || scene.group === category);

  return (
    <div className="bk-editor">
      <header className="bk-plan-heading bk-editor-title"><p className="bk-eyebrow">The Barkadas photo album</p><h1>Look around.</h1><p>See the shared spaces, then find out where everyone sleeps.</p></header>
      <div className="bk-editor-controls" role="group" aria-label="Filter gallery">
        {categories.map((option) => <button type="button" key={option} aria-pressed={category === option} onClick={() => setCategory(option)}>{option}</button>)}
      </div>
      <p role="status" className="sr-only">{visible.length} photos</p>
      <Lightbox key={category} photos={visible.map((scene) => scene.photo)}>
        {(open) => (
          <ul className="bk-gallery-grid">
            {visible.map((scene, index) => <li key={scene.name}>
              <button type="button" aria-label={`View photo: ${scene.name}`} onClick={() => open(index)}>
                <span className="bk-gallery-photo"><SitePhoto photo={scene.photo} sizes="(min-width: 850px) 42vw, 100vw" /></span>
                <span className="bk-gallery-caption"><strong>{scene.name}</strong><span aria-hidden="true">↗</span></span>
              </button>
            </li>)}
          </ul>
        )}
      </Lightbox>
      <div className="bk-editor-links"><Link className="bk-button" href={href("/stays")}>Compare rooms <span aria-hidden="true">↗</span></Link><Link className="bk-text-link" href={href("/weekend")}>Plan a weekend <span aria-hidden="true">↗</span></Link></div>
    </div>
  );
}
