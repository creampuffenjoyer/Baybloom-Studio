import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink, NavLinkStatic } from "@/components/layout/nav-link";

export const NAV_ITEMS = [
  { href: "/designs", label: "All templates" },
  { href: "/membership", label: "Membership" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/custom-websites", label: "Custom websites" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-sand/95 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center gap-2 sm:gap-6">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm text-[15px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Logo compactOnNarrowScreens />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center lg:flex">
          <Suspense fallback={NAV_ITEMS.map((i) => <NavLinkStatic key={i.href} {...i} />)}>
            {NAV_ITEMS.map((i) => (
              <NavLink key={i.href} {...i} />
            ))}
          </Suspense>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<div className="shimmer h-11 w-24 rounded-lg sm:w-48" aria-hidden />}>
            <AccountMenu />
          </Suspense>
          <MobileNav items={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}
