"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { href, nav } from "../site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40">
      <div className="mx-auto flex h-24 max-w-[1400px] items-center gap-10 px-6 sm:px-10">
        <Link href={href("/")} onClick={() => setOpen(false)} className="font-tpl-display text-3xl">
          Lumen
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-10 text-sm md:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={active ? "text-tpl-ink" : "text-tpl-muted hover:text-tpl-ink"}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href={href("/book")} className="border-b border-tpl-ink pb-0.5 text-tpl-ink">
            Reserve
          </Link>
        </nav>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="ll-menu" className="ml-auto text-sm md:hidden">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="ll-menu" aria-label="Mobile" className="absolute inset-x-0 top-24 bg-tpl-bg px-6 pb-10 md:hidden">
          <ul className="space-y-3">
            {[{ href: "/", label: "Home" }, ...nav, { href: "/book", label: "Reserve" }].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} onClick={() => setOpen(false)} className="font-tpl-display text-4xl">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
