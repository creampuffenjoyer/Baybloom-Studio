import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { photo, rooms } from "../content";
import { arch, href } from "../site";

export function RoomsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-16 pb-6 sm:px-8">
        <h1 className="font-tpl-display text-6xl italic sm:text-7xl">Rooms and suites</h1>
        <p className="mt-5 max-w-[56ch] text-lg text-tpl-muted">
          Twelve rooms, no two alike. Every stay includes breakfast in the courtyard, afternoon merienda and
          a guided walk of the old town.
        </p>
      </section>
      <div className="mx-auto max-w-7xl divide-y divide-tpl-line px-5 sm:px-8">
        {rooms.map((r, i) => {
          const [a, b] = r.photos.map(photo);
          return (
            <article key={r.slug} className="grid gap-10 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div className={`grid grid-cols-[1.4fr_1fr] items-end gap-4 ${i % 2 ? "lg:order-2" : ""}`}>
                <div className={`relative aspect-[3/4] overflow-hidden ${arch}`}>
                  <Image src={a.src} alt={a.alt} fill sizes="(min-width: 1024px) 28vw, 58vw" className="object-cover" />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={b.src} alt={b.alt} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
                </div>
              </div>
              <div>
                <h2 className="font-tpl-display text-5xl italic">{r.name}</h2>
                <p className="mt-4 max-w-[48ch] text-lg text-tpl-muted">{r.short}</p>
                <dl className="mt-6 grid max-w-md grid-cols-2 gap-y-3 text-[15px]">
                  <dt className="text-tpl-muted">Size</dt>
                  <dd>{r.size} m²</dd>
                  <dt className="text-tpl-muted">Bed</dt>
                  <dd>{r.bed}</dd>
                  <dt className="text-tpl-muted">Outlook</dt>
                  <dd>{r.outlook}</dd>
                  <dt className="text-tpl-muted">From</dt>
                  <dd>{formatMoney(r.price)} a night</dd>
                </dl>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link href={`${href("/book")}?room=${r.slug}`} className="bg-tpl-accent px-6 py-3.5 text-tpl-on-accent hover:bg-tpl-alt">
                    Check availability
                  </Link>
                  <Link href={href(`/rooms/${r.slug}`)} className="border-b border-tpl-ink pb-0.5">
                    Room details
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
