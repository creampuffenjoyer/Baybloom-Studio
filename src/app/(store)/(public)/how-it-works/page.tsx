import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { STUDIO_EMAIL_HREF } from "@/lib/checkout-methods";

export const metadata: Metadata = {
  title: "How it works",
  description: "Try a Baybloom template, personalize a draft, and see what comes with your website order.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    title: "Try a template",
    description: "Open a live demo to explore the pages and see how the design looks on desktop and mobile. You can browse and try demos without an account.",
  },
  {
    title: "Personalize a draft",
    description: "If your template has an editor, sign in to preview your own text, colors, and photos. A free Regular account gives you access to selected editors. Lifetime Premium unlocks every available editor.",
    link: { href: "/membership", label: "Compare membership plans" },
  },
  {
    title: "Order your website",
    description: "Sign in to see package prices and choose any add-ons. Where available, choose the original design or your saved draft at checkout. When ordering by email, the studio will confirm your order and arrange payment.",
  },
  {
    title: "Get your website",
    description: "Your paid website order includes the source ZIP. We’ll email you when it’s ready, and you can also download it from your order. If you purchased Hosting setup, we’ll send your live website link as well.",
    link: { href: "/account/orders", label: "Find your orders" },
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-page max-w-5xl py-10 sm:py-16">
      <PageHeading
        title="How it works"
        action={
          <Button asChild size="lg" className="h-12">
            <Link href="/designs">Browse templates <ArrowRightIcon aria-hidden /></Link>
          </Button>
        }
      >
        <p>See how to go from trying a live demo to ordering and receiving your website.</p>
      </PageHeading>

      <ol aria-label="Steps to get your website" role="list" className="mt-4 grid sm:grid-cols-2 sm:gap-x-12">
        {steps.map(({ title, description, link }, index) => (
          <li key={title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-border py-7 sm:py-9">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-bay">
              {index + 1}
            </span>
            <div>
              <h2 className="text-2xl font-medium">{title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{description}</p>
              {link && (
                <Link href={link.href} className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-bay underline underline-offset-4">
                  {link.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="ordering-help" className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div>
          <h2 id="ordering-help" className="text-2xl font-medium">Need help choosing a package?</h2>
          <p className="mt-2 text-muted-foreground">Tell us which template you like and what you need for your business.</p>
        </div>
        <Button asChild variant="outline" className="min-h-11">
          <a href={STUDIO_EMAIL_HREF}>Email the studio</a>
        </Button>
      </section>
    </div>
  );
}
