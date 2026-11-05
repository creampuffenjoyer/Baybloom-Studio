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
  { icon: CalendarCheckIcon, title: "A working booking flow", text: "Rooms, tables, treatments or event dates, ready for your engine." },
  { icon: SmartphoneIcon, title: "Built for phones first", text: "Most hospitality bookings start on a phone. Every layout is tested there." },
  { icon: CodeIcon, title: "The full source code", text: "Next.js and Tailwind CSS, with a setup guide and style guide." },
];

const STEPS = [
  { title: "Try the live demos", text: "Click through every page and run the booking flow, exactly as your guests will." },
  { title: "Log in for pricing", text: "A free account shows prices for each tier, plus favourites and side-by-side compare." },
  { title: "Buy and launch", text: "Pay online and download the source straight away. Revision rounds come with every tier." },
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
        <div className="container-page py-14">
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
      <section className="container-page mt-24" aria-labelledby="featured">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="featured" className="text-4xl font-medium sm:text-5xl">
              Pick a template
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Each one is its own design, not a colour swap. Open any card for screenshots, features and tiers.
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-full text-bay">
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
      <section className="container-page mt-28" aria-labelledby="industries">
        <Reveal className="max-w-2xl">
          <h2 id="industries" className="text-4xl font-medium sm:text-5xl">
            From beach bar to ballroom
          </h2>
          <p className="mt-3 text-muted-foreground">Templates written for the way each kind of place takes bookings.</p>
        </Reveal>
        <RevealGroup className="mt-10 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <section id="how-it-works" className="mt-28 scroll-mt-20 border-y border-border/70 bg-white/70 py-24" aria-labelledby="how">
        <div className="container-page grid gap-14 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <h2 id="how" className="text-4xl font-medium sm:text-5xl">
              How buying works
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Browsing and demos are open to everyone. You only need an account to see prices and buy.
            </p>
          </Reveal>
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            <span aria-hidden className="absolute top-5 right-6 left-6 hidden border-t border-dashed border-bay/30 md:block" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="grid size-10 place-items-center rounded-full bg-bay font-serif text-lg text-white ring-8 ring-[#fdfbf8]">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-2xl font-medium">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="container-page mt-24 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 id="faq" className="text-4xl font-medium sm:text-5xl">
          Questions owners ask
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-ink">
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
      <section className="container-page mt-24">
        <Reveal className="relative overflow-hidden rounded-3xl bg-bay px-8 py-16 text-center sm:px-16">
          <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full bg-seaglass/25 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -left-24 size-72 rounded-full bg-hibiscus/25 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl text-4xl font-medium text-white sm:text-5xl">
            Your guests deserve a beautiful website.
          </h2>
          <Suspense fallback={<CtaActions signedIn={false} />}>
            <SessionCta />
          </Suspense>
        </Reveal>
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
    <>
      <p className="relative mx-auto mt-4 max-w-lg text-white/80">
        {signedIn ? "Your account is ready: prices are unlocked on every template." : "Create a free account to see pricing on every template."}
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="h-12 rounded-full bg-hibiscus-strong px-7 text-base text-white hover:bg-hibiscus-strong/90">
          {signedIn ? <Link href="/designs">Compare templates and prices</Link> : <Link href="/register">Create an account</Link>}
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
        >
          {signedIn ? <Link href="/favorites">Your favourites</Link> : <Link href="/designs">Browse first</Link>}
        </Button>
      </div>
    </>
  );
}
