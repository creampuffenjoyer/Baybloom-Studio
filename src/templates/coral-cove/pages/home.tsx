"use client";
import { useCoral, LocalLink as Link } from "../language";
import { PlacementImage as Image } from "../components/placement-image";

import { formatMoney } from "../../_kit/dates";
import { BookingTicket } from "../components/booking-ticket";

import { href } from "../site";
import { usePersonalization } from "../personalization";

export function HomePage() {
  const { t, experiences, offers, photo, villaPhoto, reviews, villas, site } = useCoral();
  const personalization = usePersonalization();
  const hero = photo("hero");
  const reef = photo("snorkeler");
  const reefImage = personalization.websitePhotos?.snorkeler || (personalization.homeSections?.useGalleryReef ? personalization.galleryPhotos?.snorkeler : undefined);
  const offer = offers[0];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[600px] flex-col justify-end overflow-hidden bg-tpl-deep text-white md:h-[calc(100svh-12rem)] md:min-h-[480px] md:max-h-[800px] md:overflow-visible">
        <Image
          placement="home.hero"
          src={personalization.heroImage || hero.src}
          alt={personalization.heroImage ? "Your selected hero image" : hero.alt}
          unoptimized={(personalization.heroImage || hero.src).startsWith("blob:") || (personalization.heroImage || hero.src).startsWith("/api/personalization/")}
          fill
          preload
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06302e]/80 via-[#06302e]/10 to-[#06302e]/40" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 md:pb-28">
          <p className="max-w-sm text-lg leading-relaxed text-white/90">
            {site.tagline}
          </p>
          <h1 className="mt-4 font-tpl-display leading-[0.9] font-semibold tracking-[-0.04em] text-balance break-words [font-size:clamp(4rem,14vw,12rem)] [font-stretch:88%]">
            {site.name}
          </h1>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-8 sm:px-8 md:absolute md:inset-x-0 md:bottom-0 md:translate-y-1/2 md:pb-0">
          <BookingTicket />
        </div>
      </section>

      {/* Intro + getting here */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-20 pb-24 sm:px-8 md:pt-32 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
        <div>
          <h2 className="font-tpl-display text-4xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">{personalization.home?.headline || t("Forty minutes by boat from El Nido, and a long way from anywhere.")}</h2>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-tpl-muted">{personalization.home?.welcome || t("Twenty-two villas share a white-sand cove on Isla Calma, with a house reef thirty metres offshore and nothing on the horizon but limestone islands. Days run on the tide: snorkel at high water, walk to the sandbar at low, and eat whatever came in on the boats.")}</p>
          <Link
            href={href("/villas")}
            className="mt-8 inline-block rounded-lg border border-tpl-ink px-6 py-3 font-medium transition-colors hover:bg-tpl-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink"
          >{t("Meet the villas")}</Link>
        </div>
        <div className="self-end rounded-2xl bg-tpl-soft p-6 sm:p-8">
          <h3 className="font-tpl-display text-2xl font-semibold tracking-tight">{personalization.homeSections?.travelHeading || t("Getting here")}</h3>
          <ol className="mt-6 space-y-6">
            {[
              ["Fly to El Nido", "Daily flights from Manila take 1 hour 15 minutes."],
              ["Meet our driver", "We collect you at arrivals for the 10-minute ride to the pier."],
              ["Cross to Isla Calma", "Our speedboat has you on the beach 40 minutes later."],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-tpl-ink/20 text-sm font-medium text-tpl-ink tabular-nums">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-medium">{personalization.homeSections?.travel?.[["first", "second", "third"][i]]?.title || t(title)}</span>
                  <span className="text-tpl-muted">{personalization.homeSections?.travel?.[["first", "second", "third"][i]]?.text || t(text)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Villas */}
      <section aria-labelledby="villas" className="pb-24">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 sm:px-8">
          <h2 id="villas" className="font-tpl-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{t("Four ways to stay")}</h2>
          <Link href={`${href("/villas")}#compare`} className="shrink-0 font-semibold underline underline-offset-4">{t("Compare villas")}</Link>
        </div>
        <ul className="mt-10 flex snap-x snap-mandatory scroll-px-5 gap-6 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:scroll-px-8 sm:px-8 xl:px-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))]">
          {villas.map((v) => {
            const p = villaPhoto(v);
            return (
              <li key={v.slug} className="w-[80vw] max-w-[380px] shrink-0 snap-start">
                <Link href={href(`/villas/${v.slug}`)} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-deep">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                    <Image
                      placement={`home.villa.${v.slug}`}
                      src={p.src}
                      unoptimized={(p.src).startsWith("blob:") || (p.src).startsWith("/api/personalization/")}
                      alt={p.alt}
                      fill
                      sizes="380px"
                      className="object-cover"
                    />
                    <span className="absolute top-4 left-4 rounded-md bg-white/95 px-3 py-2 text-sm font-medium tabular-nums">{t("from")}{" "}{formatMoney(v.price)}
                    </span>
                  </div>
                  <h3 className="mt-4 font-tpl-display text-2xl font-semibold tracking-tight group-hover:underline">
                    {v.name}
                  </h3>
                  <p className="mt-1 text-tpl-muted">
                    {v.size}{" "}{t("m², up to")}{" "}{v.maxGuests}{" "}{t("guests")}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Reef */}
      <section className="grid bg-tpl-deep text-white lg:grid-cols-[1.25fr_1fr]">
        <div className="relative min-h-[420px]">
          <Image placement="home.reef" src={reefImage || reef.src} alt={reefImage ? personalization.coralPhotoAlt?.snorkeler || personalization.galleryAlt?.snorkeler || "Your selected reef photo" : reef.alt} unoptimized={(reefImage || reef.src).startsWith("blob:") || (reefImage || reef.src).startsWith("/api/personalization/")} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        </div>
        <div className="px-5 py-16 sm:px-12 lg:py-24">
          <h2 className="font-tpl-display text-4xl leading-[1.1] font-semibold tracking-[-0.03em] sm:text-5xl">{personalization.homeSections?.reefHeading || t("The reef starts where the sand ends.")}</h2>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-white/80">{personalization.homeSections?.reefText || t("Borrow a mask at the beach hut and swim out over table corals and turtle grass. Further out, the dive centre runs two boats a day to the walls.")}</p>
          <ul className="mt-10 divide-y divide-white/15 border-y border-white/15">
            {experiences.slice(0, 4).map((x) => (
              <li key={x.slug}>
                <Link
                  href={`${href("/experiences")}#${x.slug}`}
                  className="flex items-baseline justify-between gap-6 py-4 hover:text-tpl-alt"
                >
                  <span className="text-lg font-medium">{x.name}</span>
                  <span className="shrink-0 text-sm text-white/65">{x.duration}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={href("/experiences")} className="mt-8 inline-block font-semibold text-tpl-alt underline underline-offset-4">{t("All experiences")}</Link>
        </div>
      </section>

      {/* Offer */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-tpl-soft md:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="font-semibold text-tpl-accent">{offer.name}</p>
            <h2 className="mt-3 font-tpl-display text-4xl leading-[1.1] font-semibold tracking-[-0.03em] sm:text-5xl">
              {offer.headline}
            </h2>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-tpl-muted">{offer.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${href("/book")}?offer=${offer.slug}`}
                className="rounded-lg bg-tpl-accent px-6 py-3 font-medium text-tpl-on-accent transition-colors hover:bg-tpl-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink"
              >{t("Explore this sample offer")}</Link>
              <Link href={href("/offers")} className="rounded-lg px-6 py-3 font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">{t("See all offers")}</Link>
            </div>
          </div>
          <div className="relative min-h-[300px]">
            <Image placement="home.offer" src={photo(offer.photo).src} unoptimized={(photo(offer.photo).src).startsWith("blob:") || (photo(offer.photo).src).startsWith("/api/personalization/")} alt={photo(offer.photo).alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Reviews */}
      {!personalization.reviewsHidden && <section aria-labelledby="reviews" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <h2 id="reviews" className="sr-only">{t("Guest reviews")}</h2>
        <div className="grid gap-12 border-t border-tpl-line pt-12 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name}>
              <blockquote className="font-tpl-display text-2xl leading-snug font-medium tracking-tight">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-5 text-tpl-muted">
                <span className="font-semibold text-tpl-ink">{r.name}</span>, {r.from}
                <span className="block text-sm">{r.stay}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>}

      {/* Gallery strip */}
      <section className="pb-24">
        <div className="grid grid-cols-2 gap-2 px-2 md:grid-cols-5">
          {(["coral", "beach-bar", "sandbar", "pool", "paraw"] as const).map((k, i) => {
            const original = photo(k);
            const image = personalization.websitePhotos?.[k] || (personalization.homeSections?.useGalleryStrip ? personalization.galleryPhotos?.[k] : undefined);
            return <div key={k} className={`relative aspect-square overflow-hidden ${i === 4 && !personalization.photoEditing ? "hidden md:block" : ""}`}>
              <Image placement={`home.strip.${k}`} src={image || original.src} alt={image ? personalization.coralPhotoAlt?.[k] || personalization.galleryAlt?.[k] || "Your selected gallery photo" : original.alt} unoptimized={(image || original.src).startsWith("blob:") || (image || original.src).startsWith("/api/personalization/")} fill sizes="(min-width: 768px) 20vw, 50vw" className="object-cover" />
            </div>;
          })}
        </div>
        <p className="mt-6 text-center">
          <Link href={href("/gallery")} className="font-semibold underline underline-offset-4">{t("Open the gallery")}</Link>
        </p>
      </section>
    </>
  );
}
