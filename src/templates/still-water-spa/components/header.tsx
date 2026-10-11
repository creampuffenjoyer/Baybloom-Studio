"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { href, nav } from "../site";
import { Logo } from "./logo";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-t-bg/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-5 sm:px-8">
        <Link href={href("/")} onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 rounded-full bg-t-surface/80 p-1 lg:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[15px] transition-colors ${
                  active ? "bg-t-soft text-t-ink" : "text-t-muted hover:text-t-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href={href("/book")}
          className="ml-auto rounded-full bg-t-accent px-5 py-2.5 text-[15px] font-semibold text-t-on-accent lg:ml-0"
        >
          Book
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="sw-menu"
          className="-mr-2 rounded-full px-3 py-2 text-[15px] lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div id="sw-menu" className="fixed inset-x-0 top-20 bottom-0 overflow-y-auto bg-t-bg px-5 pt-6 pb-16 lg:hidden">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home" }, ...nav].map((item) => (
              <li key={item.href}>
                <Link href={href(item.href)} onClick={() => setOpen(false)} className="block py-2 font-t-display text-4xl">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
