"use client";

import Image from "next/image";
import Link from "next/link";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatDay, formatLong, formatMoney } from "../../_kit/dates";
import { useStayBooking } from "../../_kit/use-stay-booking";
import { extras, photo, rooms } from "../content";
import { arch, href, site } from "../site";

const NUMERALS = ["I", "II", "III", "IV"];
const TITLES = ["Your dates", "Your room", "Your details", "Confirm"];

const input =
  "mt-2 w-full border-0 border-b border-t-line bg-transparent px-0 py-2.5 text-base focus:border-t-alt focus:ring-0 focus:outline-none";
const primary = "bg-t-accent px-6 py-3.5 text-t-on-accent hover:bg-t-alt disabled:cursor-not-allowed disabled:opacity-40";

export function BookFlow() {
  const b = useStayBooking(rooms, extras);
  const short = (d: string | null) => (d ? formatDay(d, { weekday: "short", day: "numeric", month: "short" }) : "—");

  if (b.step === 4) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-t-display text-6xl italic">Until soon.</p>
        <p className="mt-6 text-lg text-t-muted">
          Your {b.room?.name} is reserved from {b.checkIn && formatLong(b.checkIn)} to {b.checkOut && formatLong(b.checkOut)}.
          Reference <span className="text-t-ink">{b.reference}</span>.
        </p>
        <p className="mt-3 text-t-muted">
          A letter of confirmation is on its way to {b.details.email}. If we can arrange anything before you arrive, write to{" "}
          {site.email}.
        </p>
        <Link href={href("/journal")} className={`${primary} mt-10 inline-block`}>
          Read about Vigan while you wait
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Itinerary strip */}
      <dl className="grid grid-cols-2 border-y border-t-line text-[15px] md:grid-cols-5">
        {[
          ["Arrive", short(b.checkIn)],
          ["Depart", short(b.checkOut)],
          ["Guests", String(b.guests)],
          ["Room", b.room?.name ?? "—"],
          ["Total", b.room && b.nights ? formatMoney(b.total) : "—"],
        ].map(([k, v]) => (
          <div key={k} className="border-t-line px-4 py-4 md:border-l md:first:border-l-0">
            <dt className="text-t-muted">{k}</dt>
            <dd className="mt-1 font-t-display text-xl italic">{v}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-12 space-y-4">
        {TITLES.map((title, i) => {
          const open = b.step === i;
          const done = b.step > i;
          return (
            <li key={title} className={`border-b border-t-line pb-4 ${open ? "" : "opacity-90"}`}>
              <h2 className="flex items-baseline gap-5">
                <span className={`w-10 font-t-display text-3xl italic ${open || done ? "text-t-alt" : "text-t-line"}`}>{NUMERALS[i]}</span>
                {done ? (
                  <button type="button" onClick={() => b.goTo(i as 0 | 1 | 2 | 3)} className="font-t-display text-3xl italic hover:text-t-alt">
                    {title} <span className="ml-2 font-t-body text-sm text-t-muted not-italic">Edit</span>
                  </button>
                ) : (
                  <span className={`font-t-display text-3xl italic ${open ? "" : "text-t-muted"}`}>{title}</span>
                )}
              </h2>

              {open && i === 0 && (
                <div className="mt-8 pl-15">
                  <Calendar
                    mode="range"
                    months={2}
                    start={b.checkIn}
                    end={b.checkOut}
                    onSelect={(a, z) => b.setDates(a, z)}
                    className="max-w-3xl"
                    headerClassName="mb-4 flex items-center gap-2 font-t-display text-xl italic"
                    navClassName="grid size-10 place-items-center text-2xl hover:text-t-alt disabled:opacity-25"
                    weekdayClassName="pb-2 text-center text-xs text-t-muted"
                    dayClassName="mx-auto grid aspect-square w-full max-w-11 place-items-center text-[15px] hover:bg-t-soft disabled:cursor-not-allowed disabled:text-t-line disabled:hover:bg-transparent data-[in-range=true]:bg-t-soft data-[selected=true]:bg-t-accent data-[selected=true]:text-t-on-accent"
                  />
                  <div className="mt-8 flex flex-wrap items-center gap-8">
                    <label className="flex items-center gap-3">
                      Guests
                      <select value={b.guests} onChange={(e) => b.setGuests(Number(e.target.value))} className="border-b border-t-line bg-transparent py-1">
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <button type="button" className={primary} disabled={b.nights < 1} onClick={() => b.goTo(1)}>
                      {b.nights > 0 ? `Continue, ${b.nights} ${b.nights === 1 ? "night" : "nights"}` : "Choose your dates"}
                    </button>
                  </div>
                </div>
              )}

              {open && i === 1 && (
                <div className="mt-8 grid gap-6 pl-15 sm:grid-cols-2 lg:grid-cols-4">
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
                        className={`group text-left disabled:cursor-not-allowed disabled:opacity-45 ${chosen ? "" : ""}`}
                      >
                        <span className={`relative block aspect-[3/4] overflow-hidden ${arch} ${chosen ? "ring-4 ring-t-alt ring-offset-4 ring-offset-t-bg" : ""}`}>
                          <Image src={p.src} alt="" fill sizes="25vw" className="object-cover" />
                        </span>
                        <span className="mt-4 block font-t-display text-2xl italic">{r.name}</span>
                        <span className="block text-[15px] text-t-muted">
                          {free
                            ? `${formatMoney(r.price * b.nights)} for ${b.nights} ${b.nights === 1 ? "night" : "nights"}`
                            : r.maxGuests < b.guests
                              ? `Sleeps up to ${r.maxGuests}`
                              : "Taken on these dates"}
                        </span>
                      </button>
                    );
                  })}
                  <div className="sm:col-span-2 lg:col-span-4">
                    <button type="button" className={primary} disabled={!b.room || !b.availability[b.room.slug]} onClick={() => b.goTo(2)}>
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {open && i === 2 && (
                <form
                  className="mt-8 grid max-w-3xl gap-x-8 gap-y-6 pl-15 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
                    b.goTo(3);
                  }}
                >
                  <label className="block text-[15px] text-t-muted">
                    Full name
                    <input name="name" required autoComplete="name" defaultValue={b.details.name} className={input} />
                  </label>
                  <label className="block text-[15px] text-t-muted">
                    Email
                    <input name="email" type="email" required autoComplete="email" defaultValue={b.details.email} className={input} />
                  </label>
                  <label className="block text-[15px] text-t-muted">
                    Mobile
                    <input name="phone" type="tel" required autoComplete="tel" defaultValue={b.details.phone} className={input} />
                  </label>
                  <label className="block text-[15px] text-t-muted">
                    Expected arrival
                    <select name="arrival" defaultValue={b.details.arrival ?? "afternoon"} className={input}>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </label>
                  <fieldset className="sm:col-span-2">
                    <legend className="text-[15px] text-t-muted">Would you like</legend>
                    <div className="mt-3 space-y-2">
                      {extras.map((x) => (
                        <label key={x.id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={b.extraIds.includes(x.id)}
                            onChange={() => b.toggleExtra(x.id)}
                            className="size-4 accent-[var(--t-accent)]"
                          />
                          <span className="flex-1">{x.name}</span>
                          <span className="text-t-muted">{formatMoney(b.extraCost(x))}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="sm:col-span-2">
                    <button type="submit" className={primary}>
                      Review your stay
                    </button>
                  </div>
                </form>
              )}

              {open && i === 3 && (
                <form
                  className="mt-8 max-w-3xl pl-15"
                  onSubmit={(e) => {
                    e.preventDefault();
                    b.confirm(bookingRef("IV"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <p className="font-t-display text-2xl leading-relaxed">
                    {b.details.name}, {b.guests} {b.guests === 1 ? "guest" : "guests"}, in the {b.room?.name} for {b.nights}{" "}
                    {b.nights === 1 ? "night" : "nights"}.
                  </p>
                  <dl className="mt-6 space-y-2 text-[15px]">
                    <div className="flex justify-between border-b border-t-line pb-2">
                      <dt>Room</dt>
                      <dd>{formatMoney(b.roomTotal)}</dd>
                    </div>
                    {b.chosenExtras.map((x) => (
                      <div key={x.id} className="flex justify-between border-b border-t-line pb-2">
                        <dt>{x.name}</dt>
                        <dd>{formatMoney(b.extraCost(x))}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-t-display text-2xl italic">
                      <dt>Total</dt>
                      <dd>{formatMoney(b.total)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm text-t-muted">
                    Breakfast and taxes included. Nothing is charged until 7 days before arrival. Demo: no booking is made.
                  </p>
                  <label className="mt-6 flex items-start gap-3">
                    <input type="checkbox" required className="mt-1 size-4 accent-[var(--t-accent)]" />
                    <span>I accept the house terms and the cancellation policy.</span>
                  </label>
                  <button type="submit" className={`${primary} mt-8`}>
                    Confirm reservation
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
