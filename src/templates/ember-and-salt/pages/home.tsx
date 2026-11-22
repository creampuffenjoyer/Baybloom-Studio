"use client";
import { useEmberCopy } from "../copy";

import { PlacementImage as Image } from "../components/placement-image";
import Link from "next/link";
import { MenuList } from "../components/menu-list";
import { href } from "../site";
import { usePersonalization } from "../personalization";
import { useEmberData } from "../data";

export function HomePage() {
  const t = useEmberCopy();
  const personalization = usePersonalization();
  const { menus, press, pressHidden, hours, photo, signatures } = useEmberData();
  const logs = photo("logs");
  const coals = menus[0].sections[1];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-10 pb-20 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:pt-16">
        <div>
          <h1 className="font-tpl-display leading-[0.86] [font-size:clamp(4.2rem,11vw,10.5rem)]">
            {personalization.home?.headline || ["Cooked", "over", "fire."].map((word, i) => (
              <span
                key={word}
                className="block"
              >
                {i === 2 ? <span className="text-tpl-alt">{word}</span> : word}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-tpl-muted">
            {personalization.home?.welcome || "A wood-fired kitchen and cocktail bar in Poblacion. Everything on the menu meets a flame: native hardwood for the grill, coconut husk for the oven, and a little smoke in the glass."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href("/reserve")} className="bg-tpl-accent px-6 py-4 font-medium text-tpl-on-accent transition-colors hover:bg-tpl-alt focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">{t("Reserve a table")}</Link>
            <Link href={href("/menu")} className="border border-tpl-line px-6 py-4 font-medium transition-colors hover:border-tpl-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink">{t("See the menu")}</Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden lg:aspect-[4/5]">
          <Image placement={"home.hero"} src={personalization.heroImage || logs.src} alt={personalization.heroImage ? "Your selected hero image" : logs.alt} unoptimized={!!personalization.heroImage || logs.src.startsWith("blob:") || logs.src.startsWith("/api/personalization/")} fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>

      {/* Press */}
      {!pressHidden && <section aria-label="What people say" className="border-y border-tpl-line">
        <ul className="mx-auto grid max-w-7xl divide-y divide-tpl-line px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {press.map((p, index) => (
            <li key={index} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <blockquote className="font-tpl-display text-xl leading-snug">“{p.quote}”</blockquote>
              <p className="mt-2 text-sm text-tpl-muted">{p.source}</p>
            </li>
          ))}
        </ul>
      </section>}

      {/* Signatures */}
      <section aria-labelledby="signatures" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <h2 id="signatures" className="font-tpl-display text-5xl sm:text-6xl">{t("What to order")}</h2>
        <ul className="mt-12 divide-y divide-tpl-line border-y border-tpl-line">
          {signatures.map((d, index) => {
            const p = photo(d.photo);
            return (
              <li key={index} className="grid items-center gap-6 py-8 sm:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr_auto]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image placement={`home.dish.${index}`} src={p.src} unoptimized={p.src.startsWith("blob:") || p.src.startsWith("/api/personalization/")} alt={p.alt} fill sizes="280px" className="object-cover" />
                </div>
                <h3 className="font-tpl-display text-4xl leading-tight sm:text-5xl">{d.name}</h3>
                <p className="max-w-[30ch] text-lg text-tpl-muted lg:text-right">{d.line}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Menu excerpt */}
      <section className="bg-tpl-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative min-h-[380px]">
            <Image placement={"home.cooking"} src={photo("fish-coals").src} unoptimized={photo("fish-coals").src.startsWith("blob:") || photo("fish-coals").src.startsWith("/api/personalization/")} alt={photo("fish-coals").alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <div>
            <MenuList section={coals} headingLevel={2} />
            <Link href={href("/menu")} className="mt-10 inline-block border-b border-tpl-accent pb-1 text-tpl-accent">{t("The full menu, drinks and desserts")}</Link>
          </div>
        </div>
      </section>

      {/* Bar */}
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-24 sm:px-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image placement={"home.bar"} src={photo("bar").src} unoptimized={photo("bar").src.startsWith("blob:") || photo("bar").src.startsWith("/api/personalization/")} alt={photo("bar").alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center md:pl-10">
          <h2 className="font-tpl-display text-5xl leading-none">{t("The bar keeps seats free.")}</h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-tpl-muted">{t("Twelve stools at the bar are never booked. Come for a smoked negroni and a flatbread, or stay for the whole menu. We’ll text you when a table opens.")}</p>
          <dl className="mt-8 grid max-w-md grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2">
            {hours.slice(0, 2).map((h, index) => (
              <div key={index} className="contents">
                <dt className="text-tpl-muted">{h.days}</dt>
                <dd className="text-right tabular-nums">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Private dining */}
      <section className="relative isolate overflow-hidden">
        <Image placement={"home.private"} src={photo("back-room").src} unoptimized={photo("back-room").src.startsWith("blob:") || photo("back-room").src.startsWith("/api/personalization/")} alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-tpl-deep/75" />
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <h2 className="max-w-3xl font-tpl-display text-5xl leading-[0.95] sm:text-7xl">{t("A room of your own behind the wine wall.")}</h2>
          <p className="mt-6 max-w-[48ch] text-lg text-tpl-ink/85">{t("The Back Room seats sixteen for birthdays, launches and long Sunday lunches. The chef’s counter seats eight for a seven-course menu cooked in front of you.")}</p>
          <Link
            href={href("/private-dining")}
            className="mt-8 inline-block bg-tpl-accent px-6 py-3.5 font-semibold text-tpl-on-accent hover:bg-tpl-alt"
          >{t("Plan a private dinner")}</Link>
        </div>
      </section>
    </>
  );
}
