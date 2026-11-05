"use client";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { languageOf } from "@/templates/_kit/language-url";
import { LUMEN_BASE } from "@/lib/lumen-lake-villas-preview";
const subscribe = () => () => {};
export function PreviewChrome() {
  const path = usePathname().replace(/\/$/, "");
  const language = languageOf(useSearchParams().get("lang"));
  const embedded = useSyncExternalStore(subscribe, () => window.parent !== window, () => false);
  useEffect(() => { if (embedded) window.parent.postMessage({ type: "lumen-preview-page", path, language }, window.location.origin); }, [embedded, path, language]);
  if (embedded) return null;
  return <aside aria-label="Template preview controls" className="border-b border-border bg-sand px-4 py-3 text-sm text-ink"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><p><strong>Lumen Lake Villas</strong> <span className="text-muted-foreground">— website preview</span></p><div className="flex gap-5"><Link className="underline underline-offset-4" href={`/preview/lumen-lake-villas?page=${encodeURIComponent(path.slice(LUMEN_BASE.length))}&lang=${language}`}>Device preview</Link><Link className="font-semibold underline underline-offset-4" href="/designs/lumen-lake-villas">Template details</Link></div></div><p className="mx-auto mt-1 max-w-6xl text-xs text-muted-foreground">Sample website. No reservations or messages are sent.</p></aside>;
}
