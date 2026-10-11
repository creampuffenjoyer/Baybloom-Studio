"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const base =
  "relative rounded-md px-3 py-2 text-sm font-medium text-ink/75 transition-colors hover:text-bay focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function isActive(href: string, pathname: string, category: string | null) {
  const [path, query] = href.split("?");
  if (pathname !== path) return false;
  const hrefCategory = new URLSearchParams(query ?? "").get("category");
  return (hrefCategory ?? null) === (category ?? null);
}

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const category = useSearchParams().get("category");
  const active = isActive(href, pathname, category);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(base, active && "text-bay")}
    >
      {label}
      {active && (
        <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-hibiscus" />
      )}
    </Link>
  );
}

/** Rendered in the static shell before search params are known. */
export function NavLinkStatic({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={base}>
      {label}
    </Link>
  );
}
