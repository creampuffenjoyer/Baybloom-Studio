import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { getFromPrices, searchDesigns, type FilterOptions } from "@/lib/catalog";
import { getFavoriteIds } from "@/lib/favorites";
import { getCurrentUser } from "@/lib/session";
import { parseCatalogQuery } from "@/lib/validators";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { MobileFilters } from "@/components/catalog/catalog-filters";
import { SortSelect } from "@/components/catalog/sort-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

/** Reads searchParams and the session, so it streams behind <Suspense>. */
export async function CatalogResults({
  searchParams,
  options,
}: {
  searchParams: Promise<SearchParams>;
  options: FilterOptions;
}) {
  const raw = await searchParams;
  const query = parseCatalogQuery(raw);
  const user = await getCurrentUser();
  const result = await searchDesigns(query, Boolean(user));
  const ids = result.items.map((d) => d.id);
  const [prices, favoriteIds] = user
    ? await Promise.all([getFromPrices(ids), getFavoriteIds(user.id, ids)])
    : [null, []];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-ink">{result.total}</span>{" "}
          {result.total === 1 ? "design" : "designs"}
          {query.q && (
            <>
              {" "}
              for “<span className="text-ink">{query.q}</span>”
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <MobileFilters options={options} />
          <SortSelect current={result.sort} canSortByPrice={Boolean(user)} />
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white/60 px-6 py-20 text-center">
          <SearchXIcon className="size-10 text-seaglass" aria-hidden />
          <h2 className="mt-4 text-2xl font-medium">No designs match those filters</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Try removing a feature or two, or search for something broader.
          </p>
          <Button asChild variant="outline" className="mt-6 rounded-full bg-white">
            <Link href="/designs">Clear all filters</Link>
          </Button>
        </div>
      ) : (
        <CatalogGrid
          items={result.items}
          prices={prices}
          favoriteIds={favoriteIds}
          signedIn={Boolean(user)}
        />
      )}

      {result.pageCount > 1 && (
        <Pagination page={result.page} pageCount={result.pageCount} raw={raw} />
      )}
    </>
  );
}

function Pagination({
  page,
  pageCount,
  raw,
}: {
  page: number;
  pageCount: number;
  raw: SearchParams;
}) {
  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(raw)) {
      if (k === "page" || v === undefined) continue;
      params.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/designs?${qs}` : "/designs";
  };

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "grid size-10 place-items-center rounded-full text-sm font-medium transition-colors",
            p === page ? "bg-bay text-white" : "bg-white text-ink hover:bg-secondary",
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}

export function ResultsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 flex justify-between">
        <div className="shimmer h-5 w-24 rounded" />
        <div className="shimmer h-10 w-44 rounded-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-border/70">
            <div className="shimmer aspect-[4/3]" />
            <div className="space-y-3 p-5">
              <div className="shimmer h-3 w-32 rounded" />
              <div className="shimmer h-5 w-48 rounded" />
              <div className="shimmer h-4 w-full rounded" />
              <div className="shimmer h-6 w-36 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
