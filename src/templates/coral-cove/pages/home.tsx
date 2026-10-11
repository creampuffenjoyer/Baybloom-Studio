import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { BookingTicket } from "../components/booking-ticket";
import { experiences, offers, photo, reviews, villas } from "../content";
import { href, site } from "../site";

export function HomePage() {
  const hero = photo("hero");
  const offer = offers[0];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[640px] flex-col justify-end overflow-hidden bg-tpl-deep text-white md:h-[100svh] md:max-h-[980px] md:overflow-visible">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06302e]/80 via-[#06302e]/10 to-[#06302e]/40" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 md:pb-28">
          <p className="max-w-xs text-lg leading-snug text-white/90 animate-in fade-in duration-700">
            {site.tagline}.
          </p>
          <h1 className="mt-3 font-tpl-display leading-[0.78] font-extrabold tracking-[-0.055em] [font-size:clamp(4.5rem,17vw,15.5rem)] [font-stretch:82%] animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
            Coral Cove
          </h1>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-8 animate-in fade-in fill-mode-both delay-500 duration-700 sm:px-8 md:absolute md:inset-x-0 md:bottom-0 md:translate-y-1/2 md:pb-0">
          <BookingTicket />
        </div>
      </section>

      {/* Intro + getting here */}
      <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-20 pb-24 sm:px-8 md:pt-36 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
        <div>
          <h2 className="font-tpl-display text-4xl leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-6xl">
            Forty minutes by boat from El Nido, and a long way from anywhere.
          </h2>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-tpl-muted">
            Twenty-two villas share a white-sand cove on Isla Calma, with a house reef thirty metres
            offshore and nothing on the horizon but limestone islands. Days run on the tide: snorkel at
            high water, walk to the sandbar at low, and eat whatever came in on the boats.
          </p>
          <Link
            href={href("/villas")}
            className="mt-8 inline-block rounded-full border-2 border-tpl-ink px-6 py-3 font-semibold transition-colors hover:bg-tpl-ink hover:text-white"
          >
            Meet the villas
          </Link>
        </div>
        <div className="self-end rounded-3xl bg-tpl-soft p-7 sm:p-9">
          <h3 className="font-tpl-display text-2xl font-bold tracking-tight">Getting here</h3>
          <ol className="mt-5 space-y-5">
            {[
              ["Fly to El Nido", "Daily flights from Manila take 1 hour 15 minutes."],
              ["Meet our driver", "We collect you at arrivals for the 10-minute ride to the pier."],
              ["Cross to Isla Calma", "Our speedboat has you on the beach 40 minutes later."],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tpl-deep font-tpl-display font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-tpl-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Villas */}
      <section aria-labelledby="villas" className="pb-24">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-5 sm:px-8">
          <h2 id="villas" className="font-tpl-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Four ways to stay
          </h2>
          <Link href={href("/villas")} className="shrink-0 font-semibold underline underline-offset-4">
            Compare villas
          </Link>
        </div>
        <ul className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:px-8 xl:px-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))]">
          {villas.map((v) => {
            const p = photo(v.photos[0]);
            return (
              <li key={v.slug} className="w-[80vw] max-w-[380px] shrink-0 snap-start">
                <Link href={href(`/villas/${v.slug}`)} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="380px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold">
                      from {formatMoney(v.price)}
                    </span>
                  </div>
                  <h3 className="mt-4 font-tpl-display text-2xl font-bold tracking-tight group-hover:underline">
                    {v.name}
                  </h3>
                  <p className="mt-1 text-tpl-muted">
                    {v.size} m², up to {v.maxGuests} guests
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Reef */}
      <section className="grid bg-tpl-deep text-white lg:grid-cols-[1.25fr_1fr]">
        <div className="relative min-h-[420px]">
          <Image src={photo("snorkeler").src} alt={photo("snorkeler").alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        </div>
        <div className="px-5 py-16 sm:px-12 lg:py-24">
          <h2 className="font-tpl-display text-4xl leading-[1.02] font-bold tracking-[-0.035em] sm:text-5xl">
            The reef starts where the sand ends.
          </h2>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-white/80">
            Borrow a mask at the beach hut and swim out over table corals and turtle grass. Further out,
            the dive centre runs two boats a day to the walls.
          </p>
          <ul className="mt-10 divide-y divide-white/15 border-y border-white/15">
            {experiences.slice(0, 4).map((x) => (
              <li key={x.slug}>
                <Link
                  href={`${href("/experiences")}#${x.slug}`}
                  className="flex items-baseline justify-between gap-6 py-4 hover:text-tpl-alt"
                >
                  <span className="text-lg font-semibold">{x.name}</span>
                  <span className="shrink-0 text-sm text-white/65">{x.duration}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={href("/experiences")} className="mt-8 inline-block font-semibold text-tpl-alt underline underline-offset-4">
            All experiences
          </Link>
        </div>
      </section>

      {/* Offer */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-tpl-soft md:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="font-semibold text-tpl-accent">{offer.name}</p>
            <h2 className="mt-3 font-tpl-display text-4xl leading-[1.02] font-bold tracking-[-0.035em] sm:text-5xl">
              {offer.headline}
            </h2>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-tpl-muted">{offer.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={href("/book")}
                className="rounded-full bg-tpl-accent px-6 py-3 font-semibold text-tpl-on-accent"
              >
                Book this offer
              </Link>
              <Link href={href("/offers")} className="rounded-full px-6 py-3 font-semibold underline underline-offset-4">
                See all offers
              </Link>
            </div>
          </div>
          <div className="relative min-h-[300px]">
            <Image src={photo(offer.photo).src} alt={photo(offer.photo).alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section aria-labelledby="reviews" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <h2 id="reviews" className="sr-only">
          Guest reviews
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={r.name} className={i === 1 ? "md:mt-16" : undefined}>
              <blockquote className="font-tpl-display text-2xl leading-snug font-semibold tracking-tight">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-5 text-tpl-muted">
                <span className="font-semibold text-tpl-ink">{r.name}</span>, {r.from}
                <span className="block text-sm">{r.stay}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Gallery strip */}
      <section className="pb-24">
        <div className="grid grid-cols-2 gap-2 px-2 md:grid-cols-5">
          {(["coral", "beach-bar", "sandbar", "pool", "paraw"] as const).map((k, i) => (
            <div key={k} className={`relative aspect-square overflow-hidden ${i === 4 ? "hidden md:block" : ""}`}>
              <Image src={photo(k).src} alt={photo(k).alt} fill sizes="(min-width: 768px) 20vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center">
          <Link href={href("/gallery")} className="font-semibold underline underline-offset-4">
            Open the gallery
          </Link>
        </p>
      </section>
    </>
  );
}
