import type { Metadata } from "next";
import { Suspense } from "react";
import { getDesignCards, getFromPrices } from "@/lib/catalog";
import { getFavoriteDesignIds } from "@/lib/favorites";
import { requireUser } from "@/lib/session";
import { CardGridSkeleton } from "@/components/catalog/card-grid";
import { FavoritesGrid } from "@/app/(store)/(client)/favorites/favorites-grid";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";

export const metadata: Metadata = {
  title: "Favorites",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeading eyebrow="Your collection" title="Your favorites" action={<Link href="/designs" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-bay hover:underline">Keep exploring <ArrowRightIcon aria-hidden className="size-4" /></Link>}>
        <p>A shortlist of places to start. Save the designs you love, then compare up to three side by side.</p>
      </PageHeading>
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
