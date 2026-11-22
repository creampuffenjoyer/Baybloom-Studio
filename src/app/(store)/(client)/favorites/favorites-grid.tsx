"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HeartIcon } from "lucide-react";
import type { DesignCard as DesignCardData } from "@/lib/catalog";
import { DesignCard } from "@/components/catalog/design-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
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
      <EmptyState icon={HeartIcon} title="No favorites yet" action={<Button asChild className="h-12 rounded-lg px-6"><Link href="/designs">Explore templates</Link></Button>}>
        <p>Tap the heart on any design to keep it here. Your shortlist will be ready whenever you are.</p>
      </EmptyState>
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
