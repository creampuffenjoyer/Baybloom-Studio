"use client";

import Link from "next/link";
import { BackToBaybloom } from "@/components/layout/back-to-baybloom";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function TemplateChrome({ slug, title }: { slug: string; title: string }) {
  const path = usePathname().replace(/\/$/, "");
  const embedded = useSyncExternalStore(subscribe, () => window.parent !== window, () => true);
  useEffect(() => {
    if (embedded && window.parent !== window) {
      window.parent.postMessage({ type: `${slug}-preview-page`, path, language: "en" }, window.location.origin);
    }
  }, [embedded, path, slug]);

  if (embedded) return null;
  const page = path.slice(`/demo/${slug}`.length);
  return (
    <aside aria-label="Baybloom template demo" className="border-b border-border bg-sand px-5 text-sm text-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 py-1">
        <div className="flex min-w-0 items-center gap-3">
          <BackToBaybloom />
          <p><strong>{title}</strong> <span className="text-muted-foreground">· Sample website</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href={`/preview/${slug}?page=${encodeURIComponent(page)}`}>Device preview</Link>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/designs">All templates</Link>
        </div>
      </div>
    </aside>
  );
}
