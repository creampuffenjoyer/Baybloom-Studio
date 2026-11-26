"use client";

import { useState } from "react";
import Link from "next/link";
import { todayInManila } from "../../_kit/demo-form";
import { input, label, pesos, SitePhoto } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { gatherings } from "../gatherings";
import photos from "../photos.json";
import { href } from "../site";

export function GatheringsPage() {
  const [selected, setSelected] = useState<string>(gatherings[0].id);
  const [guests, setGuests] = useState<string>(String(gatherings[0].min));
  const packageOption = gatherings.find((option) => option.id === selected) ?? gatherings[0];
  const guestCount = Number(guests);
  const fits = Number.isInteger(guestCount) && guestCount >= packageOption.min && guestCount <= packageOption.max;

  function validate(form: FormData) {
    if (!fits) return `This table seats ${packageOption.min} to ${packageOption.max} guests.`;
    const date = String(form.get("date"));
    if (date < todayInManila()) return "Choose today or a future date.";
    if (new Date(date).getUTCDay() === 1) return "The restaurant is closed on Mondays. Choose Tuesday through Sunday.";
  }

  return (
    <div className="st-editor">
      <header className="st-page-title st-editor-title"><p className="st-eyebrow">Gather at Sunday Table</p><h1>Pull up more chairs.</h1><p>Pick a family-style menu for your group and see what it will cost to feed everyone.</p></header>
      <div className="st-gathering-photo"><SitePhoto photo={photos.gathering} priority sizes="(min-width: 1200px) 1130px, 100vw" /></div>
      <div className="st-planner-grid st-gatherings-grid">
        <section aria-labelledby="st-occasions">
          <h2 id="st-occasions">Choose an occasion.</h2>
          <ul className="st-gathering-list">
            {gatherings.map((option) => (
              <li key={option.id}>
                <p className="st-eyebrow">{option.min}–{option.max} at the table</p>
                <h3>{option.name}</h3><p>{option.description}</p>
                <p className="st-gathering-menu">{option.menu.join(" · ")}</p>
                <button type="button" className="st-button" aria-label={`Select ${option.name}`} aria-pressed={selected === option.id} onClick={() => { setSelected(option.id); setGuests(String(option.min)); }}>{selected === option.id ? "Selected" : "Choose this menu"}</button>
              </li>
            ))}
          </ul>
        </section>
        <section className="st-party-summary" aria-labelledby="st-gathering-request">
          <p className="st-eyebrow">Gathering inquiry</p>
          <h2 id="st-gathering-request">{packageOption.name}</h2>
          <p className="st-gathering-price" role="status">{fits ? <><strong>From {pesos(packageOption.price * guestCount)}</strong> for {guestCount} guests</> : <>Enter {packageOption.min} to {packageOption.max} guests to see an estimate.</>}<br /><span>{pesos(packageOption.price)} per person · Sample menu</span></p>
          <SampleRequest key={packageOption.id} submitLabel="Try gathering inquiry" confirmation={`Sample ${packageOption.name.toLowerCase()} inquiry prepared for ${guestCount} guests. No table was reserved.`} validate={validate}>
            <input type="hidden" name="package" value={packageOption.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Guest count<input name="guests" className={input} type="number" min={packageOption.min} max={packageOption.max} required value={guests} onChange={(event) => setGuests(event.target.value)} /></label>
              <label className={label}>Preferred date<input name="date" className={input} type="date" required /></label>
            </div>
          </SampleRequest>
          <Link className="st-plain-button inline-flex items-center" href={href(`/catering?guests=${fits ? guestCount : packageOption.min}`)}>Hosting elsewhere? Browse party trays</Link>
        </section>
      </div>
    </div>
  );
}
