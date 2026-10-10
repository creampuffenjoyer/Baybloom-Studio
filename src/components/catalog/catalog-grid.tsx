"use client";

import { AnimatePresence, motion } from "motion/react";
import type { DesignCard as DesignCardData } from "@/lib/catalog";
import { DesignCard } from "@/components/catalog/design-card";
import { useCatalogNav } from "@/components/catalog/catalog-nav";
import { cn } from "@/lib/utils";

export function CatalogGrid({
  items,
  prices,
  favoriteIds,
  signedIn,
}: {
  items: DesignCardData[];
  prices: Record<string, { priceCents: number; currency: string }> | null;
  favoriteIds: string[];
  signedIn: boolean;
}) {
  const { isPending } = useCatalogNav();
  return (
    <motion.ul
      layout
      aria-busy={isPending}
      className={cn(
        "grid gap-6 transition-opacity duration-300 sm:grid-cols-2 xl:grid-cols-3",
        isPending && "opacity-60",
      )}
    >
      <AnimatePresence mode="popLayout" initial>
        {items.map((d, i) => (
          <motion.li
            key={d.id}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
          >
            <DesignCard
              design={d}
              price={prices?.[d.id] ?? null}
              signedIn={signedIn}
              favorited={favoriteIds.includes(d.id)}
              priority={i < 3}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
