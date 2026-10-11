import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "../../_kit/dates";
import { photo, rooms } from "../content";
import { arch, href, site } from "../site";

export function RoomPage({ slug }: { slug: string }) {
  const r = rooms.find((x) => x.slug === slug);
  if (!r) notFound();
  const [a, b, c] = r.photos.map(photo);

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-14 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <div className="lg:pt-10">
          <nav aria-label="Breadcrumb" className="text-[15px] text-tpl-muted">
            <Link href={href("/rooms")} className="hover:text-tpl-ink">
              Rooms
            </Link>
            {" / "}
            {r.name}
          </nav>
          <h1 className="mt-4 font-tpl-display text-6xl leading-none italic sm:text-7xl">{r.name}</h1>
          <div className="mt-8 max-w-[52ch] space-y-5 text-lg leading-relaxed text-tpl-muted">
            {r.description.map((d) => (
              <p key={d.slice(0, 16)}>{d}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-end gap-8 border-t border-tpl-line pt-8">
            <p>
              <span className="block text-sm text-tpl-muted">From</span>
              <span className="font-tpl-display text-4xl">{formatMoney(r.price)}</span>
              <span className="text-tpl-muted"> a night</span>
            </p>
            <Link href={`${href("/book")}?room=${r.slug}`} className="bg-tpl-accent px-6 py-3.5 text-tpl-on-accent hover:bg-tpl-alt">
              Check availability
            </Link>
          </div>
        </div>
        <div className={`relative aspect-[3/4] overflow-hidden ${arch}`}>
          <Image src={a.src} alt={a.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>
      <section className="mx-auto mt-20 grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-[1fr_1.5fr]">
        <div>
          <h2 className="font-tpl-display text-3xl italic">In the room</h2>
          <ul className="mt-5 space-y-3">
            {r.details.map((d) => (
              <li key={d} className="border-b border-tpl-line pb-3">
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] text-tpl-muted">
            Check-in from {site.checkIn}, check-out by {site.checkOut}. Sleeps up to {r.maxGuests}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[b, c].map((p) => (
            <div key={p.src} className="relative aspect-[3/4] overflow-hidden">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 30vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
