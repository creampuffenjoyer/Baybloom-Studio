"use client";

import { useState } from "react";
import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import photos from "../photos.json";
import { href } from "../site";
import { weekendIdeas, type Pace, type Weather } from "../weekend";

export function WeekendPage() {
  const [weather, setWeather] = useState<Weather>("clear");
  const [pace, setPace] = useState<Pace>("slow");
  const [notice, setNotice] = useState("");
  const suggestions = weekendIdeas[weather];
  const itinerary = pace === "full" ? suggestions : [suggestions[0], suggestions[2]];

  async function copyItinerary() {
    const title = `A ${weather === "rain" ? "rainy" : "clear"} day in Tagaytay`;
    const text = [title, ...itinerary.map(({ time, name, note }) => `${time} · ${name}\n${note}`)].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Itinerary copied. Paste it into your group chat.");
    } catch {
      setNotice("Clipboard access is unavailable here. Select and copy the itinerary text.");
    }
  }

  return (
    <div className="bk-editor">
      <header className="bk-plan-heading bk-editor-title"><p className="bk-eyebrow">A weekend around Tagaytay</p><h1>Make a loose plan.</h1><p>Two stops or a full day out. Pick the kind of weekend your group feels like having.</p></header>
      <div className="bk-weekend-grid">
        <div className="bk-weekend-photo"><SitePhoto photo={photos.ridge} priority sizes="(min-width: 850px) 44vw, 100vw" /></div>
        <section className="bk-itinerary" aria-labelledby="bk-itinerary-heading">
          <h2 id="bk-itinerary-heading">Your day plan</h2>
          <fieldset><legend>What’s the weather like?</legend><div className="bk-editor-controls">
            <button type="button" aria-pressed={weather === "clear"} onClick={() => { setWeather("clear"); setNotice(""); }}>Clear skies</button>
            <button type="button" aria-pressed={weather === "rain"} onClick={() => { setWeather("rain"); setNotice(""); }}>Rainy day</button>
          </div></fieldset>
          <fieldset><legend>How much do you want to do?</legend><div className="bk-editor-controls">
            <button type="button" aria-pressed={pace === "slow"} onClick={() => { setPace("slow"); setNotice(""); }}>Keep it slow</button>
            <button type="button" aria-pressed={pace === "full"} onClick={() => { setPace("full"); setNotice(""); }}>Fill the day</button>
          </div></fieldset>
          <ol className="bk-itinerary-list" aria-label="Suggested stops">{itinerary.map((stop) => <li key={stop.name}><span>{stop.time}</span><div><strong>{stop.name}</strong><p>{stop.note}</p></div></li>)}</ol>
          <button type="button" className="bk-button" onClick={() => void copyItinerary()}>Copy itinerary</button>
          <p className="bk-copy-status" role="status">{notice}</p>
        </section>
      </div>
      <div className="bk-editor-links"><Link className="bk-button" href={href("/plan")}>Plan your stay <span aria-hidden="true">↗</span></Link><Link className="bk-text-link" href={href("/guide")}>See the guest guide <span aria-hidden="true">↗</span></Link></div>
    </div>
  );
}
