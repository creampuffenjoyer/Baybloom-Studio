"use client";
import { useBloomCopy } from "../copy";
import { useBloomfield } from "../language";

import { PlacementImage as Image } from "../components/placement-image";
import { LocalLink as Link } from "../language";
import { Suspense } from "react";
import { formatMoney } from "../../_kit/dates";
import { DateCheck } from "../components/date-check";
import { Sprig } from "../components/sprig";

import { href } from "../site";
import { usePersonalization } from "../personalization";

export function HomePage() {
  const copy = useBloomCopy();
  const { packages, photo, reviews, spaces } = useBloomfield();
  const personalization = usePersonalization();
  const [left, center, right] = (["bouquet", "lawn", "glasshouse-dinner"] as const).map(photo);

  return (
    <>
      {/* Hero */}
      <section className="px-5 pt-14 text-center sm:px-8">
        <Sprig className="mx-auto w-32 text-tpl-alt" />
        <h1 className="mx-auto mt-6 max-w-4xl font-tpl-display text-6xl leading-[0.95] font-medium italic text-balance sm:text-8xl">
          {personalization.home?.headline || "Say yes in the garden."}
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-tpl-muted">
          {personalization.home?.welcome || "Twelve acres of lawns, roses and a Victorian glasshouse above Taal Lake, for weddings of twenty to two hundred."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={href("/inquire")} className="rounded-lg bg-tpl-accent px-6 py-4 text-tpl-on-accent transition-colors hover:bg-tpl-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">{copy("Check your date")}</Link>
          <Link href={href("/spaces")} className="rounded-lg px-6 py-4 ring-1 ring-tpl-ink/25 transition-colors hover:bg-tpl-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">{copy("Explore the estate")}</Link>
        </div>
      </section>
      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-[1fr_1.6fr_1fr] items-end gap-3 px-5 sm:gap-6 sm:px-8">
        {[left, center, right].map((p, i) => (
          <div
            key={p.src}
            className={`bg-white p-2 shadow-[0_4px_16px_rgb(0_0_0/0.08)] sm:p-3 ${
              i === 0 ? "-rotate-3" : i === 2 ? "rotate-2" : "z-10"
            }`}
          >
            <div className={`relative overflow-hidden ${i === 1 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
              <Image placement={`home.hero.${i}`} src={i === 1 && personalization.heroImage ? personalization.heroImage : p.src} alt={i === 1 && personalization.heroImage ? "Your selected hero image" : p.alt} unoptimized={!!personalization.heroImage || p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} fill preload={i === 1} loading={i === 1 ? undefined : "eager"} sizes="(min-width: 1024px) 40vw, 50vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      {/* Spaces */}
      <section aria-labelledby="spaces" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
          <h2 id="spaces" className="font-tpl-display text-5xl font-medium italic sm:text-6xl">{copy("Five places to marry")}</h2>
          <p className="max-w-[52ch] text-lg text-tpl-muted md:justify-self-end">{copy("Every space has its own character and its own rainy-day twin, so the plan always works.")}</p>
        </div>
        <ul className="mt-12 divide-y divide-tpl-line border-y border-tpl-line">
          {spaces.map((s) => {
            const p = photo(s.photos[0]);
            return (
              <li key={s.slug}>
                <Link href={href(`/spaces/${s.slug}`)} className="group grid grid-cols-[80px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-6">
                  <span className="relative block aspect-square w-20 overflow-hidden rounded-full sm:w-full">
                    <Image placement={`home.space.${s.slug}`} src={p.src} unoptimized={p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} alt="" fill sizes="120px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-tpl-display text-3xl font-medium group-hover:text-tpl-alt">{s.name}</span>
                    <span className="mt-1 block text-tpl-muted">{s.short}</span>
                  </span>
                  <span className="col-start-2 text-[15px] text-tpl-muted sm:col-start-auto sm:text-right">
                    {s.kind}
                    <span className="block text-tpl-ink tabular-nums">
                      {s.ceremony ? `${s.ceremony} for a ceremony` : `${s.dinner} for dinner`}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Date check */}
      <section aria-label="Check your date" className="bg-tpl-deep">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <Suspense fallback={<div className="h-[380px]" />}>
            <DateCheck dark />
          </Suspense>
        </div>
      </section>

      {/* Packages */}
      <section aria-labelledby="pk" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <h2 id="pk" className="text-center font-tpl-display text-5xl font-medium italic sm:text-6xl">{copy("Ways to celebrate")}</h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((p) => (
            <li
              key={p.name}
              className={`rounded-2xl p-8 text-center ${p.featured ? "bg-tpl-soft" : "ring-1 ring-tpl-line"}`}
            >
              <h3 className="font-tpl-display text-4xl italic">{p.name}</h3>
              <p className="mt-2 text-tpl-muted">{p.guests}</p>
              <p className="mt-5 text-lg">{p.blurb}</p>
              <p className="mt-6 font-tpl-display text-3xl tabular-nums">{copy("from")} {formatMoney(p.price)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <Link href={href("/weddings")} className="underline underline-offset-4 hover:text-tpl-alt">{copy("Compare packages")}</Link>
        </p>
      </section>

      {/* Reviews */}
      <section aria-label="Couples" className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 md:grid-cols-2">
        {reviews.map((r) => (
          <figure key={r.name} className="text-center">
            <blockquote className="font-tpl-display text-3xl leading-snug italic">“{r.quote}”</blockquote>
            <figcaption className="mt-4 text-tpl-muted">
              {r.name}{copy(", married in")} {r.when}
            </figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}
