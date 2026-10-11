import type { Metadata } from "next";
import { Suspense } from "react";
import { getCompareColumns } from "@/lib/catalog";
import { requireUser } from "@/lib/session";
import { CompareTable } from "@/app/(store)/(client)/compare/compare-table";
import { CompareEmpty } from "@/app/(store)/(client)/compare/compare-empty";

export const metadata: Metadata = {
  title: "Compare designs",
  robots: { index: false },
};

export default function ComparePage(props: PageProps<"/compare">) {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
        Client area
      </p>
      <h1 className="mt-3 text-4xl font-medium sm:text-5xl">Compare designs</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Prices, tiers, features and deliverables side by side, for up to three designs.
      </p>
      <div className="mt-10">
        <Suspense fallback={<div className="shimmer h-[520px] rounded-3xl" />}>
          <Compare searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Compare({ searchParams }: Pick<PageProps<"/compare">, "searchParams">) {
  const { d } = await searchParams;
  const slugs = (Array.isArray(d) ? d.join(",") : (d ?? ""))
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,80}$/.test(s))
    .slice(0, 3);

  await requireUser(slugs.length ? `/compare?d=${slugs.join(",")}` : "/compare");
  const columns = await getCompareColumns(slugs);

  // No selection in the URL: restore it from this browser's saved selection.
  if (columns.length === 0) return <CompareEmpty />;
  return <CompareTable columns={columns} />;
}
