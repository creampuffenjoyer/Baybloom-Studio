"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HeartIcon } from "lucide-react";
import type { DesignCard as DesignCardData } from "@/lib/catalog";
import { DesignCard } from "@/components/catalog/design-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setFavoriteAction } from "@/app/actions/favorites";

export function FavoritesGrid({
  initialItems,
  prices,
}: {
  initialItems: DesignCardData[];
  prices: Record<string, { priceCents: number; currency: string }> | null;
}) {
  const [items, setItems] = useState(initialItems);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-20 text-center"
      >
        <HeartIcon className="size-10 text-hibiscus" aria-hidden />
        <h2 className="mt-4 text-2xl font-medium">No favorites yet</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Tap the heart on any design to save it here for later.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/designs">Browse designs</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {items.map((d) => (
          <motion.li
            key={d.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
          >
            <DesignCard
              design={d}
              price={prices?.[d.id] ?? null}
              signedIn
              favorited
              onFavoriteChange={(fav) => {
                if (fav) return;
                const index = items.findIndex((x) => x.id === d.id);
                setItems((list) => list.filter((x) => x.id !== d.id));
                toast(`Removed ${d.title} from favorites`, {
                  duration: 8000,
                  action: {
                    label: "Undo",
                    onClick: async () => {
                      const res = await setFavoriteAction(d.id, true);
                      if (!res.ok) return toast.error("Couldn't restore it. Please try again.");
                      setItems((list) => {
                        const next = list.filter((x) => x.id !== d.id);
                        next.splice(Math.min(index, next.length), 0, d);
                        return next;
                      });
                    },
                  },
                });
              }}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
