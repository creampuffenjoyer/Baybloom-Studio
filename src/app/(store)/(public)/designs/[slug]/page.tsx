import { BloomGuide } from "@/components/bloom-guide";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  FileTextIcon,
  MonitorSmartphoneIcon,
  PencilIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDesignBySlug,
  getDesignPricing,
  getPublishedSlugs,
  getRelatedDesigns,
  type DesignDetail,
} from "@/lib/catalog";
import { TIER_LABEL } from "@/lib/format";
import { DesignGallery } from "@/components/design/design-gallery";
import { DeviceShowcase } from "@/components/design/device-showcase";
import { LockedPrice, PricePicker } from "@/components/design/price-panel";
import { ViewTracker } from "@/components/design/view-tracker";
import { SessionCardGrid } from "@/components/catalog/card-grid";
import { Reveal, RevealGroup, RevealItem, RevealListItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const previewFacts: Record<string, { fit: string; explore: string; languages?: string }> = {
  "still-water-spa": { fit: "day spas with treatments of different types and durations.", explore: "treatment matching, duration choices, packages and sample appointment requests.", languages: "English in the preview. Partial Tagalog and Taglish drafts are included in the source." },
  "ember-and-salt": { fit: "restaurants and bars with changing menus and private dining.", explore: "searchable menus with dietary labels, sample table requests, private dining, and gift cards.", languages: "English. Tagalog and Taglish versions are not yet available." },
  "bloomfield-gardens": { fit: "garden wedding and event venues with several celebration spaces.", explore: "space matching by guest count and arrangement, package details, and a sample inquiry.", languages: "English, with partial draft Tagalog and Taglish translations. Some text remains in English." },
  "isla-verde-boutique": { fit: "heritage hotels with distinctive rooms, local stories, dining, and events.", explore: "room matching by guest count and setting, the house story, Vigan journals, and sample stay planning." },
  "harbor-house": { fit: "owner-run guesthouses and small B&Bs that want to introduce their rooms and local area.", explore: "individual room pages, a local guide, breakfast, and a three-step sample booking." },
  "coral-cove": { fit: "island resorts with several villa styles, experiences, and stay packages.", explore: "villa comparison by capacity and pool type, stay planning, sample extras and estimates, and resort galleries." },
  "pine-ridge-lodge": { fit: "seasonal mountain lodges with rooms, cabins, and outdoor activities.", explore: "winter and summer trip planning, activities by level, rooms that fit your group, and sample stay estimates." },
  "lumen-lake-villas": { fit: "quiet lakeside retreats with several distinct villa styles and nature led experiences.", explore: "villa matching by group size, side by side amenity comparisons, a guided lake tour, and sample stay planning." },
};
const personalizableTemplates = new Set(["harbor-house", "coral-cove", "pine-ridge-lodge", "lumen-lake-villas", "isla-verde-boutique", "ember-and-salt", "still-water-spa", "bloomfield-gardens"]);

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
  const shots = design.images.filter((i) => i.kind !== "MOCKUP");
  const mobileShot = design.images.find((i) => i.kind === "MOCKUP");
  const facts = previewFacts[design.slug];
  const previewUrl = facts ? `/preview/${design.slug}` : design.demoUrl;

  return (
    <article>
      <ProductJsonLd design={design} />
      <ViewTracker slug={design.slug} />

      <div className="container-page pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/designs" className="inline-flex min-h-11 items-center hover:text-bay">
            Designs
          </Link>
          <ChevronRightIcon className="size-3.5" aria-hidden />
          <Link href={`/designs?category=${design.category.slug}`} className="inline-flex min-h-11 items-center hover:text-bay">
            {design.category.name}
          </Link>
          <ChevronRightIcon className="size-3.5" aria-hidden />
          <span aria-current="page" className="min-w-0 break-words text-ink">
            {design.title}
          </span>
        </nav>
      </div>

      <div className="container-page mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="min-w-0">
          <p className="text-sm font-medium text-hibiscus-strong">
            Website template · {design.category.name}
            {design.style && ` · ${design.style.name}`}
          </p>
          <h1 className="mt-3 text-4xl font-medium text-balance sm:text-5xl">{design.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {design.summary}
          </p>

          <BloomGuide key={design.slug} page="design" slug={design.slug} previewUrl={previewUrl} canEdit={personalizableTemplates.has(design.slug)} />
          {(design.demoUrl || personalizableTemplates.has(design.slug)) && (
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              {personalizableTemplates.has(design.slug) && <Button asChild size="lg" className="h-12 rounded-lg px-6 text-base">
                <Link href={`/personalize/${design.slug}`}>
                  <PencilIcon /> Personalize this template
                </Link>
              </Button>}
              {design.demoUrl && <Button asChild size="lg" variant={personalizableTemplates.has(design.slug) ? "outline" : "default"} className="h-12 rounded-lg px-6 text-base">
                <Link href={previewUrl!}>
                  <MonitorSmartphoneIcon /> Try the live demo
                </Link>
              </Button>}
              <p className="basis-full text-sm text-muted-foreground">{personalizableTemplates.has(design.slug) ? "Try your text, colors and photos in a preview. Sign in to save your draft." : "Explore the pages and sample interactions. No reservations are made."}</p>
            </div>
          )}

          {facts && (
            <section aria-label="About this template" className="mt-6 space-y-3 border-y border-border py-5 text-sm leading-relaxed">
              <p><strong>Best for:</strong> {facts.fit}</p>
              <p><strong>Explore:</strong> {facts.explore}</p>
              <p><strong>What you receive:</strong> downloadable website source. This is not a hosted booking service. Live availability, form delivery, hosting, and payments need configuration or integration.</p>
              <p><strong>Languages:</strong> {facts.languages ?? "Explore this template in English, Tagalog, or Taglish."}</p>
            </section>
          )}
          <div className="mt-8">
            <DesignGallery images={shots} title={design.title} />
          </div>

        </div>

        {/* Price panel: static shell shows a skeleton; the gated part streams in. */}
        <aside className="lg:pt-20" aria-label="Pricing">
          <div className="rounded-2xl border border-border bg-white p-6 lg:sticky lg:top-24">
            <h2 className="font-serif text-2xl font-medium">Pricing</h2>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">
              {design.tiers.length} {design.tiers.length === 1 ? "tier" : "tiers"} ·{" "}
              {design.tiers.map((t) => TIER_LABEL[t.level]).join(", ")}
            </p>
            <Suspense fallback={<PriceSkeleton />}>
              <PricePanel
                designId={design.id}
                compareItem={{ slug: design.slug, title: design.title, heroImage: design.heroImage }}
              />
            </Suspense>
            {design.demoUrl && (
              <Link
                href={previewUrl!}
                className="mt-5 flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-bay underline-offset-4 hover:underline"
              >
                <MonitorSmartphoneIcon className="size-4" /> Open the live demo
              </Link>
            )}
          </div>
        </aside>
      </div>

      {shots.length > 0 && mobileShot && (
        <section className="mt-20 bg-gradient-to-b from-transparent via-sand-deep/70 to-transparent py-12">
          <div className="container-page">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-medium">Desktop and mobile, out of the box</h2>
              <p className="mt-3 text-muted-foreground">
                The real home page, captured from the live demo. Every page is fully responsive.
              </p>
            </Reveal>
            <DeviceShowcase desktop={shots[0]} mobile={mobileShot} demoUrl={previewUrl} />
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

async function PricePanel({
  designId,
  compareItem,
}: {
  designId: string;
  compareItem: { slug: string; title: string; heroImage: string };
}) {
  const pricing = await getDesignPricing(designId);
  if (!pricing) return <LockedPrice callbackUrl={`/designs/${compareItem.slug}`} />;
  return <PricePicker designId={designId} pricing={pricing} compareItem={compareItem} />;
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
  const related = await getRelatedDesigns(design.id, design.category.id);
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
    category: `Website template / ${design.category.name}`,
    brand: { "@type": "Brand", name: "Baybloom Studio" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
