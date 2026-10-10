import type { DesignCard as DesignCardData } from "@/lib/catalog";
import { getFromPrices } from "@/lib/catalog";
import { getFavoriteIds } from "@/lib/favorites";
import { getCurrentUser } from "@/lib/session";
import { DesignCard } from "@/components/catalog/design-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

/**
 * A grid of cards decorated with the viewer's prices and favorites.
 * Reads the session, so render it inside <Suspense>.
 */
export async function SessionCardGrid({ items }: { items: DesignCardData[] }) {
  const user = await getCurrentUser();
  const ids = items.map((d) => d.id);
  const [prices, favoriteIds] = user
    ? await Promise.all([getFromPrices(ids), getFavoriteIds(user.id, ids)])
    : [null, [] as string[]];

  return (
    <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((d) => (
        <RevealItem key={d.id}>
          <DesignCard
            design={d}
            price={prices?.[d.id] ?? null}
            signedIn={Boolean(user)}
            favorited={favoriteIds.includes(d.id)}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-border/70">
          <div className="shimmer aspect-[4/3]" />
          <div className="space-y-3 p-5">
            <div className="shimmer h-3 w-32 rounded" />
            <div className="shimmer h-5 w-48 rounded" />
            <div className="shimmer h-4 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
