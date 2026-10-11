"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { href, nav } from "../site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-tpl-line bg-tpl-bg/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-5 sm:px-8">
        <Link href={href("/")} onClick={() => setOpen(false)} className="leading-none">
          <span className="block font-tpl-display text-3xl italic">Isla Verde</span>
          <span className="mt-0.5 block text-xs text-tpl-muted">Vigan, since 1887</span>
        </Link>
        <nav aria-label="Main" className="mx-auto hidden items-center gap-8 lg:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`border-b py-1 text-[15px] transition-colors ${active ? "border-tpl-alt text-tpl-ink" : "border-transparent text-tpl-muted hover:text-tpl-ink"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href={href("/book")} className="ml-auto bg-tpl-accent px-5 py-3 text-[15px] text-tpl-on-accent hover:bg-tpl-alt lg:ml-0">
          Book your stay
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="iv-menu"
          className="text-[15px] lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="iv-menu" aria-label="Mobile" className="border-t border-tpl-line px-5 py-6 lg:hidden">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home" }, ...nav, { href: "/contact", label: "Contact" }].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} onClick={() => setOpen(false)} className="block py-2 font-tpl-display text-3xl italic">
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
