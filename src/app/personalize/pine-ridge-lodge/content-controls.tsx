"use client";

import { useState } from "react";
import type { PineDraft } from "@/lib/personalization/harbor-draft";
import { activities, menu, posts, rooms } from "@/templates/pine-ridge-lodge/content";
import { PINE_COPY_KEYS } from "@/lib/personalization/pine-copy-keys";

const fieldClass = "mt-1 w-full rounded-lg border border-[#c9d1cf] bg-white px-3 py-2 text-sm text-[#203b3b]";
const roomKeys = ["trapper-twin", "hearth-room", "family-loft", "ridge-chalet"] as const;
const activityKeys = ["ridge-ski", "backcountry", "snowshoe", "lake-hike", "paddle", "wildflowers", "larch"] as const;
const menuKeys = ["first", "second", "third", "fourth", "fifth"] as const;
const postKeys = ["how-to-dress-for-a-bluebird-day", "larch-season-is-coming"] as const;

export function PineContentControls({ draft, onChange, preview }: { draft: PineDraft; onChange: (draft: PineDraft) => void; preview: (page: string) => void }) {
  const [room, setRoom] = useState<(typeof roomKeys)[number]>(roomKeys[0]);
  const [activity, setActivity] = useState<(typeof activityKeys)[number]>(activityKeys[0]);
  const [dish, setDish] = useState<(typeof menuKeys)[number]>(menuKeys[0]);
  const [post, setPost] = useState<(typeof postKeys)[number]>(postKeys[0]);
  const [season, setSeason] = useState<"winter" | "summer">("winter");
  const [extra, setExtra] = useState<"lift" | "rental" | "dinner">("lift");
  const [pageKey, setPageKey] = useState<"rooms" | "activities" | "dining" | "journal" | "contact">("rooms");
  const [copySearch, setCopySearch] = useState("");
  const [copyKey, setCopyKey] = useState<string>(PINE_COPY_KEYS[0]);
  const matchingCopy = PINE_COPY_KEYS.filter((item) => item.toLowerCase().includes(copySearch.toLowerCase()));
  function textField(label: string, value: string | undefined, max: number, change: (value: string) => void) {
    return <label className="block text-sm font-semibold">{label}<textarea className={fieldClass} rows={max > 120 ? 3 : 2} maxLength={max} value={value ?? ""} onChange={(event) => change(event.target.value)} /></label>;
  }
  function numberField(label: string, value: number | undefined, min: number, max: number, change: (value: number | undefined) => void) {
    return <label className="block text-sm font-semibold">{label}<input className={fieldClass} type="number" min={min} max={max} step={1} value={value ?? ""} onChange={(event) => change(event.target.value === "" ? undefined : Number(event.target.value))} /></label>;
  }
  function roomChange(field: "name" | "short" | "description" | "beds" | "features" | "price" | "size" | "maxGuests", value: string | number | undefined) {
    const entry = { ...draft.pineRooms?.[room], [field]: value || (value === 0 ? 0 : undefined) };
    onChange({ ...draft, pineRooms: { ...draft.pineRooms, [room]: entry } });
  }
  function activityChange(field: "name" | "detail" | "level" | "duration", value: string) {
    onChange({ ...draft, pineActivities: { ...draft.pineActivities, [activity]: { ...draft.pineActivities?.[activity], [field]: value || undefined } } });
  }
  function menuChange(field: "name" | "detail" | "price", value: string | number | undefined) {
    onChange({ ...draft, pineMenu: { ...draft.pineMenu, [dish]: { ...draft.pineMenu?.[dish], [field]: value || (value === 0 ? 0 : undefined) } } });
  }
  function postChange(field: "title" | "dek" | "body" | "date", value: string) {
    onChange({ ...draft, pinePosts: { ...draft.pinePosts, [post]: { ...draft.pinePosts?.[post], [field]: value || undefined } } });
  }
  function seasonChange(field: "headline" | "lede" | "months", value: string) {
    onChange({ ...draft, pineSeasons: { ...draft.pineSeasons, [season]: { ...draft.pineSeasons?.[season], [field]: value || undefined } } });
  }
  function extraChange(field: "name" | "price", value: string | number | undefined) {
    onChange({ ...draft, pineExtras: { ...draft.pineExtras, [extra]: { ...draft.pineExtras?.[extra], [field]: value || (value === 0 ? 0 : undefined) } } });
  }
  function pageChange(field: "heading" | "intro" | "driving" | "shuttle" | "rentalHeading", value: string) {
    onChange({ ...draft, pinePages: { ...draft.pinePages, [pageKey]: { ...draft.pinePages?.[pageKey], [field]: value || undefined } } });
  }
  const select = (label: string, value: string, change: (value: string) => void, options: readonly { key: string; name: string }[]) => <label className="block text-sm font-semibold">{label}<select aria-label={label} className={fieldClass} value={value} onChange={(event) => change(event.target.value)}>{options.map((option) => <option key={option.key} value={option.key}>{option.name}</option>)}</select></label>;
  return <>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">More website wording</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Find wording<input className={fieldClass} value={copySearch} onChange={(event) => { const value = event.target.value; setCopySearch(value); const match = PINE_COPY_KEYS.find((item) => item.toLowerCase().includes(value.toLowerCase())); if (match) setCopyKey(match); }} placeholder="Search the original text" /></label>
      {matchingCopy.length ? <><label className="block text-sm font-semibold">Original wording<select aria-label="Original wording" className={fieldClass} value={copyKey} onChange={(event) => setCopyKey(event.target.value)}>{matchingCopy.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><p className="text-xs leading-5">Original: {copyKey}</p>{textField("Replacement wording", draft.pineCopy?.[copyKey], 500, value => { const pineCopy = { ...draft.pineCopy }; if (value) pineCopy[copyKey] = value; else delete pineCopy[copyKey]; onChange({ ...draft, pineCopy: Object.keys(pineCopy).length ? pineCopy : undefined }); })}</> : <p className="text-sm">No matching wording found.</p>}
      <p className="text-xs leading-5">This changes matching interface text wherever it appears. It does not change booking rules or translate your wording. Leave blank to retain the original.</p>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Page introductions</summary><div className="mt-4 space-y-4">
      {select("Page to edit", pageKey, value => { setPageKey(value as typeof pageKey); preview(value); }, [{ key: "rooms", name: "Rooms" }, { key: "activities", name: "Activities" }, { key: "dining", name: "Dining" }, { key: "journal", name: "Journal" }, { key: "contact", name: "Contact" }])}
      {textField("Page heading", draft.pinePages?.[pageKey]?.heading, 120, value => pageChange("heading", value))}
      {pageKey === "contact" ? <>{textField("Driving information", draft.pinePages?.contact?.driving, 500, value => pageChange("driving", value))}{textField("Shuttle information", draft.pinePages?.contact?.shuttle, 500, value => pageChange("shuttle", value))}{textField("Rental heading", draft.pinePages?.contact?.rentalHeading, 120, value => pageChange("rentalHeading", value))}</> : textField("Page introduction", draft.pinePages?.[pageKey]?.intro, 500, value => pageChange("intro", value))}
      <p className="text-xs leading-5">Leave a field blank to retain the original. Forms and booking remain samples.</p><button type="button" className="text-sm underline" onClick={() => preview(pageKey)}>Preview selected page</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Seasonal content</summary><div className="mt-4 space-y-4">
      {select("Season", season, value => { setSeason(value as typeof season); preview("home"); }, [{ key: "winter", name: "Winter" }, { key: "summer", name: "Summer" }])}
      {textField("Season headline", draft.pineSeasons?.[season]?.headline, 120, value => seasonChange("headline", value))}
      {textField("Season introduction", draft.pineSeasons?.[season]?.lede, 500, value => seasonChange("lede", value))}
      {textField("Season months", draft.pineSeasons?.[season]?.months, 120, value => seasonChange("months", value))}
      <p className="text-xs leading-5">Use the season switch in the preview to see each version. The shared home headline and welcome message above take priority. Editing months changes display text only, not the sample booking dates.</p><button type="button" className="text-sm underline" onClick={() => preview("home")}>Preview seasons</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Sample booking extras</summary><div className="mt-4 space-y-4">
      {select("Booking extra", extra, value => { setExtra(value as typeof extra); preview("book"); }, [{ key: "lift", name: "Lift pass" }, { key: "rental", name: "Equipment rental" }, { key: "dinner", name: "Dinner" }])}
      {textField("Extra name", draft.pineExtras?.[extra]?.name, 120, value => extraChange("name", value))}
      {numberField("Extra price (CAD)", draft.pineExtras?.[extra]?.price, 0, 10000000, value => extraChange("price", value))}
      <p className="text-xs leading-5">These prices update the sample estimate. The original per-person and per-night calculation and seasonal availability stay the same; this does not create a real reservation.</p><button type="button" className="text-sm underline" onClick={() => preview("book")}>Preview sample booking</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Stay times</summary><div className="mt-4 space-y-4">
      {([ ["checkIn", "Check-in time"], ["checkOut", "Check-out time"] ] as const).map(([field, label]) => <div key={field}>{textField(label, draft.pineStayTimes?.[field], 120, value => { const pineStayTimes = { ...draft.pineStayTimes }; if (value) pineStayTimes[field] = value; else delete pineStayTimes[field]; onChange({ ...draft, pineStayTimes: Object.keys(pineStayTimes).length ? pineStayTimes : undefined }); })}</div>)}
      <p className="text-xs leading-5">These are displayed times; no reservation is created.</p><button type="button" className="text-sm underline" onClick={() => preview("rooms")}>Preview stay details</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Room content</summary><div className="mt-4 space-y-4">
      {select("Room", room, value => { setRoom(value as typeof room); preview(value); }, roomKeys.map(key => ({ key, name: rooms.find(item => item.slug === key)!.name })))}
      {([ ["name", "Room name", 120], ["short", "Short description", 500], ["description", "Room description", 1600], ["beds", "Beds", 120], ["features", "Room features", 1200] ] as const).map(([field, label, max]) => <div key={field}>{textField(label, draft.pineRooms?.[room]?.[field], max, value => roomChange(field, value))}</div>)}
      <p className="text-xs leading-5">Enter description paragraphs and features on separate lines. Leave a field blank to keep the original.</p>
      {numberField("Nightly price (CAD)", draft.pineRooms?.[room]?.price, 0, 10000000, value => roomChange("price", value))}
      {numberField("Size (m²)", draft.pineRooms?.[room]?.size, 1, 100000, value => roomChange("size", value))}
      {numberField("Maximum guests", draft.pineRooms?.[room]?.maxGuests, 1, 6, value => roomChange("maxGuests", value))}
      <button type="button" className="text-sm underline" onClick={() => preview(room)}>Preview room</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Activities content</summary><div className="mt-4 space-y-4">
      {select("Activity", activity, value => { setActivity(value as typeof activity); preview("activities"); }, activityKeys.map(key => ({ key, name: activities.find(item => item.id === key)!.name })))}
      {([ ["name", "Activity name", 120], ["detail", "Activity description", 500], ["level", "Activity level", 120], ["duration", "Activity duration", 120] ] as const).map(([field, label, max]) => <div key={field}>{textField(label, draft.pineActivities?.[activity]?.[field], max, value => activityChange(field, value))}</div>)}
      <p className="text-xs leading-5">The season and difficulty filter use the original categories; changing the displayed level does not change filtering.</p><button type="button" className="text-sm underline" onClick={() => preview("activities")}>Preview activities</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Dining menu</summary><div className="mt-4 space-y-4">
      {select("Menu item", dish, value => { setDish(value as typeof dish); preview("dining"); }, menuKeys.map((key, index) => ({ key, name: menu[index].name })))}
      {textField("Dish name", draft.pineMenu?.[dish]?.name, 120, value => menuChange("name", value))}
      {textField("Dish description", draft.pineMenu?.[dish]?.detail, 500, value => menuChange("detail", value))}
      {numberField("Dish price (CAD)", draft.pineMenu?.[dish]?.price, 0, 10000000, value => menuChange("price", value))}
      <button type="button" className="text-sm underline" onClick={() => preview("dining")}>Preview dining</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Journal content</summary><div className="mt-4 space-y-4">
      {select("Journal article", post, value => { setPost(value as typeof post); preview(value); }, postKeys.map(key => ({ key, name: posts.find(item => item.slug === key)!.title })))}
      {textField("Article title", draft.pinePosts?.[post]?.title, 120, value => postChange("title", value))}
      {textField("Article summary", draft.pinePosts?.[post]?.dek, 500, value => postChange("dek", value))}
      {textField("Article text", draft.pinePosts?.[post]?.body, 3000, value => postChange("body", value))}
      <label className="block text-sm font-semibold">Article date<input type="date" className={fieldClass} value={draft.pinePosts?.[post]?.date ?? ""} onChange={(event) => postChange("date", event.target.value)} /></label>
      <p className="text-xs leading-5">Enter one paragraph per line. Leave the date blank to keep the original.</p><button type="button" className="text-sm underline" onClick={() => preview(post)}>Preview article</button>
    </div></details>
  </>;
}
