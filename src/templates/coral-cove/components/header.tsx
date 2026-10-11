"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { href, nav, site } from "../site";

export function Header() {
  const pathname = usePathname();
  const overHero = pathname === href("/");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const clear = overHero && !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        clear ? "text-white" : "bg-white/95 text-tpl-ink shadow-[0_1px_0_var(--t-line)] backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-8 px-5 sm:px-8">
        <Link
          href={href("/")}
          onClick={() => setOpen(false)}
          className="font-tpl-display text-2xl font-extrabold tracking-[-0.04em] [font-stretch:85%]"
        >
          coral cove
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                  clear ? "hover:bg-white/15" : "hover:bg-tpl-soft"
                } ${active ? "underline decoration-2 underline-offset-[6px]" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href={href("/book")}
          className="ml-auto rounded-full bg-tpl-accent px-4 py-2 text-sm font-semibold sm:px-5 sm:py-2.5 sm:text-[15px] text-tpl-on-accent transition-transform hover:-translate-y-0.5 lg:ml-2"
        >
          Book a villa
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="cc-menu"
          className="-mr-2 grid size-11 place-items-center rounded-full lg:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="relative block h-3 w-6">
            <span className={`absolute left-0 h-0.5 w-6 bg-current transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-0.5 w-6 bg-current transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open && (
        <div id="cc-menu" className="fixed inset-x-0 top-18 bottom-0 overflow-y-auto bg-tpl-deep px-5 pt-8 pb-16 text-white lg:hidden">
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={href(item.href)}
                    onClick={() => setOpen(false)}
                    className="block py-2 font-tpl-display text-5xl font-bold tracking-[-0.03em]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-10 text-white/75">{site.tagline}</p>
          <p className="mt-2">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
              {site.phone}
            </a>
          </p>
        </div>
      )}
    </header>
  );
}
