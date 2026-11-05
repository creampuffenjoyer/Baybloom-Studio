import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getImageCredits } from "@/lib/catalog";
import { TEMPLATE_PHOTOS } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Photographers and licences for the sample photography used in the template demos.",
};

export default async function CreditsPage() {
  // Only templates that are published in the catalog.
  const designs = (await getImageCredits()).filter((d) => TEMPLATE_PHOTOS[d.slug]);

  return (
    <div className="container-page max-w-5xl py-16">
      <h1 className="text-4xl font-medium sm:text-5xl">Image credits</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        The template demos use sample photography from{" "}
        <a
          href="https://commons.wikimedia.org/"
          className="text-bay underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikimedia Commons
        </a>{" "}
        under free licences (CC0, CC BY and CC BY-SA), resized and converted to WebP. Catalog images are
        screenshots of those demos. Each template ships with its own credits page; replace the sample
        photos with your own before launch.
      </p>

      <div className="mt-12 space-y-14">
        {designs.map((d) => (
          <section key={d.slug} aria-labelledby={`credits-${d.slug}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id={`credits-${d.slug}`} className="text-2xl font-medium">
                <Link href={`/designs/${d.slug}`} className="hover:underline">
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
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-sand-deep">
                    <Image src={img.src} alt="" fill sizes="112px" className="object-cover" />
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="line-clamp-2 text-ink">{img.alt}</p>
                    <p className="mt-1 text-muted-foreground">
                      Photo:{" "}
                      <a href={img.source} className="underline underline-offset-2 hover:text-bay" target="_blank" rel="noopener noreferrer">
                        {img.author}
                      </a>
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
