"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocalLink, usePine } from "../language";
import { CURRENCY, href } from "../site";
import { formatMoney } from "../../_kit/dates";

export function TripPlanner() {
  const { t, season, setSeason, seasons, activities, rooms, photo } = usePine();
  const params = useSearchParams();
  const [level, setLevel] = useState("any");
  const count = Number(params.get("guests"));
  const guests = Number.isInteger(count) && count >= 1 && count <= 6 ? count : 2;
  const activity = activities.find(a=>a.id===params.get("activity") && a.season===season);
  const shown = activities.filter(a=>a.season===season && (level==="any" || a.levelId===level));
  const matchingRooms = rooms.filter(r=>r.maxGuests>=guests);
  function select(key: string, value: string) {
    const url = new URL(location.href);
    if (key === "activity" && url.searchParams.get(key) === value) url.searchParams.delete(key);
    else url.searchParams.set(key,value);
    url.searchParams.set("season",season);
    window.history.replaceState(null,"",url);
  }
  return <section id="plan" aria-labelledby="plan-title" className="mt-10">
    <div className="rounded-md bg-tpl-deep p-6 text-tpl-on-deep sm:p-8">
      <h2 id="plan-title" className="font-tpl-display text-3xl font-bold">{t("Build your mountain trip")}</h2>
      <p className="mt-3 max-w-2xl text-tpl-on-deep/80">{t("Choose a season, find an activity and pick a room for your group. Activities are interests for a sample request, not reservations.")}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <label>{t("Season")}<select aria-label={t("Season")} value={season} onChange={e=>setSeason(e.target.value === "summer" ? "summer" : "winter")} className="mt-2 w-full rounded-md bg-tpl-surface px-3 py-3 text-tpl-ink"><option value="winter">{seasons.winter.label}</option><option value="summer">{seasons.summer.label}</option></select></label>
        <label>{t("Activity level")}<select aria-label={t("Activity level")} value={level} onChange={e=>setLevel(e.target.value)} className="mt-2 w-full rounded-md bg-tpl-surface px-3 py-3 text-tpl-ink">{[["any",t("Any level")],["easy",t("Easy")],["moderate",t("Moderate")],["strong",t("Strong skiers")],["all",t("All levels")]].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        <label>{t("Guests")}<select aria-label={t("Guests")} value={guests} onChange={e=>select("guests",e.target.value)} className="mt-2 w-full rounded-md bg-tpl-surface px-3 py-3 text-tpl-ink">{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
      </div>
      <p className="mt-4 text-sm">{t("Season:")} {seasons[season].months}. {t("Conditions and opening dates need confirmation with the lodge.")}</p>
    </div>
    <p role="status" className="mt-6 text-tpl-muted">{t("Matching activities:")} {shown.length}</p>
    {shown.length===0 ? <div className="my-6 border-y border-tpl-line py-6"><p>{t("No activities match this level in this season.")}</p><button onClick={()=>setLevel("any")} className="mt-3 font-bold underline underline-offset-4">{t("Show all levels")}</button></div> : <ul className="mt-6 divide-y divide-tpl-line">{shown.map(a=>{
      const p=photo(a.photo);
      return <li key={a.id} className="grid gap-6 py-8 md:grid-cols-[280px_1fr]">
        <div className="relative aspect-[3/2] overflow-hidden rounded-md"><Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 280px, 100vw" className="object-cover" /></div>
        <div><h3 className="font-tpl-display text-3xl font-bold">{a.name}</h3><p className="mt-2 max-w-2xl text-tpl-muted">{a.detail}</p><p className="mt-3 font-medium">{a.level} · {a.duration}</p>
          <button aria-pressed={activity?.id===a.id} onClick={()=>select("activity",a.id)} className="mt-5 rounded-md px-4 py-3 font-bold ring-1 ring-tpl-line aria-pressed:bg-tpl-accent aria-pressed:text-tpl-on-accent hover:ring-tpl-ink">{activity?.id===a.id ? t("Added to your plan") : t("Add to trip plan")}</button>
        </div>
      </li>;
    })}</ul>}
    <section aria-labelledby="fit-rooms" className="mt-12 border-t border-tpl-line pt-8">
      <h2 id="fit-rooms" className="font-tpl-display text-3xl font-bold">{t("Rooms for your group")}</h2>
      <p className="mt-3 text-tpl-muted">{activity ? `${t("Activity interest:")} ${activity.name}.` : t("You can choose an activity now or plan it later.")} {t("Room prices exclude activities and taxes.")}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{matchingRooms.map(r=>{
        const query=new URLSearchParams({room:r.slug,guests:String(guests),season});
        if(activity)query.set("activity",activity.id);
        return <article key={r.slug} className="rounded-md bg-tpl-surface p-6 ring-1 ring-tpl-line"><h3 className="font-tpl-display text-2xl font-bold">{r.name}</h3><p className="mt-2 text-tpl-muted">{r.beds} · {r.size} m²</p><p className="mt-3 font-bold">{formatMoney(r.price,CURRENCY)} {t("per night")}</p><div className="mt-5 flex flex-wrap gap-4"><LocalLink href={`${href(`/rooms/${r.slug}`)}?${query}`} className="py-2 font-semibold underline underline-offset-4">{t("View room")}</LocalLink><LocalLink href={`${href("/book")}?${query}`} className="rounded-md bg-tpl-accent px-4 py-2 font-bold text-tpl-on-accent">{t("Plan this stay")}</LocalLink></div></article>;
      })}</div>
    </section>
  </section>;
}
