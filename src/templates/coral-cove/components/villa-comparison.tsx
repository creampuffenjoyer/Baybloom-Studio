"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocalLink, useCoral } from "../language";
import { href } from "../site";
import { formatMoney } from "../../_kit/dates";
import { useClientToday } from "../../_kit/use-today";
import { validStay } from "../stay-plan";

export function VillaComparison() {
  const { t, villas } = useCoral();
  const params = useSearchParams();
  const today = useClientToday();
  const [guests, setGuests] = useState(() => {
    const count = Number(params.get("guests"));
    return Number.isInteger(count) && count >= 1 && count <= 5 ? count : 2;
  });
  const [pool, setPool] = useState("all");
  const [start, setStart] = useState(params.get("checkin") ?? "");
  const [end, setEnd] = useState(params.get("checkout") ?? "");
  const matches = villas.filter(v => v.maxGuests >= guests && (pool === "all" || v.pool === pool));
  const invalid = !!(start || end) && !validStay(start, end, today);
  const field = "mt-2 w-full min-w-0 rounded-xl border border-tpl-line bg-white px-3 py-3 text-base";
  const poolLabel = (kind: string) => kind === "private" ? t("Private pool") : kind === "shared" ? t("Shared pool") : t("No pool");
  return <section id="compare" aria-labelledby="compare-heading" className="bg-tpl-soft py-14 scroll-mt-24">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-tpl-accent">{t("Find your island stay")}</p>
      <h2 id="compare-heading" className="mt-3 font-tpl-display text-4xl font-bold tracking-tight">{t("Compare villas")}</h2>
      <p className="mt-3 max-w-2xl text-tpl-muted">{t("Compare space, pools and nightly rates. Add dates to carry your plan into the sample booking.")}</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="min-w-0 font-semibold">{t("Guests")}<select value={guests} onChange={e=>setGuests(Number(e.target.value))} className={field}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
        <label className="min-w-0 font-semibold">{t("Pool preference")}<select value={pool} onChange={e=>setPool(e.target.value)} className={field}><option value="all">{t("Any pool")}</option>{["private","shared","none"].map(k=><option key={k} value={k}>{poolLabel(k)}</option>)}</select></label>
        <label className="min-w-0 font-semibold">{t("Arrive")}<input type="date" value={start} min={today ?? undefined} onChange={e=>setStart(e.target.value)} className={field} aria-describedby={invalid ? "compare-dates" : undefined}/></label>
        <label className="min-w-0 font-semibold">{t("Leave")}<input type="date" value={end} min={start || today || undefined} onChange={e=>setEnd(e.target.value)} className={field} aria-describedby={invalid ? "compare-dates" : undefined}/></label>
      </div>
      {invalid && <p id="compare-dates" role="alert" className="mt-3 text-tpl-accent">{t("Choose future arrival and departure dates, for a stay of 1–30 nights.")}</p>}
      <p role="status" className="mt-6 text-sm text-tpl-muted">{t("Villas matching your preferences:")} {matches.length}. {t("Availability is simulated; matching capacity does not reserve a villa.")}</p>
      {matches.length === 0 ? <div className="mt-6 border-t border-tpl-line py-6"><p>{t("No villas match. Try another pool preference or fewer guests.")}</p><button onClick={()=>{setPool("all");setGuests(2);}} className="mt-3 font-semibold underline underline-offset-4">{t("Reset filters")}</button></div> :
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{matches.map(v=>{
          const query = new URLSearchParams({room:v.slug, guests:String(guests)});
          if (validStay(start,end,today)) {query.set("checkin",start); query.set("checkout",end);}
          return <article key={v.slug} className="flex flex-col rounded-2xl bg-white p-6">
            <h3 className="font-tpl-display text-2xl font-bold tracking-tight">{v.name}</h3>
            <p className="mt-3 text-2xl font-bold">{formatMoney(v.price)} <span className="text-sm font-normal text-tpl-muted">{t("per night")}</span></p>
            <dl className="my-5 divide-y divide-tpl-line text-sm">{[[t("Size"),`${v.size} m²`],[t("Sleeps"),String(v.maxGuests)],[t("Beds"),v.beds],[t("View"),v.view],[t("Pool"),poolLabel(v.pool)]].map(([label,value])=><div key={label} className="flex justify-between gap-4 py-3"><dt className="text-tpl-muted">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl>
            <LocalLink href={href(`/villas/${v.slug}`)} className="mt-auto font-semibold underline underline-offset-4">{t("View villa")}</LocalLink>
            {invalid ? <p className="mt-4 text-sm text-tpl-muted">{t("Complete your dates above to plan this stay.")}</p> : <LocalLink href={`${href("/book")}?${query}`} className="mt-4 rounded-full bg-tpl-deep px-4 py-3 text-center font-semibold text-white">{t("Plan this stay")}</LocalLink>}
          </article>;
        })}</div>}
      <p className="mt-5 text-sm text-tpl-muted">{t("Sample nightly rates include breakfast. Taxes and service fees are excluded.")}</p>
    </div>
  </section>;
}
