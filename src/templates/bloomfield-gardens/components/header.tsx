"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { href, nav } from "../site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-t-line bg-t-bg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 pt-6 pb-3 sm:px-8 md:flex-col md:pb-0">
        <Link href={href("/")} className="text-center leading-none" onClick={() => setOpen(false)}>
          <span className="block font-t-display text-4xl italic sm:text-5xl">Bloomfield</span>
          <span className="mt-1 block text-[11px] tracking-[0.35em] text-t-muted">GARDENS · TAGAYTAY</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="bf-nav"
          className="text-[15px] underline-offset-4 hover:underline md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
        <nav
          id="bf-nav"
          aria-label="Main"
          className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-24 z-50 flex-col gap-1 border-b border-t-line bg-t-bg px-5 pb-6 md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:p-0 md:py-4`}
        >
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`py-2 text-[15px] md:py-0 ${active ? "text-t-alt" : "hover:text-t-alt"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={href("/inquire")}
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-t-accent px-5 py-2 text-center text-[15px] text-t-on-accent md:mt-0"
          >
            Check your date
          </Link>
        </nav>
      </div>
    </header>
  );
}
