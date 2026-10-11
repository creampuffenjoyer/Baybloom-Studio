"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addDays } from "../../_kit/dates";
import { useClientToday } from "../../_kit/use-today";
import { href } from "../site";

/* Ticket notches either side of the perforation (wide screens only). */
const ticketCss = `
@media (min-width: 48rem) {
  .cc-ticket-body {
    mask-image: radial-gradient(circle 12px at 100% 0, transparent 11.5px, #000 12px),
      radial-gradient(circle 12px at 100% 100%, transparent 11.5px, #000 12px);
    mask-composite: intersect;
  }
  .cc-ticket-stub {
    mask-image: radial-gradient(circle 12px at 0 0, transparent 11.5px, #000 12px),
      radial-gradient(circle 12px at 0 100%, transparent 11.5px, #000 12px);
    mask-composite: intersect;
  }
}`;

const field =
  "mt-1 w-full bg-transparent text-base font-semibold sm:text-lg text-tpl-ink outline-none [color-scheme:light] placeholder:text-tpl-muted";

/** The home-page booking bar, drawn as a boarding pass: dates and guests on the ticket, search on the stub. */
export function BookingTicket() {
  const router = useRouter();
  const today = useClientToday();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Check-out needs to be after check-in.");
      return;
    }
    const q = new URLSearchParams({ guests });
    if (checkIn && checkOut) {
      q.set("checkin", checkIn);
      q.set("checkout", checkOut);
    }
    router.push(`${href("/book")}?${q}`);
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Check villa availability"
      className="relative flex flex-col drop-shadow-[0_24px_40px_rgb(13_43_51/0.28)] md:flex-row"
    >
      <style>{ticketCss}</style>
      <div
        className="cc-ticket-body grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-t-3xl bg-tpl-line sm:grid-cols-3 md:rounded-l-3xl md:rounded-tr-none"
      >
        <label className="block bg-white px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-sm text-tpl-muted">Arrive</span>
          <input
            type="date"
            min={today ?? undefined}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              setError(null);
              if (e.target.value && (!checkOut || checkOut <= e.target.value)) {
                setCheckOut(addDays(e.target.value, 3));
              }
            }}
            className={field}
          />
        </label>
        <label className="block bg-white px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-sm text-tpl-muted">Leave</span>
          <input
            type="date"
            min={checkIn ? addDays(checkIn, 1) : (today ?? undefined)}
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setError(null);
            }}
            className={field}
          />
        </label>
        <label className="col-span-2 block bg-white px-4 py-3 sm:col-span-1 sm:px-6 sm:py-4">
          <span className="text-sm text-tpl-muted">Guests</span>
          <select value={guests} onChange={(e) => setGuests(e.target.value)} className={field}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="cc-ticket-stub flex items-center rounded-b-3xl border-t-2 border-dashed border-white/50 bg-tpl-accent px-3 py-3 md:rounded-r-3xl md:rounded-bl-none md:border-t-0 md:border-l-2 md:py-0"
      >
        <button
          type="submit"
          className="w-full rounded-full px-6 py-2 text-lg font-bold sm:py-3 whitespace-nowrap text-tpl-on-accent focus-visible:outline-2 focus-visible:outline-white md:w-auto"
        >
          See available villas
        </button>
      </div>
      {error && (
        <p role="alert" className="absolute -bottom-8 left-6 text-sm font-semibold text-white">
          {error}
        </p>
      )}
    </form>
  );
}
