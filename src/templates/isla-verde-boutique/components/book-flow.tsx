"use client";
import { usePersonalization } from "../personalization";

import { useIsla } from "../language";

import { PlacementImage as Image } from "./placement-image";
import { LocalLink as Link } from "../language";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatMoney } from "../../_kit/dates";
import { useStayBooking } from "../../_kit/use-stay-booking";
import { arch, href } from "../site";

const NUMERALS = ["I", "II", "III", "IV"];
const TITLES = ["Your dates", "Your room", "Your details", "Confirm"];

const input =
  "mt-2 w-full border-0 border-b border-tpl-line bg-transparent px-0 py-2.5 text-base focus:border-tpl-alt focus:ring-0 focus:outline-none";
const primary = "bg-tpl-accent px-6 py-3.5 text-tpl-on-accent hover:bg-tpl-alt disabled:cursor-not-allowed disabled:opacity-40";

export function BookFlow() {
  const { photoEditing } = usePersonalization();
  const { t, locale, date, extras, photo, rooms } = useIsla();
  const b = useStayBooking(rooms, extras, { maxGuests: 4, maxNights: 30 });
  const step = photoEditing ? 1 : b.step;
  const short = (d: string | null) => (d ? date(d, { weekday: "short", day: "numeric", month: "short" }) : "—");

  if (step === 4) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-tpl-display text-6xl italic">{t("Your sample stay.")}</p>
        <p className="mt-6 text-lg text-tpl-muted">{t("Your sample ")}{b.room?.name}{t(" stay runs from ")}{b.checkIn && date(b.checkIn)}{t(" to ")}{b.checkOut && date(b.checkOut)}{t(". Reference ")}<span className="text-tpl-ink">{b.reference}</span>.
        </p>
        <p className="mt-3 text-tpl-muted">{t("Nothing has been reserved or charged, and no confirmation email has been sent. This is a website demonstration.")}</p>
        <Link href={href("/journal")} className={`${primary} mt-10 inline-block`}>{t("Read about Vigan while you wait")}</Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 border-l-2 border-tpl-alt pl-4 text-sm text-tpl-muted">{t("Plan a sample stay of up to 30 nights. Dates, availability and prices are illustrative; no reservation, payment or email is sent.")}</p>
      {/* Itinerary strip */}
      <dl className="grid grid-cols-2 border-y border-tpl-line text-[15px] md:grid-cols-5">
        {[
          ["Arrive", short(b.checkIn)],
          ["Depart", short(b.checkOut)],
          ["Guests", String(b.guests)],
          ["Room", b.room?.name ?? "—"],
          ["Total", b.room && b.nights ? formatMoney(b.total) : "—"],
        ].map(([k, v]) => (
          <div key={k} className="border-tpl-line px-4 py-4 md:border-l md:first:border-l-0">
            <dt className="text-tpl-muted">{t(k)}</dt>
            <dd className="mt-1 font-tpl-display text-xl italic">{v}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-12 space-y-4">
        {TITLES.map((title, i) => {
          const open = step === i;
          const done = step > i;
          return (
            <li key={title} className={`border-b border-tpl-line pb-4 ${open ? "" : "opacity-90"}`}>
              <h2 className="flex items-baseline gap-5">
                <span className={`w-10 font-tpl-display text-3xl italic ${open || done ? "text-tpl-alt" : "text-tpl-line"}`}>{NUMERALS[i]}</span>
                {done ? (
                  <button type="button" onClick={() => b.goTo(i as 0 | 1 | 2 | 3)} className="font-tpl-display text-3xl italic hover:text-tpl-alt">
                    {t(title)} <span className="ml-2 font-tpl-body text-sm text-tpl-muted not-italic">{t("Edit")}</span>
                  </button>
                ) : (
                  <span className={`font-tpl-display text-3xl italic ${open ? "" : "text-tpl-muted"}`}>{t(title)}</span>
                )}
              </h2>

              {open && i === 0 && (
                <div className="mt-8 sm:pl-15">
                  <Calendar
                    mode="range"
                    locale={locale}
                    labels={{ previous: t("Previous month"), next: t("Next month"), to: t("to") }}
                    months={2}
                    start={b.checkIn}
                    end={b.checkOut}
                    onSelect={(a, z) => b.setDates(a, z)}
                    className="max-w-3xl"
                    headerClassName="mb-4 flex items-center gap-2 font-tpl-display text-xl italic"
                    navClassName="grid size-10 place-items-center text-2xl hover:text-tpl-alt disabled:opacity-25"
                    weekdayClassName="pb-2 text-center text-xs text-tpl-muted"
                    dayClassName="mx-auto grid aspect-square w-full max-w-11 place-items-center text-[15px] hover:bg-tpl-soft disabled:cursor-not-allowed disabled:text-tpl-line disabled:hover:bg-transparent data-[in-range=true]:bg-tpl-soft data-[selected=true]:bg-tpl-accent data-[selected=true]:text-tpl-on-accent"
                  />
                  <div className="mt-8 flex flex-wrap items-center gap-8">
                    <label className="flex items-center gap-3">{t("Guests")}<select value={b.guests} onChange={(e) => b.setGuests(Number(e.target.value))} className="border-b border-tpl-line bg-transparent py-1">
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <button type="button" className={primary} disabled={b.nights < 1} onClick={() => b.goTo(1)}>
                      {b.nights > 0 ? t("Continue, {n} nights", { n: b.nights }) : t("Choose your dates")}
                    </button>
                  </div>
                </div>
              )}

              {open && i === 1 && (
                <div className="mt-8 grid gap-6 sm:pl-15 sm:grid-cols-2 lg:grid-cols-4">
                  {rooms.map((r) => {
                    const free = photoEditing || b.availability[r.slug];
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
                        <span className={`relative block aspect-[3/4] overflow-hidden ${arch} ${chosen ? "ring-4 ring-tpl-alt ring-offset-4 ring-offset-tpl-bg" : ""}`}>
                          <Image placement={`book.room.${r.slug}`} src={p.src} unoptimized={p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                        </span>
                        <span className="mt-4 block font-tpl-display text-2xl italic">{r.name}</span>
                        <span className="block text-[15px] text-tpl-muted">
                          {free
                            ? t("{price} for {n} nights", { price: formatMoney(r.price * b.nights), n: b.nights })
                            : r.maxGuests < b.guests
                              ? t("Sleeps up to {n}", { n: r.maxGuests })
                              : t("Taken on these dates")}
                        </span>
                      </button>
                    );
                  })}
                  <div className="sm:col-span-2 lg:col-span-4">
                    <button type="button" className={primary} disabled={!b.room || !b.availability[b.room.slug]} onClick={() => b.goTo(2)}>{t("Continue")}</button>
                  </div>
                </div>
              )}

              {open && i === 2 && (
                <form
                  className="mt-8 grid max-w-3xl gap-x-8 gap-y-6 sm:pl-15 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
                    b.goTo(3);
                  }}
                >
                  <label className="block text-[15px] text-tpl-muted">{t("Full name")}<input name="name" required autoComplete="name" defaultValue={b.details.name} className={input} />
                  </label>
                  <label className="block text-[15px] text-tpl-muted">{t("Email")}<input name="email" type="email" required autoComplete="email" defaultValue={b.details.email} className={input} />
                  </label>
                  <label className="block text-[15px] text-tpl-muted">{t("Mobile")}<input name="phone" type="tel" required autoComplete="tel" defaultValue={b.details.phone} className={input} />
                  </label>
                  <label className="block text-[15px] text-tpl-muted">{t("Expected arrival")}<select name="arrival" defaultValue={b.details.arrival ?? "afternoon"} className={input}>
                      <option value="morning">{t("Morning")}</option>
                      <option value="afternoon">{t("Afternoon")}</option>
                      <option value="evening">{t("Evening")}</option>
                    </select>
                  </label>
                  <fieldset className="sm:col-span-2">
                    <legend className="text-[15px] text-tpl-muted">{t("Would you like")}</legend>
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
                          <span className="text-tpl-muted">{formatMoney(b.extraCost(x))}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="sm:col-span-2">
                    <button type="submit" className={primary}>{t("Review your stay")}</button>
                  </div>
                </form>
              )}

              {open && i === 3 && (
                <form
                  className="mt-8 max-w-3xl sm:pl-15"
                  onSubmit={(e) => {
                    e.preventDefault();
                    b.confirm(bookingRef("IV"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <p className="font-tpl-display text-2xl leading-relaxed">
                    {b.details.name}, {b.guests} {t(b.guests === 1 ? "guest" : "guests")}{t(", in the ")}{b.room?.name}{t(" for ")}{b.nights}{" "}
                    {t(b.nights === 1 ? "night" : "nights")}.
                  </p>
                  <dl className="mt-6 space-y-2 text-[15px]">
                    <div className="flex justify-between border-b border-tpl-line pb-2">
                      <dt>{t("Room")}</dt>
                      <dd>{formatMoney(b.roomTotal)}</dd>
                    </div>
                    {b.chosenExtras.map((x) => (
                      <div key={x.id} className="flex justify-between border-b border-tpl-line pb-2">
                        <dt>{x.name}</dt>
                        <dd>{formatMoney(b.extraCost(x))}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-tpl-display text-2xl italic">
                      <dt>{t("Total")}</dt>
                      <dd>{formatMoney(b.total)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm text-tpl-muted">{t("Breakfast and taxes included. Nothing is charged until 7 days before arrival. Demo: no booking is made.")}</p>
                  <label className="mt-6 flex items-start gap-3">
                    <input type="checkbox" required className="mt-1 size-4 accent-[var(--t-accent)]" />
                    <span>{t("I accept the house terms and the cancellation policy.")}</span>
                  </label>
                  <button type="submit" className={`${primary} mt-8`}>{t("Confirm reservation")}</button>
                </form>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
