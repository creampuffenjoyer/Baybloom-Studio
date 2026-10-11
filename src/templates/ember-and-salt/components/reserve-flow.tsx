"use client";

import Link from "next/link";
import { useState } from "react";
import { bookingRef, formatTime, freeSlots, isAvailable, timeSlots } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatLong, fromDay, type Day } from "../../_kit/dates";
import { href, site } from "../site";

const SEATING = [
  { id: "room", label: "Dining room", note: "Tables for two to eight" },
  { id: "bar", label: "Bar", note: "Up to four, cocktail-led" },
  { id: "counter", label: "Kitchen counter", note: "Up to four, facing the ovens" },
] as const;

const input =
  "mt-2 w-full border border-t-line bg-t-surface px-4 py-3 text-base text-t-ink placeholder:text-t-muted/70 focus:border-t-accent focus:outline-none";

/** Slots by weekday: Sunday also serves lunch; Monday is closed. */
function slotsFor(day: Day) {
  const dow = fromDay(day).getDay();
  if (dow === 1) return [];
  const dinner = timeSlots("17:30", dow === 5 || dow === 6 ? "22:00" : "21:30", 15);
  return dow === 0 ? [...timeSlots("12:00", "14:30", 15), ...dinner] : dinner;
}

export function ReserveFlow() {
  const [party, setParty] = useState(2);
  const [day, setDay] = useState<Day | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [seating, setSeating] = useState<(typeof SEATING)[number]["id"]>("room");
  const [stage, setStage] = useState<"choose" | "details" | "done">("choose");
  const [guest, setGuest] = useState<Record<string, string>>({});
  const [ref, setRef] = useState("");

  const all = day ? slotsFor(day) : [];
  const free = day ? freeSlots(day, all, `${party}-${seating}`, party > 4 ? 0.55 : 0.35) : [];
  const seatingNote = SEATING.find((s) => s.id === seating)!;

  if (stage === "done") {
    return (
      <div className="mx-auto max-w-xl py-6 text-center">
        <p className="font-t-display text-6xl leading-none sm:text-7xl">See you soon.</p>
        <p className="mt-6 text-lg text-t-muted">
          A table for {party} on {day && formatLong(day)} at {time && formatTime(time)}, {seatingNote.label.toLowerCase()}.
        </p>
        <p className="mt-2 text-t-muted">
          Reference <span className="font-semibold text-t-ink">{ref}</span>. Confirmation sent to {guest.email}.
        </p>
        <p className="mt-8 border-y border-t-line py-5 text-[15px] text-t-muted">
          We hold tables for 15 minutes. Running late or need to change? Call us on{" "}
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-t-accent">
            {site.phone}
          </a>
          .
        </p>
        <Link href={href("/menu")} className="mt-8 inline-block bg-t-accent px-6 py-3.5 font-semibold text-t-on-accent">
          Look at the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_340px]">
      {stage === "choose" ? (
        <div className="space-y-14">
          <fieldset>
            <legend className="font-t-display text-3xl">How many of you?</legend>
            <div className="mt-5 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={party === n}
                  onClick={() => {
                    setParty(n);
                    setTime(null);
                  }}
                  className={`size-14 border text-lg transition-colors ${
                    party === n ? "border-t-accent bg-t-accent text-t-on-accent" : "border-t-line hover:border-t-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[15px] text-t-muted">
              Nine or more?{" "}
              <Link href={href("/private-dining")} className="text-t-accent underline underline-offset-4">
                Book a private room
              </Link>
              .
            </p>
          </fieldset>

          <fieldset>
            <legend className="font-t-display text-3xl">Which day?</legend>
            <Calendar
              mode="single"
              start={day}
              onSelect={(d) => {
                setDay(d);
                setTime(null);
              }}
              isDisabled={(d) => slotsFor(d).length === 0 || !isAvailable(d, "full-house", 0.08)}
              className="mt-5 max-w-md border border-t-line p-5"
              headerClassName="mb-4 flex items-center gap-2 font-t-display text-xl"
              navClassName="grid size-10 place-items-center text-2xl hover:text-t-accent disabled:opacity-25"
              weekdayClassName="pb-2 text-center text-xs text-t-muted"
              dayClassName="mx-auto grid aspect-square w-full max-w-11 place-items-center text-[15px] hover:bg-t-soft disabled:cursor-not-allowed disabled:text-t-line disabled:line-through disabled:hover:bg-transparent data-[selected=true]:bg-t-accent data-[selected=true]:text-t-on-accent data-[today=true]:underline"
            />
            <p className="mt-3 text-[15px] text-t-muted">Closed on Mondays. Struck-through days are fully booked.</p>
          </fieldset>

          <fieldset disabled={!day}>
            <legend className="font-t-display text-3xl">What time?</legend>
            {!day ? (
              <p className="mt-4 text-t-muted">Choose a day to see open tables.</p>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {all.map((t) => {
                    const open = free.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={!open}
                        aria-pressed={time === t}
                        onClick={() => setTime(t)}
                        className={`border py-3 tabular-nums transition-colors ${
                          time === t
                            ? "border-t-accent bg-t-accent text-t-on-accent"
                            : open
                              ? "border-t-line hover:border-t-ink"
                              : "cursor-not-allowed border-transparent text-t-line line-through"
                        }`}
                      >
                        {formatTime(t)}
                      </button>
                    );
                  })}
                </div>
                {free.length === 0 && (
                  <p className="mt-4 text-t-muted">That day is full for {party}. Try another day, or sit at the bar.</p>
                )}
              </>
            )}
          </fieldset>

          <fieldset>
            <legend className="font-t-display text-3xl">Where would you like to sit?</legend>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {SEATING.map((s) => {
                const tooBig = s.id !== "room" && party > 4;
                return (
                  <label
                    key={s.id}
                    className={`cursor-pointer border p-4 has-checked:border-t-accent ${tooBig ? "cursor-not-allowed opacity-40" : "border-t-line"}`}
                  >
                    <input
                      type="radio"
                      name="seating"
                      className="sr-only"
                      disabled={tooBig}
                      checked={seating === s.id}
                      onChange={() => {
                        setSeating(s.id);
                        setTime(null);
                      }}
                    />
                    <span className="block font-semibold">{s.label}</span>
                    <span className="text-sm text-t-muted">{s.note}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            disabled={!day || !time}
            onClick={() => setStage("details")}
            className="bg-t-accent px-7 py-4 text-lg font-semibold text-t-on-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            Continue to your details
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setGuest(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
            setRef(bookingRef("ES"));
            setStage("done");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="space-y-6"
        >
          <h2 className="font-t-display text-3xl">Who’s the booking for?</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              Name
              <input name="name" required autoComplete="name" className={input} />
            </label>
            <label className="block">
              Mobile
              <input name="phone" type="tel" required autoComplete="tel" className={input} />
            </label>
            <label className="block sm:col-span-2">
              Email
              <input name="email" type="email" required autoComplete="email" className={input} />
            </label>
            <label className="block">
              Occasion
              <select name="occasion" className={input} defaultValue="">
                <option value="">None</option>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>Date night</option>
                <option>Business</option>
              </select>
            </label>
            <label className="block">
              Dietary needs
              <input name="diet" placeholder="e.g. one vegetarian, nut allergy" className={input} />
            </label>
          </div>
          <label className="flex items-start gap-3 text-[15px] text-t-muted">
            <input type="checkbox" name="news" className="mt-1 size-4 accent-[var(--t-accent)]" />
            Send me news about guest chefs and wine dinners (about once a month).
          </label>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <button type="submit" className="bg-t-accent px-7 py-4 text-lg font-semibold text-t-on-accent hover:bg-t-alt">
              Confirm reservation
            </button>
            <button type="button" onClick={() => setStage("choose")} className="text-t-muted underline underline-offset-4">
              Change table
            </button>
          </div>
          <p className="text-sm text-t-muted">
            Demo: connect your reservation system (SevenRooms, OpenTable or your own) here. Nothing is booked.
          </p>
        </form>
      )}

      <aside aria-label="Your table" className="lg:sticky lg:top-36 lg:self-start">
        <div className="border border-t-line bg-t-surface p-6">
          <h2 className="font-t-display text-2xl">Your table</h2>
          <dl className="mt-5 space-y-3 text-[15px]">
            {[
              ["Guests", String(party)],
              ["Day", day ? formatLong(day) : "Not chosen"],
              ["Time", time ? formatTime(time) : "Not chosen"],
              ["Seating", seatingNote.label],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-dotted border-t-line pb-2">
                <dt className="text-t-muted">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-t-muted">Tables are held for two hours. No deposit for parties under nine.</p>
        </div>
      </aside>
    </div>
  );
}
