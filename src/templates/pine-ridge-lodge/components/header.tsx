"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { href, nav } from "../site";

/** Three pine peaks. */
function Mark() {
  return (
    <svg viewBox="0 0 40 28" aria-hidden className="h-7 w-10">
      <path d="M2 26 L12 8 L22 26 Z" fill="currentColor" opacity="0.55" />
      <path d="M12 26 L24 2 L36 26 Z" fill="currentColor" />
      <path d="M24 2 L28 10 L20 10 Z" fill="var(--t-accent)" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 bg-tpl-deep text-tpl-on-deep">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-8 px-5 sm:px-8">
        <Link href={href("/")} onClick={() => setOpen(false)} className="flex items-center gap-3">
          <Mark />
          <span className="font-tpl-display text-2xl font-bold">Pine Ridge</span>
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-7 lg:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`font-medium ${active ? "text-tpl-accent" : "text-tpl-on-deep/85 hover:text-tpl-on-deep"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href={href("/book")} className="ml-auto rounded-md bg-tpl-accent px-5 py-2.5 font-bold text-tpl-on-accent lg:ml-0">
          Book
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="pr-menu" className="font-medium lg:hidden">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="pr-menu" aria-label="Mobile" className="absolute inset-x-0 top-18 bg-tpl-deep px-5 pb-8 lg:hidden">
          <ul className="border-t border-white/15">
            {[{ href: "/", label: "Home" }, ...nav].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} onClick={() => setOpen(false)} className="block border-b border-white/10 py-3 font-tpl-display text-2xl">
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
