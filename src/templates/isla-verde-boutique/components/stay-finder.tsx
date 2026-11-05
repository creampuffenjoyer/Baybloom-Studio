"use client";

import { useIsla } from "../language";

import { useState } from "react";
import { LocalLink as Link } from "../language";
import { href } from "../site";
import { formatMoney } from "../../_kit/dates";

const settings = ["Any setting", "Historic street", "Courtyard", "Private pool"] as const;
const settingByRoom: Record<string, typeof settings[number]> = { "casa-room": "Historic street", "mansion-suite": "Historic street", "courtyard-suite": "Courtyard", "pool-suite": "Private pool" };

export function StayFinder() {
  const { t, rooms } = useIsla();
  const [guests, setGuests] = useState(2);
  const [setting, setSetting] = useState<string>(settings[0]);
  const matches = rooms.filter((room) => room.maxGuests >= guests && (setting === settings[0] || settingByRoom[room.slug] === setting));
  return <section aria-labelledby="stay-finder" className="mx-auto my-12 max-w-7xl px-5 sm:px-8">
    <div className="border-y border-tpl-line py-8">
      <h2 id="stay-finder" className="font-tpl-display text-4xl italic">{t("Find your place in the house")}</h2>
      <p className="mt-3 max-w-2xl text-tpl-muted">{t("Wake above the old town, settle into the courtyard, or choose a pool of your own. Match the setting to your stay.")}</p>
      <div className="my-6 flex flex-wrap gap-6">
        <label className="grid gap-2 text-sm">{t("Guests")}<select className="border-b border-tpl-line bg-tpl-bg px-3 py-3" value={guests} onChange={(event) => setGuests(Number(event.target.value))}>{[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <label className="grid gap-2 text-sm">{t("Your preferred setting")}<select className="max-w-full border-b border-tpl-line bg-tpl-bg px-3 py-3" value={setting} onChange={(event) => setSetting(event.target.value)}>{settings.map((value) => <option key={value} value={value}>{t(value)}</option>)}</select></label>
      </div>
      <p role="status" className="text-sm text-tpl-muted">{matches.length ? t("{n} room styles fit your group. Dates and availability are illustrative.", { n: matches.length }) : t("No room fits both choices. Try another setting or a smaller group.")}</p>
      {!matches.length && <button type="button" className="mt-3 underline underline-offset-4" onClick={() => { setSetting(settings[0]); setGuests(2); }}>{t("Reset preferences")}</button>}
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">{matches.map((room) => <li key={room.slug} className="border-t border-tpl-line pt-5">
        <h3 className="font-tpl-display text-3xl italic">{room.name}</h3><p className="mt-2 text-tpl-muted">{room.short}</p>
        <p className="mt-3 text-sm">{t("Up to ")}{room.maxGuests}{t(" guests · ")}{room.size}{t(" m² · From ")}{formatMoney(room.price)}{t(" / night")}</p>
        <div className="mt-4 flex flex-wrap gap-5"><Link href={href(`/rooms/${room.slug}`)} className="underline underline-offset-4">{t("Explore the room")}</Link><Link href={`${href("/book")}?room=${room.slug}&guests=${guests}`} className="underline underline-offset-4">{t("Plan a sample stay")}</Link></div>
      </li>)}</ul>
    </div>
  </section>;
}
