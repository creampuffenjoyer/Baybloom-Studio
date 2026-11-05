"use client";

import { useBloomfield } from "../language";

import { useState } from "react";
import { LocalLink as Link } from "../language";

import { href } from "../site";

type Arrangement = "ceremony" | "dinner" | "standing";
export function SpaceFinder() {
  const { spaces, finder, language } = useBloomfield();
  const [guests, setGuests] = useState(100);
  const [arrangement, setArrangement] = useState<Arrangement>("ceremony");
  const matches = spaces.filter((space) => (space[arrangement] ?? 0) >= guests);
  return <section aria-labelledby="space-finder" className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
    <div className="rounded-[2rem] bg-tpl-soft p-6 sm:p-10">
      <h2 id="space-finder" className="font-tpl-display text-4xl italic">{finder?.title ?? "Find a space for your celebration"}</h2>
      <p className="mt-3 max-w-2xl text-tpl-muted">{finder?.intro ?? "Compare spaces by guest count and arrangement. Capacities are illustrative; ask the venue about your plans."}</p>
      <div className="mt-6 flex flex-wrap gap-6">
        <label className="grid gap-2">{finder?.guests ?? "Guests"}<input type="number" min={2} max={250} value={guests} onChange={(e) => setGuests(Math.max(2, Math.min(250, Number(e.target.value) || 2)))} className="w-28 rounded-xl bg-white px-4 py-3 ring-1 ring-tpl-line" /></label>
        <label className="grid gap-2">{finder?.arrangement ?? "Arrangement"}<select value={arrangement} onChange={(e) => setArrangement(e.target.value as Arrangement)} className="rounded-xl bg-white px-4 py-3 ring-1 ring-tpl-line"><option value="ceremony">{finder?.ceremony ?? "Ceremony"}</option><option value="dinner">{finder?.dinner ?? "Seated dinner"}</option><option value="standing">{finder?.standing ?? "Standing"}</option></select></label>
      </div>
      <p className="mt-6 text-sm text-tpl-muted" role="status">{matches.length ? language === "tl" ? `${matches.length} lugar ang angkop sa ayos na ito.` : language === "taglish" ? `${matches.length} spaces ang fit sa arrangement na ito.` : `${matches.length} ${matches.length === 1 ? "space fits" : "spaces fit"} this arrangement.` : finder?.noMatches ?? "No space matches this arrangement and guest count. Try another arrangement or fewer guests."}</p>
      <ul className="mt-5 grid gap-4 md:grid-cols-2">{matches.map((space) => <li key={space.slug} className="rounded-2xl bg-tpl-surface p-5"><h3 className="font-tpl-display text-3xl italic">{space.name}</h3><p className="mt-2 text-tpl-muted">{space.short}</p><p className="mt-3 text-sm">{finder?.capacity ?? "Capacity"}: {space[arrangement]} {language === "tl" ? "panauhin" : "guests"}</p><div className="mt-4 flex flex-wrap gap-5"><Link href={href(`/spaces/${space.slug}`)} className="underline underline-offset-4">{finder?.explore ?? "Explore space"}</Link><Link href={`${href("/inquire")}?space=${space.slug}&guests=${guests}`} className="underline underline-offset-4">{finder?.inquire ?? "Plan a sample inquiry"}</Link></div></li>)}</ul>
    </div>
  </section>;
}
