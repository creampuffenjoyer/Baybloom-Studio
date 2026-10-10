"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GitCompareArrowsIcon } from "lucide-react";
import { compareHref, useCompare } from "@/components/compare/compare-store";
import { Button } from "@/components/ui/button";

/** Shown when /compare has no designs in the URL. */
export function CompareEmpty() {
  const router = useRouter();
  const { items } = useCompare();

  // If this browser has a saved selection, open it.
  useEffect(() => {
    if (items.length > 0) router.replace(compareHref(items));
  }, [items, router]);

  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-20 text-center">
      <GitCompareArrowsIcon className="size-10 text-seaglass" aria-hidden />
      <h2 className="mt-4 text-2xl font-medium">Nothing to compare yet</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Use the compare button on any design card or design page to add up to three designs.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/designs">Browse designs</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link href="/favorites">From my favorites</Link>
        </Button>
      </div>
    </div>
  );
}
