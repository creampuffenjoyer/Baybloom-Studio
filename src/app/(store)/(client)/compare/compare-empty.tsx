"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GitCompareArrowsIcon } from "lucide-react";
import { compareHref, useCompare } from "@/components/compare/compare-store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";

/** Shown when /compare has no designs in the URL. */
export function CompareEmpty() {
  const router = useRouter();
  const { items } = useCompare();

  // If this browser has a saved selection, open it.
  useEffect(() => {
    if (items.length > 0) router.replace(compareHref(items));
  }, [items, router]);

  return (
    <EmptyState icon={GitCompareArrowsIcon} title="Nothing to compare yet" action={<>
        <Button asChild className="h-12 rounded-lg px-6">
          <Link href="/designs">Browse designs</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-lg bg-white px-6">
          <Link href="/favorites">From my favorites</Link>
        </Button>
      </>}>
      <p>Choose the compare button on a design card to add it here. You can compare up to three designs.</p>
    </EmptyState>
  );
}
