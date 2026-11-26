"use client";

import Link from "next/link";
import { Photo } from "../_kit/studio/photo";
import photos from "./photos.json";
import { BASE } from "./site";
import { useEffect, useRef, useState } from "react";

import { rooms, money } from "./rooms";
import { SampleRequest } from "../_kit/sample-request";
import { input, label } from "../_kit/hospitality-site";

export function Front() {
  return (
    <section className="room-front">
      <div className="room-directory">
        <p className="edition-kicker">Common Room / Building directory</p>
        <h1>Move in.<br />Spread out.</h1>
        <nav aria-label="Building directory">
          <Link href={BASE + "/room-finder"}><span>01–03</span>Private studios ↗</Link>
          <Link href={(BASE || "/") + "#amenities"}><span>G</span>Shared spaces ↓</Link>
          <Link href={(BASE || "/") + "#request"}><span>G</span>Resident desk ↓</Link>
        </nav>
      </div>
      <figure>
        <Photo hero photo={photos.lounge} sizes="(min-width: 750px) 56vw, 100vw" />
        <figcaption>Ground floor / Resident lounge</figcaption>
      </figure>
    </section>
  );
}

export function Feature() {
  const [months, setMonths] = useState(1);
  const [roomCode, setRoomCode] = useState<string>();
  const inquiryHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (roomCode) inquiryHeading.current?.focus(); }, [roomCode]);
  const selected = rooms.find(room => room.code === roomCode);
  const term = months === 1 ? "month" : "months";

  return (
    <article className="room-finder">
      <header>
        <p className="edition-kicker">Common Room / Resident desk</p>
        <h1>Which room fits?</h1>
        <p>Compare the space and estimate your stay. Both include utilities, fibre and use of the shared kitchen and workroom.</p>
      </header>
      <label className="room-term">
        Length of stay
        <select value={months} onChange={event => setMonths(Number(event.target.value))}>
          {[1, 2, 3, 6, 12].map(n => <option key={n} value={n}>{n} {n === 1 ? "month" : "months"}</option>)}
        </select>
      </label>
      <div className="room-compare">
        {rooms.map(room => (
          <article key={room.code}>
            <Photo photo={photos[room.image]} sizes="(min-width: 700px) 45vw, 100vw" />
            <div>
              <span className="room-key">{room.code}</span>
              <h2>{room.name}</h2>
              <p>{room.area} m² · {room.people}</p>
              <p>{room.space}</p>
              <hr />
              <p>{money.format(room.rate)} per month</p>
              <strong aria-live="polite">{money.format(room.rate * months)} for {months} {term}</strong>
              <button type="button" className="room-choose" aria-pressed={roomCode === room.code} onClick={() => setRoomCode(room.code)}>
                {roomCode === room.code ? "Selected" : "Select"} {room.name}
              </button>
            </div>
          </article>
        ))}
      </div>
      <p>Estimates use the displayed starting rates. The resident desk confirms dates and the final rate.</p>
      {selected && (
        <section className="room-enquiry" aria-label="Room inquiry">
          <h2 ref={inquiryHeading} tabIndex={-1}>Ask about this stay.</h2>
          <p>{selected.name} · {months} {term} · Estimated {money.format(selected.rate * months)}</p>
          <SampleRequest key={selected.code + months} submitLabel="Preview stay request" confirmation={`Your sample request for the ${selected.name} for ${months} ${term} is ready.`}>
            <input type="hidden" name="room" value={selected.name} />
            <input type="hidden" name="months" value={months} />
            <label className={label}>Preferred move-in date<input className={input} name="date" type="date" required /></label>
          </SampleRequest>
        </section>
      )}
    </article>
  );
}
