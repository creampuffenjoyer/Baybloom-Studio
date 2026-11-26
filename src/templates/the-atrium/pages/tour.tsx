"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HallScene, SceneCaption } from "../components/scenes";
import { useAtriumMode } from "../mode";
import { href } from "../site";

export function TourPage() {
  const query = useSearchParams();
  const view = query.get("view");
  return <LightingTour key={view} startComparing={view === "compare"} />;
}

function LightingTour({ startComparing }: { startComparing: boolean }) {
  const { mode, setMode } = useAtriumMode();
  const [comparing, setComparing] = useState(startComparing);
  const [split, setSplit] = useState(50);

  function selectLighting(next: "day" | "night") {
    setMode(next);
    setComparing(false);
  }

  return (
    <div className="at-frame at-inner">
      <header className="at-page-heading at-tour-heading">
        <div><p className="at-overline">The Glasshouse</p><h1>From day into night.</h1><p>See the same room in daylight and after dark.</p></div>
        <div className="at-mode" role="group" aria-label="Tour lighting">
          <button type="button" aria-pressed={!comparing && mode === "day"} onClick={() => selectLighting("day")}>Daylight</button>
          <button type="button" aria-pressed={!comparing && mode === "night"} onClick={() => selectLighting("night")}>After dark</button>
          <button type="button" aria-pressed={comparing} onClick={() => { if (!comparing) setSplit(50); setComparing(true); }}>Compare</button>
        </div>
      </header>
      <figure className="at-tour-figure">
        <div className="at-tour-image">
          <HallScene lead comparison={comparing ? split : undefined} />
          {comparing && <>
            <span className="at-compare-label at-compare-day">Daylight</span>
            <span className="at-compare-label at-compare-night">After dark</span>
            <input
              className="at-compare-input"
              type="range"
              min={0}
              max={100}
              value={split}
              aria-label="Daylight and after-dark comparison"
              aria-valuetext={`Daylight ${split}%, after dark ${100 - split}%`}
              onChange={(event) => setSplit(event.target.valueAsNumber)}
            />
          </>}
        </div>
        <figcaption><span>The Glasshouse</span>{comparing ? <p>Drag the divider or use the arrow keys to compare the lighting.</p> : <SceneCaption />}</figcaption>
      </figure>
      <section className="at-tour-next at-reveal">
        <div><p className="at-overline">See it in person</p><h2>Walk the room.</h2><p>Tell us the occasion and how many guests you expect so we can plan your walkthrough.</p></div>
        <div className="at-page-actions">
          <Link className="at-button" href={href("/inquire?kind=tour")}>Request a walkthrough <span aria-hidden="true">↗</span></Link>
          <Link className="at-text-link" href={href("/plan?space=glasshouse")}>Try a Glasshouse layout</Link>
        </div>
      </section>
    </div>
  );
}
