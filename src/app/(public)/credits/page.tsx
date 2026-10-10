import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getImageCredits } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Photographers and licenses for the sample imagery used across the catalog.",
};

export default async function CreditsPage() {
  const designs = await getImageCredits();

  return (
    <div className="container-page max-w-5xl py-16">
      <h1 className="text-4xl font-medium sm:text-5xl">Image credits</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Sample photography in the catalog comes from{" "}
        <a
          href="https://commons.wikimedia.org/"
          className="text-bay underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikimedia Commons
        </a>{" "}
        under free licenses (CC0, CC BY and CC BY-SA). Images were resized and converted to
        WebP. They illustrate each design’s direction and are not the deliverables
        themselves.
      </p>

      <div className="mt-12 space-y-14">
        {designs.map((d) => (
          <section key={d.slug} aria-labelledby={`credits-${d.slug}`}>
            <h2 id={`credits-${d.slug}`} className="text-2xl font-medium">
              <Link href={`/designs/${d.slug}`} className="hover:underline">
                {d.title}
              </Link>
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {d.images.map((img) => (
                <li key={img.id} className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-border/70">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-sand-deep">
                    <Image
                      src={img.thumbUrl ?? img.url}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="line-clamp-2 text-ink">{img.alt}</p>
                    <p className="mt-1 text-muted-foreground">
                      Photo:{" "}
                      {img.creditUrl ? (
                        <a
                          href={img.creditUrl}
                          className="underline underline-offset-2 hover:text-bay"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {img.creditName}
                        </a>
                      ) : (
                        img.creditName
                      )}
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
