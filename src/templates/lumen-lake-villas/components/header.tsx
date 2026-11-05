"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { href } from "../site";
import { LanguagePicker, LocalLink, useLumen } from "../language";

export function Header() {
  const { t, nav: localizedNav } = useLumen();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40">
      <div className="mx-auto flex h-24 max-w-[1400px] items-center gap-10 px-6 sm:px-10">
        <LocalLink href={href("/")} onClick={() => setOpen(false)} className="font-tpl-display text-3xl">
          Lumen
        </LocalLink>
        <div className="hidden md:block"><LanguagePicker /></div>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-10 text-sm md:flex">
          {localizedNav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <LocalLink
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={active ? "text-tpl-ink" : "text-tpl-muted hover:text-tpl-ink"}
              >
                {item.label}
              </LocalLink>
            );
          })}
          <LocalLink href={href("/book")} className="border-b border-tpl-ink pb-0.5 text-tpl-ink">{t("Reserve")}</LocalLink>
        </nav>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="ll-menu" className="ml-auto text-sm md:hidden">
          {open ? t("Close") : t("Menu")}
        </button>
      </div>
      {open && (
        <nav id="ll-menu" aria-label="Mobile" className="absolute inset-x-0 top-24 bg-tpl-bg px-6 pb-10 md:hidden">
          <ul className="space-y-3">
            {[{ href: "/", label: t("Home") }, ...localizedNav, { href: "/book", label: t("Reserve") }].map((i) => (
              <li key={i.href}>
                <LocalLink href={href(i.href)} onClick={() => setOpen(false)} className="font-tpl-display text-4xl">
                  {i.label}
                </LocalLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="px-6 pb-4 md:hidden"><LanguagePicker /></div>
    </header>
  );
}
