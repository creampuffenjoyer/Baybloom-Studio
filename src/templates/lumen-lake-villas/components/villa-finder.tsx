"use client";
import { usePersonalization } from "../personalization";
import { PlacementImage as Image } from "./placement-image";
import { useState } from "react";
import { formatMoney } from "../../_kit/dates";
import { CURRENCY, href } from "../site";
import { LocalLink, useLumen } from "../language";

export function VillaFinder() {
  const { villas, photo, t } = useLumen();
  const [guests, setGuests] = useState(2);
  const { photoEditing } = usePersonalization();
  const fits = photoEditing ? villas : villas.filter((villa) => villa.maxGuests >= guests);
  return <section aria-labelledby="villa-finder-title" className="mt-12 border-y border-tpl-line py-7">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><h2 id="villa-finder-title" className="font-tpl-display text-3xl">{t("Find a villa for your group")}</h2><p className="mt-2 text-sm text-tpl-muted">{t("Showing villas for")} {guests} {t(guests === 1 ? "guest" : "guests")}</p></div>
      <label className="flex items-center gap-3 text-sm">{t("How many guests?")}<select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="border-b border-tpl-line bg-tpl-bg px-2 py-2"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></label>
    </div>
    {fits.length ? <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{fits.map((villa) => { const image = photo(villa.photos[0]); return <li key={villa.slug} className="border border-tpl-line"><LocalLink href={href(`/villas/${villa.slug}`)} className="group block"><div className="relative aspect-[4/3]"><Image placement={`villas.finder.${villa.slug}`} src={image.src} alt={image.alt} unoptimized={image.src.startsWith("blob:") || image.src.startsWith("/api/personalization/")} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /></div><div className="p-4"><h3 className="font-tpl-display text-2xl group-hover:underline">{villa.name}</h3><p className="mt-1 text-sm text-tpl-muted">{t("Sleeps")} {villa.maxGuests} · {formatMoney(villa.price, CURRENCY)} / night</p><span className="mt-4 inline-block border-b border-tpl-ink pb-0.5 text-sm">{t("View villa")}</span></div></LocalLink></li>; })}</ul> : <p className="mt-6 text-sm text-tpl-muted">{t("No villa fits that group. Try fewer guests.")}</p>}
  </section>;
}
