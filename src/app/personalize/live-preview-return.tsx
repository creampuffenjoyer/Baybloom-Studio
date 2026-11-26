"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { BackToBaybloom } from "@/components/layout/back-to-baybloom";

const subscribe = () => () => {};
const isEmbedded = () => window.parent !== window;
const hideDuringPrerender = () => true;

export function LivePreviewReturn() {
  const pathname = usePathname();
  const embedded = useSyncExternalStore(subscribe, isEmbedded, hideDuringPrerender);
  if (embedded || !pathname.replace(/\/$/, "").endsWith("/live-preview")) return null;

  return (
    <aside aria-label="Baybloom preview navigation" className="border-b border-border bg-sand px-4 py-2">
      <div className="mx-auto max-w-6xl"><BackToBaybloom /></div>
    </aside>
  );
}
