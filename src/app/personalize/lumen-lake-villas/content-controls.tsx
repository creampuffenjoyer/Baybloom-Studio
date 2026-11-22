"use client";
import { useState } from "react";
import type { LumenDraft } from "@/lib/personalization/harbor-draft";
import { villas, experiences } from "@/templates/lumen-lake-villas/content";
import { LUMEN_COPY_KEYS } from "@/lib/personalization/lumen-copy-keys";

const fieldClass = "mt-1 w-full rounded-lg border border-[#c9d1cf] bg-white px-3 py-2 text-sm text-[#203b3b]";
const villaKeys = ["shore-villa", "garden-villa", "family-villa", "boathouse"] as const;
const experienceKeys = ["kayak", "cruise", "dinner", "sauna"] as const;
export function LumenContentControls({ draft, onChange, preview }: { draft: LumenDraft; onChange: (draft: LumenDraft) => void; preview: (page: string) => void }) {
  const [villa, setVilla] = useState<(typeof villaKeys)[number]>(villaKeys[0]);
  const [experience, setExperience] = useState<(typeof experienceKeys)[number]>(experienceKeys[0]);
  const [extra, setExtra] = useState<"breakfast" | "sauna" | "transfer">("breakfast");
  const [copySearch, setCopySearch] = useState("");
  const [copyKey, setCopyKey] = useState<string>(LUMEN_COPY_KEYS[0]);
  const matchingCopy = LUMEN_COPY_KEYS.filter((item) => item.toLowerCase().includes(copySearch.toLowerCase()));
  function villaChange(field: "name" | "line" | "description" | "price" | "size" | "maxGuests" | "bedrooms" | "setting" | "jetty" | "sauna", value: string | number | boolean | undefined) {
    onChange({ ...draft, lumenVillas: { ...draft.lumenVillas, [villa]: { ...draft.lumenVillas?.[villa], [field]: value === "" ? undefined : value } } });
  }
  function experienceChange(field: "name" | "when" | "price" | "text", value: string) {
    onChange({ ...draft, lumenExperiences: { ...draft.lumenExperiences, [experience]: { ...draft.lumenExperiences?.[experience], [field]: value || undefined } } });
  }
  return <>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">More website wording</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Find wording<input className={fieldClass} value={copySearch} onChange={(event) => { const value = event.target.value; setCopySearch(value); const match = LUMEN_COPY_KEYS.find((item) => item.toLowerCase().includes(value.toLowerCase())); if (match) setCopyKey(match); }} placeholder="Search the original text" /></label>
      {matchingCopy.length ? <><label className="block text-sm font-semibold">Original wording<select aria-label="Original wording" className={fieldClass} value={copyKey} onChange={(event) => setCopyKey(event.target.value)}>{matchingCopy.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><p className="text-xs leading-5">Original: {copyKey}</p><label className="block text-sm font-semibold">Replacement wording<textarea className={fieldClass} maxLength={500} rows={3} value={draft.lumenCopy?.[copyKey] ?? ""} onChange={(event) => { const value = event.target.value; const lumenCopy = { ...draft.lumenCopy }; if (value) lumenCopy[copyKey] = value; else delete lumenCopy[copyKey]; onChange({ ...draft, lumenCopy: Object.keys(lumenCopy).length ? lumenCopy : undefined }); }} /></label></> : <p className="text-sm">No matching wording found.</p>}
      <p className="text-xs leading-5">This changes matching interface text wherever it appears. It does not change booking rules or translate your wording. Leave blank to retain the original.</p>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Villa content</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Villa<select aria-label="Villa" className={fieldClass} value={villa} onChange={(event) => { const value = event.target.value as typeof villa; setVilla(value); preview(value); }}>{villaKeys.map(key => <option key={key} value={key}>{villas.find(item => item.slug === key)?.name}</option>)}</select></label>
      {([ ["name", "Villa name", 120], ["line", "Short description", 500], ["description", "Villa description", 1600] ] as const).map(([field, label, max]) => <label key={field} className="block text-sm font-semibold">{label}<textarea className={fieldClass} rows={field === "description" ? 4 : 2} maxLength={max} value={draft.lumenVillas?.[villa]?.[field] ?? ""} onChange={(event) => villaChange(field, event.target.value)} /></label>)}
      <p className="text-xs leading-5">Enter one description paragraph per line. Blank fields retain the original.</p>
      {([ ["price", "Nightly price (SEK)", 0, 10000000], ["size", "Size (m²)", 1, 100000], ["maxGuests", "Maximum guests", 1, 5], ["bedrooms", "Bedrooms", 1, 20] ] as const).map(([field, label, min, max]) => <label key={field} className="block text-sm font-semibold">{label}<input className={fieldClass} type="number" min={min} max={max} step={1} value={draft.lumenVillas?.[villa]?.[field] ?? ""} onChange={(event) => villaChange(field, event.target.value === "" ? undefined : Number(event.target.value))} /></label>)}
      <label className="block text-sm font-semibold">Setting<select aria-label="Villa setting" className={fieldClass} value={draft.lumenVillas?.[villa]?.setting ?? ""} onChange={(event) => villaChange("setting", event.target.value || undefined)}><option value="">Use original</option><option value="Waterfront">Waterfront</option><option value="Garden">Garden</option><option value="Over water">Over water</option></select></label>
      {([ ["jetty", "Private jetty"], ["sauna", "Sauna"] ] as const).map(([field, label]) => <label key={field} className="block text-sm font-semibold">{label}<select aria-label={label} className={fieldClass} value={draft.lumenVillas?.[villa]?.[field] === undefined ? "original" : draft.lumenVillas[villa]?.[field] ? "yes" : "no"} onChange={(event) => villaChange(field, event.target.value === "original" ? undefined : event.target.value === "yes")}><option value="original">Use original</option><option value="yes">Yes</option><option value="no">No</option></select></label>)}
      <p className="text-xs leading-5">The sample villa finder and booking accept up to five guests.</p>
      <button type="button" className="text-sm underline" onClick={() => preview(villa)}>Preview villa</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Experiences content</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Experience<select aria-label="Experience" className={fieldClass} value={experience} onChange={(event) => { setExperience(event.target.value as typeof experience); preview("experiences"); }}>{experienceKeys.map(key => <option key={key} value={key}>{experiences.find(item => item.slug === key)?.name}</option>)}</select></label>
      {([ ["name", "Experience name", 120], ["when", "Experience schedule", 120], ["price", "Experience price", 120], ["text", "Experience description", 500] ] as const).map(([field, label, max]) => <label key={field} className="block text-sm font-semibold">{label}<textarea className={fieldClass} rows={field === "text" ? 4 : 2} maxLength={max} value={draft.lumenExperiences?.[experience]?.[field] ?? ""} onChange={(event) => experienceChange(field, event.target.value)} /></label>)}
      <p className="text-xs leading-5">Experience prices and schedules are display text; no service is reserved.</p><button type="button" className="text-sm underline" onClick={() => preview("experiences")}>Preview experiences</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Sample booking extras</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Booking extra<select aria-label="Booking extra" className={fieldClass} value={extra} onChange={(event) => { setExtra(event.target.value as typeof extra); preview("book"); }}><option value="breakfast">Breakfast</option><option value="sauna">Sauna</option><option value="transfer">Transfer</option></select></label>
      <label className="block text-sm font-semibold">Extra name<input className={fieldClass} maxLength={120} value={draft.lumenExtras?.[extra]?.name ?? ""} onChange={(event) => onChange({ ...draft, lumenExtras: { ...draft.lumenExtras, [extra]: { ...draft.lumenExtras?.[extra], name: event.target.value || undefined } } })} /></label>
      <label className="block text-sm font-semibold">Extra price (SEK)<input className={fieldClass} type="number" min={0} max={10000000} step={1} value={draft.lumenExtras?.[extra]?.price ?? ""} onChange={(event) => onChange({ ...draft, lumenExtras: { ...draft.lumenExtras, [extra]: { ...draft.lumenExtras?.[extra], price: event.target.value === "" ? undefined : Number(event.target.value) } } })} /></label>
      <p className="text-xs leading-5">The sample estimate uses these prices with the original per-person or per-stay calculation. No reservation is created.</p><button type="button" className="text-sm underline" onClick={() => preview("book")}>Preview sample booking</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Stay times and tour</summary><div className="mt-4 space-y-4">
      {([ ["checkIn", "Check-in time"], ["checkOut", "Check-out time"] ] as const).map(([field, label]) => <label key={field} className="block text-sm font-semibold">{label}<input className={fieldClass} maxLength={120} value={draft.lumenStayTimes?.[field] ?? ""} onChange={(event) => onChange({ ...draft, lumenStayTimes: { ...draft.lumenStayTimes, [field]: event.target.value || undefined } })} /></label>)}
      {([ ["jetty", "Jetty scene name"], ["shore", "Shore scene name"], ["sauna", "Sauna scene name"], ["boathouse", "Boathouse scene name"] ] as const).map(([field, label]) => <label key={field} className="block text-sm font-semibold">{label}<input className={fieldClass} maxLength={120} value={draft.lumenTour?.[field] ?? ""} onChange={(event) => onChange({ ...draft, lumenTour: { ...draft.lumenTour, [field]: event.target.value || undefined } })} /></label>)}
      <button type="button" className="text-sm underline" onClick={() => preview("tour")}>Preview virtual tour</button>
    </div></details>
  </>;
}
