import type { Metadata } from "next";
import { Suspense } from "react";
import { getCompareColumns } from "@/lib/catalog";
import { requireUser } from "@/lib/session";
import { CompareTable } from "@/app/(store)/(client)/compare/compare-table";
import { CompareEmpty } from "@/app/(store)/(client)/compare/compare-empty";
import { PageHeading } from "@/components/layout/page-heading";

export const metadata: Metadata = {
  title: "Compare designs",
  robots: { index: false },
};

export default function ComparePage(props: PageProps<"/compare">) {
  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeading eyebrow="Your collection" title="Compare designs">
        <p>Compare prices, tiers and included features for up to three designs, all in one place.</p>
      </PageHeading>
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
