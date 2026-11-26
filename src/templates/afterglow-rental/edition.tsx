"use client";

import Link from "next/link";
import { Photo } from "../_kit/studio/photo";
import photos from "./photos.json";
import { BASE } from "./site";
import { useState } from "react";

const cues = [
  {
    time: "17:30",
    title: "Arrival",
    photo: photos.lounge,
    light: "An amber wash on the room perimeter leaves a clear path from the entrance to the bar.",
    furniture: "Set two lounge groups apart and leave the central aisle open for guests."
  },
  {
    time: "19:00",
    title: "Dinner",
    photo: photos.table,
    light: "Bring the table lights up and lower the perimeter wash so faces remain visible across the table.",
    furniture: "Give the serving team a clear route behind each row of chairs."
  },
  {
    time: "21:00",
    title: "Last dance",
    photo: photos.lighting,
    light: "Shift the brightest pool of light toward the dance floor. Keep a warm reading level at the lounge.",
    furniture: "Move occasional tables to the edge and keep the exit aisle clear."
  },
];

export function Front() {
  return (
    <section className="after-front" id="studio-title">
      <Photo hero photo={photos.hall} />
      <div className="after-caption">
        <p className="edition-kicker">Furniture & lighting for evening events</p>
        <h1>After the<br /><i>lights go down.</i></h1>
        <Link href={BASE + "/cue-sheet"}>Follow an evening ↗</Link>
      </div>
      <div className="after-running">
        <span>Sample running order</span>
        {cues.map(c => <span key={c.time}><time>{c.time}</time> {c.title}</span>)}
      </div>
    </section>
  );
}

export function Feature() {
  const [index, setIndex] = useState(0);
  const cue = cues[index];
  return (
    <article className="after-cues">
      <header>
        <p className="edition-kicker">Afterglow Rental / Production notes</p>
        <h1>The evening cue sheet.</h1>
        <p>A dinner reception in three lighting states. Select a cue to see the room and the crew notes.</p>
      </header>
      <div className="after-console">
        <div role="group" aria-label="Lighting cues">
          {cues.map((c, i) => <button key={c.time} type="button" onClick={() => setIndex(i)} aria-pressed={index === i}>
            <time>{c.time}</time>
            {c.title}
          </button>)}
        </div>
        <div className="after-stage" aria-live="polite">
          <Photo photo={cue.photo} />
          <div>
            <h2>{cue.title}</h2>
            <h3>Lighting desk</h3>
            <p>{cue.light}</p>
            <h3>Floor crew</h3>
            <p>{cue.furniture}</p>
          </div>
        </div>
      </div>
      <Link className="edition-link" href={(BASE || "/") + "#packages"}>See installation packages ↗</Link>
    </article>
  );
}
