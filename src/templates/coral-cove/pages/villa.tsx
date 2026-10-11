import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "../../_kit/dates";
import { PhotoGrid } from "../components/photo-grid";
import { photo, villas } from "../content";
import { href, site } from "../site";

export function VillaPage({ slug }: { slug: string }) {
  const villa = villas.find((v) => v.slug === slug);
  if (!villa) notFound();
  const others = villas.filter((v) => v.slug !== slug);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
      <nav aria-label="Breadcrumb" className="text-sm text-tpl-muted">
        <Link href={href("/villas")} className="hover:text-tpl-ink hover:underline">
          Villas
        </Link>
        <span aria-hidden> / </span>
        <span aria-current="page">{villa.name}</span>
      </nav>
      <h1 className="mt-4 font-tpl-display text-5xl leading-[0.95] font-extrabold tracking-[-0.045em] [font-stretch:88%] sm:text-7xl">
        {villa.name}
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg text-tpl-muted sm:text-xl">{villa.short}</p>

      <div className="mt-10">
        <PhotoGrid photos={villa.photos.map(photo)} />
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="space-y-5 text-lg leading-relaxed">
            {villa.description.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <h2 className="mt-14 font-tpl-display text-3xl font-bold tracking-tight">In the villa</h2>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {villa.amenities.map((a) => (
              <li key={a} className="flex items-center gap-3">
                <span aria-hidden className="size-2 rounded-full bg-tpl-accent" />
                {a}
              </li>
            ))}
          </ul>
          <h2 className="mt-14 font-tpl-display text-3xl font-bold tracking-tight">Good to know</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-tpl-muted">Check-in</dt>
              <dd className="font-semibold">From {site.checkIn}</dd>
            </div>
            <div>
              <dt className="text-tpl-muted">Check-out</dt>
              <dd className="font-semibold">Until {site.checkOut}</dd>
            </div>
            <div>
              <dt className="text-tpl-muted">Beds</dt>
              <dd className="font-semibold">{villa.beds}</dd>
            </div>
          </dl>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-tpl-soft p-7">
            <p className="text-tpl-muted">Nightly rate from</p>
            <p className="font-tpl-display text-4xl font-bold tracking-tight">{formatMoney(villa.price)}</p>
            <p className="mt-1 text-sm text-tpl-muted">Breakfast included, taxes extra</p>
            <dl className="mt-6 space-y-2 border-t border-black/10 pt-5 text-[15px]">
              <div className="flex justify-between">
                <dt>Size</dt>
                <dd className="font-semibold">{villa.size} m²</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sleeps</dt>
                <dd className="font-semibold">Up to {villa.maxGuests}</dd>
              </div>
              <div className="flex justify-between">
                <dt>View</dt>
                <dd className="font-semibold">{villa.view}</dd>
              </div>
            </dl>
            <Link
              href={`${href("/book")}?room=${villa.slug}`}
              className="mt-7 block rounded-full bg-tpl-accent px-6 py-3.5 text-center text-lg font-bold text-tpl-on-accent"
            >
              Check dates
            </Link>
            <p className="mt-3 text-center text-sm text-tpl-muted">Free cancellation up to 14 days before arrival</p>
          </div>
        </aside>
      </div>

      <section aria-labelledby="more" className="mt-24">
        <h2 id="more" className="font-tpl-display text-3xl font-bold tracking-tight">
          Other villas
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {others.map((v) => {
            const p = photo(v.photos[0]);
            return (
              <li key={v.slug}>
                <Link href={href(`/villas/${v.slug}`)} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 font-tpl-display text-xl font-bold group-hover:underline">{v.name}</p>
                  <p className="text-tpl-muted">from {formatMoney(v.price)} a night</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
