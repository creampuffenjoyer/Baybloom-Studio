import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink, NavLinkStatic } from "@/components/layout/nav-link";

export const NAV_ITEMS = [
  { href: "/designs", label: "All templates" },
  { href: "/membership", label: "Membership" },
  { href: "/designs?category=resort", label: "Resorts" },
  { href: "/designs?category=hotel", label: "Hotels & rentals" },
  { href: "/designs?category=restaurant", label: "Restaurants" },
  { href: "/designs?category=spa", label: "Spas" },
  { href: "/designs?category=venue", label: "Events" },
  { href: "/designs?category=creative", label: "Creative studios" },
  { href: "/designs?category=fashion", label: "Fashion" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-sand/95 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center gap-6">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm text-[15px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center min-[1440px]:flex">
          <Suspense fallback={NAV_ITEMS.map((i) => <NavLinkStatic key={i.href} {...i} />)}>
            {NAV_ITEMS.map((i) => (
              <NavLink key={i.href} {...i} />
            ))}
          </Suspense>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<div className="shimmer h-11 w-28 rounded-lg sm:w-48" aria-hidden />}>
            <AccountMenu />
          </Suspense>
          <MobileNav items={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}
