"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRoundIcon, ReceiptTextIcon, UserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account", label: "Profile & billing", icon: UserRoundIcon },
  { href: "/account/orders", label: "Orders & downloads", icon: ReceiptTextIcon },
  { href: "/account/security", label: "Security", icon: KeyRoundIcon },
];

export function AccountNav() {
  return <AccountNavList pathname={usePathname()} />;
}

/** Also rendered as the static fallback before the pathname is known. */
export function AccountNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-24 lg:self-start">
      <ul className="flex flex-wrap gap-2 lg:flex-col">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/account" ? pathname === href : Boolean(pathname?.startsWith(href));
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active ? "bg-secondary text-bay ring-1 ring-bay/20" : "text-muted-foreground hover:bg-white hover:text-bay",
                )}
              >
                <Icon className={cn("size-4", active ? "text-hibiscus-strong" : "text-muted-foreground")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
