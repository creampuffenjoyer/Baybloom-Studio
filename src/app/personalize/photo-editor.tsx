"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CoralDraft, PersonalizationDraft } from "@/lib/personalization/harbor-draft";
import { PHOTO_TEMPLATES, legacyPhoto, type LegacyPhotos, type PhotoPlacement, type PhotoTemplate } from "./photo-templates";

type Options = NonNullable<CoralDraft["photoPlacements"]>;
type PendingPhoto = { url?: string; savedUrl?: string; file?: File; pending: boolean; error?: string };
type LoadedPhotos = { placementPhotos?: { slot: string; updatedAt: string }[]; draft?: unknown };
const field = "mt-1 w-full rounded-lg border border-[#c9d1cf] bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f4c5c]";

export function useLocationPhotoEditor({ draft, setDraft, page, setPage, busy, ready, saveChanges, saveStatus, signInNeeded, legacy }: {
  draft: PersonalizationDraft; setDraft: Dispatch<SetStateAction<PersonalizationDraft>>; page: string; setPage: (page: string) => void; busy: boolean; ready: boolean; saveChanges: () => void; saveStatus: string; signInNeeded: boolean; legacy: LegacyPhotos;
}) {
  const [selectedId, setSelectedId] = useState("home.hero");
  const [editing, setEditing] = useState(true);
  const [photos, setPhotos] = useState<Record<string, PendingPhoto>>({});
  const [also, setAlso] = useState<{ source: string; ids: string[] }>({ source: "", ids: [] });
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const blobs = useRef(new Map<string, string>());
  const baseline = useRef(JSON.stringify(draft));
  const baselineOptions = useRef<Options>({});
  const editable = draft;
  const enabled = !!editable;
  const config = PHOTO_TEMPLATES[editable?.template ?? "coral-cove"];
  const available = config.placements.filter(item => item.page === page);
  const selected = available.find(item => item.id === selectedId) ?? available[0];
  const urls = useMemo(() => Object.fromEntries(Object.entries(photos).flatMap(([id, value]) => value.url ? [[id, value.url]] : [])), [photos]);
  const pending = !!editable && (Object.values(photos).some(item => item.pending) || JSON.stringify(draft) !== baseline.current);

  useEffect(() => () => { for (const url of blobs.current.values()) URL.revokeObjectURL(url); }, []);
  useEffect(() => {
    if (!enabled || !pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [enabled, pending]);
  useEffect(() => {
    const element = dialog.current;
    if (!drawer || !element) return;
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    element.showModal();
    return () => { element.close(); document.body.style.overflow = previous; };
  }, [drawer]);

  function revoke(id: string) { const url = blobs.current.get(id); if (url) URL.revokeObjectURL(url); blobs.current.delete(id); }
  const select = useCallback((id: string, fromPreview = false) => {
    const item = config.get(id); if (!item) return;
    setSelectedId(id); setPage(item.page); setEditing(true); setNotice("");
    if (fromPreview && matchMedia("(max-width: 1023px)").matches) setDrawer(true);
    else if (fromPreview) document.getElementById(config.panelId)?.scrollIntoView({ block: "nearest" });
  }, [setPage, config]);
  function updateOptions(ids: string[], update: (value: Options[string]) => Options[string]) {
    setDraft(current => {
      const photoPlacements: Options = { ...current.photoPlacements };
      for (const id of ids) { const value = update(photoPlacements[id]); if (value && Object.keys(value).length) photoPlacements[id] = value; else delete photoPlacements[id]; }
      return { ...current, photoPlacements: Object.keys(photoPlacements).length ? photoPlacements : undefined };
    });
  }
  function replace(file?: File) {
    if (!selected || !file || busy) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setNotice("Choose a JPEG, PNG, or WebP image up to 5 MB."); return; }
    const ids = [selected.id, ...(also.source === selected.id ? also.ids : [])];
    const next: Record<string, PendingPhoto> = {};
    for (const id of ids) { revoke(id); const url = URL.createObjectURL(file); blobs.current.set(id, url); next[id] = { url, savedUrl: photos[id]?.savedUrl, file, pending: true }; }
    setPhotos(current => ({ ...current, ...next }));
    updateOptions(ids, value => { const next = { ...value }; delete next.original; return next; });
    setNotice(ids.length > 1 ? `Replacement selected for ${ids.length} locations. Save changes to keep it.` : "Replacement selected. Save changes to keep it.");
  }
  function restore() {
    if (!selected || busy) return;
    revoke(selected.id);
    setPhotos(current => ({ ...current, [selected.id]: { savedUrl: current[selected.id]?.savedUrl, pending: true } }));
    updateOptions([selected.id], value => ({ ...value, original: true })); setNotice("Original restored in this preview. Save changes to keep it.");
  }
  function discard() {
    if (!selected || busy) return;
    revoke(selected.id);
    setPhotos(current => ({ ...current, [selected.id]: { url: current[selected.id]?.savedUrl, savedUrl: current[selected.id]?.savedUrl, pending: false } }));
    updateOptions([selected.id], () => baselineOptions.current[selected.id]); setNotice("Pending change discarded for this location.");
  }
  function load(data: LoadedPhotos) {
    for (const id of blobs.current.keys()) revoke(id);
    const next: Record<string, PendingPhoto> = {};
    for (const item of data.placementPhotos ?? []) if (config.is(item.slot) && typeof item.updatedAt === "string") {
      const url = `/api/personalization/${config.template}/placements/${item.slot}/image?v=${encodeURIComponent(item.updatedAt)}`;
      next[item.slot] = { url, savedUrl: url, pending: false };
    }
    setPhotos(next); baseline.current = JSON.stringify(data.draft); baselineOptions.current = (data.draft as CoralDraft)?.photoPlacements ?? {}; setNotice("");
  }
  async function save(snapshot: PersonalizationDraft) {
    baseline.current = JSON.stringify(snapshot); baselineOptions.current = structuredClone(snapshot.photoPlacements ?? {});
    let failures = 0;
    for (const [id, value] of Object.entries(photos).filter(([, value]) => value.pending)) {
      const endpoint = `/api/personalization/${config.template}/placements/${id}/image`;
      try {
        const response = await fetch(endpoint, value.file ? { method: "PUT", headers: { "Content-Type": value.file.type }, body: value.file } : { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not save this photo.");
        const url = value.file ? `${endpoint}?v=${encodeURIComponent(data.updatedAt)}` : undefined;
        revoke(id); setPhotos(current => ({ ...current, [id]: { url, savedUrl: url, pending: false } }));
      } catch (error) {
        failures++; setPhotos(current => ({ ...current, [id]: { ...value, error: error instanceof Error ? error.message : "Could not save this photo." } }));
      }
    }
    setNotice(failures ? `${failures} photo${failures === 1 ? "" : "s"} could not be saved. Your text was saved. Retry Save changes.` : "All changes saved.");
    return failures === 0;
  }
  function reset() {
    for (const id of blobs.current.keys()) revoke(id);
    setPhotos(current => Object.fromEntries(Object.entries(current).map(([id, value]) => [id, { savedUrl: value.savedUrl, pending: !!value.savedUrl }])));
    updateOptions(config.placements.map(item => item.id), () => ({ original: true }));
    setNotice("Template photos restored in this preview. Save changes to keep them.");
  }
  const selectedOptions = selected ? editable?.photoPlacements?.[selected.id] : undefined;
  const original = selected ? config.original(selected.id) : undefined;
  const fallback = selected && editable ? legacyPhoto(selected, editable, legacy) : original;
  const image = selectedOptions?.original ? original : selected && photos[selected.id]?.url ? { src: photos[selected.id].url!, alt: selectedOptions?.alt || fallback?.alt || "Selected photo" } : fallback;
  const selectedPending = selected && (photos[selected.id]?.pending || JSON.stringify(selectedOptions) !== JSON.stringify(baselineOptions.current[selected.id]));
  const panelProps: PanelProps = {
    config, page, available, selected, image, options: selectedOptions, busy, notice,
    status: busy ? "Saving" : selected && photos[selected.id]?.error ? "Failed" : selectedPending ? "Unsaved" : (selected && (photos[selected.id]?.savedUrl || baselineOptions.current[selected.id])) ? "Saved" : "Original",
    error: selected ? photos[selected.id]?.error : undefined,
    also: selected && also.source === selected.id ? also.ids : [],
    select, choosePage: next => { setPage(next); setNotice(""); }, replace, restore, discard,
    setAlt: alt => { if (selected) updateOptions([selected.id], value => { const next = { ...value }; if (alt) next.alt = alt; else delete next.alt; return next; }); },
    setAlso: ids => { if (selected) setAlso({ source: selected.id, ids }); },
  };
  return { selected: selected?.id, editing, setEditing, urls, pending, select, load, save, reset,
    controls: editable ? <div id={config.panelId} className="mt-6 border-y border-[#d7dfd8] py-5">
      <div className="hidden lg:block"><PhotoPanel {...panelProps} /></div>
      <button type="button" className="min-h-11 w-full rounded-lg border border-[#0f4c5c] px-4 py-2 text-left font-medium lg:hidden" onClick={() => setDrawer(true)}>Photo controls{selected ? ` · ${selected.name}` : ""}</button>
      <dialog ref={dialog} onClose={() => setDrawer(false)} aria-label="Photo controls" className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-white p-5 text-[#203b3b] backdrop:bg-black/30">
        <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-medium">Photo controls</h2><button type="button" onClick={() => setDrawer(false)} className="min-h-11 rounded-lg px-4 underline">Close</button></div>
        <PhotoPanel {...panelProps} />
        <div className="sticky bottom-0 -mx-5 -mb-5 mt-4 border-t border-[#d7dfd8] bg-white px-5 py-4">
          <button type="button" disabled={busy || !ready} onClick={saveChanges} className="min-h-12 w-full rounded-lg bg-[#0f4c5c] px-4 py-3 font-medium text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
          <p className="mt-2 text-xs leading-5 text-[#55666b]">Saves all pending text and photo changes.</p>
          {drawer && saveStatus && <p role="status" className="mt-2 text-sm leading-5">{saveStatus}</p>}
          {drawer && signInNeeded && <p className="mt-2 text-sm leading-5"><Link href={`/login?callbackUrl=${encodeURIComponent(`/personalize/${config.template}`)}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Sign in in a new tab</Link>, then return here and try again.</p>}
        </div>
      </dialog>
    </div> : null,
  };
}

type PanelProps = {
  config: PhotoTemplate;
  page: string; available: readonly PhotoPlacement[]; selected?: PhotoPlacement; image?: { src: string; alt: string }; options?: Options[string]; busy: boolean; notice: string; status: string; error?: string; also: string[];
  select: (id: string) => void; choosePage: (page: string) => void; replace: (file?: File) => void; restore: () => void; discard: () => void; setAlt: (alt: string) => void; setAlso: (ids: string[]) => void;
};
function PhotoPanel(props: PanelProps) {
  const id = useId(); const { selected } = props;
  const alternatives = selected ? props.config.placements.filter(item => item.photo === selected.photo && item.id !== selected.id) : [];
  return <fieldset disabled={props.busy} className="space-y-4 disabled:opacity-70">
    <legend className="mb-3 text-base font-semibold">Photos</legend>
    <p className="text-sm leading-6">Click a photo in the preview, or find it by page and location.</p>
    <label htmlFor={`${id}-page`} className="block text-sm font-medium">Page<select id={`${id}-page`} aria-label="Photo page" className={field} value={props.page} onChange={event => props.choosePage(event.target.value)}>{props.config.pages.map(page => <option key={page.id} value={page.id}>{page.name}</option>)}</select></label>
    {selected ? <>
      <label htmlFor={`${id}-location`} className="block text-sm font-medium">Photo location<select id={`${id}-location`} aria-label="Photo location" className={field} value={selected.id} onChange={event => props.select(event.target.value)}>{props.available.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {props.image && <div className="relative aspect-video overflow-hidden rounded-lg border border-[#d7dfd8]"><Image src={props.image.src} alt={`${selected.name} — Current photo`} fill unoptimized className="object-cover" sizes="300px" /></div>}
      <div><p className="text-sm font-medium">{selected.pageName} · {selected.name}</p><p role="status" className={`mt-1 text-sm ${props.error ? "text-red-700" : "text-[#55666b]"}`}>{props.status}</p></div>
      <label htmlFor={`${id}-file`} className="block text-sm font-medium">Replace photo<input id={`${id}-file`} key={selected.id} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={event => { props.replace(event.target.files?.[0]); event.target.value = ""; }} /></label>
      <p className="text-xs leading-5 text-[#55666b]">JPEG, PNG or WebP, up to 5 MB. Suggested shape: {selected.ratio}. Use a photo at least 1600 pixels wide, and check how it fits in the preview.</p>
      <label htmlFor={`${id}-alt`} className="block text-sm font-medium">Photo description<input id={`${id}-alt`} className={field} maxLength={120} value={props.options?.alt ?? ""} placeholder={props.image?.alt} onChange={event => props.setAlt(event.target.value)} /></label>
      <p className="text-xs leading-5 text-[#55666b]">Describe what the photo shows for visitors using a screen reader.</p>
      <div className="flex flex-wrap gap-x-4 gap-y-3 text-sm"><button type="button" onClick={props.restore} className="min-h-11 underline underline-offset-4">Restore original</button><button type="button" onClick={props.discard} disabled={props.status === "Saved" || props.status === "Original"} className="min-h-11 underline underline-offset-4 disabled:opacity-50">Discard pending change</button></div>
      {!!alternatives.length && <details className="border-t border-[#d7dfd8] pt-3"><summary className="cursor-pointer text-sm font-medium">Use the next replacement in other locations</summary><p className="mt-2 text-xs leading-5">Only this location changes unless you select more. Choose locations before uploading the replacement.</p><div className="mt-3 space-y-3">{alternatives.map(item => <label key={item.id} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={props.also.includes(item.id)} onChange={event => props.setAlso(event.target.checked ? [...props.also, item.id] : props.also.filter(id => id !== item.id))} /><span>{item.pageName} · {item.name}</span></label>)}</div></details>}
      {props.error && <p role="alert" className="text-sm text-red-700">{props.error}</p>}
    </> : <p className="text-sm">This page has no editable photos. Choose another page.</p>}
    {props.notice && <p role="status" className="text-sm leading-6">{props.notice}</p>}
  </fieldset>;
}
