import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCatalogDirectory } from "@/lib/catalog";
import { TEMPLATE_PHOTOS } from "@/lib/templates";
import { PageHeading } from "@/components/layout/page-heading";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Photographers and licences for the sample photography used in the template demos.",
};

export default async function CreditsPage() {
  const designs = (await getCatalogDirectory()).filter((d) => Object.hasOwn(TEMPLATE_PHOTOS, d.slug));

  return (
    <div className="container-page max-w-5xl py-16">
      <PageHeading eyebrow="Behind the imagery" title="Image credits">
      <p>
        The template demos use sample photography from{" "}
        <a
          href="https://commons.wikimedia.org/"
          className="text-bay underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikimedia Commons
        </a>{" "}
        under free licences, alongside images generated for Baybloom Studio. Each entry lists its source
        and licence. The catalog covers are screenshots of the demos.
      </p>
      </PageHeading>

      <div className="mt-12 space-y-14">
        {designs.map((d) => (
          <section key={d.slug} aria-labelledby={`credits-${d.slug}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id={`credits-${d.slug}`} className="text-2xl font-medium">
                <Link href={d.status === "DRAFT" ? `/preview/${d.slug}` : `/designs/${d.slug}`} className="hover:underline">
                  {d.title}
                </Link>
              </h2>
              <Link href={`/demo/${d.slug}/credits`} className="text-sm text-bay underline underline-offset-4">
                Credits page in the demo
              </Link>
            </div>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {TEMPLATE_PHOTOS[d.slug].map((img) => (
                <li key={img.src} className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-border/70">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-sand-deep sm:w-28">
                    <Image src={img.src} alt="" fill sizes="112px" className="object-cover" />
                  </div>
                  <div className="min-w-0 text-sm [overflow-wrap:anywhere]">
                    <p className="line-clamp-2 text-ink">{img.alt}</p>
                    <p className="mt-1 text-muted-foreground">
                      Photo:{" "}
                      {img.source ? <a href={img.source} className="underline underline-offset-2 hover:text-bay" target="_blank" rel="noopener noreferrer">
                        {img.author}
                      </a> : img.author}
                      {" · "}
                      {img.licenseUrl ? (
                        <a
                          href={img.licenseUrl}
                          className="underline underline-offset-2 hover:text-bay"
                          target="_blank"
                          rel="noopener noreferrer license"
                        >
                          {img.license}
                        </a>
                      ) : (
                        img.license
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
