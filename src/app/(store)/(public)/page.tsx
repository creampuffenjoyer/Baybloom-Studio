import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, CalendarCheckIcon, CodeIcon, LayoutTemplateIcon, SmartphoneIcon } from "lucide-react";
import { getCategoriesWithCovers, getFeaturedDesigns, getHomeStats } from "@/lib/catalog";
import { Hero } from "@/components/home/hero";
import { CardGridSkeleton, SessionCardGrid } from "@/components/catalog/card-grid";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { INDUSTRY_COVERS, SHOWCASE } from "@/lib/templates";
import { cn } from "@/lib/utils";

const INCLUDED = [
  { icon: LayoutTemplateIcon, title: "Every page in the demo", text: "Home, rooms or menus, detail pages, gallery, story and contact." },
  { icon: CalendarCheckIcon, title: "Booking layouts included", text: "Explore sample bookings, then connect your own reservation system." },
  { icon: SmartphoneIcon, title: "Made for every screen", text: "Thoughtful layouts for guests browsing on phones, tablets and desktops." },
  { icon: CodeIcon, title: "The full source code", text: "Next.js and Tailwind CSS, with a setup guide and style guide." },
];

const STEPS = [
  { title: "Try the live demos", text: "Click through every page and run the booking flow, exactly as your guests will." },
  { title: "Log in for pricing", text: "A free account shows prices for each tier, plus favourites and side-by-side compare." },
  { title: "Make it your own", text: "Choose a tier and download your source. Add your content, connect your services and prepare to launch." },
];

const FAQ = [
  {
    q: "Do I need a developer?",
    a: "To change words, photos, prices and colours, no: they live in two plain files, and the setup guide walks you through them. To connect a booking engine or payment gateway, a developer will help, or choose the Premium tier and we set it up with you.",
  },
  {
    q: "Can I use my own booking engine?",
    a: "Yes. The booking flows work in the demo with sample availability, and each one has a single place to connect your booking engine, channel manager, reservation system or simple email requests.",
  },
  {
    q: "What exactly do I download?",
    a: "A complete Next.js and Tailwind CSS project for the template you bought, with every page from the demo, the sample photos and their credits, a setup guide and a style guide. Higher tiers add guides and customisation kits.",
  },
  {
    q: "Can you customise it for me?",
    a: "Yes. Every tier includes revision rounds, and add-ons cover custom branding, extra languages and hosting setup. Tell us what you need after checkout.",
  },
  {
    q: "Are the photos mine to use?",
    a: "The demo photos are freely licensed samples with credits included. Most businesses replace them with their own photography before launch, which we recommend.",
  },
];

