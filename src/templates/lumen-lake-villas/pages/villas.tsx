import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "../../_kit/dates";
import { photo, villas, type Villa } from "../content";
import { CURRENCY, href, site } from "../site";

const ROWS: [string, (v: Villa) => string][] = [
  ["From, per night", (v) => formatMoney(v.price, CURRENCY)],
  ["Setting", (v) => v.setting],
  ["Size", (v) => `${v.size} m²`],
  ["Sleeps", (v) => String(v.maxGuests)],
  ["Bedrooms", (v) => String(v.bedrooms)],
  ["Private jetty", (v) => (v.jetty ? "Yes" : "—")],
  ["Own sauna", (v) => (v.sauna ? "Yes" : "—")],
];

export function VillasPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-10 sm:px-10">
      <h1 className="font-tpl-display text-7xl sm:text-8xl">The villas</h1>
      <p className="mt-6 max-w-[48ch] text-lg text-tpl-muted">
        Four villas, each with its own way of meeting the lake. Linen, wood stoves and breakfast baskets in
        all of them.
      </p>

      <div className="mt-20 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Compare the villas</caption>
          <thead>
            <tr>
              <td />
              {villas.map((v) => (
                <th key={v.slug} scope="col" className="px-4 pb-6 align-bottom font-normal">
                  <Link href={href(`/villas/${v.slug}`)} className="group block">
                    <span className="relative block aspect-[4/3] overflow-hidden">
                      <Image src={photo(v.photos[0]).src} alt="" fill sizes="20vw" className="object-cover" />
                    </span>
                    <span className="mt-4 block font-tpl-display text-2xl group-hover:underline">{v.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, get]) => (
              <tr key={label} className="border-t border-tpl-line">
                <th scope="row" className="py-4 pr-4 font-normal text-tpl-muted">
                  {label}
                </th>
                {villas.map((v) => (
                  <td key={v.slug} className="px-4 py-4">
                    {get(v)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-tpl-line">
              <td />
              {villas.map((v) => (
                <td key={v.slug} className="px-4 py-6">
                  <Link href={`${href("/book")}?room=${v.slug}`} className="border-b border-tpl-ink pb-0.5">
                    Check dates
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VillaPage({ slug }: { slug: string }) {
  const v = villas.find((x) => x.slug === slug);
  if (!v) notFound();
  const [a, b, c] = v.photos.map(photo);
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-10 sm:px-10">
      <Link href={href("/villas")} className="text-sm text-tpl-muted hover:text-tpl-ink">
        All villas
      </Link>
      <h1 className="mt-4 font-tpl-display text-7xl sm:text-8xl">{v.name}</h1>
      <p className="mt-4 font-tpl-display text-2xl text-tpl-muted italic">{v.line}</p>
      <div className="relative mt-14 aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
        <Image src={a.src} alt={a.alt} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="mt-20 grid gap-16 md:grid-cols-[1fr_1.4fr]">
        <dl className="grid h-fit grid-cols-2 gap-y-4 text-sm">
          {ROWS.map(([label, get]) => (
            <div key={label} className="contents">
              <dt className="text-tpl-muted">{label}</dt>
              <dd>{get(v)}</dd>
            </div>
          ))}
          <dt className="text-tpl-muted">Check-in / out</dt>
          <dd>
            {site.checkIn} / {site.checkOut}
          </dd>
        </dl>
        <div>
          <div className="space-y-5 text-lg leading-relaxed">
            {v.description.map((d) => (
              <p key={d.slice(0, 16)}>{d}</p>
            ))}
          </div>
          <Link href={`${href("/book")}?room=${v.slug}`} className="mt-10 inline-block bg-tpl-accent px-7 py-4 text-sm text-tpl-on-accent">
            Check availability
          </Link>
        </div>
      </div>
      <div className="mt-24 grid gap-6 md:grid-cols-[1fr_1.5fr]">
        {[b, c].map((p) => (
          <div key={p.src} className="relative aspect-[4/5] overflow-hidden md:last:aspect-[4/3] md:last:self-end">
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
