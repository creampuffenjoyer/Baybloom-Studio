"use client";
import { useState } from "react";
import type { EmberDraft } from "@/lib/personalization/harbor-draft";
import { DIET_LABEL, menus, spaces, type Diet } from "@/templates/ember-and-salt/content";
import { site } from "@/templates/ember-and-salt/site";
import { EMBER_COPY_KEYS } from "@/lib/personalization/ember-copy-keys";

const cls = "mt-1 w-full rounded-lg border border-[#c9d1cf] bg-white px-3 py-2 text-sm text-[#203b3b]";
const order = ["first", "second", "third", "fourth"] as const;
export function EmberContentControls({ draft, onChange, preview }: { draft: EmberDraft; onChange: (draft: EmberDraft) => void; preview: (page: string) => void }) {
  const [menuIndex, setMenuIndex] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [dishIndex, setDishIndex] = useState(0);
  const [space, setSpace] = useState<"back-room" | "chefs-counter" | "full-house">("back-room");
  const [hours, setHours] = useState<(typeof order)[number]>("first");
  const [chapter, setChapter] = useState<(typeof order)[number]>("first");
  const [copySearch, setCopySearch] = useState("");
  const [copyKey, setCopyKey] = useState<string>(EMBER_COPY_KEYS[0]);
  const [review, setReview] = useState<"first" | "second" | "third">("first");
  const [signature, setSignature] = useState<"first" | "second" | "third">("first");
  const menu = menus[menuIndex]; const section = menu.sections[sectionIndex]; const dish = section.dishes[dishIndex];
  const sectionKey = `${menu.id}:${sectionIndex}`; const dishKey = `${sectionKey}:${dishIndex}`;
  const override = draft.emberDishes?.[dishKey];
  const diet = override?.diet ?? (override?.name || override?.detail ? [] : dish.diet ?? []);
  const text = (label: string, value: string | undefined, max: number, change: (value: string) => void, placeholder?: string) => <label className="block text-sm font-semibold">{label}<textarea className={cls} rows={max > 120 ? 3 : 2} maxLength={max} value={value ?? ""} placeholder={placeholder} onChange={(event) => change(event.target.value)} /></label>;
  const number = (label: string, value: number | undefined, change: (value: number | undefined) => void, placeholder?: number) => <label className="block text-sm font-semibold">{label}<input className={cls} type="number" min={0} max={10000000} step={1} value={value ?? ""} placeholder={placeholder === undefined ? undefined : String(placeholder)} onChange={(event) => change(event.target.value === "" ? undefined : Number(event.target.value))} /></label>;
  function dishChange(field: "name" | "detail" | "note" | "price", value: string | number | undefined) {
    const clearDiet = field === "name" || field === "detail";
    onChange({ ...draft, emberDishes: { ...draft.emberDishes, [dishKey]: { ...override, [field]: value === "" ? undefined : value, ...(clearDiet ? { diet: [] } : {}) } } });
  }
  return <>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">More website wording</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Find wording<input className={cls} value={copySearch} onChange={(event) => setCopySearch(event.target.value)} placeholder="Search original wording" /></label>
      <label className="block text-sm font-semibold">Original wording<select className={cls} value={copyKey} onChange={(event) => setCopyKey(event.target.value)}>{EMBER_COPY_KEYS.filter(key => key.toLowerCase().includes(copySearch.toLowerCase()) || key === copyKey).map(key => <option key={key} value={key}>{key}</option>)}</select></label>
      {text("Replacement wording", draft.emberCopy?.[copyKey], 500, value => { const emberCopy = { ...draft.emberCopy }; if (value.trim()) emberCopy[copyKey] = value; else delete emberCopy[copyKey]; onChange({ ...draft, emberCopy: Object.keys(emberCopy).length ? emberCopy : undefined }); }, copyKey)}
      <p className="text-xs leading-5">Choose a preview page above to see the change. Clearing a replacement restores the original wording.</p>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Restaurant story</summary><div className="mt-4 space-y-4">
      {([ ["heading", "Story heading", 120], ["introduction", "Story introduction", 500], ["sourcing", "Sourcing story", 500] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.emberStory?.[field], max, value => onChange({ ...draft, emberStory: { ...draft.emberStory, [field]: value || undefined } }))}</div>)}
      <label className="block text-sm font-semibold">Timeline entry<select className={cls} value={chapter} onChange={(event) => { setChapter(event.target.value as typeof chapter); preview("story"); }}>{order.map((key, index) => <option key={key} value={key}>Entry {index + 1}</option>)}</select></label>
      {([ ["year", "Timeline year", 120], ["text", "Timeline description", 500] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.emberStory?.chapters?.[chapter]?.[field], max, value => onChange({ ...draft, emberStory: { ...draft.emberStory, chapters: { ...draft.emberStory?.chapters, [chapter]: { ...draft.emberStory?.chapters?.[chapter], [field]: value || undefined } } } }))}</div>)}
      <button type="button" className="text-sm underline" onClick={() => preview("story")}>Preview story</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Menus and dishes</summary><div className="mt-4 space-y-4">
      <p className="text-xs leading-5">Choose the matching menu tab in the preview to see changes to drinks or dessert.</p>
      <label className="block text-sm font-semibold">Menu<select aria-label="Menu to edit" className={cls} value={menuIndex} onChange={(event) => { setMenuIndex(Number(event.target.value)); setSectionIndex(0); setDishIndex(0); preview("menu"); }}>{menus.map((item, index) => <option key={item.id} value={index}>{item.label}</option>)}</select></label>
      {([ ["label", "Menu name", 120], ["served", "Menu serving hours", 120] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.emberMenus?.[menu.id]?.[field], max, value => onChange({ ...draft, emberMenus: { ...draft.emberMenus, [menu.id]: { ...draft.emberMenus?.[menu.id], [field]: value || undefined } } }), menu[field])}</div>)}
      <label className="block text-sm font-semibold">Menu section<select aria-label="Menu section" className={cls} value={sectionIndex} onChange={(event) => { setSectionIndex(Number(event.target.value)); setDishIndex(0); preview("menu"); }}>{menu.sections.map((item, index) => <option key={index} value={index}>{item.title}</option>)}</select></label>
      {text("Section heading", draft.emberSections?.[sectionKey]?.title, 120, value => onChange({ ...draft, emberSections: { ...draft.emberSections, [sectionKey]: { ...draft.emberSections?.[sectionKey], title: value || undefined } } }), section.title)}
      {text("Section introduction", draft.emberSections?.[sectionKey]?.intro, 500, value => onChange({ ...draft, emberSections: { ...draft.emberSections, [sectionKey]: { ...draft.emberSections?.[sectionKey], intro: value || undefined } } }), section.intro)}
      <label className="block text-sm font-semibold">Dish<select aria-label="Dish to edit" className={cls} value={dishIndex} onChange={(event) => { setDishIndex(Number(event.target.value)); preview("menu"); }}>{section.dishes.map((item, index) => <option key={index} value={index}>{item.name}</option>)}</select></label>
      {text("Dish name", override?.name, 120, value => dishChange("name", value), dish.name)}
      {text("Dish ingredients and description", override?.detail, 500, value => dishChange("detail", value), dish.detail)}
      {number("Dish price (PHP)", override?.price, value => dishChange("price", value), dish.price)}
      {text("Dish note", override?.note, 120, value => dishChange("note", value), dish.note)}
      <fieldset className="space-y-2"><legend className="text-sm font-semibold">Dietary labels</legend>{(Object.entries(DIET_LABEL) as [Diet, string][]).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={diet.includes(key)} onChange={(event) => { const next = event.target.checked ? [...diet, key] : diet.filter(item => item !== key); onChange({ ...draft, emberDishes: { ...draft.emberDishes, [dishKey]: { ...override, diet: next } } }); }} />{label}</label>)}</fieldset>
      <p className="text-xs leading-5">Changing a dish name or ingredients clears its example labels. Choose labels only after confirming the dish; these labels do not guarantee allergen safety.</p><button type="button" className="text-sm underline" onClick={() => preview("menu")}>Preview menu</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Private dining spaces</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Space<select aria-label="Space to edit" className={cls} value={space} onChange={(event) => { setSpace(event.target.value as typeof space); preview("private-dining"); }}>{spaces.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
      {([ ["name", "Space name", 120], ["seats", "Seated capacity", 120], ["standing", "Standing capacity", 120], ["description", "Space description", 500] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.emberSpaces?.[space]?.[field], max, value => onChange({ ...draft, emberSpaces: { ...draft.emberSpaces, [space]: { ...draft.emberSpaces?.[space], [field]: value || undefined } } }), spaces.find(item => item.slug === space)?.[field])}</div>)}
      {number("Minimum spend (PHP)", draft.emberSpaces?.[space]?.minimum, value => onChange({ ...draft, emberSpaces: { ...draft.emberSpaces, [space]: { ...draft.emberSpaces?.[space], minimum: value } } }), spaces.find(item => item.slug === space)?.minimum)}
      <p className="text-xs leading-5">Capacities are display text; inquiries are samples and are not sent.</p><button type="button" className="text-sm underline" onClick={() => preview("private-dining")}>Preview private dining</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Featured dishes</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Featured dish<select aria-label="Featured dish" className={cls} value={signature} onChange={(event) => { setSignature(event.target.value as typeof signature); preview("home"); }}><option value="first">Dish 1</option><option value="second">Dish 2</option><option value="third">Dish 3</option></select></label>
      {([ ["name", "Featured dish name", 120], ["line", "Featured dish description", 500] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.emberSignatures?.[signature]?.[field], max, value => onChange({ ...draft, emberSignatures: { ...draft.emberSignatures, [signature]: { ...draft.emberSignatures?.[signature], [field]: value || undefined } } }))}</div>)}
      <p className="text-xs leading-5">Featured dishes are edited separately from menu items.</p><button type="button" className="text-sm underline" onClick={() => preview("home")}>Preview featured dishes</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Opening hours</summary><div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold">Hours row<select aria-label="Hours row" className={cls} value={hours} onChange={(event) => { setHours(event.target.value as typeof hours); preview("visit"); }}>{order.map((key, index) => <option key={key} value={key}>{site.hours[index].days}</option>)}</select></label>
      {([ ["days", "Days"], ["time", "Hours"] ] as const).map(([field, label]) => <div key={field}>{text(label, draft.emberHours?.[hours]?.[field], 120, value => onChange({ ...draft, emberHours: { ...draft.emberHours, [hours]: { ...draft.emberHours?.[hours], [field]: value || undefined } } }))}</div>)}
      <p className="text-xs leading-5">Changing displayed hours does not change the sample reservation time slots.</p><button type="button" className="text-sm underline" onClick={() => preview("visit")}>Preview visit</button>
    </div></details>
    <details className="border-t border-[#d7dfd8] pt-4"><summary className="cursor-pointer text-sm font-semibold">Press quotes</summary><div className="mt-4 space-y-4">
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!draft.emberPressHidden} onChange={(event) => onChange({ ...draft, emberPressHidden: !event.target.checked || undefined })} />Show press quotes</label>
      <p className="text-xs leading-5">The original quotes are examples. Replace them with genuine quotes you can use, or hide the section.</p>
      <label className="block text-sm font-semibold">Quote<select aria-label="Press quote" className={cls} value={review} onChange={(event) => { setReview(event.target.value as typeof review); preview("home"); }}><option value="first">Quote 1</option><option value="second">Quote 2</option><option value="third">Quote 3</option></select></label>
      {([ ["quote", "Quote text", 500], ["source", "Quote source", 120] ] as const).map(([field, label, max]) => <div key={field}>{text(label, draft.emberPress?.[review]?.[field], max, value => onChange({ ...draft, emberPress: { ...draft.emberPress, [review]: { ...draft.emberPress?.[review], [field]: value || undefined } } }))}</div>)}
      <button type="button" className="text-sm underline" onClick={() => preview("home")}>Preview quotes</button>
    </div></details>
  </>;
}
