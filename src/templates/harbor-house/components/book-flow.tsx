"use client";

import Image from "next/image";
import Link from "next/link";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatDay, formatMoney } from "../../_kit/dates";
import { useStayBooking } from "../../_kit/use-stay-booking";
import { extras, photo, rooms } from "../content";
import { href, site } from "../site";
import { Stamp } from "./postcard";

const input =
  "mt-2 w-full rounded-xl bg-t-surface px-4 py-3 ring-1 ring-t-line focus:ring-2 focus:ring-t-accent focus:outline-none";
const primary = "rounded-full bg-t-accent px-6 py-3 font-bold text-t-on-accent disabled:cursor-not-allowed disabled:opacity-40";
const STEPS = ["When", "Which room", "Who"];

export function BookFlow() {
  const b = useStayBooking(rooms, extras);
  // Three steps here: dates, room (with extras), details. Review happens on the postcard.
  const step = Math.min(b.step, 2);
  const d = (x: string | null) => (x ? formatDay(x, { weekday: "short", day: "numeric", month: "short" }) : "…");

  if (b.step === 4) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="font-[family-name:var(--hh-hand)] text-6xl text-t-accent">See you soon!</p>
        <p className="mt-5 text-lg">
          {b.room?.name} is yours from {d(b.checkIn)} to {d(b.checkOut)}. Booking {b.reference}.
        </p>
        <p className="mt-3 text-t-muted">
          {site.hosts} will message you a few days before to sort out your airport pick-up. Pay when you arrive, cash or
          GCash.
        </p>
        <Link href={href("/guide")} className={`${primary} mt-8 inline-block`}>
          Plan your days
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <div>
        <ol className="flex gap-2" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={step === i ? "step" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${step === i ? "bg-t-ink text-white" : i < step ? "bg-t-soft" : "bg-t-surface text-t-muted ring-1 ring-t-line"}`}
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className="mt-8">
            <h2 className="font-t-display text-3xl">When are you coming?</h2>
            <Calendar
              mode="range"
              start={b.checkIn}
              end={b.checkOut}
              onSelect={(a, z) => b.setDates(a, z)}
              className="mt-6 max-w-md rounded-3xl bg-t-surface p-5 ring-1 ring-t-line"
              headerClassName="mb-3 flex items-center gap-2 font-t-display text-xl"
              navClassName="grid size-10 place-items-center rounded-full text-2xl hover:bg-t-soft disabled:opacity-25"
              weekdayClassName="pb-2 text-center text-xs font-bold text-t-muted"
              dayClassName="mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-full font-semibold hover:bg-t-soft disabled:cursor-not-allowed disabled:font-normal disabled:text-t-line disabled:hover:bg-transparent data-[in-range=true]:rounded-none data-[in-range=true]:bg-t-soft data-[selected=true]:bg-t-accent data-[selected=true]:text-white"
            />
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 font-semibold">
                Guests
                <select value={b.guests} onChange={(e) => b.setGuests(Number(e.target.value))} className="rounded-xl bg-t-surface px-3 py-2 ring-1 ring-t-line">
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </label>
              <button type="button" className={primary} disabled={b.nights < 1} onClick={() => b.goTo(1)}>
                Show rooms
              </button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="mt-8">
            <h2 className="font-t-display text-3xl">Pick your room</h2>
            <ul className="mt-6 space-y-3">
              {rooms.map((r) => {
                const free = b.availability[r.slug];
                const p = photo(r.photos[0]);
                return (
                  <li key={r.slug}>
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl bg-t-surface p-3 ring-1 ring-t-line has-checked:ring-2 has-checked:ring-t-accent ${free ? "" : "cursor-not-allowed opacity-50"}`}
                    >
                      <input type="radio" name="room" className="sr-only" disabled={!free} checked={b.room?.slug === r.slug} onChange={() => b.selectRoom(r.slug)} />
                      <span className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                        <Image src={p.src} alt="" fill sizes="80px" className="object-cover" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-t-display text-xl">{r.name}</span>
                        <span className="text-sm text-t-muted">{free ? r.bed : "Booked for some of those nights"}</span>
                      </span>
                      <span className="pr-2 text-right font-bold">{formatMoney(r.price * b.nights)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <fieldset className="mt-8">
              <legend className="font-t-display text-xl">Little extras</legend>
              <div className="mt-3 space-y-2">
                {extras.map((x) => (
                  <label key={x.id} className="flex items-center gap-3">
                    <input type="checkbox" checked={b.extraIds.includes(x.id)} onChange={() => b.toggleExtra(x.id)} className="size-5 accent-[var(--t-accent)]" />
                    <span className="flex-1">{x.name}</span>
                    <span className="text-t-muted">{formatMoney(b.extraCost(x))}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-8 flex items-center gap-6">
              <button type="button" onClick={() => b.goTo(0)} className="font-semibold underline underline-offset-4">
                Back
              </button>
              <button type="button" className={primary} disabled={!b.room || !b.availability[b.room.slug]} onClick={() => b.goTo(2)}>
                Continue
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
              b.confirm(bookingRef("HH"));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <h2 className="font-t-display text-3xl">Who’s coming?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block font-semibold">
                Name
                <input name="name" required autoComplete="name" className={input} />
              </label>
              <label className="block font-semibold">
                Mobile / WhatsApp
                <input name="phone" type="tel" required autoComplete="tel" className={input} />
              </label>
              <label className="block font-semibold sm:col-span-2">
                Email
                <input name="email" type="email" required autoComplete="email" className={input} />
              </label>
              <label className="block font-semibold sm:col-span-2">
                Flight or boat details <span className="font-normal text-t-muted">(optional)</span>
                <input name="arrival" className={input} placeholder="e.g. PR 2932, arriving 9:40 am" />
              </label>
            </div>
            <p className="mt-4 text-sm text-t-muted">No payment now: pay at the house. Demo: nothing is booked.</p>
            <div className="mt-8 flex items-center gap-6">
              <button type="button" onClick={() => b.goTo(1)} className="font-semibold underline underline-offset-4">
                Back
              </button>
              <button type="submit" className={primary}>
                Book it
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Postcard summary */}
      <aside aria-label="Your stay" className="lg:sticky lg:top-8 lg:self-start">
        <div className="rotate-1 bg-t-surface p-6 shadow-[0_20px_40px_-24px_rgb(34_48_63/0.45)] ring-1 ring-t-line">
          <div className="flex items-start justify-between gap-4">
            <p className="font-[family-name:var(--hh-hand)] text-4xl leading-none text-t-accent">Wish you were here</p>
            <Stamp className="rotate-6">
              <span className="block font-t-display text-lg">{b.room && b.nights ? formatMoney(b.total) : "₱ —"}</span>
            </Stamp>
          </div>
          <dl className="mt-6 space-y-2 border-t border-dashed border-t-line pt-4 font-[family-name:var(--hh-hand)] text-2xl">
            <div className="flex justify-between gap-4">
              <dt className="text-t-muted">Arriving</dt>
              <dd>{d(b.checkIn)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-t-muted">Leaving</dt>
              <dd>{d(b.checkOut)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-t-muted">Room</dt>
              <dd className="text-right">{b.room?.name ?? "…"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-t-muted">Guests</dt>
              <dd>{b.guests}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-t-muted">Breakfast included. Free cancellation up to 5 days before.</p>
        </div>
      </aside>
    </div>
  );
}
