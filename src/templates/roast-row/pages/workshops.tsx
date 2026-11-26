"use client";

import { useState } from "react";
import { todayInManila } from "../../_kit/demo-form";
import { input, label, pesos, SitePhoto } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { workshops } from "../experiences";
import photos from "../photos.json";

export function WorkshopsPage() {
  const [id, setId] = useState<string>(workshops[0].id);
  const [seats, setSeats] = useState("1");
  const workshop = workshops.find((option) => option.id === id) ?? workshops[0];

  function validate(form: FormData) {
    const date = String(form.get("date"));
    if (date < todayInManila()) return "Choose today or a future workshop date.";
    if (new Date(date).getUTCDay() !== workshop.day) return `${workshop.name} meets on ${workshop.weekday}s. Choose that day of the week.`;
  }

  return (
    <div className="rr-editor">
      <header className="rr-editor-hero">
        <div><p className="rr-label">Small-group workshops</p><h1 className="rr-display">BEHIND<br />THE BAR.</h1><p>Pour, taste, and troubleshoot with one of the people who makes your morning coffee.</p></div>
        <div className="rr-editor-image"><SitePhoto photo={photos.workshop} sizes="(min-width: 850px) 50vw, 100vw" priority /></div>
      </header>
      <div className="rr-editor-grid">
        <section aria-labelledby="rr-workshop-list">
          <h2 id="rr-workshop-list">Pick a workshop.</h2>
          <ul className="rr-workshop-list">
            {workshops.map((option) => <li key={option.id}>
              <p className="rr-label">{option.branch} · {option.weekday}s at {option.time}</p>
              <h3>{option.name}</h3><p>{option.description}</p><p className="rr-workshop-details">{option.minutes} minutes · {pesos(option.price)} per person</p>
              <button type="button" className="rr-chip" aria-pressed={id === option.id} aria-label={`Select ${option.name}`} onClick={() => { setId(option.id); setSeats("1"); }}>{id === option.id ? "Selected" : "Select workshop"}</button>
            </li>)}
          </ul>
        </section>
        <section className="rr-panel" aria-labelledby="rr-workshop-request">
          <h2 id="rr-workshop-request">Request a seat.</h2>
          <p className="rr-workshop-summary" role="status"><strong>{workshop.name}</strong><br />{workshop.branch} · {workshop.weekday}s at {workshop.time} · {pesos((Number(seats) || 0) * workshop.price)} estimated</p>
          <SampleRequest key={workshop.id} submitLabel="Try workshop request" confirmation={`Sample request prepared for ${workshop.name}. No seat was reserved.`} validate={validate}>
            <input type="hidden" name="workshop" value={workshop.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Preferred date<input className={input} name="date" type="date" required /></label>
              <label className={label}>Seats<input className={input} name="seats" type="number" min={1} max={workshop.group} value={seats} required onChange={(event) => setSeats(event.target.value)} /></label>
            </div>
          </SampleRequest>
        </section>
      </div>
    </div>
  );
}
