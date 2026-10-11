import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "../../_kit/dates";
import { Stamp } from "../components/postcard";
import { photo, rooms } from "../content";
import { href } from "../site";

export function RoomPage({ slug }: { slug: string }) {
  const r = rooms.find((x) => x.slug === slug);
  if (!r) notFound();
  const [a, b, c] = r.photos.map(photo);
  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
      <Link href={href("/rooms")} className="text-[15px] font-semibold text-tpl-muted hover:text-tpl-ink">
        ← All rooms
      </Link>
      <div className="mt-6 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={a.src} alt={a.alt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[b, c].map((p) => (
              <div key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 27vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h1 className="font-tpl-display text-5xl leading-tight">{r.name}</h1>
          <p className="mt-2 font-[family-name:var(--hh-hand)] text-3xl text-tpl-muted">{r.postcard}</p>
          <div className="mt-6 space-y-4 text-lg leading-relaxed">
            {r.description.map((d) => (
              <p key={d.slice(0, 16)}>{d}</p>
            ))}
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[r.bed, r.view, `Sleeps ${r.maxGuests}`, ...r.little].map((x) => (
              <li key={x} className="rounded-full bg-tpl-surface px-3 py-1.5 text-sm ring-1 ring-tpl-line">
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center gap-6">
            <Stamp className="-rotate-3">
              <span className="block text-[11px] font-semibold">per night</span>
              <span className="block font-tpl-display text-2xl">{formatMoney(r.price)}</span>
            </Stamp>
            <Link href={`${href("/book")}?room=${r.slug}`} className="rounded-full bg-tpl-accent px-6 py-3 font-bold text-tpl-on-accent">
              Check dates for this room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
