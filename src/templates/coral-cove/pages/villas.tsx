"use client";
import { useCoral, LocalLink as Link } from "../language";
import { VillaComparison } from "../components/villa-comparison";
import Image from "next/image";

import { formatMoney } from "../../_kit/dates";
import { PageIntro } from "../components/page-intro";

import { href } from "../site";

export function VillasPage() {
  const { t, photo, villas } = useCoral();
  return (
    <>
      <div className="pb-12"><PageIntro
        title={t("Villas on the cove")}
        lede={t("Twenty-two villas in four styles, all within a short walk of the water. Every rate includes breakfast, snorkel gear and the house reef.")}
      /></div>

      <VillaComparison />
      <div className="mx-auto mt-16 max-w-7xl space-y-24 px-5 pb-24 sm:px-8">
        {villas.map((v, i) => {
          const p = photo(v.photos[0]);
          return (
            <article key={v.slug} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
              <div className={`relative aspect-[4/3] overflow-hidden rounded-[2rem] ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div>
                <h2 className="font-tpl-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">{v.name}</h2>
                <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-tpl-muted">{v.short}</p>
                <dl className="mt-6 grid max-w-md grid-cols-3 gap-4 border-y border-tpl-line py-4 text-sm">
                  <div>
                    <dt className="text-tpl-muted">{t("Size")}</dt>
                    <dd className="font-semibold">{v.size} m²</dd>
                  </div>
                  <div>
                    <dt className="text-tpl-muted">{t("Sleeps")}</dt>
                    <dd className="font-semibold">{v.maxGuests}</dd>
                  </div>
                  <div>
                    <dt className="text-tpl-muted">{t("View")}</dt>
                    <dd className="font-semibold">{v.view}</dd>
                  </div>
                </dl>
                <p className="mt-6 text-lg">{t("From")}{" "}<span className="font-tpl-display text-2xl font-bold">{formatMoney(v.price)}</span>{" "}{t("a night")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={href(`/villas/${v.slug}`)} className="rounded-full bg-tpl-ink px-6 py-3 font-semibold text-white">{t("View villa")}</Link>
                  <Link
                    href={`${href("/book")}?room=${v.slug}`}
                    className="rounded-full border-2 border-tpl-ink px-6 py-3 font-semibold hover:bg-tpl-ink hover:text-white"
                  >{t("Check dates")}</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>


    </>
  );
}
