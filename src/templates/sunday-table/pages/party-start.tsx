"use client";

import Link from "next/link";
import { useState } from "react";
import { pesos } from "../../_kit/hospitality-site";
import { partySizes, suggestedTrays, trayTotals } from "../party";
import { href } from "../site";

export function PartyStart() {
  const [guests, setGuests] = useState<number>(12);
  const summary = trayTotals(suggestedTrays(guests));

  return (
    <div className="st-party-start">
      <fieldset>
        <legend>How many are coming?</legend>
        <div className="st-pills">
          {partySizes.map((size) => <button type="button" key={size} aria-pressed={size === guests} onClick={() => setGuests(size)}>{size}<span className="sr-only"> guests</span></button>)}
        </div>
      </fieldset>
      <p className="st-quick-total" role="status"><strong>{pesos(summary.total)}</strong><span>{summary.count} suggested trays for {guests} guests</span></p>
      <Link className="st-button" href={href(`/catering?guests=${guests}`)}>Build your tray order <span aria-hidden="true">↗</span></Link>
    </div>
  );
}
