import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "../../_kit/dates";
import { RITUALS, photo, treatments } from "../content";
import { href, pebbles } from "../site";

export function TreatmentPage({ slug }: { slug: string }) {
  const t = treatments.find((x) => x.slug === slug);
  if (!t) notFound();
  const p = photo(t.photo);
  const ritual = RITUALS.find((r) => r.id === t.ritual)!;
  const more = treatments.filter((x) => x.ritual === t.ritual && x.slug !== t.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 pb-16 sm:px-8">
      <nav aria-label="Breadcrumb" className="text-[15px] text-t-muted">
        <Link href={href("/treatments")} className="hover:text-t-ink">
          Treatments
        </Link>
        {" / "}
        <Link href={`${href("/treatments")}#${ritual.id}`} className="hover:text-t-ink">
          {ritual.label}
        </Link>
      </nav>
      <div className="mt-8 grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className={`relative aspect-square overflow-hidden ${pebbles[1]}`}>
          <Image src={p.src} alt={p.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h1 className="font-t-display text-5xl leading-tight sm:text-6xl">{t.name}</h1>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-t-muted">
            {t.description.map((d) => (
              <p key={d.slice(0, 16)}>{d}</p>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {t.options.map((o) => (
              <li key={o.minutes}>
                <Link
                  href={`${href("/book")}?treatment=${t.slug}&minutes=${o.minutes}`}
                  className="flex items-center justify-between rounded-2xl bg-t-surface px-5 py-4 ring-1 ring-t-line hover:ring-t-accent"
                >
                  <span>
                    <span className="block font-t-display text-xl">{o.minutes} minutes</span>
                    <span className="text-sm text-t-muted">Book this length</span>
                  </span>
                  <span className="font-semibold">{formatMoney(o.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-t-display text-xl">Included</h2>
              <ul className="mt-3 space-y-2">
                {t.includes.map((i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-t-accent" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-t-display text-xl">Good for</h2>
              <p className="mt-3 text-t-muted">{t.goodFor}</p>
            </div>
          </div>
        </div>
      </div>
      {more.length > 0 && (
        <section aria-labelledby="also" className="mt-24">
          <h2 id="also" className="font-t-display text-3xl">
            Also in {ritual.label.toLowerCase()}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {more.map((m) => (
              <li key={m.slug}>
                <Link href={href(`/treatments/${m.slug}`)} className="block rounded-[2rem] bg-t-surface p-7 hover:bg-t-soft">
                  <span className="block font-t-display text-2xl">{m.name}</span>
                  <span className="mt-2 block text-t-muted">{m.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
