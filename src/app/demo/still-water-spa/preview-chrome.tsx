"use client";
import Link from "next/link";
import { BackToBaybloom } from "@/components/layout/back-to-baybloom";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { languageOf } from "@/templates/_kit/language-url";
import { STILL_WATER_BASE } from "@/lib/still-water-preview";
const subscribe = () => () => {};
export function PreviewChrome() {
  const path = usePathname().replace(/\/$/, "");
  const language = languageOf(useSearchParams().get("lang"));
  const embedded = useSyncExternalStore(subscribe, () => window.parent !== window, () => false);
  useEffect(() => { if (embedded) window.parent.postMessage({ type: "still-water-preview-page", path, language }, window.location.origin); }, [embedded, path, language]);
  if (embedded) return null;
  return <aside aria-label="Template preview controls" className="border-b border-border bg-sand px-4 py-3 text-sm text-ink"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><BackToBaybloom /><p><strong>Still Water Spa</strong> <span className="text-muted-foreground">— website preview</span></p></div><div className="flex flex-wrap items-center gap-x-4 gap-y-1"><Link className="underline underline-offset-4" href={`/preview/still-water-spa?page=${encodeURIComponent(path.slice(STILL_WATER_BASE.length))}&lang=${language}`}>Device preview</Link><Link className="underline underline-offset-4" href="/designs/still-water-spa">Template details</Link></div></div><p className="mx-auto mt-1 max-w-6xl text-xs text-muted-foreground">Sample website. No appointments, payments or messages are sent.</p></aside>;
}
