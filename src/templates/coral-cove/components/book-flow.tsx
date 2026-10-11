"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatDay, formatLong, formatMoney } from "../../_kit/dates";
import { STAY_STEPS, useStayBooking } from "../../_kit/use-stay-booking";
import { extras, offers, photo, villas } from "../content";
import { href, site } from "../site";

const input =
  "mt-2 w-full rounded-2xl border border-tpl-line bg-white px-4 py-3 text-base focus:border-tpl-deep focus:ring-2 focus:ring-tpl-alt focus:outline-none";
const primary =
  "rounded-full bg-tpl-accent px-7 py-3.5 text-lg font-bold text-tpl-on-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40";
const ghost = "rounded-full px-5 py-3 font-semibold underline underline-offset-4";

export function BookFlow() {
  const b = useStayBooking(villas, extras);
  const params = useSearchParams();
  const offer = offers.find((o) => o.slug === params.get("offer")) ?? null;
  const [payment, setPayment] = useState<"deposit" | "arrival">("deposit");

  // "Stay 5, pay 4": every fifth night is free.
  const freeNights = offer?.slug === "stay-longer" ? Math.floor(b.nights / 5) : 0;
  const discount = b.room ? freeNights * b.room.price : 0;
  const total = b.total - discount;

  if (b.step === 4) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <p className="mx-auto grid size-16 place-items-center rounded-full bg-tpl-deep text-3xl text-white animate-in zoom-in duration-500">
          ✓
        </p>
        <h2 className="mt-6 font-tpl-display text-5xl font-extrabold tracking-[-0.045em]">You’re booked.</h2>
        <p className="mt-4 text-lg text-tpl-muted">
          Booking reference <span className="font-bold text-tpl-ink">{b.reference}</span>. We’ve sent the details to{" "}
          {b.details.email || "your email"}.
        </p>
        <div className="mt-8 rounded-3xl bg-tpl-soft p-7 text-left">
          <p className="font-tpl-display text-2xl font-bold">{b.room?.name}</p>
          <p className="mt-2">
            {b.checkIn && formatLong(b.checkIn)} → {b.checkOut && formatLong(b.checkOut)}
          </p>
          <p className="mt-1 text-tpl-muted">
            {b.nights} nights · {b.guests} {b.guests === 1 ? "guest" : "guests"} · {formatMoney(total)}
            {payment === "deposit" ? ` (deposit of ${formatMoney(Math.round(total * 0.3))} paid)` : " (pay on arrival)"}
          </p>
        </div>
        <p className="mt-8 text-tpl-muted">
          Our team will message you on WhatsApp ({site.whatsapp}) a week before you arrive to arrange your boat.
        </p>
        <Link href={href("/")} className={`${primary} mt-8 inline-block`}>
          Back to the cove
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div>
        <ol className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Booking steps">
          {STAY_STEPS.map((label, i) => (
            <li key={label} aria-current={b.step === i ? "step" : undefined} className="flex items-center gap-2">
              <span
                className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
                  i < b.step ? "bg-tpl-deep text-white" : i === b.step ? "bg-tpl-accent text-white" : "bg-tpl-soft text-tpl-muted"
                }`}
              >
                {i < b.step ? "✓" : i + 1}
              </span>
              <span className={i === b.step ? "font-semibold" : "text-tpl-muted"}>{label}</span>
            </li>
          ))}
        </ol>

        {offer && (
          <p className="mt-6 rounded-2xl bg-tpl-alt/40 px-5 py-3">
            <span className="font-semibold">{offer.name}:</span> {offer.headline.toLowerCase()}.{" "}
            {offer.slug === "stay-longer" ? "Applied automatically for 5+ nights." : "We’ll apply the package price when we confirm."}
          </p>
        )}

        <div className="mt-8">
          {b.step === 0 && (
            <section aria-labelledby="step-dates">
              <h2 id="step-dates" className="font-tpl-display text-3xl font-bold tracking-tight">
                When are you coming?
              </h2>
              <p className="mt-2 text-tpl-muted">Pick your arrival day, then the day you leave.</p>
              <Calendar
                mode="range"
                months={2}
                start={b.checkIn}
                end={b.checkOut}
                onSelect={(a, z) => b.setDates(a, z)}
                className="mt-6 rounded-3xl border border-tpl-line p-5"
                headerClassName="mb-4 flex items-center gap-2 font-tpl-display text-lg font-bold"
                navClassName="grid size-10 place-items-center rounded-full text-2xl hover:bg-tpl-soft disabled:opacity-30"
                weekdayClassName="pb-2 text-center text-xs font-semibold text-tpl-muted"
                dayClassName="relative mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-full text-[15px] font-medium hover:bg-tpl-soft disabled:cursor-not-allowed disabled:text-tpl-line disabled:hover:bg-transparent data-[in-range=true]:rounded-none data-[in-range=true]:bg-tpl-alt/45 data-[selected=true]:bg-tpl-deep data-[selected=true]:text-white data-[today=true]:underline"
              />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Guests</span>
                  <div className="flex items-center rounded-full border border-tpl-line">
                    <button
                      type="button"
                      onClick={() => b.setGuests(Math.max(1, b.guests - 1))}
                      aria-label="Fewer guests"
                      className="grid size-11 place-items-center text-xl"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="w-8 text-center font-bold">
                      {b.guests}
                    </span>
                    <button
                      type="button"
                      onClick={() => b.setGuests(Math.min(5, b.guests + 1))}
                      aria-label="More guests"
                      className="grid size-11 place-items-center text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button type="button" className={primary} disabled={b.nights < 1} onClick={() => b.goTo(1)}>
                  {b.nights > 0 ? `See villas for ${b.nights} ${b.nights === 1 ? "night" : "nights"}` : "Choose your dates"}
                </button>
              </div>
            </section>
          )}

          {b.step === 1 && (
            <section aria-labelledby="step-villa">
              <h2 id="step-villa" className="font-tpl-display text-3xl font-bold tracking-tight">
                Choose your villa
              </h2>
              <p className="mt-2 text-tpl-muted">
                {b.checkIn && formatDay(b.checkIn)} – {b.checkOut && formatDay(b.checkOut)}, {b.guests}{" "}
                {b.guests === 1 ? "guest" : "guests"}.{" "}
                <button type="button" onClick={() => b.goTo(0)} className="font-semibold text-tpl-ink underline underline-offset-4">
                  Change
                </button>
              </p>
              <ul className="mt-6 space-y-4">
                {villas.map((v) => {
                  const free = b.availability[v.slug];
                  const tooSmall = v.maxGuests < b.guests;
                  const chosen = b.room?.slug === v.slug;
                  const p = photo(v.photos[0]);
                  return (
                    <li key={v.slug}>
                      <label
                        className={`grid cursor-pointer grid-cols-[96px_1fr] gap-4 rounded-3xl border-2 p-3 transition-colors sm:grid-cols-[150px_1fr_auto] sm:items-center ${
                          chosen ? "border-tpl-deep bg-tpl-alt/20" : "border-tpl-line"
                        } ${!free ? "cursor-not-allowed opacity-55" : "hover:border-tpl-deep/50"}`}
                      >
                        <input
                          type="radio"
                          name="villa"
                          className="sr-only"
                          disabled={!free}
                          checked={chosen}
                          onChange={() => b.selectRoom(v.slug)}
                        />
                        <span className="relative aspect-square overflow-hidden rounded-2xl sm:aspect-[4/3]">
                          <Image src={p.src} alt="" fill sizes="150px" className="object-cover" />
                        </span>
                        <span>
                          <span className="block font-tpl-display text-xl font-bold">{v.name}</span>
                          <span className="block text-sm text-tpl-muted">
                            {v.size} m² · {v.beds} · {v.view}
                          </span>
                          {!free && (
                            <span className="mt-1 block text-sm font-semibold text-tpl-accent">
                              {tooSmall ? `Sleeps up to ${v.maxGuests}` : "Booked on some of these nights"}
                            </span>
                          )}
                        </span>
                        <span className="col-span-2 text-right sm:col-span-1 sm:pr-3">
                          <span className="block font-tpl-display text-2xl font-bold">{formatMoney(v.price * b.nights)}</span>
                          <span className="text-sm text-tpl-muted">
                            {formatMoney(v.price)} × {b.nights} nights
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {villas.every((v) => !b.availability[v.slug]) && (
                <p className="mt-6 rounded-2xl bg-tpl-soft p-5">
                  Nothing is free for those dates. Try moving a day either side, or{" "}
                  <Link href={href("/contact")} className="font-semibold underline">
                    ask us
                  </Link>{" "}
                  and we’ll find a way.
                </p>
              )}
              <div className="mt-8 flex justify-between">
                <button type="button" className={ghost} onClick={() => b.goTo(0)}>
                  Back
                </button>
                <button type="button" className={primary} disabled={!b.room || !b.availability[b.room.slug]} onClick={() => b.goTo(2)}>
                  Continue
                </button>
              </div>
            </section>
          )}

          {b.step === 2 && (
            <form
              aria-labelledby="step-details"
              onSubmit={(e) => {
                e.preventDefault();
                b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
                b.goTo(3);
              }}
            >
              <h2 id="step-details" className="font-tpl-display text-3xl font-bold tracking-tight">
                Your details
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-semibold">Full name</span>
                  <input name="name" required autoComplete="name" defaultValue={b.details.name} className={input} />
                </label>
                <label className="block">
                  <span className="font-semibold">Email</span>
                  <input name="email" type="email" required autoComplete="email" defaultValue={b.details.email} className={input} />
                </label>
                <label className="block">
                  <span className="font-semibold">Mobile / WhatsApp</span>
                  <input name="phone" type="tel" required autoComplete="tel" defaultValue={b.details.phone} className={input} />
                </label>
                <label className="block">
                  <span className="font-semibold">Flight into El Nido</span>
                  <select name="arrival" defaultValue={b.details.arrival ?? "morning"} className={input}>
                    <option value="morning">Morning (before 12 pm)</option>
                    <option value="afternoon">Afternoon (12 – 5 pm)</option>
                    <option value="unknown">Not booked yet</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-semibold">Anything we should know?</span>
                  <span className="text-tpl-muted"> (optional)</span>
                  <textarea
                    name="requests"
                    rows={3}
                    defaultValue={b.details.requests}
                    placeholder="Celebrations, dietary needs, cots…"
                    className={input}
                  />
                </label>
              </div>
              <fieldset className="mt-10">
                <legend className="font-tpl-display text-2xl font-bold tracking-tight">Add to your stay</legend>
                <div className="mt-4 space-y-3">
                  {extras.map((x) => (
                    <label
                      key={x.id}
                      className="flex cursor-pointer items-center gap-4 rounded-2xl border border-tpl-line p-4 has-checked:border-tpl-deep has-checked:bg-tpl-alt/20"
                    >
                      <input
                        type="checkbox"
                        checked={b.extraIds.includes(x.id)}
                        onChange={() => b.toggleExtra(x.id)}
                        className="size-5 accent-[var(--t-deep)]"
                      />
                      <span className="flex-1">{x.name}</span>
                      <span className="font-semibold">
                        {formatMoney(b.extraCost(x))}
                        <span className="block text-right text-xs font-normal text-tpl-muted">
                          {x.per === "guest" ? `${formatMoney(x.price)} per guest` : x.per === "night" ? "per night" : "per stay"}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-8 flex justify-between">
                <button type="button" className={ghost} onClick={() => b.goTo(1)}>
                  Back
                </button>
                <button type="submit" className={primary}>
                  Review booking
                </button>
              </div>
            </form>
          )}

          {b.step === 3 && (
            <form
              aria-labelledby="step-review"
              onSubmit={(e) => {
                e.preventDefault();
                b.confirm(bookingRef("CC"));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <h2 id="step-review" className="font-tpl-display text-3xl font-bold tracking-tight">
                Review and confirm
              </h2>
              <dl className="mt-6 divide-y divide-tpl-line rounded-3xl border border-tpl-line">
                {[
                  ["Guest", `${b.details.name} · ${b.details.email}`],
                  ["Villa", b.room?.name],
                  ["Dates", `${b.checkIn && formatLong(b.checkIn)} → ${b.checkOut && formatLong(b.checkOut)}`],
                  ["Guests", String(b.guests)],
                  ["Requests", b.details.requests || "None"],
                ].map(([k, v]) => (
                  <div key={k} className="grid gap-1 p-4 sm:grid-cols-[140px_1fr]">
                    <dt className="text-tpl-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <fieldset className="mt-8">
                <legend className="font-tpl-display text-2xl font-bold tracking-tight">How would you like to pay?</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["deposit", "Pay 30% deposit now", `${formatMoney(Math.round(total * 0.3))} today by card or GCash`],
                      ["arrival", "Pay on arrival", "We hold your villa with a card guarantee"],
                    ] as const
                  ).map(([value, label, note]) => (
                    <label
                      key={value}
                      className="cursor-pointer rounded-2xl border-2 border-tpl-line p-4 has-checked:border-tpl-deep has-checked:bg-tpl-alt/20"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        checked={payment === value}
                        onChange={() => setPayment(value)}
                        className="sr-only"
                      />
                      <span className="block font-semibold">{label}</span>
                      <span className="text-sm text-tpl-muted">{note}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-sm text-tpl-muted">
                  Demo: connect Stripe, PayMongo or your booking engine here. No payment is taken.
                </p>
              </fieldset>
              <label className="mt-6 flex items-start gap-3">
                <input type="checkbox" required className="mt-1 size-5 accent-[var(--t-deep)]" />
                <span>I agree to the booking terms and the 14-day free cancellation policy.</span>
              </label>
              <div className="mt-8 flex justify-between">
                <button type="button" className={ghost} onClick={() => b.goTo(2)}>
                  Back
                </button>
                <button type="submit" className={primary}>
                  Confirm booking
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <aside aria-label="Booking summary" className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-3xl bg-tpl-soft">
          {b.room && (
            <div className="relative aspect-[16/9]">
              <Image src={photo(villas.find((v) => v.slug === b.room!.slug)!.photos[0]).src} alt="" fill sizes="360px" className="object-cover" />
            </div>
          )}
          <div className="p-6">
            <h2 className="font-tpl-display text-2xl font-bold tracking-tight">{b.room?.name ?? "Your stay"}</h2>
            <dl className="mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-tpl-muted">Arrive</dt>
                <dd className="font-semibold">{b.checkIn ? formatDay(b.checkIn, { weekday: "short", day: "numeric", month: "short" }) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tpl-muted">Leave</dt>
                <dd className="font-semibold">{b.checkOut ? formatDay(b.checkOut, { weekday: "short", day: "numeric", month: "short" }) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tpl-muted">Guests</dt>
                <dd className="font-semibold">{b.guests}</dd>
              </div>
            </dl>
            {b.room && b.nights > 0 && (
              <dl className="mt-5 space-y-2 border-t border-black/10 pt-5 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt>
                    {b.nights} {b.nights === 1 ? "night" : "nights"}
                  </dt>
                  <dd>{formatMoney(b.roomTotal)}</dd>
                </div>
                {b.chosenExtras.map((x) => (
                  <div key={x.id} className="flex justify-between gap-4">
                    <dt className="text-tpl-muted">{x.name}</dt>
                    <dd>{formatMoney(b.extraCost(x))}</dd>
                  </div>
                ))}
                {discount > 0 && (
                  <div className="flex justify-between gap-4 text-tpl-deep">
                    <dt>
                      {freeNights} free {freeNights === 1 ? "night" : "nights"}
                    </dt>
                    <dd>−{formatMoney(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-black/10 pt-3 text-lg font-bold">
                  <dt>Total</dt>
                  <dd>{formatMoney(total)}</dd>
                </div>
                <p className="text-xs text-tpl-muted">Includes breakfast. 12% VAT and service charge are added at the resort.</p>
              </dl>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
