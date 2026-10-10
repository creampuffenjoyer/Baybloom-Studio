"use client";

import { useEffect } from "react";

/** Counts one view per design per browser session. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable (private mode); still count the view.
    }
    const url = `/api/designs/${encodeURIComponent(slug)}/view`;
    if (!navigator.sendBeacon?.(url)) {
      void fetch(url, { method: "POST", keepalive: true });
    }
  }, [slug]);
  return null;
}
