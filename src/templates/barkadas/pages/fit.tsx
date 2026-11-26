"use client";

import { useState } from "react";
import Link from "next/link";
import { pesos } from "../../_kit/hospitality-site";
import { findStay, groupCapacity, groupQuery, MAX_CARS, MAX_GUESTS } from "../group";
import { href } from "../site";

function Stepper({ name, value, min, max, update }: { name: string; value: number; min: number; max: number; update: (value: number) => void }) {
  return <div className="bk-stepper" role="group" aria-label={name}>
    <span>{name}</span>
    <div>
      <button type="button" disabled={value <= min} aria-label={`Decrease ${name.toLowerCase()}`} onClick={() => update(value - 1)}>−</button>
      <output aria-label={name}>{value}</output>
      <button type="button" disabled={value >= max} aria-label={`Increase ${name.toLowerCase()}`} onClick={() => update(value + 1)}>+</button>
    </div>
  </div>;
}

export function GroupFit() {
  const [guests, setGuests] = useState(4);
  const [cars, setCars] = useState(1);
  const [ownBed, setOwnBed] = useState(false);
  const stay = findStay(guests, cars, ownBed);

  return (
    <section className="bk-fit" aria-labelledby="fit-heading">
      <div className="bk-fit-heading"><p className="bk-eyebrow">Group finder</p><h2 id="fit-heading">Will we fit?</h2></div>
      <Stepper name="Guests" value={guests} min={1} max={MAX_GUESTS} update={setGuests} />
      <Stepper name="Cars" value={cars} min={0} max={MAX_CARS} update={setCars} />
      <label className="bk-checkbox"><input type="checkbox" checked={ownBed} onChange={(event) => setOwnBed(event.target.checked)} /> Everyone needs their own bed</label>
      {stay ? (
        <>
          <div className="bk-match" role="status">
            <p><strong>{stay.name}</strong></p>
            <p>{groupCapacity(stay, ownBed)} {ownBed ? "individual beds" : "guest capacity"} · {stay.parking} {stay.parking === 1 ? "car" : "cars"}</p>
            <p>{pesos(stay.price)} per night</p>
          </div>
          <Link className="bk-button" href={href(`/plan?${groupQuery(stay, guests, cars, ownBed)}`)}>Plan this stay <span aria-hidden="true">↗</span></Link>
        </>
      ) : (
        <>
          <p className="bk-match" role="status"><strong>No stay fits this group.</strong> Try fewer guests or cars, or allow shared beds.</p>
          <Link className="bk-text-link" href={href("/stays")}>Compare both stays <span aria-hidden="true">↗</span></Link>
        </>
      )}
    </section>
  );
}
