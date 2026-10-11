import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { Breathe } from "../components/breathe";
import { RITUALS, packages, photo, reviews, treatments, type Ritual } from "../content";
import { href, pebbles, site } from "../site";

const ritualPhoto: Record<Ritual, Parameters<typeof photo>[0]> = {
  massage: "room",
  facial: "oil",
  body: "eucalyptus",
  bathing: "hot-spring",
};

export function HomePage() {
  const hero = photo("long-pool");
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-8 pb-24 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h1 className="font-t-display text-6xl leading-[1.02] text-balance sm:text-7xl lg:text-8xl">Slow down in the pines.</h1>
          <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-t-muted">
            A day spa and bathhouse in the hills of Baguio. Hilot massage, botanical facials and a
            thermal circuit under a timber roof, five minutes from Session Road.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={href("/book")} className="rounded-full bg-t-accent px-7 py-3.5 font-semibold text-t-on-accent">
              Book a treatment
            </Link>
            <Link href={href("/treatments")} className="rounded-full px-7 py-3.5 font-semibold ring-1 ring-t-ink/20 hover:ring-t-ink/50">
              See treatments
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className={`relative aspect-[5/4] overflow-hidden ${pebbles[0]}`}>
            <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-10 -left-4 sm:left-6">
            <Breathe />
          </div>
        </div>
      </section>

      {/* Rituals */}
      <section aria-labelledby="rituals" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <h2 id="rituals" className="max-w-xl font-t-display text-4xl sm:text-5xl">
          Four ways to rest
        </h2>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {RITUALS.map((r, i) => {
            const p = photo(ritualPhoto[r.id]);
            const count = treatments.filter((t) => t.ritual === r.id).length;
            return (
              <li key={r.id}>
                <Link href={`${href("/treatments")}#${r.id}`} className="group block">
                  <div className={`relative aspect-square overflow-hidden ${pebbles[i % 3]}`}>
                    <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-5 font-t-display text-2xl">{r.label}</h3>
                  <p className="mt-1 text-t-muted">{r.line}</p>
                  <p className="mt-2 text-sm text-t-accent">
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
        <div className="grid overflow-hidden rounded-[3rem] bg-t-deep text-t-on-deep lg:grid-cols-2">
          <div className="relative min-h-[360px]">
            <Image src={photo("steam").src} alt={photo("steam").alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="p-8 sm:p-14">
            <h2 className="font-t-display text-4xl sm:text-5xl">The thermal circuit</h2>
            <p className="mt-4 max-w-[44ch] text-lg text-t-on-deep/80">
              Two hours in the bathhouse for {formatMoney(1500)}, or free with any treatment of 90 minutes or more.
            </p>
            <ol className="mt-8 space-y-4">
              {[
                ["Heat", "Fifteen minutes in the eucalyptus steam room or the cedar sauna."],
                ["Cold", "A short plunge in the 14 °C pool, or a cool rain shower."],
                ["Rest", "Ten minutes on a daybed in the quiet room, with tea."],
                ["Repeat", "Two or three rounds, then a long float in the warm pool."],
              ].map(([title, text], i) => (
                <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                  <span className="grid size-10 place-items-center rounded-full ring-1 ring-t-on-deep/30 font-t-display">{i + 1}</span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-t-on-deep/75">{text}</span>
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
          <h2 id="packages" className="font-t-display text-4xl sm:text-5xl">
            Half days and whole afternoons
          </h2>
          <Link href={href("/packages")} className="text-t-accent underline underline-offset-4">
            All packages and memberships
          </Link>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((p) => (
            <li key={p.name} className="rounded-[2rem] bg-t-surface p-7">
              <h3 className="font-t-display text-2xl">{p.name}</h3>
              <p className="mt-1 text-t-muted">
                {Math.floor(p.minutes / 60)} h {p.minutes % 60 ? `${p.minutes % 60} min` : ""} · {formatMoney(p.price)}
              </p>
              <ul className="mt-5 space-y-2 text-[15px]">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-t-accent" />
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Reviews */}
      <section aria-label="Guest reviews" className="mx-auto max-w-4xl space-y-14 px-5 py-8 text-center sm:px-8">
        {reviews.map((r) => (
          <figure key={r.name}>
            <blockquote className="font-t-display text-3xl leading-snug text-balance sm:text-4xl">“{r.quote}”</blockquote>
            <figcaption className="mt-4 text-t-muted">
              {r.name}, {r.when}
            </figcaption>
          </figure>
        ))}
      </section>

      {/* Visit */}
      <section className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 rounded-[3rem] bg-t-soft p-8 sm:p-14 md:grid-cols-3">
          <h2 className="font-t-display text-4xl">Come as you are</h2>
          <div>
            <p className="font-semibold">Open every day</p>
            {site.hours.map((h) => (
              <p key={h.days} className="text-t-muted">
                {h.days}, {h.time}
              </p>
            ))}
          </div>
          <div>
            <p className="font-semibold">{site.address[0]}</p>
            <p className="text-t-muted">{site.address.slice(1).join(", ")}</p>
            <Link href={href("/visit")} className="mt-3 inline-block text-t-accent underline underline-offset-4">
              Getting here
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
