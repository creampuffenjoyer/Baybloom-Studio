import type { Metadata } from "next";
import { MailIcon, PhoneIcon } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { STUDIO_EMAIL_HREF, STUDIO_PHONE, STUDIO_PHONE_HREF } from "@/lib/checkout-methods";

export const metadata: Metadata = {
  title: "Custom websites",
  description: "Tell Baybloom Studio what you need and request a quote for custom web design, integrations, or launch support.",
  alternates: { canonical: "/custom-websites" },
};

const services = [
  {
    title: "Website design",
    description: "Adapt a Baybloom template to your brand or discuss a new design built around the pages and features your business needs.",
  },
  {
    title: "Bookings and other integrations",
    description: "Tell us which booking platform, payment provider, or inquiry workflow you use so we can scope the connection.",
  },
  {
    title: "Hosting and launch",
    description: "Get help setting up hosting, connecting your domain, and checking that key pages and forms work before launch.",
  },
];

const quoteBody = [
  "Hi Baybloom Studio,",
  "",
  "I’d like a quote for a custom website.",
  "",
  "Business name and what you do:",
  "Current website or Baybloom template you like:",
  "Pages, features, or integrations you need:",
  "Target launch date and budget range, if known:",
].join("\n");
const quoteHref = `${STUDIO_EMAIL_HREF}?subject=${encodeURIComponent("Custom website quote")}&body=${encodeURIComponent(quoteBody)}`;

export default function CustomWebsitesPage() {
  return (
    <div className="container-page max-w-5xl py-10 sm:py-16">
      <PageHeading title="Custom websites">
        <p>Work with Baybloom Studio on a website tailored to your business, from design and integrations to launch.</p>
      </PageHeading>

      <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12">
        <section aria-labelledby="custom-services">
          <h2 id="custom-services" className="text-3xl font-medium">What we can help with</h2>
          <dl className="mt-2 divide-y divide-border">
            {services.map(({ title, description }) => (
              <div key={title} className="py-5">
                <dt className="font-serif text-xl font-medium text-ink">{title}</dt>
                <dd className="mt-2 leading-relaxed text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="website-quote" className="rounded-2xl bg-bay p-6 text-white sm:p-8">
          <h2 id="website-quote" className="text-3xl font-medium text-white">Request a quote</h2>
          <p className="mt-3 leading-relaxed text-white/85">Tell us about your business, the pages or features you need, and when you’d like to launch. We’ll use those details to scope and price your project.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button asChild variant="secondary" className="min-h-11">
              <a href={quoteHref}><MailIcon aria-hidden /> Email for a quote</a>
            </Button>
            <a href={STUDIO_PHONE_HREF} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4">
              <PhoneIcon aria-hidden className="size-4" /> Call {STUDIO_PHONE}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
