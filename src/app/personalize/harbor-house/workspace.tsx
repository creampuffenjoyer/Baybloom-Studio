"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { emptyHarborDraft, parseHarborDraft, type HarborDraft } from "@/lib/personalization/harbor-draft";
import { HomePage } from "@/templates/harbor-house/pages/home";
import { PersonalizationContext } from "@/templates/harbor-house/personalization";
import { Shell } from "@/templates/harbor-house/shell";

const fieldClass = "mt-1 w-full rounded-lg border border-[#c9d1cf] bg-white px-3 py-2 text-sm text-[#203b3b]";

export function HarborEditor() {
  const [draft, setDraft] = useState<HarborDraft>(emptyHarborDraft);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [photoChange, setPhotoChange] = useState<{ action: "keep" | "remove" } | { action: "replace"; file: File }>({ action: "keep" });
  const photoUrlRef = useRef<string | undefined>(undefined);
  const [error, setError] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [signInNeeded, setSignInNeeded] = useState(false);

  useEffect(() => () => { if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current); }, []);

  function replacePhoto(file?: File) {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = file ? URL.createObjectURL(file) : undefined;
    photoUrlRef.current = url;
    setPhotoUrl(url);
  }

  function reset() {
    setDraft(emptyHarborDraft());
    replacePhoto();
    setPhotoChange({ action: "remove" });
    setError("");
    setSaveStatus("Changes reset in this preview. Your saved draft has not been changed.");
    setFileKey((value) => value + 1);
  }

  async function draftRequest(action: "load" | "save") {
    setBusy(true);
    setSaveStatus("");
    setSignInNeeded(false);
    try {
      let photo: { action: "keep" | "remove" } | { action: "replace"; base64: string } = { action: "keep" };
      if (action === "save") {
        if (photoChange.action === "replace") {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => typeof reader.result === "string" ? resolve(reader.result.slice(reader.result.indexOf(",") + 1)) : reject(new Error("Image could not be read"));
            reader.onerror = () => reject(new Error("Image could not be read"));
            reader.readAsDataURL(photoChange.file);
          });
          photo = { action: "replace", base64 };
        } else photo = photoChange;
      }
      const response = await fetch("/api/personalization/harbor-house", action === "save" ? {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draft, photo }),
      } : { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) setSignInNeeded(true);
      if (!response.ok) { setSaveStatus(data.error || "Could not access your draft. Please try again."); return; }
      if (action === "save") { setPhotoChange({ action: "keep" }); setSaveStatus("Draft and photo changes saved to your account."); return; }
      if (!data.draft) { setSaveStatus("You don't have a saved Harbor House draft yet."); return; }
      const parsed = parseHarborDraft(data.draft);
      if (!parsed.success) { setSaveStatus("This draft could not be opened. Please contact support."); return; }
      setDraft(parsed.data);
      replacePhoto();
      setPhotoUrl(data.hasPhoto ? `/api/personalization/harbor-house/photo?v=${encodeURIComponent(data.updatedAt)}` : undefined);
      setPhotoChange({ action: "keep" });
      setFileKey((value) => value + 1);
      setSaveStatus("Saved draft and photo loaded.");
    } catch { setSaveStatus("Could not access your draft. Check your connection and try again."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-dvh bg-[#eff2ed] text-[#203b3b]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7dfd8] bg-white px-5 py-4 sm:px-8">
      <div><Link href="/preview/harbor-house" className="text-sm underline underline-offset-4">Back to preview</Link><h1 className="mt-1 font-serif text-2xl">Make Harbor House yours</h1></div>
      <Link href="/designs/harbor-house#tiers" className="rounded-full bg-[#0f4c5c] px-5 py-3 text-sm font-semibold text-white">View packages</Link>
    </header>
    <div className="grid gap-0 lg:h-[calc(100dvh-90px)] lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside aria-label="Personalization controls" className="overflow-y-auto border-b border-[#d7dfd8] bg-white p-5 lg:border-r lg:border-b-0">
        <p className="text-sm leading-6">Try a few ideas on the home page. Sign in to save your text, color, and photo to your account.</p>
        <p className="mt-2 text-sm leading-6">Saved changes are not included in a purchase yet. Other pages and languages are not editable here.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void draftRequest("save")} className="rounded-full bg-[#0f4c5c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save draft</button>
          <button type="button" disabled={busy} onClick={() => void draftRequest("load")} className="rounded-full border border-[#0f4c5c] px-4 py-2 text-sm font-semibold disabled:opacity-50">Load saved draft</button>
        </div>
        <p className="mt-2 text-xs leading-5">Loading replaces the current editor content. Saving replaces your previously saved Harbor House draft. Use photos you have permission to use.</p>
        {saveStatus && <p role="status" className="mt-3 text-sm">{saveStatus}</p>}
        {signInNeeded && <p className="mt-2 text-sm"><Link className="underline underline-offset-4" href="/login?callbackUrl=%2Fpersonalize%2Fharbor-house">Sign in</Link> (unsaved changes in this window will be lost).</p>}
        <fieldset disabled={busy} className="mt-6 space-y-4 disabled:opacity-70">
          <legend className="sr-only">Edit your home page</legend>
          <label className="block text-sm font-semibold">Business name<input className={fieldClass} maxLength={120} value={draft.business.name ?? ""} placeholder="Harbor House" onChange={(e) => setDraft({ ...draft, business: { ...draft.business, name: e.target.value || undefined } })} /></label>
          <label className="block text-sm font-semibold">Tagline<input className={fieldClass} maxLength={500} value={draft.business.tagline ?? ""} placeholder="A bed and breakfast by the harbour" onChange={(e) => setDraft({ ...draft, business: { ...draft.business, tagline: e.target.value || undefined } })} /></label>
          <label className="block text-sm font-semibold">Hosts<input className={fieldClass} maxLength={120} value={draft.business.hosts ?? ""} placeholder="Mila and Joel" onChange={(e) => setDraft({ ...draft, business: { ...draft.business, hosts: e.target.value || undefined } })} /></label>
          <label className="block text-sm font-semibold">Home page headline<textarea className={fieldClass} rows={3} maxLength={120} value={draft.home.headline ?? ""} placeholder="A room by the harbour, and breakfast like home." onChange={(e) => setDraft({ ...draft, home: { ...draft.home, headline: e.target.value || undefined } })} /></label>
          <label className="block text-sm font-semibold">Welcome message<textarea className={fieldClass} rows={4} maxLength={500} value={draft.home.welcome ?? ""} placeholder="Welcome your guests..." onChange={(e) => setDraft({ ...draft, home: { ...draft.home, welcome: e.target.value || undefined } })} /></label>
          <label className="block text-sm font-semibold">Accent color<input type="color" className="mt-2 block h-11 w-20 cursor-pointer rounded border border-[#c9d1cf] bg-white p-1" value={draft.theme.accent ?? "#24557f"} onChange={(e) => setDraft({ ...draft, theme: { accent: e.target.value } })} /></label>
          <label className="block text-sm font-semibold">Home page photo<input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPEG, PNG, or WebP image up to 5 MB."); e.target.value = ""; return; }
            setError(""); replacePhoto(file); setPhotoChange({ action: "replace", file });
          }} /></label>
          <button type="button" onClick={() => { replacePhoto(); setPhotoChange({ action: "remove" }); setFileKey((value) => value + 1); }} className="text-sm underline underline-offset-4">Use original photo</button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="button" onClick={reset} className="rounded-full border border-[#0f4c5c] px-4 py-2 text-sm font-semibold">Reset changes</button>
        </fieldset>
      </aside>
      <section aria-label="Home page preview" className="min-w-0 overflow-auto p-3 sm:p-5">
        <p className="mb-3 text-sm">Home page preview · links are disabled while editing</p>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm" onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) event.preventDefault(); }}>
          <PersonalizationContext value={{ business: draft.business, home: draft.home, accent: draft.theme.accent, heroImage: photoUrl }}><Shell><HomePage /></Shell></PersonalizationContext>
        </div>
      </section>
    </div>
  </main>;
}
