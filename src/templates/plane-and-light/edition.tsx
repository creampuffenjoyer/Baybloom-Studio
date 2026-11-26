"use client";

import Link from "next/link";
import { Photo } from "../_kit/studio/photo";
import photos from "./photos.json";
import { BASE } from "./site";
import { useState } from "react";

const frames = [
  {
    title: "Pavilion at dusk",
    tag: "Exterior",
    image: photos.facade,
    note: "A roof line and its shadow hold the edge of the frame. The camera sits just below the canopy."
  },
  {
    title: "The Listening Room",
    tag: "Interior",
    image: photos.interior,
    note: "A window beyond the frame draws the eye across the floor and through the room."
  },
  {
    title: "Low Court",
    tag: "Exterior",
    image: photos.exterior,
    note: "A long elevation lets the junction between ground and wall read as a single line."
  },
  {
    title: "Stair at No. 12",
    tag: "Detail",
    image: photos.stair,
    note: "A close crop follows the turn of the stair. Side light describes each change in the surface."
  },
  {
    title: "The reflecting court",
    tag: "Exterior",
    image: photos.courtyard,
    note: "The pool doubles the opening above it. A vertical frame holds both the sky and its reflection."
  },
];

export function Front() {
  return (
    <section className="plane-front">
      <div className="plane-margin">
        <p className="edition-kicker">Architectural photography</p>
        <h1>Plane <i>& Light</i></h1>
        <Link href={BASE + "/contact-sheet"}>Open contact sheet ↗</Link>
      </div>
      <figure>
        <Photo hero photo={photos.facade} />
        <figcaption><span>PL—01 / Pavilion at dusk</span><span>Exterior study</span></figcaption>
      </figure>
    </section>
  );
}

export function Feature() {
  const [index, setIndex] = useState(0);
  const f = frames[index];
  return (
    <article className="plane-sheet">
      <header>
        <p className="edition-kicker">Plane & Light / Selected negatives</p>
        <h1>Contact sheet.</h1>
      </header>
      <figure aria-live="polite">
        <Photo photo={f.image} />
        <figcaption><b>PL—0{index + 1} / {f.title}</b><p>{f.note}</p></figcaption>
      </figure>
      <div className="plane-negatives" role="group" aria-label="Choose a frame">
        {frames.map((frame, i) => <button key={frame.title} aria-label={frame.title} aria-pressed={i === index} onClick={() => setIndex(i)}>
          <Photo photo={frame.image} sizes="20vw" />
          <span>0{i + 1} / {frame.tag}</span>
        </button>)}
      </div>
      <Link className="edition-link" href={(BASE || "/") + "#request"}>Commission a series ↗</Link>
    </article>
  );
}
