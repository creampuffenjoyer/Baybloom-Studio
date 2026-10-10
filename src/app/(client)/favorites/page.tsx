import type { Metadata } from "next";
import { Suspense } from "react";
import { getDesignCards, getFromPrices } from "@/lib/catalog";
import { getFavoriteDesignIds } from "@/lib/favorites";
import { requireUser } from "@/lib/session";
import { CardGridSkeleton } from "@/components/catalog/card-grid";
import { FavoritesGrid } from "@/app/(client)/favorites/favorites-grid";

export const metadata: Metadata = {
  title: "Favorites",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
        Client area
      </p>
      <h1 className="mt-3 text-4xl font-medium sm:text-5xl">Your favorites</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Designs you&apos;ve saved. Pick up to three to compare side by side.
      </p>
      <div className="mt-10">
        <Suspense fallback={<CardGridSkeleton count={3} />}>
          <Favorites />
        </Suspense>
      </div>
    </div>
  );
}

async function Favorites() {
  const user = await requireUser("/favorites");
  const ids = await getFavoriteDesignIds(user.id);
  const [items, prices] = await Promise.all([getDesignCards(ids), getFromPrices(ids)]);
  return <FavoritesGrid initialItems={items} prices={prices} />;
}
