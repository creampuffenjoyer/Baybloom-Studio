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
      { href: "/designs?category=hotel", label: "Hotels & B&Bs" },
      { href: "/designs?category=restaurant", label: "Restaurants & cafés" },
      { href: "/designs?category=spa", label: "Spas & wellness" },
      { href: "/designs?category=venue", label: "Wedding & event venues" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/credits", label: "Image credits" },
      { href: "/register", label: "Create an account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-bay-deep text-white/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo tone="light" className="text-[15px]" />
          <p className="mt-5 font-serif text-2xl leading-snug text-white">
            Websites for hospitality brands that bloom.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Ready-made, fully responsive website templates for resorts, hotels,
            restaurants, spas and event venues.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="font-sans text-xs font-semibold tracking-[0.2em] text-seaglass uppercase">
              {col.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
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
            © <CopyrightYear /> Baybloom Studio. Sample imagery from Wikimedia Commons,{" "}
            <Link href="/credits" className="underline underline-offset-2 hover:text-white">
              see credits
            </Link>
            .
          </p>
          <p>Prices in Philippine pesos (PHP).</p>
        </div>
      </div>
    </footer>
  );
}
