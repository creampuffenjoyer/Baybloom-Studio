"use client";
import { useCoral, LocalLink as Link } from "../language";

import { PlacementImage as Image } from "./placement-image";
import { usePersonalization } from "../personalization";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useClientToday } from "../../_kit/use-today";
import { validStay, stayEstimate } from "../stay-plan";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { fromDay, formatMoney } from "../../_kit/dates";
import { useStayBooking } from "../../_kit/use-stay-booking";

import { href } from "../site";

const input =
  "mt-2 w-full rounded-2xl border border-tpl-line bg-white px-4 py-3 text-base focus:border-tpl-deep focus:ring-2 focus:ring-tpl-alt focus:outline-none";
const primary =
  "rounded-full bg-tpl-accent px-7 py-3.5 text-lg font-bold text-tpl-on-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40";
const ghost = "rounded-full px-5 py-3 font-semibold underline underline-offset-4";

export function BookFlow() {
  const { t, extras, offers, villaPhoto, villas, locale } = useCoral();
  const b = useStayBooking(villas, extras, { maxGuests: 5, maxNights: 30 });
  const { photoEditing, photoSelection } = usePersonalization();
  const step = photoEditing ? 1 : b.step;
  const summaryVilla = photoEditing ? villas.find(v => photoSelection?.endsWith(v.slug)) ?? b.room : b.room;
  const params = useSearchParams();
  const offer = offers.find((o) => o.slug === params.get("offer")) ?? null;
  const [payment, setPayment] = useState<"deposit" | "arrival">("deposit");

  const today = useClientToday();
  const datesValid = validStay(b.checkIn, b.checkOut, today);
  const { freeNights, discount, subtotal: total } = stayEstimate(b.roomTotal, b.extrasTotal, b.room?.price ?? 0, b.nights, offer?.slug ?? null);
  const formatDay = (day: string, options: Intl.DateTimeFormatOptions = {day: "numeric", month: "short"}) => new Intl.DateTimeFormat(locale, options).format(fromDay(day));
  const formatLong = (day: string) => formatDay(day, {weekday: "long", day: "numeric", month: "long", year: "numeric"});

  if (step === 4) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <p className="mx-auto grid size-16 place-items-center rounded-full bg-tpl-deep text-3xl text-white animate-in zoom-in duration-500">
          ✓
        </p>
        <h2 className="mt-6 font-tpl-display text-5xl font-extrabold tracking-[-0.045em]">{t("Your sample stay is ready.")}</h2>
        <p className="mt-4 text-lg text-tpl-muted">{t("Sample reference")}{" "}<span className="font-bold text-tpl-ink">{b.reference}</span>. {t("No reservation, payment or email was created.")}
        </p>
        <div className="mt-8 rounded-3xl bg-tpl-soft p-7 text-left">
          <p className="font-tpl-display text-2xl font-bold">{b.room?.name}</p>
          <p className="mt-2">
            {b.checkIn && formatLong(b.checkIn)} → {b.checkOut && formatLong(b.checkOut)}
          </p>
          <p className="mt-1 text-tpl-muted">
            {b.nights}{" "}{t("nights ·")}{" "}{b.guests} {b.guests === 1 ? t("guest") : t("guests")} · {formatMoney(total)}
            {payment === "deposit" ? `${t("Sample deposit:")} ${formatMoney(Math.round(total * 0.3))}` : t("Pay on arrival (sample)")}
          </p>
        </div>
        <p className="mt-8 text-tpl-muted">{t("This is an estimate for exploring the template. Taxes and service fees are excluded.")}</p>
        <Link href={href("/")} className={`${primary} mt-8 inline-block`}>{t("Back to the cove")}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div>
        <ol className="flex flex-wrap gap-x-6 gap-y-2" aria-label={t("Booking steps")}>
          {[t("Dates"), t("Villa"), t("Details"), t("Review")].map((label, i) => (
            <li key={label} aria-current={step === i ? "step" : undefined} className="flex items-center gap-2">
              <span
                className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
                  i < step ? "bg-tpl-deep text-white" : i === step ? "bg-tpl-accent text-white" : "bg-tpl-soft text-tpl-muted"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className={i === step ? "font-semibold" : "text-tpl-muted"}>{t(label)}</span>
            </li>
          ))}
        </ol>

        {offer && (
          <p className="mt-6 rounded-2xl bg-tpl-alt/40 px-5 py-3">
            <span className="font-semibold">{offer.name}:</span> {offer.headline.toLowerCase()}.{" "}
            {offer.slug === "stay-longer" ? t("Sample discount applied for 5+ nights; the sail is illustrative.") : t("This package needs a separate quote. The estimate below uses standard villa rates.")}
          </p>
        )}

        {!datesValid && b.checkIn && <p role="alert" className="mt-4 text-tpl-accent">{t("Choose future arrival and departure dates, for a stay of 1–30 nights.")}</p>}
        <div className="mt-8">
          {step === 0 && (
            <section aria-labelledby="step-dates">
              <h2 id="step-dates" className="font-tpl-display text-3xl font-bold tracking-tight">{t("When are you coming?")}</h2>
              <p className="mt-2 text-tpl-muted">{t("Pick your arrival day, then the day you leave.")}</p>
              <Calendar
                locale={locale}
                labels={{previous: t("Previous month"), next: t("Next month"), to: t("to")}}
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
                  <span className="font-semibold">{t("Guests")}</span>
                  <div className="flex items-center rounded-full border border-tpl-line">
                    <button
                      type="button"
                      onClick={() => b.setGuests(Math.max(1, b.guests - 1))}
                      aria-label={t("Fewer guests")}
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
                      aria-label={t("More guests")}
                      className="grid size-11 place-items-center text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button type="button" className={primary} disabled={!datesValid} onClick={() => b.goTo(1)}>
                  {b.nights > 0 ? `${t("See villas")} · ${b.nights} ${b.nights === 1 ? t("night") : t("nights")}` : t("Choose your dates")}
                </button>
              </div>
            </section>
          )}

          {step === 1 && (
            <section aria-labelledby="step-villa">
              <h2 id="step-villa" className="font-tpl-display text-3xl font-bold tracking-tight">{t("Choose your villa")}</h2>
              <p className="mt-2 text-tpl-muted">
                {b.checkIn && formatDay(b.checkIn)} – {b.checkOut && formatDay(b.checkOut)}, {b.guests}{" "}
                {b.guests === 1 ? t("guest") : t("guests")}.{" "}
                <button type="button" onClick={() => b.goTo(0)} className="font-semibold text-tpl-ink underline underline-offset-4">{t("Change")}</button>
              </p>
              <ul className="mt-6 space-y-4">
                {villas.map((v) => {
                  const free = b.availability[v.slug];
                  const tooSmall = v.maxGuests < b.guests;
                  const chosen = b.room?.slug === v.slug;
                  const p = villaPhoto(v);
                  return (
                    <li key={v.slug}>
                      <label
                        className={`has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-tpl-deep grid cursor-pointer grid-cols-[96px_1fr] gap-4 rounded-3xl border-2 p-3 transition-colors sm:grid-cols-[150px_1fr_auto] sm:items-center ${
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
                          <Image placement={`book.villa.${v.slug}`} src={p.src} alt="" unoptimized={(p.src).startsWith("blob:") || (p.src).startsWith("/api/personalization/")} fill sizes="150px" className="object-cover" />
                        </span>
                        <span>
                          <span className="block font-tpl-display text-xl font-bold">{v.name}</span>
                          <span className="block text-sm text-tpl-muted">
                            {v.size}{" "}{t("m² ·")}{" "}{v.beds} · {v.view}
                          </span>
                          {!free && (
                            <span className="mt-1 block text-sm font-semibold text-tpl-accent">
                              {tooSmall ? `${t("Sleeps up to")} ${v.maxGuests}` : t("Unavailable in this sample")}
                            </span>
                          )}
                        </span>
                        <span className="col-span-2 text-right sm:col-span-1 sm:pr-3">
                          <span className="block font-tpl-display text-2xl font-bold">{formatMoney(v.price * b.nights)}</span>
                          <span className="text-sm text-tpl-muted">
                            {formatMoney(v.price)} × {b.nights}{" "}{t("nights")}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {villas.every((v) => !b.availability[v.slug]) && (
                <p className="mt-6 rounded-2xl bg-tpl-soft p-5">{t("No sample villas match these dates. Try different dates, or")}{" "}
                  <Link href={href("/contact")} className="font-semibold underline">{t("ask us")}</Link>{" "}{t("explore the sample enquiry.")}</p>
              )}
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <button type="button" className={ghost} onClick={() => b.goTo(0)}>{t("Back")}</button>
                <button type="button" className={primary} disabled={!datesValid || !b.room || !b.availability[b.room.slug]} onClick={() => b.goTo(2)}>{t("Continue")}</button>
              </div>
            </section>
          )}

          {step === 2 && (
            <form
              aria-labelledby="step-details"
              onChange={(event) => { const field = event.target; if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) && field.name) b.setDetails({ ...b.details, [field.name]: field.value }); }}
              onSubmit={(e) => {
                e.preventDefault();
                b.setDetails(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
                b.goTo(3);
              }}
            >
              <h2 id="step-details" className="font-tpl-display text-3xl font-bold tracking-tight">{t("Your details")}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-semibold">{t("Full name")}</span>
                  <input name="name" required autoComplete="name" defaultValue={b.details.name} className={input} />
                </label>
                <label className="block">
                  <span className="font-semibold">{t("Email")}</span>
                  <input name="email" type="email" required autoComplete="email" defaultValue={b.details.email} className={input} />
                </label>
                <label className="block">
                  <span className="font-semibold">{t("Mobile / WhatsApp")}</span>
                  <input name="phone" type="tel" required autoComplete="tel" defaultValue={b.details.phone} className={input} />
                </label>
                <label className="block">
                  <span className="font-semibold">{t("Flight into El Nido")}</span>
                  <select name="arrival" defaultValue={b.details.arrival ?? "morning"} className={input}>
                    <option value="morning">{t("Morning (before 12 pm)")}</option>
                    <option value="afternoon">{t("Afternoon (12 – 5 pm)")}</option>
                    <option value="unknown">{t("Not booked yet")}</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="font-semibold">{t("Anything we should know?")}</span>
                  <span className="text-tpl-muted">{" "}{t("(optional)")}</span>
                  <textarea
                    name="requests"
                    rows={3}
                    defaultValue={b.details.requests}
                    placeholder={t("Celebrations, dietary needs, cots…")}
                    className={input}
                  />
                </label>
              </div>
              <fieldset className="mt-10">
                <legend className="font-tpl-display text-2xl font-bold tracking-tight">{t("Add to your stay")}</legend>
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
                          {x.per === "guest" ? `${formatMoney(x.price)} ${t("per guest")}` : x.per === "night" ? t("per night") : t("per stay")}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <button type="button" className={ghost} onClick={() => b.goTo(1)}>{t("Back")}</button>
                <button type="submit" className={primary}>{t("Review sample stay")}</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form
              aria-labelledby="step-review"
              onSubmit={(e) => {
                e.preventDefault();
                if (!datesValid || !b.room || !b.availability[b.room.slug]) { b.goTo(0); return; }
                b.confirm(bookingRef("CC-SAMPLE"));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <h2 id="step-review" className="font-tpl-display text-3xl font-bold tracking-tight">{t("Review and confirm")}</h2>
              <dl className="mt-6 divide-y divide-tpl-line rounded-3xl border border-tpl-line">
                {[
                  ["Guest", `${b.details.name} · ${b.details.email}`],
                  ["Villa", b.room?.name],
                  ["Dates", `${b.checkIn && formatLong(b.checkIn)} → ${b.checkOut && formatLong(b.checkOut)}`],
                  ["Guests", String(b.guests)],
                  ["Requests", b.details.requests || "None"],
                ].map(([k, v]) => (
                  <div key={k} className="grid gap-1 p-4 sm:grid-cols-[140px_1fr]">
                    <dt className="text-tpl-muted">{t(k ?? "")}</dt>
                    <dd className="font-medium">{v === "None" ? t("None") : v}</dd>
                  </div>
                ))}
              </dl>
              <fieldset className="mt-8">
                <legend className="font-tpl-display text-2xl font-bold tracking-tight">{t("Sample payment preference")}</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["deposit", "30% deposit (sample)", `${formatMoney(Math.round(total * 0.3))} — ${t("illustrative deposit only")}`],
                      ["arrival", "Pay on arrival", "No card details are collected."],
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
                      <span className="text-sm text-tpl-muted">{t(note)}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-sm text-tpl-muted">{t("Demo: connect Stripe, PayMongo or your booking engine here. No payment is taken.")}</p>
              </fieldset>
              <label className="mt-6 flex items-start gap-3">
                <input type="checkbox" required className="mt-1 size-5 accent-[var(--t-deep)]" />
                <span>{t("I understand this is a sample and no villa will be reserved.")}</span>
              </label>
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <button type="button" className={ghost} onClick={() => b.goTo(2)}>{t("Back")}</button>
                <button type="submit" className={primary}>{t("Finish sample stay")}</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <aside aria-label={t("Booking summary")} className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-3xl bg-tpl-soft">
          {summaryVilla && (
            <div className="relative aspect-[16/9]">
              <Image placement={`book.summary.${summaryVilla!.slug}`} src={villaPhoto(summaryVilla!).src} alt="" unoptimized={(villaPhoto(summaryVilla!).src).startsWith("blob:") || (villaPhoto(summaryVilla!).src).startsWith("/api/personalization/")} fill sizes="360px" className="object-cover" />
            </div>
          )}
          <div className="p-6">
            <h2 className="font-tpl-display text-2xl font-bold tracking-tight">{b.room?.name ?? t("Your stay")}</h2>
            <dl className="mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-tpl-muted">{t("Arrive")}</dt>
                <dd className="font-semibold">{b.checkIn ? formatDay(b.checkIn, { weekday: "short", day: "numeric", month: "short" }) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tpl-muted">{t("Leave")}</dt>
                <dd className="font-semibold">{b.checkOut ? formatDay(b.checkOut, { weekday: "short", day: "numeric", month: "short" }) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tpl-muted">{t("Guests")}</dt>
                <dd className="font-semibold">{b.guests}</dd>
              </div>
            </dl>
            {b.room && b.nights > 0 && (
              <dl className="mt-5 space-y-2 border-t border-black/10 pt-5 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt>
                    {b.nights} {b.nights === 1 ? t("night") : t("nights")}
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
                      {freeNights}{" "}{t("free")}{" "}{freeNights === 1 ? t("night") : t("nights")}
                    </dt>
                    <dd>−{formatMoney(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-black/10 pt-3 text-lg font-bold">
                  <dt>{t("Estimated subtotal")}</dt>
                  <dd>{formatMoney(total)}</dd>
                </div>
                <p className="text-xs text-tpl-muted">{t("Breakfast included. Taxes and service fees are excluded; this is not a final quote.")}</p>
              </dl>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
