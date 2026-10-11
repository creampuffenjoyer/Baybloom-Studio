"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { href, nav } from "../site";

/** A little house-and-wave mark. */
function Mark() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className="size-9 text-t-accent">
      <path d="M8 18 L18 9 L28 18 V27 H8 Z" fill="var(--t-soft)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="15" y="20" width="6" height="7" fill="currentColor" />
      <path d="M3 31 q3.75 -3 7.5 0 t7.5 0 t7.5 0 t7.5 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 bg-t-bg">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href={href("/")} onClick={() => setOpen(false)} className="flex items-center gap-2.5 font-t-display text-2xl">
          <Mark />
          Harbor House
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-6 md:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`text-[15px] font-semibold decoration-t-alt decoration-2 underline-offset-8 hover:underline ${active ? "underline" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href={href("/book")} className="ml-auto rounded-full bg-t-accent px-5 py-2.5 text-[15px] font-bold text-t-on-accent md:ml-0">
          Book a room
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="hh-menu" className="font-semibold md:hidden">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="hh-menu" aria-label="Mobile" className="absolute inset-x-0 top-20 border-y border-t-line bg-t-bg px-5 pb-6 shadow-lg md:hidden">
          <ul>
            {[{ href: "/", label: "Home" }, ...nav].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} onClick={() => setOpen(false)} className="block border-b border-t-line py-3 font-t-display text-2xl">
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
