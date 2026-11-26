import Link from "next/link";
import { cacheLife } from "next/cache";
import { Logo } from "@/components/brand/logo";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const COLUMNS = [
  {
    title: "Templates",
    links: [
      { href: "/designs?category=resort", label: "Resorts" },
      { href: "/designs?category=hotel", label: "Hotels, B&Bs & rentals" },
      { href: "/designs?category=restaurant", label: "Restaurants & cafés" },
      { href: "/designs?category=spa", label: "Spas & wellness" },
      { href: "/designs?category=venue", label: "Events & venues" },
      { href: "/designs?category=creative", label: "Creative studios" },
      { href: "/designs?category=fashion", label: "Fashion & retail" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/membership", label: "Membership & downloads" },
      { href: "/credits", label: "Image credits" },
      { href: "/register", label: "Create an account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-bay-deep text-white/80 sm:mt-24">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:gap-12 sm:py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="col-span-2 max-w-sm md:col-span-1">
          <Logo tone="light" className="text-[15px]" />
          <p className="mt-5 font-serif text-2xl leading-snug text-white">
            Website templates for independent businesses.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Explore live demos for hospitality, dining, wellness, events, creative studios and fashion labels.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="font-sans text-base font-medium tracking-normal text-seaglass">
              {col.title}
            </h2>
            <ul className="mt-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center rounded-sm text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>
            © <CopyrightYear /> Baybloom Studio. For image sources and licences,{" "}
            <Link href="/credits" className="underline underline-offset-2 hover:text-white">
              see credits
            </Link>
            .
          </p>
          <p>Lifetime membership in USD. Studio services in PHP.</p>
        </div>
      </div>
    </footer>
  );
}
