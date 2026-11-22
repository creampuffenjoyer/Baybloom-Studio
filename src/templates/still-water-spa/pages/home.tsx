"use client";
import { useSpaCopy } from "../copy";
import { useSpaPhoto } from "../photos";
import { PlacementImage as Image } from "../components/placement-image";
import { LocalLink as Link } from "../language";
import { formatMoney } from "../../_kit/dates";
import { Breathe } from "../components/breathe";
import { RITUALS, reviews, type Ritual } from "../content";
import { useStillWater, useSpaHours } from "../language";
import { href, pebbles, site } from "../site";
import { usePersonalization } from "../personalization";

const ritualPhoto: Record<Ritual, import("../content").PhotoKey> = {
  massage: "room",
  facial: "oil",
  body: "eucalyptus",
  bathing: "hot-spring",
};

export function HomePage() {
  const copy = useSpaCopy();
  const photo = useSpaPhoto();
  const personalization = usePersonalization();
  const { treatments, packages } = useStillWater();
  const hours = useSpaHours();
  const hero = photo("long-pool");
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-8 pb-24 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h1 className="font-tpl-display text-6xl leading-[1.02] text-balance sm:text-7xl lg:text-8xl">{personalization.home?.headline || "Slow down in the pines."}</h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-tpl-muted">
            {personalization.home?.welcome || "A day spa and bathhouse in the hills of Baguio. Hilot massage, botanical facials and a thermal circuit under a timber roof, five minutes from Session Road."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href("/book")} className="rounded-lg bg-tpl-accent px-6 py-4 font-medium text-tpl-on-accent transition-colors hover:bg-tpl-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">{copy("Book a treatment")}</Link>
            <Link href={href("/treatments")} className="rounded-lg px-6 py-4 font-medium ring-1 ring-tpl-ink/20 transition-colors hover:bg-tpl-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">{copy("See treatments")}</Link>
          </div>
        </div>
        <div className="relative">
          <div className={`relative aspect-[5/4] overflow-hidden ${pebbles[0]}`}>
            <Image placement={"home.hero"} src={personalization.heroImage || hero.src} alt={personalization.heroImage ? "Your selected hero image" : hero.alt} unoptimized={!!personalization.heroImage || hero.src.startsWith("blob:") || hero.src.startsWith("/api/personalization/")} fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-10 -left-4 sm:left-6">
            <Breathe />
          </div>
        </div>
      </section>

      {/* Rituals */}
      <section aria-labelledby="rituals" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <h2 id="rituals" className="max-w-xl font-tpl-display text-4xl sm:text-5xl">{copy("Four ways to rest")}</h2>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {RITUALS.map((r, i) => {
            const p = photo(ritualPhoto[r.id]);
            const count = treatments.filter((t) => t.ritual === r.id).length;
            return (
              <li key={r.id}>
                <Link href={`${href("/treatments")}#${r.id}`} className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">
                  <div className={`relative aspect-square overflow-hidden ${pebbles[i % 3]}`}>
                    <Image placement={`home.ritual.${r.id}`} src={p.src} unoptimized={p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <h3 className="mt-6 font-tpl-display text-2xl group-hover:underline underline-offset-4">{r.label}</h3>
                  <p className="mt-1 text-tpl-muted">{r.line}</p>
                  <p className="mt-2 text-sm text-tpl-accent">
                    {count} {count === 1 ? "treatment" : "treatments"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Thermal circuit */}
      <section className="mx-auto mt-10 max-w-7xl px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-tpl-deep text-tpl-on-deep lg:grid-cols-2">
          <div className="relative min-h-[360px]">
            <Image placement={"home.steam"} src={photo("steam").src} unoptimized={photo("steam").src.startsWith("blob:") || photo("steam").src.startsWith("/api/personalization/")} alt={photo("steam").alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="p-8 sm:p-12">
            <h2 className="font-tpl-display text-4xl sm:text-5xl">{copy("The thermal circuit")}</h2>
            <p className="mt-4 max-w-[44ch] text-lg text-tpl-on-deep/80">{copy("Two hours in the bathhouse for")} {formatMoney(treatments.find(item => item.slug === "thermal-circuit")?.options[0].price ?? 1500)}{copy(", or free with any treatment of 90 minutes or more.")}</p>
            <ol className="mt-8 space-y-4">
              {[
                ["Heat", "Fifteen minutes in the eucalyptus steam room or the cedar sauna."],
                ["Cold", "A short plunge in the 14 °C pool, or a cool rain shower."],
                ["Rest", "Ten minutes on a daybed in the quiet room, with tea."],
                ["Repeat", "Two or three rounds, then a long float in the warm pool."],
              ].map(([title, text], i) => (
                <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                  <span className="grid size-10 place-items-center rounded-full ring-1 ring-tpl-on-deep/30 font-tpl-display">{i + 1}</span>
                  <span>
                    <span className="block font-semibold">{copy(title)}</span>
                    <span className="text-tpl-on-deep/75">{copy(text)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section aria-labelledby="packages" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="packages" className="font-tpl-display text-4xl sm:text-5xl">{copy("Half days and whole afternoons")}</h2>
          <Link href={href("/packages")} className="text-tpl-accent underline underline-offset-4">{copy("All packages and memberships")}</Link>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((p) => (
            <li key={p.name} className="rounded-2xl bg-tpl-surface p-6">
              <h3 className="font-tpl-display text-2xl">{p.name}</h3>
              <p className="mt-1 text-tpl-muted tabular-nums">
                {Math.floor(p.minutes / 60)} {copy("h")} {p.minutes % 60 ? `${p.minutes % 60} min` : ""} · {formatMoney(p.price)}
              </p>
              <ul className="mt-5 space-y-2 text-[15px]">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-tpl-accent" />
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Reviews */}
      {!personalization.spaReviewsHidden && <section aria-label="Guest reviews" className="mx-auto max-w-4xl space-y-14 px-5 py-8 text-center sm:px-8">
        {reviews.map((original, index) => { const r = { ...original, ...personalization.spaReviews?.[index === 0 ? "first" : "second"] }; return (
          <figure key={index}>
            <blockquote className="font-tpl-display text-3xl leading-snug text-balance sm:text-4xl">“{r.quote}”</blockquote>
            <figcaption className="mt-4 text-tpl-muted">
              {r.name}, {r.when}
            </figcaption>
          </figure>
        ); })}
      </section>}

      {/* Visit */}
      <section className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 rounded-2xl bg-tpl-soft p-8 sm:p-12 md:grid-cols-3">
          <h2 className="font-tpl-display text-4xl">{copy("Come as you are")}</h2>
          <div>
            <p className="font-semibold">{copy("Hours")}</p>
            {hours.map((h) => (
              <p key={h.days} className="text-tpl-muted">
                {h.days}, {h.time}
              </p>
            ))}
          </div>
          <div>
            <p className="font-semibold">{(personalization.business?.address ?? site.address)[0]}</p>
            <p className="text-tpl-muted">{(personalization.business?.address ?? site.address).slice(1).join(", ")}</p>
            <Link href={href("/visit")} className="mt-3 inline-block text-tpl-accent underline underline-offset-4">{copy("Getting here")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
