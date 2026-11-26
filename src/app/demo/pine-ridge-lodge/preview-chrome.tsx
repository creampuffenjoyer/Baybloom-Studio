"use client";

import Link from "next/link";
import { BackToBaybloom } from "@/components/layout/back-to-baybloom";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { languageOf } from "@/templates/_kit/language-url";
import { seasonOf } from "@/templates/pine-ridge-lodge/plan";
import { PINE_BASE } from "@/lib/pine-preview";

const subscribe = () => () => {};
export function PreviewChrome() {
  const path = usePathname().replace(/\/$/, "");
  const language = languageOf(useSearchParams().get("lang"));
  const season = seasonOf(useSearchParams().get("season"));
  const embedded = useSyncExternalStore(subscribe, () => window.parent !== window, () => false);
  useEffect(() => {
    if (embedded) window.parent.postMessage({ type: "pine-preview-page", path, language, season }, window.location.origin);
  }, [embedded, path, language, season]);
  if (embedded) return null;
  return <aside aria-label="Template preview controls" className="border-b border-border bg-sand px-4 py-3 text-sm text-ink">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <BackToBaybloom />
        <p><strong>Pine Ridge Lodge</strong> <span className="text-muted-foreground">— website preview</span></p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link className="underline underline-offset-4" href={`/preview/pine-ridge-lodge?page=${encodeURIComponent(path.slice(PINE_BASE.length))}&lang=${language}&season=${season}`}>Device preview</Link>
        <Link className="font-semibold underline underline-offset-4" href="/designs/pine-ridge-lodge">Template details</Link>
      </div>
    </div>
    <p className="mx-auto mt-1 max-w-6xl text-xs text-muted-foreground">Sample website. No reservations or messages are sent.</p>
  </aside>;
}
