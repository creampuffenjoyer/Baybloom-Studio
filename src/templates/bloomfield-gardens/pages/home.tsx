import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { formatMoney } from "../../_kit/dates";
import { DateCheck } from "../components/date-check";
import { Sprig } from "../components/sprig";
import { packages, photo, reviews, spaces } from "../content";
import { href } from "../site";

export function HomePage() {
  const [left, center, right] = (["bouquet", "lawn", "glasshouse-dinner"] as const).map(photo);

  return (
    <>
      {/* Hero */}
      <section className="px-5 pt-14 text-center sm:px-8">
        <Sprig className="mx-auto w-32 text-tpl-alt" />
        <h1 className="mx-auto mt-6 max-w-4xl font-tpl-display text-6xl leading-[0.95] font-medium italic text-balance sm:text-8xl">
          Say yes in the garden.
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-tpl-muted">
          Twelve acres of lawns, roses and a Victorian glasshouse above Taal Lake, for weddings of twenty
          to two hundred.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={href("/inquire")} className="rounded-full bg-tpl-accent px-7 py-3.5 text-tpl-on-accent">
            Check your date
          </Link>
          <Link href={href("/spaces")} className="rounded-full px-7 py-3.5 ring-1 ring-tpl-ink/25 hover:ring-tpl-ink/60">
            Explore the estate
          </Link>
        </div>
      </section>
      <div className="mx-auto mt-14 grid max-w-7xl grid-cols-[1fr_1.6fr_1fr] items-end gap-3 px-5 sm:gap-5 sm:px-8">
        {[left, center, right].map((p, i) => (
          <div
            key={p.src}
            className={`bg-white p-2 shadow-[0_18px_40px_-24px_rgb(58_41_52/0.45)] sm:p-3 ${
              i === 0 ? "-rotate-3" : i === 2 ? "rotate-2" : "z-10"
            }`}
          >
            <div className={`relative overflow-hidden ${i === 1 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
              <Image src={p.src} alt={p.alt} fill priority sizes="(min-width: 1024px) 40vw, 50vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      {/* Spaces */}
      <section aria-labelledby="spaces" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
          <h2 id="spaces" className="font-tpl-display text-5xl font-medium italic sm:text-6xl">
            Five places to marry
          </h2>
          <p className="max-w-[52ch] text-lg text-tpl-muted md:justify-self-end">
            Every space has its own character and its own rainy-day twin, so the plan always works.
          </p>
        </div>
        <ul className="mt-12 divide-y divide-tpl-line border-y border-tpl-line">
          {spaces.map((s) => {
            const p = photo(s.photos[0]);
            return (
              <li key={s.slug}>
                <Link href={href(`/spaces/${s.slug}`)} className="group grid items-center gap-5 py-6 sm:grid-cols-[120px_1fr_auto]">
                  <span className="relative block aspect-square w-24 overflow-hidden rounded-full sm:w-full">
                    <Image src={p.src} alt="" fill sizes="120px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </span>
                  <span>
                    <span className="block font-tpl-display text-3xl font-medium group-hover:text-tpl-alt">{s.name}</span>
                    <span className="mt-1 block text-tpl-muted">{s.short}</span>
                  </span>
                  <span className="text-[15px] text-tpl-muted sm:text-right">
                    {s.kind}
                    <span className="block text-tpl-ink">
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
        <h2 id="pk" className="text-center font-tpl-display text-5xl font-medium italic sm:text-6xl">
          Ways to celebrate
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((p) => (
            <li
              key={p.name}
              className={`rounded-[2rem] px-8 pt-12 pb-8 text-center ${p.featured ? "bg-tpl-soft" : "ring-1 ring-tpl-line"}`}
            >
              <h3 className="font-tpl-display text-4xl italic">{p.name}</h3>
              <p className="mt-2 text-tpl-muted">{p.guests}</p>
              <p className="mt-5 text-lg">{p.blurb}</p>
              <p className="mt-6 font-tpl-display text-3xl">from {formatMoney(p.price)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <Link href={href("/weddings")} className="underline underline-offset-4 hover:text-tpl-alt">
            Compare packages
          </Link>
        </p>
      </section>

      {/* Reviews */}
      <section aria-label="Couples" className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 md:grid-cols-2">
        {reviews.map((r) => (
          <figure key={r.name} className="text-center">
            <blockquote className="font-tpl-display text-3xl leading-snug italic">“{r.quote}”</blockquote>
            <figcaption className="mt-4 text-tpl-muted">
              {r.name}, married in {r.when}
            </figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}
