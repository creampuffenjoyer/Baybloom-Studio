import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  ExternalLinkIcon,
  FileTextIcon,
  InfoIcon,
} from "lucide-react";
import {
  getDesignBySlug,
  getDesignPricing,
  getPublishedSlugs,
  getRelatedDesigns,
  type DesignDetail,
} from "@/lib/catalog";
import { TIER_LABEL, TYPE_LABEL } from "@/lib/format";
import { DesignGallery } from "@/components/design/design-gallery";
import { DeviceShowcase } from "@/components/design/device-showcase";
import { LockedPrice, PricePicker } from "@/components/design/price-panel";
import { ViewTracker } from "@/components/design/view-tracker";
import { SessionCardGrid } from "@/components/catalog/card-grid";
import { Reveal, RevealGroup, RevealItem, RevealListItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/designs/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const design = await getDesignBySlug(slug);
  if (!design) return { title: "Design not found" };
  return {
    title: design.title,
    description: design.summary,
    alternates: { canonical: `/designs/${design.slug}` },
    openGraph: {
      title: `${design.title} · Baybloom Studio`,
      description: design.summary,
      images: [{ url: design.heroImage, alt: design.heroAlt }],
    },
  };
}

export default function DesignPage(props: PageProps<"/designs/[slug]">) {
  return (
    <Suspense fallback={<DesignSkeleton />}>
      <DesignContent params={props.params} />
    </Suspense>
  );
}

function DesignSkeleton() {
  return (
    <div className="container-page pt-8" aria-hidden>
      <div className="shimmer h-4 w-48 rounded" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div>
          <div className="shimmer h-3 w-56 rounded" />
          <div className="shimmer mt-4 h-12 w-2/3 rounded" />
          <div className="shimmer mt-4 h-5 w-full max-w-xl rounded" />
          <div className="shimmer mt-8 aspect-[3/2] rounded-2xl" />
        </div>
        <div className="shimmer h-96 rounded-3xl lg:mt-20" />
      </div>
    </div>
  );
}

