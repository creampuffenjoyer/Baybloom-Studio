"use client";

import Image from "next/image";
import { formatMoney } from "../../_kit/dates";
import { CURRENCY, href } from "../site";
import { LocalLink, useLumen } from "../language";

export function HomePage() {
  const { t, villas, experiences, photo: localizedPhoto } = useLumen();
  const hero = localizedPhoto("jetties");
  return (
    <>
      {/* Hero: a letterbox photo split by the waterline */}
      <section className="mx-auto max-w-[1400px] px-6 pt-10 sm:px-10">
        <h1 className="font-tpl-display text-[clamp(3.5rem,10vw,9.5rem)] leading-[0.9] tracking-[-0.02em]">
          {t("Still water,")}
          <br />
          {t("slow days.")}
        </h1>
        <div className="relative mt-16 aspect-[16/9] overflow-hidden sm:aspect-[21/8]">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1400px) 1320px, 100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-x-0 top-[58%] h-px bg-white/80" />
          <p className="absolute top-[58%] right-4 mt-2 text-xs text-white/90 sm:right-6">Waterline, 06:12</p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <p className="max-w-[40ch] text-lg leading-relaxed text-tpl-muted">
            {t("Four villas on the quiet eastern shore of Lake Lumen in Värmland. Saunas, rowing boats, and nothing much to do.")}
          </p>
          <p className="text-sm text-tpl-muted">{t("Open all year. Two hours from Oslo, three from Stockholm.")}</p>
          <LocalLink href={href("/book")} className="bg-tpl-accent px-7 py-4 text-sm text-tpl-on-accent">{t("Check availability")}</LocalLink>
        </div>
      </section>

      {/* Villas */}
      <section aria-labelledby="villas" className="mx-auto mt-40 max-w-[1400px] px-6 sm:px-10">
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <h2 id="villas" className="font-tpl-display text-5xl">
            The villas
          </h2>
          <p className="max-w-[46ch] text-tpl-muted">{t("Waterfront, garden or over the water. Each sleeps two to five, and each has the lake in view.")}</p>
        </div>
        <ul className="mt-16 grid gap-x-10 gap-y-20 md:grid-cols-2">
          {villas.map((v, i) => {
            const p = localizedPhoto(v.photos[0]);
            return (
              <li key={v.slug} className={i % 2 ? "md:mt-32" : ""}>
                <LocalLink href={href(`/villas/${v.slug}`)} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.5s] group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="font-tpl-display text-3xl">{v.name}</h3>
                    <p className="text-sm text-tpl-muted">from {formatMoney(v.price, CURRENCY)}</p>
                  </div>
                  <p className="mt-1 text-tpl-muted">{v.line}</p>
                </LocalLink>
              </li>
            );
          })}
        </ul>
        <p className="mt-16">
          <LocalLink href={href("/villas")} className="border-b border-tpl-ink pb-0.5 text-sm">{t("Compare the villas")}</LocalLink>
        </p>
      </section>

      {/* Experiences */}
      <section aria-labelledby="exp" className="mt-40 bg-tpl-soft">
        <div className="mx-auto max-w-[1400px] px-6 py-28 sm:px-10">
          <h2 id="exp" className="max-w-2xl font-tpl-display text-5xl leading-tight">
            {t("Mornings on the water, evenings in the sauna.")}
          </h2>
          <ul className="mt-16 grid gap-px bg-tpl-line md:grid-cols-4">
            {experiences.map((x) => (
              <li key={x.slug} className="bg-tpl-soft p-6 md:p-8">
                <p className="text-xs text-tpl-muted">{x.when}</p>
                <h3 className="mt-3 font-tpl-display text-2xl">{x.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-tpl-muted">{x.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-12">
          <LocalLink href={href("/experiences")} className="border-b border-tpl-ink pb-0.5 text-sm">All experiences</LocalLink>
          </p>
        </div>
      </section>

      {/* Tour teaser */}
      <section className="mx-auto mt-40 grid max-w-[1400px] gap-10 px-6 sm:px-10 md:grid-cols-[2fr_1fr] md:items-end">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image src={localizedPhoto("town").src} alt={localizedPhoto("town").alt} fill sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-tpl-display text-4xl">{t("Walk the shore from home")}</h2>
          <p className="mt-3 text-tpl-muted">{t("Look around the jetties, the sauna and the boathouse before you book.")}</p>
          <LocalLink href={href("/tour")} className="mt-6 inline-block border-b border-tpl-ink pb-0.5 text-sm">{t("Open the virtual tour")}</LocalLink>
        </div>
      </section>
    </>
  );
}
