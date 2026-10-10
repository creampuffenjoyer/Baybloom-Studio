import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, LockOpenIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";
import {
  getCategoriesWithCovers,
  getFeaturedDesigns,
  getHomeStats,
} from "@/lib/catalog";
import { Hero } from "@/components/home/hero";
import { Counter } from "@/components/home/counter";
import { CardGridSkeleton, SessionCardGrid } from "@/components/catalog/card-grid";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [featured, categories, stats] = await Promise.all([
    getFeaturedDesigns(6),
    getCategoriesWithCovers(),
    getHomeStats(),
  ]);
  const lead = featured[0];

  return (
    <>
      <Hero
        image={lead?.heroImage ?? "/images/designs/coral-cove/00-turquoise-lagoon-and-white-sand-beach.webp"}
        alt={lead?.heroAlt ?? ""}
        featured={lead ? { title: lead.title, href: `/designs/${lead.slug}` } : null}
      />

      {/* Stats */}
      <section aria-label="At a glance" className="border-b border-border/70 bg-white/60">
        <dl className="container-page grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4">
          {[
            { label: "Designs available", value: stats.designs },
            { label: "Resort settings", value: stats.categories },
            { label: "Features to choose from", value: stats.features },
            ...(stats.clients > 0
              ? [{ label: "Happy clients", value: stats.clients }]
              : [{ label: "Tiers per design", value: 3, suffix: "" }]),
          ].map((s) => (
            <div key={s.label} className="text-center">
              <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{s.label}</dt>
              <dd className="mt-2 font-serif text-4xl font-medium text-bay sm:text-5xl">
                <Counter value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured */}
      <section className="container-page mt-24" aria-labelledby="featured">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
              Featured
            </p>
            <h2 id="featured" className="mt-3 text-4xl font-medium sm:text-5xl">
              This season’s favourites
            </h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full text-bay">
            <Link href="/designs">
              View all designs <ArrowRightIcon />
            </Link>
          </Button>
        </Reveal>
        <div className="mt-10">
          <Suspense fallback={<CardGridSkeleton count={6} />}>
            <SessionCardGrid items={featured} />
          </Suspense>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-28" aria-labelledby="settings">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
            Find your setting
          </p>
          <h2 id="settings" className="mt-3 text-4xl font-medium sm:text-5xl">
            From lagoon to treeline
          </h2>
        </Reveal>
        <RevealGroup className="mt-10 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <RevealItem
              key={c.slug}
              className={cn(
                i === 0 && "sm:row-span-2 lg:col-span-2",
                i === 3 && "lg:col-span-2",
              )}
            >
              <Link
                href={`/designs?category=${c.slug}`}
                className="group relative flex h-full overflow-hidden rounded-2xl bg-bay focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {c.cover && (
                  <Image
                    src={c.cover.heroImage}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bay-deep/85 via-bay-deep/20 to-transparent" />
                <div className="relative mt-auto p-6 text-white">
                  <h3 className="font-serif text-2xl font-medium text-white">{c.name}</h3>
                  <p className="mt-1 text-sm text-white/80">
                    {c.description} · {c.count} {c.count === 1 ? "design" : "designs"}
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mt-28 scroll-mt-20 bg-white/70 py-24" aria-labelledby="how">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
              How it works
            </p>
            <h2 id="how" className="mt-3 text-4xl font-medium sm:text-5xl">
              Three steps to a resort that stands out
            </h2>
          </Reveal>
          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.12}>
            {[
              {
                icon: SearchIcon,
                title: "Browse the collection",
                body: "Filter websites, plans and interiors by setting, style, tier and the features you need.",
              },
              {
                icon: LockOpenIcon,
                title: "Log in for pricing",
                body: "A free client account unlocks prices, tier details and add-ons, plus favorites and side-by-side compare.",
              },
              {
                icon: ShoppingBagIcon,
                title: "Buy and download",
                body: "Pay online and download your files straight away, with revision rounds included in every tier.",
              },
            ].map((step, i) => (
              <RevealItem key={step.title} className="rounded-3xl bg-sand p-8">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-full bg-bay text-white">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-serif text-5xl text-seaglass">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl font-medium">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-24">
        <Reveal className="relative overflow-hidden rounded-3xl bg-bay px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 size-72 rounded-full bg-seaglass/25 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-24 size-72 rounded-full bg-hibiscus/25 blur-3xl"
          />
          <h2 className="relative mx-auto max-w-2xl text-4xl font-medium text-white sm:text-5xl">
            Your resort, beautifully designed.
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/80">
            Create a free account to see pricing on every design.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-hibiscus-strong px-7 text-base text-white hover:bg-hibiscus-strong/90"
            >
              <Link href="/register">Create an account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/designs">Browse first</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
