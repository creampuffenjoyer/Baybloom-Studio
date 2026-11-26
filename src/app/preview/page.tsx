import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BackToBaybloom } from "@/components/layout/back-to-baybloom";
import { PageHeading } from "@/components/layout/page-heading";
import { CATEGORIES, DESIGNS } from "../../../prisma/catalog";

export const metadata: Metadata = {
  title: "Studio collection preview",
  robots: { index: false, follow: true },
};

// The shipped demos can be previewed even while the commerce database is offline.
const designs = [...DESIGNS].sort((a, b) => a.title.localeCompare(b.title));
const industries = new Map(CATEGORIES.map(category => [category.slug, category.name]));
const industryCount = new Set(designs.map(design => design.category)).size;

export default function PreviewIndex() {
  return (
    <main className="min-h-dvh bg-sand">
      <div className="container-page py-8 sm:py-12">
        <PageHeading title="Studio collection preview" action={<BackToBaybloom />}>
          <p>Explore {designs.length} templates across {industryCount} industries in desktop and mobile previews.</p>
        </PageHeading>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map(({ slug, title, summary, category }) => (
            <li key={slug} className="h-full">
              <Link href={`/preview/${slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bay">
                <Image
                  src={`/images/designs/${slug}/cover.webp`}
                  alt=""
                  width={1600}
                  height={1200}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3] w-full border-b border-border object-cover"
                />
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="text-xs font-medium text-muted-foreground">{industries.get(category)}</p>
                  <h2 className="text-2xl font-medium group-hover:underline group-hover:underline-offset-4">{title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
                  <span className="mt-auto pt-2 text-sm font-semibold text-bay">Open preview <span aria-hidden="true">↗</span></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
