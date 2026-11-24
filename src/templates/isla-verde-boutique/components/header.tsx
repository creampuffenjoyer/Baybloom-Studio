"use client";

import { LanguagePicker, useIsla } from "../language";

import { LocalLink as Link } from "../language";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { href } from "../site";
import { usePersonalization } from "../personalization";

export function Header({ languagePicker = true }: { languagePicker?: boolean }) {
  const { t, nav, site } = useIsla();
  const { business } = usePersonalization();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-tpl-line bg-tpl-bg/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-5 px-5 sm:gap-8 sm:px-8">
        <Link href={href("/")} onClick={() => setOpen(false)} className="leading-none">
          <span data-preview-brand={business?.name ? "" : undefined} className="block font-tpl-display text-2xl whitespace-nowrap italic sm:text-3xl">{site.name}</span>
          <span className="mt-0.5 block text-xs text-tpl-muted">{t("Vigan, since 1887")}</span>
        </Link>
        <nav aria-label={t("Main")} className="mx-auto hidden items-center gap-8 xl:flex">
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
        <Link href={href("/book")} className="ml-auto bg-tpl-accent px-4 py-3 text-[15px] text-tpl-on-accent hover:bg-tpl-alt xl:ml-0">{t("Book")}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="iv-menu"
          className="text-[15px] xl:hidden"
        >
          {open ? t("Close") : t("Menu")}
        </button>
      </div>
      {open && (
        <nav id="iv-menu" aria-label={t("Mobile navigation")} className="border-t border-tpl-line px-5 py-6 xl:hidden">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home" }, ...nav, { href: "/contact", label: "Contact" }].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} onClick={() => setOpen(false)} className="block py-2 font-tpl-display text-3xl italic">
                  {t(i.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {languagePicker && <LanguagePicker />}
    </header>
  );
}
