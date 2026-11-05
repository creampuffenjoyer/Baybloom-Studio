"use client";

import { useHarbor } from "../language";

import { LocalLink as Link } from "../language";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { href } from "../site";

/** A little house-and-wave mark. */
function Mark() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className="size-9 text-tpl-accent">
      <path d="M8 18 L18 9 L28 18 V27 H8 Z" fill="var(--t-soft)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="15" y="20" width="6" height="7" fill="currentColor" />
      <path d="M3 31 q3.75 -3 7.5 0 t7.5 0 t7.5 0 t7.5 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const { t, nav, site } = useHarbor();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 bg-tpl-bg">
      <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center gap-3 py-3 px-5 sm:px-8">
        <Link href={href("/")} onClick={() => setOpen(false)} className="flex items-center gap-2.5 font-tpl-display text-xl whitespace-nowrap sm:text-2xl">
          <Mark />
          {site.name}</Link>
        <nav aria-label={t("Main")} className="ml-auto hidden items-center gap-6 md:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`text-[15px] font-semibold decoration-tpl-alt decoration-2 underline-offset-8 hover:underline ${active ? "underline" : ""}`}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
        <Link href={href("/book")} className="ml-auto hidden rounded-full bg-tpl-accent px-5 py-2.5 text-[15px] font-bold text-tpl-on-accent sm:inline-flex md:ml-0">
          {t("Book")}
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="hh-menu" className="ml-auto min-h-11 font-semibold sm:ml-0 md:hidden">
          {open ? t("Close") : t("Menu")}
        </button>
      </div>
      {open && (
        <nav id="hh-menu" aria-label={t("Mobile")} className="absolute inset-x-0 top-20 border-y border-tpl-line bg-tpl-bg px-5 pb-6 shadow-lg md:hidden">
          <ul>
            {[{ href: "/", label: "Home" }, { href: "/book", label: "Book a room" }, ...nav].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} onClick={() => setOpen(false)} className="block border-b border-tpl-line py-3 font-tpl-display text-2xl">
                  {t(i.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
