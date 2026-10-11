"use client";

import Image from "next/image";
import Link from "next/link";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatDay, formatLong, formatMoney } from "../../_kit/dates";
import { STAY_STEPS, useStayBooking } from "../../_kit/use-stay-booking";
import { extras, photo, rooms } from "../content";
import { CURRENCY, href } from "../site";

const money = (n: number) => formatMoney(n, CURRENCY);
const input = "mt-1.5 w-full rounded-md bg-tpl-surface px-4 py-3 ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-accent focus:outline-none";
const primary = "rounded-md bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent disabled:cursor-not-allowed disabled:opacity-40";

export function BookFlow() {
  const b = useStayBooking(rooms, extras);

  if (b.step === 4) {
    return (
      <div className="rounded-md bg-tpl-deep p-10 text-tpl-on-deep">
        <p className="font-tpl-display text-5xl font-bold">You’re booked in.</p>
        <p className="mt-4 text-lg text-tpl-on-deep/85">
          {b.room?.name}, {b.checkIn && formatLong(b.checkIn)} to {b.checkOut && formatLong(b.checkOut)}, for {b.guests}.
          Confirmation {b.reference} is on its way to {b.details.email}.
        </p>
        <p className="mt-2 text-tpl-on-deep/70">Check-in opens at 4 pm. Leave your boots in the boot room and come find us by the fire.</p>
        <Link href={href("/activities")} className={`${primary} mt-8 inline-block`}>
          Plan your days
        </Link>
      </div>
    );
  }

  const canNext = [b.nights > 0, !!b.room && b.availability[b.room.slug], true, true][b.step];

  return (
    <div className="pb-28">
      {/* Trail progress */}
      <ol aria-label="Booking steps" className="relative flex justify-between">
        <span aria-hidden className="absolute top-4 right-4 left-4 border-t-2 border-dashed border-tpl-line" />
        <span
          aria-hidden
          className="absolute top-4 left-4 border-t-2 border-tpl-accent transition-all duration-500"
          style={{ width: `calc(${(b.step / 3) * 100}% - ${(b.step / 3) * 2}rem)` }}
        />
        {STAY_STEPS.map((label, i) => (
          <li key={label} aria-current={b.step === i ? "step" : undefined} className="relative flex flex-col items-center gap-2">
            <span
              className={`grid size-8 place-items-center rounded-full text-sm font-bold ring-4 ring-tpl-bg ${
                i <= b.step ? "bg-tpl-accent text-tpl-on-accent" : "bg-tpl-soft text-tpl-muted"
              }`}
            >
              {i < b.step ? "✓" : i + 1}
            </span>
            <span className={`text-sm ${b.step === i ? "font-bold" : "text-tpl-muted"}`}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        {b.step === 0 && (
          <section aria-labelledby="dates">
            <h2 id="dates" className="font-tpl-display text-4xl font-bold">
              Pick your dates
            </h2>
            <Calendar
              mode="range"
              months={2}
              start={b.checkIn}
              end={b.checkOut}
              onSelect={(a, z) => b.setDates(a, z)}
              className="mt-6 rounded-md bg-tpl-surface p-6 ring-1 ring-tpl-line"
              headerClassName="mb-4 flex items-center gap-2 font-tpl-display text-xl font-bold"
              navClassName="grid size-10 place-items-center rounded text-2xl hover:bg-tpl-soft disabled:opacity-25"
              weekdayClassName="pb-2 text-center text-xs font-bold text-tpl-muted"
              dayClassName="mx-auto grid aspect-square w-full max-w-11 place-items-center rounded font-medium hover:bg-tpl-soft disabled:cursor-not-allowed disabled:text-tpl-line disabled:hover:bg-transparent data-[in-range=true]:bg-tpl-accent/25 data-[selected=true]:bg-tpl-deep data-[selected=true]:text-tpl-on-deep"
            />
            <label className="mt-6 flex items-center gap-3 font-medium">
              Guests
              <select value={b.guests} onChange={(e) => b.setGuests(Number(e.target.value))} className="rounded-md bg-tpl-surface px-3 py-2 ring-1 ring-tpl-line">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </section>
        )}

        {b.step === 1 && (
          <section aria-labelledby="room">
            <h2 id="room" className="font-tpl-display text-4xl font-bold">
              Choose a room
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {rooms.map((r) => {
                const free = b.availability[r.slug];
                const chosen = b.room?.slug === r.slug;
                const p = photo(r.photos[0]);
                return (
                  <button
                    key={r.slug}
                    type="button"
                    disabled={!free}
                    aria-pressed={chosen}
                    onClick={() => b.selectRoom(r.slug)}
                    className={`grid grid-cols-[120px_1fr] gap-4 rounded-md bg-tpl-surface p-3 text-left ring-1 transition-shadow disabled:cursor-not-allowed disabled:opacity-50 ${
                      chosen ? "ring-3 ring-tpl-accent" : "ring-tpl-line hover:ring-tpl-ink/30"
                    }`}
                  >
                    <span className="relative aspect-square overflow-hidden rounded">
                      <Image src={p.src} alt="" fill sizes="120px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-tpl-display text-2xl font-bold">{r.name}</span>
                      <span className="block text-sm text-tpl-muted">
                        {r.beds} · sleeps {r.maxGuests}
                      </span>
                      <span className="mt-2 block font-bold">
                        {free ? money(r.price * b.nights) : r.maxGuests < b.guests ? `Sleeps up to ${r.maxGuests}` : "Full on these dates"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {b.step === 2 && (
          <form
            id="details-form"
            aria-labelledby="details"
            onSubmit={(e) => {
              e.preventDefault();
              b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
              b.goTo(3);
            }}
          >
            <h2 id="details" className="font-tpl-display text-4xl font-bold">
              Your details
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block font-medium">
                Name
                <input name="name" required autoComplete="name" defaultValue={b.details.name} className={input} />
              </label>
              <label className="block font-medium">
                Email
                <input name="email" type="email" required autoComplete="email" defaultValue={b.details.email} className={input} />
              </label>
              <label className="block font-medium">
                Phone
                <input name="phone" type="tel" required autoComplete="tel" defaultValue={b.details.phone} className={input} />
              </label>
              <label className="block font-medium">
                Arriving by
                <select name="arrival" defaultValue={b.details.arrival ?? "car"} className={input}>
                  <option value="car">Car</option>
                  <option value="shuttle">Village shuttle</option>
                </select>
              </label>
            </div>
            <fieldset className="mt-8">
              <legend className="font-tpl-display text-2xl font-bold">Add-ons</legend>
              <div className="mt-3 space-y-2">
                {extras.map((x) => (
                  <label key={x.id} className="flex items-center gap-3 rounded-md bg-tpl-surface p-3 ring-1 ring-tpl-line">
                    <input type="checkbox" checked={b.extraIds.includes(x.id)} onChange={() => b.toggleExtra(x.id)} className="size-5 accent-[var(--t-accent)]" />
                    <span className="flex-1">{x.name}</span>
                    <span className="font-bold">{money(b.extraCost(x))}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </form>
        )}

        {b.step === 3 && (
          <section aria-labelledby="confirm">
            <h2 id="confirm" className="font-tpl-display text-4xl font-bold">
              Check everything
            </h2>
            <dl className="mt-6 divide-y divide-tpl-line rounded-md bg-tpl-surface ring-1 ring-tpl-line">
              {[
                ["Guest", `${b.details.name}, ${b.details.email}`],
                ["Stay", `${b.checkIn && formatLong(b.checkIn)} to ${b.checkOut && formatLong(b.checkOut)}`],
                ["Room", `${b.room?.name} for ${b.guests}`],
                ["Room total", money(b.roomTotal)],
                ...b.chosenExtras.map((x) => [x.name, money(b.extraCost(x))]),
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-tpl-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-tpl-muted">
              A one-night deposit is charged now; the rest on arrival. Demo: no payment is taken and nothing is booked.
            </p>
          </section>
        )}
      </div>

      {/* Basecamp bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-tpl-line bg-tpl-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3 sm:px-8">
          <p className="min-w-0 flex-1 truncate text-sm">
            <span className="font-bold">
              {b.checkIn ? formatDay(b.checkIn) : "Dates"} – {b.checkOut ? formatDay(b.checkOut) : "…"}
            </span>
            <span className="text-tpl-muted"> · {b.room?.name ?? "No room yet"} · </span>
            <span className="font-bold">{b.room && b.nights ? money(b.total) : "—"}</span>
          </p>
          {b.step > 0 && (
            <button type="button" onClick={() => b.goTo((b.step - 1) as 0 | 1 | 2)} className="font-medium underline underline-offset-4">
              Back
            </button>
          )}
          {b.step === 2 ? (
            <button type="submit" form="details-form" className={primary}>
              Review
            </button>
          ) : b.step === 3 ? (
            <button type="button" className={primary} onClick={() => b.confirm(bookingRef("PR"))}>
              Confirm and pay deposit
            </button>
          ) : (
            <button type="button" className={primary} disabled={!canNext} onClick={() => b.goTo((b.step + 1) as 1 | 2)}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
