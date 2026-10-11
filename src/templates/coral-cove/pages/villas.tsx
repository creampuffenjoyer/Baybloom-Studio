import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { PageIntro } from "../components/page-intro";
import { photo, villas } from "../content";
import { href } from "../site";

export function VillasPage() {
  return (
    <>
      <PageIntro
        title="Villas on the cove"
        lede="Twenty-two villas in four styles, all within a short walk of the water. Every rate includes breakfast, snorkel gear and the house reef."
      />

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
                    <dt className="text-tpl-muted">Size</dt>
                    <dd className="font-semibold">{v.size} m²</dd>
                  </div>
                  <div>
                    <dt className="text-tpl-muted">Sleeps</dt>
                    <dd className="font-semibold">{v.maxGuests}</dd>
                  </div>
                  <div>
                    <dt className="text-tpl-muted">View</dt>
                    <dd className="font-semibold">{v.view}</dd>
                  </div>
                </dl>
                <p className="mt-6 text-lg">
                  From <span className="font-tpl-display text-2xl font-bold">{formatMoney(v.price)}</span> a night
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={href(`/villas/${v.slug}`)} className="rounded-full bg-tpl-ink px-6 py-3 font-semibold text-white">
                    View villa
                  </Link>
                  <Link
                    href={`${href("/book")}?room=${v.slug}`}
                    className="rounded-full border-2 border-tpl-ink px-6 py-3 font-semibold hover:bg-tpl-ink hover:text-white"
                  >
                    Check dates
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section aria-labelledby="compare" className="bg-tpl-soft py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 id="compare" className="font-tpl-display text-4xl font-bold tracking-[-0.035em]">
            Side by side
          </h2>
          <div className="mt-8 overflow-x-auto rounded-3xl bg-white">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-tpl-line">
                  <th scope="col" className="p-5 font-semibold text-tpl-muted">
                    <span className="sr-only">Feature</span>
                  </th>
                  {villas.map((v) => (
                    <th key={v.slug} scope="col" className="p-5 font-tpl-display text-lg font-bold">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Nightly rate from", (v) => formatMoney(v.price)],
                    ["Size", (v) => `${v.size} m²`],
                    ["Guests", (v) => `Up to ${v.maxGuests}`],
                    ["Beds", (v) => v.beds],
                    ["View", (v) => v.view],
                    ["Private pool", (v) => (v.amenities.some((a) => /pool/i.test(a)) ? "Yes" : "No")],
                  ] as [string, (v: (typeof villas)[number]) => string][]
                ).map(([label, value]) => (
                  <tr key={label} className="border-b border-tpl-line last:border-0">
                    <th scope="row" className="p-5 font-semibold text-tpl-muted">
                      {label}
                    </th>
                    {villas.map((v) => (
                      <td key={v.slug} className="p-5">
                        {value(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
