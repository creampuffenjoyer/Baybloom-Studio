"use client";

import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { formatDay, formatLong, formatMoney } from "../../_kit/dates";
import { useStayBooking } from "../../_kit/use-stay-booking";
import { CURRENCY, href } from "../site";
import { LocalLink, useLumen } from "../language";

const money = (n: number) => formatMoney(n, CURRENCY);
/** "the Shore Villa", but "The Boathouse" (some names already carry the article). */
const the = (name = "", capital = false) => (/^the /i.test(name) ? name : `${capital ? "The" : "the"} ${name}`);
const input = "mt-1 w-full border-0 border-b border-tpl-line bg-transparent px-0 py-3 text-lg focus:border-tpl-accent focus:ring-0 focus:outline-none";
const next = "bg-tpl-accent px-7 py-4 text-sm text-tpl-on-accent disabled:cursor-not-allowed disabled:opacity-35";
const QUESTIONS = ["When will you come?", "Where would you like to stay?", "Who should we expect?", "Shall we hold it for you?"];

/** One question at a time, in large type, with a quiet running summary underneath. */
export function BookFlow() {
  const { t, locale, villas, extras } = useLumen();
  const b = useStayBooking(villas, extras);

  if (b.step === 4) {
    return (
      <div className="max-w-3xl">
        <p className="font-tpl-display text-6xl leading-tight sm:text-7xl">{the(b.room?.name, true)} {t("is yours.")}</p>
        <p className="mt-6 text-lg text-tpl-muted">{b.checkIn && formatLong(b.checkIn, locale)} {t("to")} {b.checkOut && formatLong(b.checkOut, locale)}. {t("Reference")} {b.reference}. {t("We’ve written to")} {b.details.email} {t("with directions and the door code.")}</p>
        <LocalLink href={href("/experiences")} className="mt-10 inline-block border-b border-tpl-ink pb-0.5 text-sm">{t("Plan your days on the lake")}</LocalLink>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <p className="text-sm text-tpl-muted" aria-live="polite">
        {b.step + 1} / 4
      </p>
      <h2 className="mt-3 font-tpl-display text-5xl leading-tight sm:text-6xl">{t(QUESTIONS[b.step])}</h2>

      <div className="mt-12">
        {b.step === 0 && (
          <>
            <Calendar
              mode="range"
              months={2}
              locale={locale}
              start={b.checkIn}
              end={b.checkOut}
              onSelect={(a, z) => b.setDates(a, z)}
              headerClassName="mb-4 flex items-center gap-2 text-sm"
              navClassName="grid size-10 place-items-center text-xl hover:text-tpl-accent disabled:opacity-25"
              weekdayClassName="pb-3 text-center text-xs text-tpl-muted"
              dayClassName="mx-auto grid aspect-square w-full max-w-11 place-items-center text-sm hover:bg-tpl-soft disabled:cursor-not-allowed disabled:text-tpl-line disabled:hover:bg-transparent data-[in-range=true]:bg-tpl-soft data-[selected=true]:bg-tpl-ink data-[selected=true]:text-white"
            />
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <label className="flex items-center gap-3 text-sm text-tpl-muted">
                {t("Guests")}
                <select value={b.guests} onChange={(e) => b.setGuests(Number(e.target.value))} className="border-b border-tpl-line bg-transparent py-1 text-tpl-ink">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button type="button" className={next} disabled={b.nights < 1} onClick={() => b.goTo(1)}>
                {t("Next")}
              </button>
            </div>
          </>
        )}

        {b.step === 1 && (
          <>
            <ul className="divide-y divide-tpl-line border-y border-tpl-line">
              {villas.map((v) => {
                const free = b.availability[v.slug];
                return (
                  <li key={v.slug}>
                    <label className={`flex cursor-pointer items-baseline gap-6 py-6 ${free ? "" : "cursor-not-allowed opacity-40"}`}>
                      <input
                        type="radio"
                        name="villa"
                        disabled={!free}
                        checked={b.room?.slug === v.slug}
                        onChange={() => b.selectRoom(v.slug)}
                        className="size-4 accent-[var(--t-ink)]"
                      />
                      <span className="flex-1">
                        <span className="font-tpl-display text-3xl">{v.name}</span>
                        <span className="ml-3 text-sm text-tpl-muted">{free ? v.line : v.maxGuests < b.guests ? `${t("Sleeps")} ${v.maxGuests}` : t("Taken")}</span>
                      </span>
                      <span className="text-sm">{money(v.price * b.nights)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <fieldset className="mt-10">
              <legend className="text-sm text-tpl-muted">{t("Add")}</legend>
              <div className="mt-3 space-y-3">
                {extras.map((x) => (
                  <label key={x.id} className="flex items-center gap-4">
                    <input type="checkbox" checked={b.extraIds.includes(x.id)} onChange={() => b.toggleExtra(x.id)} className="size-4 accent-[var(--t-ink)]" />
                    <span className="flex-1">{x.name}</span>
                    <span className="text-sm text-tpl-muted">{money(b.extraCost(x))}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-10 flex items-center gap-8">
              <button type="button" className={next} disabled={!b.room || !b.availability[b.room.slug]} onClick={() => b.goTo(2)}>
                {t("Next")}
              </button>
              <button type="button" onClick={() => b.goTo(0)} className="text-sm text-tpl-muted">
                {t("Back")}
              </button>
            </div>
          </>
        )}

        {b.step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
              b.goTo(3);
            }}
            className="grid max-w-2xl gap-8 sm:grid-cols-2"
          >
            <label className="block text-sm text-tpl-muted">
              {t("Name")}
              <input name="name" required autoComplete="name" defaultValue={b.details.name} className={input} />
            </label>
            <label className="block text-sm text-tpl-muted">
              {t("Email")}
              <input name="email" type="email" required autoComplete="email" defaultValue={b.details.email} className={input} />
            </label>
            <label className="block text-sm text-tpl-muted sm:col-span-2">
              {t("Anything we should prepare?")}
              <input name="notes" defaultValue={b.details.notes} className={input} placeholder={t("A cot, firewood, an early sauna…")} />
            </label>
            <div className="flex items-center gap-8 sm:col-span-2">
              <button type="submit" className={next}>
                {t("Next")}
              </button>
              <button type="button" onClick={() => b.goTo(1)} className="text-sm text-tpl-muted">
                {t("Back")}
              </button>
            </div>
          </form>
        )}

        {b.step === 3 && (
          <>
            <p className="max-w-2xl font-tpl-display text-3xl leading-snug">
              {b.details.name}, {b.guests} {t(b.guests === 1 ? "guest" : "guests")}, {t("in")} {the(b.room?.name)}, {b.nights}{" "}
              {t(b.nights === 1 ? "night" : "nights")} {t("from")} {b.checkIn && formatLong(b.checkIn)}. {money(b.total)} {t("in all.")}
            </p>
            <p className="mt-4 text-sm text-tpl-muted">{t("Pay on arrival. Free cancellation until 14 days before. Demo: nothing is booked.")}</p>
            <div className="mt-10 flex items-center gap-8">
              <button type="button" className={next} onClick={() => b.confirm(bookingRef("LL"))}>
                {t("Yes, hold it")}
              </button>
              <button type="button" onClick={() => b.goTo(2)} className="text-sm text-tpl-muted">
                {t("Back")}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-20 border-t border-tpl-line pt-6 text-sm text-tpl-muted">
        {b.checkIn ? `${formatDay(b.checkIn, undefined, locale)} – ${b.checkOut ? formatDay(b.checkOut, undefined, locale) : "…"}` : t("No dates yet")}
        {b.room ? ` · ${b.room.name}` : ""}
        {b.room && b.nights ? ` · ${money(b.total)}` : ""}
      </p>
    </div>
  );
}
