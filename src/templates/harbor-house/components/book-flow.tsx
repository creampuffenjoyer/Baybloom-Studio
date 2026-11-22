"use client";

import { useHarbor } from "../language";

import { PlacementImage as Image } from "./placement-image";
import { LocalLink as Link } from "../language";
import { bookingRef } from "../../_kit/availability";
import { Calendar } from "../../_kit/calendar";
import { fromDay, formatMoney } from "../../_kit/dates";
import { useStayBooking } from "../../_kit/use-stay-booking";

import { href } from "../site";
import { Stamp } from "./postcard";
import { usePersonalization } from "../personalization";

const input =
  "mt-2 w-full rounded-xl bg-tpl-surface px-4 py-3 ring-1 ring-tpl-line focus:ring-2 focus:ring-tpl-accent focus:outline-none";
const primary = "rounded-full bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent disabled:cursor-not-allowed disabled:opacity-40";
const STEPS = ["When", "Which room", "Who"];

export function BookFlow() {
  const { t, extras, photo, rooms, locale } = useHarbor();
  const { roomPhotos, websitePhotos, photoEditing } = usePersonalization();
  const b = useStayBooking(rooms, extras);
  const guestLimit = Math.min(12, Math.max(2, ...rooms.map((room) => room.maxGuests)));
  // Three steps here: dates, room (with extras), details. Review happens on the postcard.
  const step = photoEditing ? 1 : Math.min(b.step, 2);
  const d = (x: string | null) => (x ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(fromDay(x)) : "…");

  if (!photoEditing && b.step === 4) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="font-[family-name:var(--hh-hand)] text-6xl text-tpl-accent" role="status">{t("Sample booking complete")}</p>
        <p className="mt-5 text-lg">
          {t("Selection")}: {b.room?.name}. {t("Dates")}: {d(b.checkIn)} – {d(b.checkOut)}. {t("Sample reference")}: {b.reference}.
        </p>
        <p className="mt-3 text-tpl-muted">
          {t("Nothing has been reserved or charged, and no confirmation message will be sent. This demonstrates the website’s booking interface.")}</p>
        <Link href={href("/guide")} className={`${primary} mt-8 inline-block`}>
          {t("Plan your days")}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <div>
        <ol className="flex flex-wrap gap-2" aria-label={t("Steps")}>
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={step === i ? "step" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${step === i ? "bg-tpl-ink text-white" : i < step ? "bg-tpl-soft" : "bg-tpl-surface text-tpl-muted ring-1 ring-tpl-line"}`}
            >
              {i + 1}. {t(s)}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className="mt-8">
            <h2 className="font-tpl-display text-3xl">{t("When are you coming?")}</h2>
            <Calendar
              locale={locale}
              labels={{ previous: t("Previous month"), next: t("Next month"), to: t("to") }}
              mode="range"
              start={b.checkIn}
              end={b.checkOut}
              onSelect={(a, z) => b.setDates(a, z)}
              className="mt-6 max-w-md rounded-3xl bg-tpl-surface p-5 ring-1 ring-tpl-line"
              headerClassName="mb-3 flex items-center gap-2 font-tpl-display text-xl"
              navClassName="grid size-10 place-items-center rounded-full text-2xl hover:bg-tpl-soft disabled:opacity-25"
              weekdayClassName="pb-2 text-center text-xs font-bold text-tpl-muted"
              dayClassName="mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-full font-semibold hover:bg-tpl-soft disabled:cursor-not-allowed disabled:font-normal disabled:text-tpl-line disabled:hover:bg-transparent data-[in-range=true]:rounded-none data-[in-range=true]:bg-tpl-soft data-[selected=true]:bg-tpl-accent data-[selected=true]:text-white"
            />
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 font-semibold">
                {t("Guests")}<select value={b.guests} onChange={(e) => b.setGuests(Number(e.target.value))} className="rounded-xl bg-tpl-surface px-3 py-2 ring-1 ring-tpl-line">
                  {Array.from({ length: guestLimit }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                </select>
              </label>
              <button type="button" className={primary} disabled={b.nights < 1} onClick={() => b.goTo(1)}>
                {t("Show rooms")}</button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="mt-8">
            <h2 className="font-tpl-display text-3xl">{t("Pick your room")}</h2>
            <ul className="mt-6 space-y-3">
              {rooms.map((r) => {
                const free = photoEditing || b.availability[r.slug];
                const p = photo(r.photos[0]);
                return (
                  <li key={r.slug}>
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl bg-tpl-surface p-3 ring-1 ring-tpl-line has-checked:ring-2 has-checked:ring-tpl-accent ${free ? "" : "cursor-not-allowed opacity-50"}`}
                    >
                      <input type="radio" name="room" className="sr-only" disabled={!free} checked={b.room?.slug === r.slug} onChange={() => b.selectRoom(r.slug)} />
                      <span className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                        <Image placement={`book.room.${r.slug}`} src={websitePhotos?.[r.photos[0]] || roomPhotos?.[r.slug] || p.src} alt="" unoptimized={(websitePhotos?.[r.photos[0]] || roomPhotos?.[r.slug] || p.src).startsWith("blob:") || (websitePhotos?.[r.photos[0]] || roomPhotos?.[r.slug] || p.src).startsWith("/api/personalization/")} fill sizes="80px" className="object-cover" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-tpl-display text-xl">{r.name}</span>
                        <span className="text-sm text-tpl-muted">{free ? r.bed : t("Booked for some of those nights")}</span>
                      </span>
                      <span className="pr-2 text-right font-bold">{formatMoney(r.price * b.nights)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <fieldset className="mt-8">
              <legend className="font-tpl-display text-xl">{t("Little extras")}</legend>
              <div className="mt-3 space-y-2">
                {extras.map((x) => (
                  <label key={x.id} className="flex items-center gap-3">
                    <input type="checkbox" checked={b.extraIds.includes(x.id)} onChange={() => b.toggleExtra(x.id)} className="size-5 accent-[var(--t-accent)]" />
                    <span className="flex-1">{x.name}</span>
                    <span className="text-tpl-muted">{formatMoney(b.extraCost(x))}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-8 flex items-center gap-6">
              <button type="button" onClick={() => b.goTo(0)} className="font-semibold underline underline-offset-4">
                {t("Back")}</button>
              <button type="button" className={primary} disabled={!b.room || !b.availability[b.room.slug]} onClick={() => b.goTo(2)}>
                {t("Continue")}</button>
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
            <h2 className="font-tpl-display text-3xl">{t("Who’s coming?")}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block font-semibold">
                {t("Name")}<input name="name" required autoComplete="name" className={input} />
              </label>
              <label className="block font-semibold">
                {t("Mobile / WhatsApp")}<input name="phone" type="tel" required autoComplete="tel" className={input} />
              </label>
              <label className="block font-semibold sm:col-span-2">
                {t("Email")}<input name="email" type="email" required autoComplete="email" className={input} />
              </label>
              <label className="block font-semibold sm:col-span-2">
                {t("Flight or boat details")}<span className="font-normal text-tpl-muted">{t("(optional)")}</span>
                <input name="arrival" className={input} placeholder={t("e.g. PR 2932, arriving 9:40 am")} />
              </label>
            </div>
            <p className="mt-4 text-sm text-tpl-muted">{t("Use sample details. This form does not send a reservation or message.")}</p>
            <div className="mt-8 flex items-center gap-6">
              <button type="button" onClick={() => b.goTo(1)} className="font-semibold underline underline-offset-4">
                {t("Back")}</button>
              <button type="submit" className={primary}>
                {t("Complete sample booking")}</button>
            </div>
          </form>
        )}
      </div>

      {/* Postcard summary */}
      <aside aria-label={t("Your stay")} className="lg:sticky lg:top-8 lg:self-start">
        <div className="rotate-1 bg-tpl-surface p-6 shadow-[0_20px_40px_-24px_rgb(34_48_63/0.45)] ring-1 ring-tpl-line">
          <div className="flex items-start justify-between gap-4">
            <p className="font-[family-name:var(--hh-hand)] text-4xl leading-none text-tpl-accent">{t("Wish you were here")}</p>
            <Stamp className="rotate-6">
              <span className="block font-tpl-display text-lg">{b.room && b.nights ? formatMoney(b.total) : "₱ —"}</span>
            </Stamp>
          </div>
          <dl className="mt-6 space-y-2 border-t border-dashed border-tpl-line pt-4 font-[family-name:var(--hh-hand)] text-2xl">
            <div className="flex justify-between gap-4">
              <dt className="text-tpl-muted">{t("Arriving")}</dt>
              <dd>{d(b.checkIn)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tpl-muted">{t("Leaving")}</dt>
              <dd>{d(b.checkOut)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tpl-muted">{t("Room")}</dt>
              <dd className="text-right">{b.room?.name ?? "…"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tpl-muted">{t("Guests")}</dt>
              <dd>{b.guests}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-tpl-muted">{t("Breakfast included. Free cancellation up to 5 days before.")}</p>
        </div>
      </aside>
    </div>
  );
}
