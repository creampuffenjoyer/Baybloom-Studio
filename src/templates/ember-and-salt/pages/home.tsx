import Image from "next/image";
import Link from "next/link";
import { MenuList } from "../components/menu-list";
import { menus, photo, press, signatureDishes } from "../content";
import { href, site } from "../site";

export function HomePage() {
  const logs = photo("logs");
  const coals = menus[0].sections[1];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-10 pb-20 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:pt-16">
        <div>
          <h1 className="font-tpl-display leading-[0.86] [font-size:clamp(4.2rem,11vw,10.5rem)]">
            {["Cooked", "over", "fire."].map((word, i) => (
              <span
                key={word}
                className="block animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-700 ease-out"
                style={{ animationDelay: `${i * 140}ms` }}
              >
                {i === 2 ? <span className="text-tpl-alt">{word}</span> : word}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-tpl-muted">
            A wood-fired kitchen and cocktail bar in Poblacion. Everything on the menu meets a flame:
            native hardwood for the grill, coconut husk for the oven, and a little smoke in the glass.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href("/reserve")} className="bg-tpl-accent px-6 py-3.5 font-semibold text-tpl-on-accent hover:bg-tpl-alt">
              Reserve a table
            </Link>
            <Link href={href("/menu")} className="border border-tpl-line px-6 py-3.5 font-semibold hover:border-tpl-ink">
              See the menu
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden lg:aspect-[4/5]">
          <Image src={logs.src} alt={logs.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>

      {/* Press */}
      <section aria-label="What people say" className="border-y border-tpl-line">
        <ul className="mx-auto grid max-w-7xl divide-tpl-line px-5 sm:px-8 md:grid-cols-3 md:divide-x">
          {press.map((p) => (
            <li key={p.source} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <blockquote className="font-tpl-display text-xl leading-snug">“{p.quote}”</blockquote>
              <p className="mt-2 text-sm text-tpl-muted">{p.source}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Signatures */}
      <section aria-labelledby="signatures" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <h2 id="signatures" className="font-tpl-display text-5xl sm:text-6xl">
          What to order
        </h2>
        <ul className="mt-12 divide-y divide-tpl-line border-y border-tpl-line">
          {signatureDishes.map((d) => {
            const p = photo(d.photo);
            return (
              <li key={d.name} className="grid items-center gap-6 py-8 sm:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr_auto]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={p.src} alt={p.alt} fill sizes="280px" className="object-cover" />
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
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative min-h-[380px]">
            <Image src={photo("fish-coals").src} alt={photo("fish-coals").alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <div>
            <MenuList section={coals} headingLevel={2} />
            <Link href={href("/menu")} className="mt-10 inline-block border-b border-tpl-accent pb-1 text-tpl-accent">
              The full menu, drinks and desserts
            </Link>
          </div>
        </div>
      </section>

      {/* Bar */}
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-24 sm:px-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={photo("bar").src} alt={photo("bar").alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center md:pl-10">
          <h2 className="font-tpl-display text-5xl leading-none">The bar keeps seats free.</h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-tpl-muted">
            Twelve stools at the bar are never booked. Come for a smoked negroni and a flatbread, or
            stay for the whole menu. We’ll text you when a table opens.
          </p>
          <dl className="mt-8 space-y-1.5">
            {site.hours.slice(0, 2).map((h) => (
              <div key={h.days} className="flex gap-4">
                <dt className="w-44 text-tpl-muted">{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Private dining */}
      <section className="relative isolate overflow-hidden">
        <Image src={photo("back-room").src} alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-tpl-deep/75" />
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <h2 className="max-w-3xl font-tpl-display text-5xl leading-[0.95] sm:text-7xl">A room of your own behind the wine wall.</h2>
          <p className="mt-6 max-w-[48ch] text-lg text-tpl-ink/85">
            The Back Room seats sixteen for birthdays, launches and long Sunday lunches. The chef’s counter
            seats eight for a seven-course menu cooked in front of you.
          </p>
          <Link
            href={href("/private-dining")}
            className="mt-8 inline-block bg-tpl-accent px-6 py-3.5 font-semibold text-tpl-on-accent hover:bg-tpl-alt"
          >
            Plan a private dinner
          </Link>
        </div>
      </section>
    </>
  );
}
