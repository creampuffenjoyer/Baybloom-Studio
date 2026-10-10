import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink, NavLinkStatic } from "@/components/layout/nav-link";

export const NAV_ITEMS = [
  { href: "/designs", label: "All designs" },
  { href: "/designs?type=website", label: "Websites" },
  { href: "/designs?type=architecture", label: "Architecture" },
  { href: "/designs?type=interior", label: "Interiors" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-sand/85 backdrop-blur-md supports-[backdrop-filter]:bg-sand/70">
      <div className="container-page flex h-16 items-center gap-6">
        <Link
          href="/"
          className="shrink-0 rounded-sm text-[15px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          <Suspense fallback={NAV_ITEMS.map((i) => <NavLinkStatic key={i.href} {...i} />)}>
            {NAV_ITEMS.map((i) => (
              <NavLink key={i.href} {...i} />
            ))}
          </Suspense>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<div className="shimmer h-9 w-36 rounded-md" aria-hidden />}>
            <AccountMenu />
          </Suspense>
          <MobileNav items={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}
