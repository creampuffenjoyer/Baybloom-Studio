import { BloomGuide } from "@/components/bloom-guide";
import { SHOWCASE } from "@/lib/templates";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getFilterOptions, getPublishedSlugs } from "@/lib/catalog";
import { CatalogNavProvider } from "@/components/catalog/catalog-nav";
import { FilterControls, SearchBox } from "@/components/catalog/catalog-filters";
import { CatalogResults, ResultsSkeleton } from "@/app/(store)/(public)/designs/results";
import { PageHeading } from "@/components/layout/page-heading";

export const metadata: Metadata = {
  title: "Website templates for hospitality",
  description:
    "Browse website templates for resorts, hotels, restaurants, spas and event venues. Filter by industry, style, tier and features.",
  alternates: { canonical: "/designs" },
};

export default async function DesignsPage(props: PageProps<"/designs">) {
  const [options, published] = await Promise.all([getFilterOptions(), getPublishedSlugs()]);

  return (
    <CatalogNavProvider>
      <div className="container-page pt-12 pb-8 sm:pt-16">
        <PageHeading eyebrow="The collection" title="A website that feels like your place">
          <p>
          Complete, multi-page website templates for resorts, hotels, restaurants, spas and
          venues. Try every live demo, then log in to see pricing for each tier.
          </p>
        </PageHeading>
        <BloomGuide page="catalog" matches={SHOWCASE.filter(item => published.includes(item.slug))} />
      </div>

      <div className="container-page grid gap-10 pb-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] space-y-6 overflow-y-auto rounded-xl border border-border bg-white/50 p-5 [scrollbar-width:thin]">
            <Suspense fallback={<FiltersSkeleton />}>
              <SearchBox />
              <FilterControls options={options} />
            </Suspense>
          </div>
        </aside>

        <section aria-label="Designs" className="min-w-0">
          <div className="mb-6 lg:hidden">
            <Suspense fallback={<div className="shimmer h-11 rounded-full" />}>
              <SearchBox />
            </Suspense>
          </div>
          <Suspense fallback={<ResultsSkeleton />}>
            <CatalogResults searchParams={props.searchParams} options={options} />
          </Suspense>
        </section>
      </div>
    </CatalogNavProvider>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="shimmer h-11 rounded-full" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-3">
          <div className="shimmer h-3 w-24 rounded" />
          <div className="shimmer h-4 w-40 rounded" />
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-4 w-36 rounded" />
        </div>
      ))}
    </div>
  );
}

