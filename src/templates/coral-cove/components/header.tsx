"use client";
import { useCoral, LocalLink as Link } from "../language";


import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { href } from "../site";

export function Header() {
  const { t, nav, site } = useCoral();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuToggle.current?.focus();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 text-tpl-ink shadow-[0_1px_0_var(--t-line)] backdrop-blur"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 sm:gap-8 px-5 sm:px-8">
        <Link
          href={href("/")}
          onClick={() => setOpen(false)}
          className="rounded-sm font-tpl-display text-2xl font-semibold tracking-[-0.03em] [font-stretch:88%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-deep"
        >
          {site.name}
        </Link>
        <nav aria-label={t("Main")} className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-[15px] font-medium transition-colors hover:bg-tpl-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tpl-deep ${active ? "underline decoration-2 underline-offset-[6px]" : ""}`}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
        <Link
          href={href("/book")}
          className="ml-auto hidden sm:block rounded-lg bg-tpl-accent px-4 py-2 text-sm font-medium sm:px-5 sm:py-3 sm:text-[15px] text-tpl-on-accent transition-colors hover:bg-tpl-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tpl-deep lg:ml-2"
        >{t("Book a villa")}</Link>
        <button
          ref={menuToggle}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="cc-menu"
          className="-mr-2 ml-auto grid size-11 place-items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tpl-deep lg:hidden"
        >
          <span className="sr-only">{open ? t("Close menu") : t("Open menu")}</span>
          <span aria-hidden className="relative block h-3 w-6">
            <span className={`absolute left-0 h-0.5 w-6 bg-current transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-0.5 w-6 bg-current transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open && (
        <div id="cc-menu" className="absolute inset-x-0 top-full max-h-[80dvh] overflow-y-auto bg-tpl-deep px-5 pt-8 pb-16 text-white lg:hidden">
          <nav aria-label={t("Mobile")}>
            <ul className="space-y-1">
              {[...nav, { href: "/book", label: "Plan a stay" }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={href(item.href)}
                    onClick={() => setOpen(false)}
                    className="block rounded-sm py-2 font-tpl-display text-4xl font-semibold tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t(item.label)}
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
