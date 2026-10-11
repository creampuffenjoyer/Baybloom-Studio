import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { photo, type Room } from "../content";
import { href } from "../site";

/** A stamp with a perforated edge, used for prices. */
export function Stamp({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block bg-tpl-bg p-1 shadow-sm [outline:5px_dotted_var(--t-bg)] [outline-offset:-2px] ${className}`}
    >
      <span className="block border-2 border-tpl-accent bg-tpl-soft px-3 py-1.5 text-center leading-tight text-tpl-accent">{children}</span>
    </span>
  );
}

/** A room shown as a postcard: photo on the front, a note and a stamp. */
export function Postcard({ room, tilt = 0 }: { room: Room; tilt?: number }) {
  const p = photo(room.photos[0]);
  return (
    <Link
      href={href(`/rooms/${room.slug}`)}
      className="group block bg-tpl-surface p-3 shadow-[0_20px_40px_-24px_rgb(34_48_63/0.45)] ring-1 ring-tpl-line transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
      style={{ rotate: `${tilt}deg` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        <Stamp className="absolute top-3 right-3 rotate-3">
          <span className="block text-[11px] font-semibold">from</span>
          <span className="block font-tpl-display text-lg">{formatMoney(room.price)}</span>
        </Stamp>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4 px-2 pt-4 pb-2">
        <div>
          <h3 className="font-tpl-display text-2xl">{room.name}</h3>
          <p className="mt-1 font-[family-name:var(--hh-hand)] text-2xl leading-tight text-tpl-muted">{room.postcard}</p>
        </div>
        <p className="self-end border-l border-dashed border-tpl-line pl-4 text-right text-sm text-tpl-muted">
          {room.bed}
          <br />
          {room.view}
        </p>
      </div>
    </Link>
  );
}