export default async function HomePage() {
  const [featured, categories, stats] = await Promise.all([
    getFeaturedDesigns(6),
    getCategoriesWithCovers(),
    getHomeStats(),
  ]);

  return (
    <>
      <Hero templates={SHOWCASE} count={stats.designs} />

      {/* What's included */}
      <section aria-labelledby="included" className="bg-white/70">
        <div className="container-page py-10 sm:py-12">
          <h2 id="included" className="sr-only">
            Included in every template
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED.map((i) => (
              <li key={i.title} className="flex gap-4">
                <i.icon aria-hidden className="mt-1 size-5 shrink-0 text-hibiscus-strong" />
                <div>
                  <p className="font-semibold text-ink">{i.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{i.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Templates */}
      <section className="container-page mt-16 sm:mt-24" aria-labelledby="featured">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-medium text-hibiscus-strong">The collection</p>
            <h2 id="featured" className="text-4xl font-medium sm:text-5xl">
              Find a place to start
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Distinct designs for distinctive places. Explore the pages, try the demo and find the right fit for your business.
            </p>
          </div>
          <Button asChild variant="ghost" className="h-11 rounded-lg text-bay">
            <Link href="/designs">
              All {stats.designs} templates <ArrowRightIcon />
            </Link>
          </Button>
        </Reveal>
        <div className="mt-10">
          <Suspense fallback={<CardGridSkeleton count={6} />}>
            <SessionCardGrid items={featured} />
          </Suspense>
        </div>
      </section>

      {/* Industries */}
      <section className="container-page mt-16 sm:mt-24" aria-labelledby="industries">
        <Reveal className="max-w-2xl">
          <h2 id="industries" className="text-4xl font-medium sm:text-5xl">
            From beach bar to ballroom
          </h2>
          <p className="mt-3 text-muted-foreground">Templates written for the way each kind of place takes bookings.</p>
        </Reveal>
        <RevealGroup className="mt-8 grid auto-rows-[220px] gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <RevealItem key={c.slug} className={cn(i === 0 && "sm:row-span-2 lg:col-span-2")}>
              <Link
                href={`/designs?category=${c.slug}`}
                className="group relative flex h-full overflow-hidden rounded-2xl bg-bay focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {INDUSTRY_COVERS[c.slug] && (
                  <Image
                    src={INDUSTRY_COVERS[c.slug].src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bay-deep/85 via-bay-deep/25 to-transparent" />
                <div className="relative mt-auto p-5 text-white sm:p-6">
                  <h3 className={cn("font-serif font-medium text-white", i === 0 ? "text-3xl" : "text-2xl leading-tight")}>{c.name}</h3>
                  {i === 0 && <p className="mt-1 max-w-sm text-white/85">{c.description}</p>}
                  <p className="mt-2 text-sm text-white/80">
                    {c.count} {c.count === 1 ? "template" : "templates"}
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mt-16 scroll-mt-24 border-y border-border bg-white/70 py-14 sm:mt-24 sm:py-20" aria-labelledby="how">
        <div className="container-page grid gap-14 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <h2 id="how" className="text-4xl font-medium sm:text-5xl">
              How buying works
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Browsing and demos are open to everyone. You only need an account to see prices and buy.
            </p>
          </Reveal>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span aria-hidden className="inline-block border-b border-hibiscus-strong pb-2 font-sans text-sm font-medium text-hibiscus-strong">
                  0{i + 1}
                </span>
                <h3 className="mt-5 text-2xl font-medium">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="container-page mt-16 grid gap-8 sm:mt-24 lg:grid-cols-[1fr_2fr] lg:gap-10">
        <h2 id="faq" className="text-4xl font-medium sm:text-5xl">
          Questions owners ask
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 rounded-sm text-base font-medium text-ink sm:text-lg [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-sand-deep text-bay transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[64ch] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="find-your-website" className="container-page mt-16 sm:mt-24">
        <div className="grid gap-8 border-t border-bay/20 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
          <h2 id="find-your-website" className="max-w-xl text-4xl leading-[1.1] font-medium text-balance sm:text-5xl">
            A website for your kind of hospitality
          </h2>
          <Suspense fallback={<CtaActions signedIn={false} />}>
            <SessionCta />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function SessionCta() {
  const user = await getCurrentUser();
  return <CtaActions signedIn={!!user} />;
}

/** Visitors are invited to sign up; signed-in clients go straight to the catalog. */
function CtaActions({ signedIn }: { signedIn: boolean }) {
  return (
    <div>
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        {signedIn
          ? "Explore the collection, compare prices and choose a starting point for your business."
          : "Explore the collection at your own pace. A free account lets you compare prices and save your favourites."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button asChild size="lg" className="h-12 max-w-full rounded-lg bg-bay px-6 text-base text-white transition-colors hover:bg-bay-deep">
          {signedIn ? <Link href="/designs">Compare templates and prices</Link> : <Link href="/register">Create an account</Link>}
        </Button>
        <Link
          href={signedIn ? "/favorites" : "/designs"}
          className="inline-flex min-h-12 items-center gap-2 rounded-sm text-base font-medium text-bay underline-offset-4 transition-colors hover:text-bay-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {signedIn ? "Your favourites" : "Browse first"}
          <ArrowRightIcon aria-hidden className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
