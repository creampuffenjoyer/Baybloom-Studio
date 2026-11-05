"use client";
import { useCoral, LocalLink as Link } from "../language";


import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { href } from "../site";

export function Header() {
  const { t, nav, site } = useCoral();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
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
          className="font-tpl-display text-2xl font-extrabold tracking-[-0.04em] [font-stretch:85%]"
        >
          coral cove
        </Link>
        <nav aria-label={t("Main")} className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(href(item.href));
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-tpl-soft ${active ? "underline decoration-2 underline-offset-[6px]" : ""}`}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
        <Link
          href={href("/book")}
          className="ml-auto hidden sm:block rounded-full bg-tpl-accent px-4 py-2 text-sm font-semibold sm:px-5 sm:py-2.5 sm:text-[15px] text-tpl-on-accent transition-transform hover:-translate-y-0.5 lg:ml-2"
        >{t("Book a villa")}</Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="cc-menu"
          className="-mr-2 ml-auto grid size-11 place-items-center rounded-full lg:hidden"
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
                    className="block py-2 font-tpl-display text-5xl font-bold tracking-[-0.03em]"
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