async function DesignContent({ params }: { params: PageProps<"/designs/[slug]">["params"] }) {
  const { slug } = await params;
  const design = await getDesignBySlug(slug);
  if (!design) notFound();

  const featureGroups = Object.entries(
    design.features.reduce<Record<string, string[]>>((acc, f) => {
      (acc[f.group] ??= []).push(f.name);
      return acc;
    }, {}),
  );
  const photos = design.images.filter((i) => i.kind !== "PLAN");

  return (
    <article>
      <ProductJsonLd design={design} />
      <ViewTracker slug={design.slug} />

      <div className="container-page pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/designs" className="hover:text-bay">
            Designs
          </Link>
          <ChevronRightIcon className="size-3.5" aria-hidden />
          <Link href={`/designs?category=${design.category.slug}`} className="hover:text-bay">
            {design.category.name}
          </Link>
          <ChevronRightIcon className="size-3.5" aria-hidden />
          <span aria-current="page" className="truncate text-ink">
            {design.title}
          </span>
        </nav>
      </div>

      <div className="container-page mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
            {TYPE_LABEL[design.type]} · {design.category.name}
            {design.style && ` · ${design.style.name}`}
          </p>
          <h1 className="mt-3 text-4xl font-medium text-balance sm:text-5xl">{design.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {design.summary}
          </p>

          <div className="mt-8">
            <DesignGallery images={design.images} title={design.title} />
          </div>

          {design.type !== "WEBSITE" && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm text-muted-foreground">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-bay" aria-hidden />
              Photos are illustrative references for the design direction. Your package
              includes the drawings and files listed below.
            </p>
          )}
        </div>

        {/* Price panel: static shell shows a skeleton; the gated part streams in. */}
        <aside className="lg:pt-20" aria-label="Pricing">
          <div className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_-30px_rgb(15_76_92/0.35)] ring-1 ring-border/70 lg:sticky lg:top-24">
            <h2 className="font-serif text-2xl font-medium">Pricing</h2>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">
              {design.tiers.length} {design.tiers.length === 1 ? "tier" : "tiers"} ·{" "}
              {design.tiers.map((t) => TIER_LABEL[t.level]).join(", ")}
            </p>
            <Suspense fallback={<PriceSkeleton />}>
              <PricePanel designId={design.id} slug={design.slug} />
            </Suspense>
            {design.demoUrl && (
              <a
                href={design.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-bay underline-offset-4 hover:underline"
              >
                View live demo <ExternalLinkIcon className="size-3.5" />
              </a>
            )}
          </div>
        </aside>
      </div>

      {design.type === "WEBSITE" && photos.length >= 3 && (
        <section className="mt-20 bg-gradient-to-b from-transparent via-sand-deep/70 to-transparent py-12">
          <div className="container-page">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-medium">Desktop and mobile, out of the box</h2>
              <p className="mt-3 text-muted-foreground">
                A preview of the template’s home page with sample content. Every page is
                fully responsive.
              </p>
            </Reveal>
            <DeviceShowcase
              name={design.title}
              tagline={design.summary.split(/[.,—]/)[0]}
              hero={photos[0]}
              secondary={photos[1]}
              tertiary={photos[2]}
            />
          </div>
        </section>
      )}

      <div className="container-page mt-20 grid gap-14 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-16">
          <Reveal>
            <h2 className="text-3xl font-medium">About this design</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink/85">
              {design.description.split(/\n\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          {featureGroups.length > 0 && (
            <section aria-labelledby="features">
              <Reveal>
                <h2 id="features" className="text-3xl font-medium">
                  Features
                </h2>
              </Reveal>
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {featureGroups.map(([group, names]) => (
                  <RevealGroup key={group}>
                    <h3 className="font-sans text-xs font-semibold tracking-[0.16em] text-ink/60 uppercase">
                      {group}
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {names.map((n) => (
                        <RevealListItem key={n} className="flex items-center gap-2.5">
                          <CheckCircle2Icon className="size-[18px] text-seaglass" aria-hidden />
                          {n}
                        </RevealListItem>
                      ))}
                    </ul>
                  </RevealGroup>
                ))}
              </div>
            </section>
          )}

          <TierComparison tiers={design.tiers} />
        </div>

        {design.deliverables.length > 0 && (
          <Reveal>
            <section
              aria-labelledby="deliverables"
              className="rounded-3xl border border-border bg-white/60 p-6"
            >
              <h2 id="deliverables" className="font-serif text-2xl font-medium">
                What you receive
              </h2>
              <ul className="mt-4 space-y-3">
                {design.deliverables.map((d) => (
                  <li key={d} className="flex gap-3 text-sm leading-relaxed">
                    <FileTextIcon className="mt-0.5 size-4 shrink-0 text-bay" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}
      </div>

      <Suspense>
        <RelatedDesigns design={design} />
      </Suspense>
    </article>
  );
}

async function PricePanel({ designId, slug }: { designId: string; slug: string }) {
  const pricing = await getDesignPricing(designId);
  if (!pricing) return <LockedPrice callbackUrl={`/designs/${slug}`} />;
  return <PricePicker pricing={pricing} />;
}

function PriceSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="shimmer h-12 rounded-xl" />
      ))}
      <div className="shimmer mt-4 h-12 rounded-full" />
      <div className="shimmer h-12 rounded-full" />
    </div>
  );
}

function TierComparison({ tiers }: { tiers: DesignDetail["tiers"] }) {
  return (
    <section aria-labelledby="tiers">
      <Reveal>
        <h2 id="tiers" className="text-3xl font-medium">
          Compare tiers
        </h2>
        <p className="mt-2 text-muted-foreground">What each level includes.</p>
      </Reveal>
      <RevealGroup className={cn("mt-6 grid gap-4", tiers.length > 1 && "md:grid-cols-3")}>
        {tiers.map((t) => (
          <RevealItem
            key={t.id}
            className={cn(
              "flex flex-col rounded-2xl p-5 ring-1",
              t.level === "PREMIUM"
                ? "bg-bay text-white ring-bay"
                : "bg-white ring-border/70",
            )}
          >
            <h3
              className={cn(
                "font-serif text-xl font-medium",
                t.level === "PREMIUM" && "text-white",
              )}
            >
              {TIER_LABEL[t.level]}
            </h3>
            <p className={cn("mt-1 text-sm", t.level === "PREMIUM" ? "text-white/75" : "text-muted-foreground")}>
              {t.revisions} {t.revisions === 1 ? "revision round" : "revision rounds"}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {t.inclusions.map((inc) => (
                <li key={inc} className="flex gap-2">
                  <CheckCircle2Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      t.level === "PREMIUM" ? "text-seaglass" : "text-bay",
                    )}
                    aria-hidden
                  />
                  {inc}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

async function RelatedDesigns({ design }: { design: DesignDetail }) {
  const related = await getRelatedDesigns(design.id, design.category.id, design.type);
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related" className="container-page mt-24">
      <Reveal>
        <h2 id="related" className="text-3xl font-medium">
          You might also like
        </h2>
      </Reveal>
      <div className="mt-8">
        <SessionCardGrid items={related} />
      </div>
    </section>
  );
}

/** Product structured data without price (spec §9). */
function ProductJsonLd({ design }: { design: DesignDetail }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: design.title,
    description: design.summary,
    image: [design.heroImage, ...design.images.slice(0, 4).map((i) => i.url)],
    category: `${TYPE_LABEL[design.type]} / ${design.category.name}`,
    brand: { "@type": "Brand", name: "Baybloom Studio" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
