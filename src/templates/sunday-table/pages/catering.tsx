"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { todayInManila } from "../../_kit/demo-form";
import { input, label, pesos } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { occasions, trays } from "../content";
import { maxTrays, partySize, suggestedTrays, trayTotals, type TrayOrder } from "../party";

export function CateringPage() {
  const query = useSearchParams();
  const guests = partySize(query.get("guests"));
  return <PartyPlanner key={guests} initialGuests={guests} />;
}

function PartyPlanner({ initialGuests }: { initialGuests: number }) {
  const [guestCount, setGuestCount] = useState(String(initialGuests));
  const [order, setOrder] = useState<TrayOrder>(() => suggestedTrays(initialGuests));
  const guests = Number(guestCount);
  const valid = Number.isInteger(guests) && guests >= 6 && guests <= 120;
  const { total, mains, count } = trayTotals(order);
  const selection = trays.filter((tray) => order[tray.id] > 0);
  const coverage = valid ? Math.min(100, (mains / guests) * 100) : 0;

  function adjust(id: string, delta: number) {
    setOrder((previous) => ({ ...previous, [id]: Math.min(maxTrays, Math.max(0, (previous[id] ?? 0) + delta)) }));
  }

  function validate(data: FormData) {
    if (!valid) return "Enter a guest count from 6 to 120.";
    if (!count) return "Add at least one tray to your request.";
    if (String(data.get("date")) < todayInManila()) return "Choose today or a future date.";
  }

  return (
    <div className="st-catering">
      <header className="st-page-title">
        <p className="st-eyebrow">Sunday Table · Party trays</p>
        <h1>Set a bigger table.</h1>
        <p>Start with a suggested spread, then swap trays or add seconds.</p>
      </header>
      <div className="st-planner-grid">
        <section aria-labelledby="tray-options">
          <div className="st-guest-tools">
            <label className={label}>Guest count<input className={input} type="number" min={6} max={120} value={guestCount} onChange={(event) => setGuestCount(event.target.value)} /></label>
            <button type="button" className="st-button" disabled={!valid} onClick={() => setOrder(suggestedTrays(guests))}>Suggest a spread</button>
          </div>
          {!valid && <p className="st-guide-note" role="status">Enter a guest count from 6 to 120.</p>}
          <h2 id="tray-options">Pick your trays</h2>
          <ul className="st-trays">
            {trays.map((tray) => {
              const quantity = order[tray.id] ?? 0;
              return <li key={tray.id}>
                <div><h3>{tray.name}</h3><p>{tray.course === "main" ? "Main" : "Side"} · Serves {tray.serves} · {pesos(tray.price)}</p></div>
                <div className="st-stepper" aria-label={`Quantity for ${tray.name}`}>
                  <button type="button" aria-label={`Remove ${tray.name}`} disabled={!quantity} onClick={() => adjust(tray.id, -1)}>−</button>
                  <span>{quantity}</span>
                  <button type="button" aria-label={`Add ${tray.name}`} disabled={quantity >= maxTrays} onClick={() => adjust(tray.id, 1)}>+</button>
                </div>
              </li>;
            })}
          </ul>
          <button type="button" className="st-plain-button" disabled={!count} onClick={() => setOrder({})}>Clear tray selection</button>
        </section>
        <section className="st-party-summary" aria-labelledby="party-summary">
          <h2 id="party-summary">Your spread</h2>
          <ul className="st-summary-trays">
            {selection.map((tray) => <li key={tray.id}><span>{order[tray.id]} × {tray.name}</span><strong>{pesos(order[tray.id] * tray.price)}</strong></li>)}
          </ul>
          {!count && <p className="st-guide-note">Add a tray or start with the suggested spread.</p>}
          <div role="status" className="st-coverage">
            <p><strong>{mains} main portions</strong>{valid && ` for ${guests} guests`}</p>
            <meter aria-label="Main portions for your guest count" min={0} max={100} value={coverage} />
            <p className="st-guide-note">{valid && mains < guests ? `Add about ${guests - mains} more main portions. Sides are counted separately.` : "Main portions are estimates. Sides are counted separately."}</p>
            <p className="st-summary-total"><span>Food estimate</span><strong>{pesos(total)}</strong></p>
          </div>
          <SampleRequest submitLabel="Try catering inquiry" confirmation={`Sample catering inquiry prepared for ${guestCount} guests. No message was sent.`} validate={validate}>
            <input type="hidden" name="guests" value={guestCount} />
            <input type="hidden" name="trays" value={JSON.stringify(order)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Occasion<select className={input} name="occasion">{occasions.map((occasion) => <option key={occasion}>{occasion}</option>)}</select></label>
              <label className={label}>Event date<input className={input} type="date" name="date" required /></label>
            </div>
            <label className={label}>Notes <span className="sr-only">(optional)</span><textarea name="notes" className={input} rows={3} maxLength={500} /></label>
          </SampleRequest>
        </section>
      </div>
    </div>
  );
}
