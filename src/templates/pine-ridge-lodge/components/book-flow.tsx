"use client";
import { usePine, LocalLink as Link } from "../language";

import { PlacementImage as Image } from "./placement-image";

import { useSearchParams } from "next/navigation";
import { useClientToday } from "../../_kit/use-today";
import { validStay, matchesSeason, extraCost } from "../plan";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { fromDay, formatMoney } from "../../_kit/dates";
import { useStayBooking } from "../../_kit/use-stay-booking";

import { CURRENCY, href } from "../site";
import { usePersonalization } from "../personalization";

const money = (n: number) => formatMoney(n, CURRENCY);
const input = "mt-1.5 w-full rounded-md bg-tpl-surface px-4 py-3 ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-accent focus:outline-none";
const primary = "rounded-md bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent disabled:cursor-not-allowed disabled:opacity-40";

export function BookFlow() {
  const { photoEditing } = usePersonalization();
  const { t, extras, photo, rooms, season, activities, seasons, locale } = usePine();
  const personalization = usePersonalization();
  const availableExtras = extras.filter(x => season === "winter" || x.id !== "lift").map(x => x.id === "rental" && !personalization.pineExtras?.rental?.name ? {...x, name: season === "winter" ? t("One ski set, daily") : t("One bike, daily")} : x);
  const b = useStayBooking(rooms, availableExtras, { maxGuests: 6, maxNights: 30 });
  const step = photoEditing ? 1 : b.step;
  const params = useSearchParams();
  const activity = activities.find(a => a.id === params.get("activity") && a.season === season);
  const today = useClientToday();
  const datesValid = validStay(b.checkIn, b.checkOut, today);
  const inSeason = datesValid && matchesSeason(b.checkIn, b.checkOut, season);
  const cost = (x: (typeof extras)[number]) => extraCost(x.id, x.price, b.guests, b.nights);
  const total = b.roomTotal + b.chosenExtras.reduce((sum,x)=>sum+cost(x),0);
  const formatDay = (day: string, options: Intl.DateTimeFormatOptions = {day: "numeric", month: "short"}) => new Intl.DateTimeFormat(locale,options).format(fromDay(day));
  const formatLong = (day: string) => formatDay(day,{day: "numeric", month: "long", year: "numeric"});

  if (step === 4) {
    return (
      <div role="status" className="rounded-md bg-tpl-deep p-6 text-tpl-on-deep sm:p-10">
        <p className="font-tpl-display text-5xl font-bold">{t("Your sample stay is ready.")}</p>
        <p className="mt-4 text-lg text-tpl-on-deep/85">
          {b.room?.name}, {b.checkIn && formatLong(b.checkIn)}{" "}{t("to")}{" "}{b.checkOut && formatLong(b.checkOut)}{t(", for")}{" "}{b.guests}{t(". Sample reference")}{" "}{b.reference}{t(". No reservation, payment or email was created.")}</p>
        <p className="mt-2 text-tpl-on-deep/70">{t("This is a sample estimate in Canadian dollars, excluding taxes.")}</p>
        <p className="mt-4 font-bold">{t("Estimated subtotal")}: {money(total)}</p>
        {activity && <p className="mt-3">{t("Activity interest:")} {activity.name}. {t("Interest only; guide and equipment arrangements are not included or reserved.")}</p>}
        <Link href={href("/activities")} className={`${primary} mt-8 inline-block`}>{t("Plan your days")}</Link>
      </div>
    );
  }

  const canNext = [datesValid && inSeason, datesValid && inSeason && !!b.room && b.availability[b.room.slug], true, true][step];

  return (
    <div>
      <p className="mb-6 rounded-md bg-tpl-soft p-4">{t("Planning season:")} {seasons[season].label} · {seasons[season].months}. <Link href={href("/activities")} className="underline">{t("Change trip plan")}</Link></p>
      {activity && <p className="mb-6">{t("Activity interest:")} {activity.name}. {t("Interest only; guide and equipment arrangements are not included or reserved.")}</p>}
      {b.checkIn && (!datesValid || !inSeason) && <p role="alert" className="mb-6 text-tpl-alt">{t("Choose a stay of 1–30 nights from today, entirely within the selected season.")}</p>}
      {/* Trail progress */}
      <ol aria-label={t("Booking steps")} className="relative flex justify-between gap-2 border-t-2 border-dashed border-tpl-line pt-4">
        {[t("Dates"), t("Room"), t("Details"), t("Review")].map((label, i) => (
          <li key={label} aria-current={step === i ? "step" : undefined} className="relative flex flex-col items-center gap-2">
            <span
              className={`grid size-8 place-items-center rounded-full text-sm font-bold ring-4 ring-tpl-bg ${
                i <= step ? "bg-tpl-accent text-tpl-on-accent" : "bg-tpl-soft text-tpl-muted"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={`text-center text-sm ${step === i ? "font-bold" : "text-tpl-muted"}`}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        {step === 0 && (
          <section aria-labelledby="dates">
            <h2 id="dates" className="font-tpl-display text-4xl font-bold">{t("Pick your dates")}</h2>
            <Calendar
              locale={locale}
              labels={{previous: t("Previous month"), next: t("Next month"), to: t("to")}}
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
            <label className="mt-6 flex items-center gap-3 font-medium">{t("Guests")}<select value={b.guests} onChange={(e) => b.setGuests(Number(e.target.value))} className="rounded-md bg-tpl-surface px-3 py-2 ring-1 ring-tpl-line">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="room">
            <h2 id="room" className="font-tpl-display text-4xl font-bold">{t("Choose a room")}</h2>
            {rooms.every(r=>!b.availability[r.slug]) && <p role="status" className="mt-5 text-tpl-alt">{t("No sample rooms match these dates and guest count. Try different dates or fewer guests.")}</p>}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                    className={`grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)] gap-4 rounded-md bg-tpl-surface p-3 text-left ring-1 transition-shadow disabled:cursor-not-allowed disabled:opacity-50 ${
                      chosen ? "ring-3 ring-tpl-accent" : "ring-tpl-line hover:ring-tpl-ink/30"
                    }`}
                  >
                    <span className="relative aspect-square overflow-hidden rounded">
                      <Image placement={`book.room.${r.slug}`} src={p.src} alt="" unoptimized={p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} fill sizes="120px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-tpl-display text-2xl font-bold">{r.name}</span>
                      <span className="block text-sm text-tpl-muted">
                        {r.beds}{" "}{t("· sleeps")}{" "}{r.maxGuests}
                      </span>
                      <span className="mt-2 block font-bold">
                        {free ? money(r.price * b.nights) : r.maxGuests < b.guests ? `${t("Sleeps up to")} ${r.maxGuests}` : t("Unavailable in this sample")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <form
            id="details-form"
            onChange={(event) => { const field = event.target; if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && field.name) b.setDetails({...b.details,[field.name]:field.value}); }}
            aria-labelledby="details"
            onSubmit={(e) => {
              e.preventDefault();
              b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
              b.goTo(3);
            }}
          >
            <h2 id="details" className="font-tpl-display text-4xl font-bold">{t("Your details")}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block font-medium">{t("Name")}<input name="name" required autoComplete="name" defaultValue={b.details.name} className={input} />
              </label>
              <label className="block font-medium">{t("Email")}<input name="email" type="email" required autoComplete="email" defaultValue={b.details.email} className={input} />
              </label>
              <label className="block font-medium">{t("Phone")}<input name="phone" type="tel" required autoComplete="tel" defaultValue={b.details.phone} className={input} />
              </label>
              <label className="block font-medium">{t("Arriving by")}<select name="arrival" defaultValue={b.details.arrival ?? "car"} className={input}>
                  <option value="car">{t("Car")}</option>
                  <option value="shuttle">{t("Village shuttle")}</option>
                </select>
              </label>
            </div>
            <fieldset className="mt-8">
              <legend className="font-tpl-display text-2xl font-bold">{t("Add-ons")}</legend>
              <div className="mt-3 space-y-2">
                {availableExtras.map((x) => (
                  <label key={x.id} className="flex items-center gap-3 rounded-md bg-tpl-surface p-3 ring-1 ring-tpl-line">
                    <input type="checkbox" checked={b.extraIds.includes(x.id)} onChange={() => b.toggleExtra(x.id)} className="size-5 accent-[var(--t-accent)]" />
                    <span className="flex-1">{x.name}</span>
                    <span className="text-right"><span className="block font-bold">{money(cost(x))}</span><span className="text-xs text-tpl-muted">{b.nights} {t("nights")} × {x.id === "rental" ? 1 : b.guests} {x.id === "rental" ? t("rental set") : t("guests")}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
          </form>
        )}

        {step === 3 && (
          <section aria-labelledby="confirm">
            <h2 id="confirm" className="font-tpl-display text-4xl font-bold">{t("Check everything")}</h2>
            <dl className="mt-6 divide-y divide-tpl-line rounded-md bg-tpl-surface ring-1 ring-tpl-line">
              {[
                ["Guest", `${b.details.name}, ${b.details.email}`],
                ["Stay", `${b.checkIn && formatLong(b.checkIn)} → ${b.checkOut && formatLong(b.checkOut)}`],
                ["Room", `${b.room?.name} · ${b.guests}`],
                ["Room total", money(b.roomTotal)],
                ...b.chosenExtras.map((x) => [x.name, money(cost(x))]),
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-tpl-muted">{t(k)}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-tpl-muted">{t("Sample only. No payment is taken and nothing is booked. Prices exclude taxes.")}</p>
          </section>
        )}
      </div>

      {/* Basecamp bar */}
      <div className="mt-8 border-t border-tpl-line bg-tpl-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-5 py-3 sm:px-8">
          <p className="w-full text-sm sm:w-auto sm:flex-1">
            <span className="font-bold">
              {b.checkIn ? formatDay(b.checkIn) : t("Dates")} – {b.checkOut ? formatDay(b.checkOut) : "…"}
            </span>
            <span className="text-tpl-muted"> · {b.room?.name ?? t("No room yet")} · </span>
            <span className="font-bold">{t("Estimated subtotal")}: {b.room && b.nights ? money(total) : "—"}</span>
          </p>
          {step > 0 && (
            <button type="button" onClick={() => b.goTo((step - 1) as 0 | 1 | 2)} className="font-medium underline underline-offset-4">{t("Back")}</button>
          )}
          {step === 2 ? (
            <button type="submit" form="details-form" className={primary}>{t("Review")}</button>
          ) : step === 3 ? (
            <button type="button" className={primary} onClick={() => { if (!datesValid || !inSeason || !b.room || !b.availability[b.room.slug]) { b.goTo(0); return; } b.confirm(bookingRef("PR-SAMPLE")); }}>{t("Finish sample stay")}</button>
          ) : (
            <button type="button" className={primary} disabled={!canNext} onClick={() => b.goTo((step + 1) as 1 | 2)}>{t("Continue")}</button>
          )}
        </div>
      </div>
    </div>
  );
}
