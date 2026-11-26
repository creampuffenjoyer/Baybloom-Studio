"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { todayInManila } from "../../_kit/demo-form";
import { input, label, pesos } from "../../_kit/hospitality-site";
import { SampleRequest } from "../../_kit/sample-request";
import { stays, type Stay } from "../content";
import { groupCapacity, groupNumber, MAX_CARS, MAX_GUESTS } from "../group";
import { href } from "../site";
import { RoomLayout } from "./room-layout";

const DAY = 24 * 60 * 60 * 1000;

export function PlanPage() {
  const query = useSearchParams();
  const stay = stays.find(({ id }) => id === query.get("stay")) ?? stays[0];
  const guests = groupNumber(query.get("guests"), 1, MAX_GUESTS, 4);
  const cars = groupNumber(query.get("cars"), 0, MAX_CARS, 1);
  const ownBed = query.get("beds") === "individual";
  return <StayPlanner key={`${stay.id}:${guests}:${cars}:${ownBed}`} initialStay={stay} initialGuests={guests} initialCars={cars} initialOwnBed={ownBed} />;
}

function StayPlanner({ initialStay, initialGuests, initialCars, initialOwnBed }: {
  initialStay: Stay; initialGuests: number; initialCars: number; initialOwnBed: boolean;
}) {
  const [stayId, setStayId] = useState<string>(initialStay.id);
  const [groupSize, setGroupSize] = useState(String(initialGuests));
  const [cars, setCars] = useState(String(initialCars));
  const [ownBed, setOwnBed] = useState(initialOwnBed);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const stay = stays.find(({ id }) => id === stayId) ?? initialStay;
  const guests = Number(groupSize);
  const capacity = groupCapacity(stay, ownBed);
  const nights = (Date.parse(departure) - Date.parse(arrival)) / DAY;
  const validNights = Number.isInteger(nights) && nights >= 1 && nights <= 30;
  const groupIssue = !Number.isInteger(guests) || guests < 1 || guests > capacity
    ? `This stay fits up to ${capacity} ${ownBed ? "guests with individual beds" : "overnight guests"}.`
    : cars === "" || !Number.isInteger(Number(cars)) || Number(cars) < 0 || Number(cars) > stay.parking
      ? `This stay has ${stay.parking} parking ${stay.parking === 1 ? "slot" : "slots"}.` : undefined;
  const total = validNights && !groupIssue ? nights * stay.price : null;

  function validate() {
    if (groupIssue) return groupIssue;
    if (arrival < todayInManila()) return "Choose today or a future date for check-in.";
    if (!validNights) return "Choose a check-out after check-in, with a stay of up to 30 nights.";
  }

  return (
    <div className="bk-plan">
      <div className="bk-plan-heading"><p className="bk-eyebrow">Barkadas · Stay planner</p><h1>Plan a stay together.</h1><p>Check the beds, parking and per-person split before you inquire.</p></div>
      <div className="bk-plan-grid">
        <section className="bk-plan-form" aria-label="Stay request">
          <SampleRequest submitLabel="Try stay request" confirmation={`Sample request for ${stay.name} prepared. No stay was reserved.`} validate={validate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Stay<select name="stay" className={input} value={stayId} onChange={(event) => setStayId(event.target.value)}>{stays.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
              <label className={label}>Overnight guests<input name="guests" className={input} type="number" min={1} max={MAX_GUESTS} required value={groupSize} onChange={(event) => setGroupSize(event.target.value)} /></label>
              <label className={label}>Cars<input name="cars" className={input} type="number" min={0} max={MAX_CARS} required value={cars} onChange={(event) => setCars(event.target.value)} /></label>
              <label className="bk-checkbox self-end"><input type="checkbox" name="ownBed" checked={ownBed} onChange={(event) => setOwnBed(event.target.checked)} /> Everyone needs their own bed</label>
              <label className={label}>Check-in<input name="arrival" className={input} type="date" required value={arrival} onChange={(event) => setArrival(event.target.value)} /></label>
              <label className={label}>Check-out<input name="departure" className={input} type="date" min={arrival || undefined} required value={departure} onChange={(event) => setDeparture(event.target.value)} /></label>
            </div>
          </SampleRequest>
        </section>
        <aside className="bk-plan-summary" aria-label="Stay estimate">
          <p className="bk-eyebrow">Sleeping arrangements</p>
          <h2>{stay.name}</h2>
          <RoomLayout stay={stay} />
          <p className="bk-rate">{pesos(stay.price)} / night · {stay.parking} parking {stay.parking === 1 ? "slot" : "slots"}</p>
          <div role="status" className="bk-estimate">
            {groupIssue ? <p>{groupIssue} <Link href={href("/stays")} className="underline underline-offset-2">Compare stays.</Link></p> : total !== null ? (
              <><p><strong>{pesos(total)} for {nights} {nights === 1 ? "night" : "nights"}</strong></p><p>About {pesos(stay.price / guests)} per person, per night.</p></>
            ) : <p>Choose dates 1 to 30 nights apart to see the total.</p>}
          </div>
          <p className="bk-estimate-note">Sample rates. The host confirms availability and fees.</p>
        </aside>
      </div>
    </div>
  );
}
