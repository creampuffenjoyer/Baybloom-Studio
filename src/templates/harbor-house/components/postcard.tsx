"use client";

import { useHarbor } from "../language";

import { PlacementImage as Image } from "./placement-image";
import { LocalLink as Link } from "../language";
import { formatMoney } from "../../_kit/dates";
import { type Room } from "../content";
import { href } from "../site";
import { usePersonalization } from "../personalization";

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
export function Postcard({ room, tilt = 0, placement }: { room: Room; tilt?: number; placement: string }) {
  const { t, photo } = useHarbor();
  const { roomPhotos, websitePhotos } = usePersonalization();
  const p = photo(room.photos[0]);
  const libraryPhoto = websitePhotos?.[room.photos[0]];
  const customPhoto = libraryPhoto || roomPhotos?.[room.slug];
  return (
    <Link
      href={href(`/rooms/${room.slug}`)}
      className="group block bg-tpl-surface p-3 shadow-[0_4px_16px_rgb(0_0_0/0.08)] ring-1 ring-tpl-line focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-ink"
      style={{ rotate: `${tilt}deg` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image placement={placement} src={customPhoto || p.src} alt={libraryPhoto ? p.alt : customPhoto ? `${room.name} room photo` : p.alt} unoptimized={(customPhoto || p.src).startsWith("blob:") || (customPhoto || p.src).startsWith("/api/personalization/")} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        <Stamp className="absolute top-3 right-3 rotate-3">
          <span className="block text-[11px] font-semibold">{t("from")}</span>
          <span className="block font-tpl-display text-lg tabular-nums">{formatMoney(room.price)}</span>
        </Stamp>
      </div>
      <div className="grid grid-cols-1 gap-4 px-2 pt-4 pb-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h3 className="font-tpl-display text-2xl group-hover:underline underline-offset-4">{room.name}</h3>
          <p className="mt-1 font-[family-name:var(--hh-hand)] text-2xl leading-tight text-tpl-muted">{room.postcard}</p>
        </div>
        <p className="self-end border-t border-dashed border-tpl-line pt-3 text-sm text-tpl-muted sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 sm:text-right">
          {room.bed}
          <br />
          {room.view}
        </p>
      </div>
    </Link>
  );
}
