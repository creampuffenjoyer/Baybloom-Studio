"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const base =
  "relative inline-flex min-h-11 items-center rounded-lg px-2 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-bay focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function NavLink({ href, label }: { href: string; label: string }) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(base, active && "bg-secondary text-bay")}
    >
      {label}
    </Link>
  );
}

/** Rendered in the static shell when the pathname is resolved at request time. */
export function NavLinkStatic({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={base}>
      {label}
    </Link>
  );
}
