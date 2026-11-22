"use client";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { EMBER_BASE } from "@/lib/ember-preview";
const subscribe = () => () => {};
export function PreviewChrome() {
  const path = usePathname().replace(/\/$/, "");
  const embedded = useSyncExternalStore(subscribe, () => window.parent !== window, () => false);
  useEffect(() => { if (embedded) window.parent.postMessage({ type: "ember-preview-page", path, language: "en" }, window.location.origin); }, [embedded, path]);
  if (embedded) return null;
  return <aside aria-label="Template preview controls" className="border-b border-border bg-sand px-4 py-3 text-sm text-ink"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><p><strong>Ember &amp; Salt</strong> <span className="text-muted-foreground">— website preview</span></p><div className="flex gap-5"><Link className="underline underline-offset-4" href={`/preview/ember-and-salt?page=${encodeURIComponent(path.slice(EMBER_BASE.length))}`}>Device preview</Link><Link className="underline underline-offset-4" href="/designs/ember-and-salt">Template details</Link></div></div><p className="mx-auto mt-1 max-w-6xl text-xs text-muted-foreground">Sample website. No bookings, payments or messages are sent.</p></aside>;
}
