"use client";

import { useStillWater } from "../language";
import { useState } from "react";
import { LocalLink as Link } from "../language";
import { formatMoney } from "../../_kit/dates";
import { RITUALS, type Ritual } from "../content";
import { href } from "../site";
import { findTreatments } from "../treatment-search";

export function TreatmentFinder() {
  const { treatments, t } = useStillWater();
  const [ritual, setRitual] = useState<Ritual | "all">("all");
  const [duration, setDuration] = useState("all");
  const durations = [...new Set(treatments.flatMap((treatment) => treatment.options.map((option) => option.minutes)))].sort((a, b) => a - b);
  const matches = findTreatments(treatments, ritual, duration === "all" ? null : Number(duration));
  return <section aria-labelledby="treatment-finder" className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><div className="rounded-[2rem] bg-tpl-soft p-6 sm:p-10">
    <h2 id="treatment-finder" className="font-tpl-display text-4xl">{t("Find time for yourself")}</h2>
    <p className="mt-3 max-w-2xl text-tpl-muted">{t("Explore treatments by type and duration. Discuss your preferences and any health concerns with the spa before booking.")}</p>
    <div className="mt-6 flex flex-wrap gap-5"><label className="grid gap-2 text-sm">{t("Treatment type")}<select value={ritual} onChange={(e) => setRitual(e.target.value as Ritual | "all")} className="rounded-xl bg-tpl-surface px-4 py-3"><option value="all">{t("All treatments")}</option>{RITUALS.map((r) => <option key={r.id} value={r.id}>{t(r.label)}</option>)}</select></label><label className="grid gap-2 text-sm">{t("Duration")}<select value={duration} onChange={(e) => setDuration(e.target.value)} className="rounded-xl bg-tpl-surface px-4 py-3"><option value="all">{t("Any duration")}</option>{durations.map((n) => <option key={n} value={n}>{n}{" "}{t("minutes")}</option>)}</select></label></div>
    <p role="status" className="mt-6 text-sm text-tpl-muted">{matches.length ? t("{n} treatments match your choices.", { n: matches.length }) : t("No treatment matches. Try another type or duration.")}</p>
    <ul className="mt-5 grid gap-4 md:grid-cols-2">{matches.map((item) => <li key={item.slug} className="rounded-2xl bg-tpl-surface p-5"><h3 className="font-tpl-display text-2xl">{item.name}</h3><p className="mt-2 text-tpl-muted">{item.summary}</p><div className="mt-4 flex flex-wrap gap-4"><Link className="underline underline-offset-4" href={href(`/treatments/${item.slug}`)}>{t("Treatment details")}</Link>{item.options.filter((o) => duration === "all" || o.minutes === Number(duration)).map((o) => <Link key={o.minutes} className="underline underline-offset-4" href={`${href("/book")}?treatment=${item.slug}&minutes=${o.minutes}`}>{t("Sample booking")}: {o.minutes} {t("min")} · {formatMoney(o.price)}{item.forTwo ? ` ${t("for two")}` : ""}</Link>)}</div></li>)}</ul>
  </div></section>;
}
