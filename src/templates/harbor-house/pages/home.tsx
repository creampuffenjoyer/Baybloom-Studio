"use client";

import { useHarbor } from "../language";

import { PlacementImage as Image } from "../components/placement-image";
import { LocalLink as Link } from "../language";
import { Postcard } from "../components/postcard";

import { href } from "../site";
import { usePersonalization } from "../personalization";

const TILTS = [-1.5, 1, 1.5, -1];

export function HomePage() {
  const { t, breakfast, guestbook, photo, places, rooms, site } = useHarbor();
  const personalization = usePersonalization();
  const cove = photo("cove");
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <h1 className="max-w-3xl font-tpl-display text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
          {personalization.home?.headline || t("A room by the harbour, and breakfast like home.")}</h1>
        <div className="relative mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[21/10]">
            <Image placement="home.hero" src={personalization.heroImage || cove.src} alt={personalization.heroImage ? "Your selected hero image" : cove.alt} unoptimized={(personalization.heroImage || cove.src).startsWith("blob:") || (personalization.heroImage || cove.src).startsWith("/api/personalization/")} fill preload sizes="(min-width: 1152px) 1088px, 100vw" className="object-cover" />
          </div>
          <div className="relative -mt-16 ml-4 max-w-sm -rotate-2 bg-tpl-soft p-6 shadow-[0_4px_16px_rgb(0_0_0/0.08)] sm:absolute sm:-bottom-10 sm:left-8 sm:mt-0 sm:ml-0">
            <p className="font-[family-name:var(--hh-hand)] text-[1.7rem] leading-snug">
              {personalization.home?.welcome || t("Welcome! Four rooms, one big breakfast table and the whole of Batanes on the doorstep. We can’t wait to have you.")}</p>
            <p className="mt-3 text-right font-[family-name:var(--hh-hand)] text-2xl text-tpl-accent">— {site.hosts}</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4 sm:mt-20 sm:justify-end">
          <Link href={href("/book")} className="rounded-lg bg-tpl-accent px-6 py-3 font-medium text-tpl-on-accent transition-colors hover:bg-tpl-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">
            {t("Check dates")}</Link>
          <Link href={href("/rooms")} className="font-medium underline decoration-tpl-alt decoration-2 underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">
            {t("See the rooms")}</Link>
        </div>
      </section>

      {/* Rooms */}
      <section aria-labelledby="rooms" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <h2 id="rooms" className="font-tpl-display text-4xl sm:text-5xl">
          {t("Four rooms, all different")}</h2>
        <p className="mt-3 max-w-[52ch] text-lg text-tpl-muted">{t("Breakfast, wifi and a warm welcome included. Free cancellation up to five days before.")}</p>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {rooms.map((r, i) => (
            <Postcard placement={`home.room.${r.slug}`} key={r.slug} room={r} tilt={TILTS[i]} />
          ))}
        </div>
      </section>

      {/* Breakfast */}
      <section className="bg-tpl-soft">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:items-center">
          <div className="relative aspect-square overflow-hidden rounded-3xl">
            <Image placement="home.breakfast" src={photo("breakfast").src} unoptimized={(photo("breakfast").src).startsWith("blob:") || (photo("breakfast").src).startsWith("/api/personalization/")} alt={photo("breakfast").alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-tpl-display text-4xl sm:text-5xl">{t("Breakfast is the main event")}</h2>
            <p className="mt-4 text-lg text-tpl-ink/80">{t("Served from 7 to 10 at the big table, or in bed if you ask nicely.")}</p>
            <ul className="mt-6 space-y-3">
            {breakfast[0].items.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-tpl-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={href("/breakfast")} className="mt-8 inline-block font-semibold underline decoration-2 underline-offset-8">
              {t("The whole breakfast menu")}</Link>
          </div>
        </div>
      </section>

      {/* Around */}
      <section aria-labelledby="around" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="around" className="font-tpl-display text-4xl sm:text-5xl">
              {t("Right outside the door")}</h2>
            <p className="mt-4 text-lg text-tpl-muted">
              {t("Joel keeps a hand-drawn map at the front desk. Here are the places guests love most.")}</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl">
              <Image placement="home.guide" src={photo("lighthouse").src} unoptimized={(photo("lighthouse").src).startsWith("blob:") || (photo("lighthouse").src).startsWith("/api/personalization/")} alt={photo("lighthouse").alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ul className="divide-y divide-tpl-line self-center border-y border-tpl-line">
            {places.slice(0, 5).map((p) => (
              <li key={p.id} className="grid grid-cols-[1fr_auto] gap-4 py-5">
                <div>
                  <p className="font-tpl-display text-xl">{p.name}</p>
                  <p className="text-tpl-muted">{p.note}</p>
                </div>
                <p className="text-right text-sm font-semibold text-tpl-accent">{p.distance}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Guestbook */}
      <section aria-labelledby="gb" className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 id="gb" className="font-tpl-display text-4xl">
          {t("From the guestbook")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {guestbook.slice(0, 2).map((g, i) => (
            <figure key={g.who} className={`bg-tpl-surface p-7 ring-1 ring-tpl-line ${i ? "md:mt-10 md:rotate-1" : "md:-rotate-1"}`}>
              <blockquote className="font-[family-name:var(--hh-hand)] text-[1.7rem] leading-snug">{g.text}</blockquote>
              <figcaption className="mt-3 text-sm text-tpl-muted">
                {g.who}, {g.from}, {g.month}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8">
          <Link href={href("/guestbook")} className="font-semibold underline decoration-tpl-alt decoration-2 underline-offset-8">
            {t("Read the guestbook")}</Link>
        </p>
      </section>
    </>
  );
}
