"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRoundIcon, ReceiptTextIcon, UserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account", label: "Profile & billing", icon: UserRoundIcon },
  { href: "/account/orders", label: "Orders & downloads", icon: ReceiptTextIcon },
  { href: "/account/security", label: "Password", icon: KeyRoundIcon },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-24 lg:self-start">
      <ul className="flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-white text-bay shadow-sm ring-1 ring-border/70" : "text-ink/75 hover:bg-white/70 hover:text-bay",
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
