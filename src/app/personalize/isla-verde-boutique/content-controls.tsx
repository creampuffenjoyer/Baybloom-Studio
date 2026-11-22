"use client";
import { useState } from "react";
import type { IslaDraft } from "@/lib/personalization/harbor-draft";
import { rooms, posts, menuHighlights, eventSpaces } from "@/templates/isla-verde-boutique/content";
import { ISLA_COPY_KEYS } from "@/lib/personalization/isla-copy-keys";

const cls = "mt-1 w-full rounded-lg border border-[#c9d1cf] bg-white px-3 py-2 text-sm text-[#203b3b]";
const roomKeys = ["casa-room", "courtyard-suite", "pool-suite", "mansion-suite"] as const;
const postKeys = ["a-morning-on-calle-crisologo", "restoring-the-capiz-windows", "the-longganisa-question"] as const;
const indexKeys = ["first", "second", "third", "fourth", "fifth"] as const;
const spaceKeys = ["first", "second", "third"] as const;
export function IslaContentControls({ draft, onChange, preview }: { draft: IslaDraft; onChange: (draft: IslaDraft) => void; preview: (page: string) => void }) {
  const [room, setRoom] = useState<(typeof roomKeys)[number]>(roomKeys[0]);
  const [post, setPost] = useState<(typeof postKeys)[number]>(postKeys[0]);
  const [dish, setDish] = useState<(typeof indexKeys)[number]>(indexKeys[0]);
  const [space, setSpace] = useState<(typeof spaceKeys)[number]>(spaceKeys[0]);
  const [extra, setExtra] = useState<"airport" | "kalesa" | "dinner">("airport");
  const [chapter, setChapter] = useState<(typeof indexKeys)[number]>("first");
  const [copySearch, setCopySearch] = useState("");
  const [copyKey, setCopyKey] = useState<string>(ISLA_COPY_KEYS[0]);
  const matchingCopy = ISLA_COPY_KEYS.filter((item) => item.toLowerCase().includes(copySearch.toLowerCase()));
  const select = (label: string, value: string, change: (value: string) => void, options: readonly { key: string; name: string }[]) => <label className="block text-sm font-semibold">{label}<select aria-label={label} className={cls} value={value} onChange={(event) => change(event.target.value)}>{options.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}</select></label>;
  const text = (label: string, value: string | undefined, max: number, change: (value: string) => void) => <label className="block text-sm font-semibold">{label}<textarea className={cls} rows={max > 120 ? 3 : 2} maxLength={max} value={value ?? ""} onChange={(event) => change(event.target.value)} /></label>;
  const number = (label: string, value: number | undefined, min: number, max: number, change: (value: number | undefined) => void) => <label className="block text-sm font-semibold">{label}<input className={cls} type="number" min={min} max={max} step={1} value={value ?? ""} onChange={(event) => change(event.target.value === "" ? undefined : Number(event.target.value))} /></label>;
  return <>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">More website wording</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Find wording<input className={cls} value={copySearch} onChange={(event) => { const value = event.target.value; setCopySearch(value); const match = ISLA_COPY_KEYS.find((item) => item.toLowerCase().includes(value.toLowerCase())); if (match) setCopyKey(match); }} placeholder="Search the original text" /></label>
      {matchingCopy.length ? <><label className="block text-sm font-semibold">Original wording<select aria-label="Original wording" className={cls} value={copyKey} onChange={(event) => setCopyKey(event.target.value)}>{matchingCopy.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><p className="text-xs leading-5">Original: {copyKey}</p>{text("Replacement wording", draft.islaCopy?.[copyKey], 500, value => { const islaCopy = { ...draft.islaCopy }; if (value) islaCopy[copyKey] = value; else delete islaCopy[copyKey]; onChange({ ...draft, islaCopy: Object.keys(islaCopy).length ? islaCopy : undefined }); })}</> : <p className="text-sm">No matching wording found.</p>}
      <p className="text-xs leading-5">This changes matching interface text wherever it appears, without changing booking rules or translating your wording. Keep placeholders such as {"{n}"} if needed.</p>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Room content</summary><div className="mt-4 space-y-4">
      {select("Room", room, value => { setRoom(value as typeof room); preview(value); }, roomKeys.map(key => ({ key, name: rooms.find(item => item.slug === key)!.name })))}
      {([ ["name", "Room name", 120], ["short", "Short description", 500], ["description", "Room description", 1600], ["bed", "Bed", 120], ["outlook", "Outlook", 120], ["details", "Room details", 1200] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.islaRooms?.[room]?.[field], max, value => onChange({ ...draft, islaRooms: { ...draft.islaRooms, [room]: { ...draft.islaRooms?.[room], [field]: value || undefined } } }))}</div>)}
      <p className="text-xs leading-5">Enter description paragraphs and room details on separate lines. Blank fields retain the original.</p>
      {([ ["price", "Nightly price (PHP)", 0, 10000000], ["size", "Size (m²)", 1, 100000], ["maxGuests", "Maximum guests", 1, 4] ] as const).map(([field, label, min, max]) => <div key={field}>{number(label, draft.islaRooms?.[room]?.[field], min, max, value => onChange({ ...draft, islaRooms: { ...draft.islaRooms, [room]: { ...draft.islaRooms?.[room], [field]: value } } }))}</div>)}
      <p className="text-xs leading-5">The sample booking supports up to four guests. Room setting filters keep their original categories.</p><button type="button" className="text-sm underline" onClick={() => preview(room)}>Preview room</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Dining highlights</summary><div className="mt-4 space-y-4">
      {select("Dish", dish, value => { setDish(value as typeof dish); preview("dining"); }, indexKeys.map((key, index) => ({ key, name: menuHighlights[index].name })))}
      {([ ["name", "Dish name", 120], ["detail", "Dish description", 500] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.islaMenu?.[dish]?.[field], max, value => onChange({ ...draft, islaMenu: { ...draft.islaMenu, [dish]: { ...draft.islaMenu?.[dish], [field]: value || undefined } } }))}</div>)}
      <button type="button" className="text-sm underline" onClick={() => preview("dining")}>Preview dining</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Event spaces</summary><div className="mt-4 space-y-4">
      {select("Event space", space, value => { setSpace(value as typeof space); preview("events"); }, spaceKeys.map((key, index) => ({ key, name: eventSpaces[index].name })))}
      {([ ["name", "Space name", 120], ["capacity", "Capacity", 120], ["note", "Space description", 500] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.islaSpaces?.[space]?.[field], max, value => onChange({ ...draft, islaSpaces: { ...draft.islaSpaces, [space]: { ...draft.islaSpaces?.[space], [field]: value || undefined } } }))}</div>)}
      <p className="text-xs leading-5">Capacity is display text; event inquiries remain samples.</p><button type="button" className="text-sm underline" onClick={() => preview("events")}>Preview events</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Journal content</summary><div className="mt-4 space-y-4">
      {select("Journal article", post, value => { setPost(value as typeof post); preview(value); }, postKeys.map(key => ({ key, name: posts.find(item => item.slug === key)!.title })))}
      {([ ["title", "Article title", 120], ["dek", "Article summary", 500], ["body", "Article text", 3000] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.islaPosts?.[post]?.[field], max, value => onChange({ ...draft, islaPosts: { ...draft.islaPosts, [post]: { ...draft.islaPosts?.[post], [field]: value || undefined } } }))}</div>)}
      <label className="block text-sm font-semibold">Article date<input type="date" className={cls} value={draft.islaPosts?.[post]?.date ?? ""} onChange={(event) => onChange({ ...draft, islaPosts: { ...draft.islaPosts, [post]: { ...draft.islaPosts?.[post], date: event.target.value || undefined } } })} /></label>
      {number("Reading time (minutes)", draft.islaPosts?.[post]?.minutes, 1, 1000, value => onChange({ ...draft, islaPosts: { ...draft.islaPosts, [post]: { ...draft.islaPosts?.[post], minutes: value } } }))}
      <p className="text-xs leading-5">Enter one article paragraph per line.</p><button type="button" className="text-sm underline" onClick={() => preview(post)}>Preview article</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">House story</summary><div className="mt-4 space-y-4">
      {text("Home page story year", draft.islaStory?.foundingYear, 120, value => onChange({ ...draft, islaStory: { ...draft.islaStory, foundingYear: value || undefined } }))}
      {select("Timeline entry", chapter, value => { setChapter(value as typeof chapter); preview("story"); }, indexKeys.map((key, index) => ({ key, name: `Entry ${index + 1}` })))}
      {([ ["year", "Timeline year", 120], ["text", "Timeline description", 500] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.islaStory?.chapters?.[chapter]?.[field], max, value => onChange({ ...draft, islaStory: { ...draft.islaStory, chapters: { ...draft.islaStory?.chapters, [chapter]: { ...draft.islaStory?.chapters?.[chapter], [field]: value || undefined } } } }))}</div>)}
      <p className="text-xs leading-5">Blank fields retain the example timeline. Edit the story introduction under More website wording.</p><button type="button" className="text-sm underline" onClick={() => preview("story")}>Preview story</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Sample booking extras</summary><div className="mt-4 space-y-4">
      {select("Booking extra", extra, value => { setExtra(value as typeof extra); preview("book"); }, [{ key: "airport", name: "Airport transfer" }, { key: "kalesa", name: "Kalesa tour" }, { key: "dinner", name: "Dinner" }])}
      {text("Extra name", draft.islaExtras?.[extra]?.name, 120, value => onChange({ ...draft, islaExtras: { ...draft.islaExtras, [extra]: { ...draft.islaExtras?.[extra], name: value || undefined } } }))}
      {number("Extra price (PHP)", draft.islaExtras?.[extra]?.price, 0, 10000000, value => onChange({ ...draft, islaExtras: { ...draft.islaExtras, [extra]: { ...draft.islaExtras?.[extra], price: value } } }))}
      <p className="text-xs leading-5">The sample estimate uses the original per-person or per-stay calculation. No reservation is created.</p><button type="button" className="text-sm underline" onClick={() => preview("book")}>Preview sample booking</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Stay times</summary><div className="mt-4 space-y-4">
      {([ ["checkIn", "Check-in time"], ["checkOut", "Check-out time"] ] as const).map(([field, label]) => <div key={field}>{text(label, draft.islaStayTimes?.[field], 120, value => { const islaStayTimes = { ...draft.islaStayTimes }; if (value) islaStayTimes[field] = value; else delete islaStayTimes[field]; onChange({ ...draft, islaStayTimes: Object.keys(islaStayTimes).length ? islaStayTimes : undefined }); })}</div>)}
      <button type="button" className="text-sm underline" onClick={() => preview("rooms")}>Preview stay details</button>
    </div></details>
  </>;
}
