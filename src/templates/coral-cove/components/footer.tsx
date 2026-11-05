"use client";
import { useCoral, LocalLink as Link } from "../language";

import { href } from "../site";
import { Newsletter } from "./newsletter";

export function Footer() {
  const { t, nav, site } = useCoral();
  return (
    <footer className="bg-tpl-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-20 pb-10 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-tpl-display text-5xl leading-[0.95] font-bold tracking-[-0.04em] sm:text-6xl">{t("See you on")}<br />{t("the sand.")}</p>
          <p className="mt-6 max-w-sm text-white/75">{t("Try the sample newsletter form. No subscription is created.")}</p>
          <div className="mt-5">
            <Newsletter />
          </div>
        </div>
        <div className="space-y-6 text-[15px]">
          <div>
            <h2 className="font-semibold">{t("Find us")}</h2>
            <address className="mt-2 leading-relaxed text-white/75 not-italic">
              {site.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
          <div>
            <h2 className="font-semibold">{t("Talk to us")}</h2>
            <p className="mt-2 leading-relaxed text-white/75">
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {site.phone}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </p>
          </div>
        </div>
        <nav aria-label={t("Footer")} className="text-[15px]">
          <h2 className="font-semibold">{t("Explore")}</h2>
          <ul className="mt-2 space-y-2 text-white/75">
            {[...nav, { href: "/book", label: "Book a villa" }].map((item) => (
              <li key={item.href}>
                <Link href={href(item.href)} className="hover:text-white">
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div
        aria-hidden
        className="overflow-hidden px-5 font-tpl-display leading-[0.72] font-extrabold tracking-[-0.06em] text-white/10 select-none [font-size:clamp(5rem,22vw,20rem)] [font-stretch:80%] sm:px-8"
      >
        coral cove
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-white/60 sm:flex-row sm:justify-between sm:px-8">
          <p>{t("© Coral Cove Resort. All rates in Philippine pesos.")}</p>
          <p className="flex gap-5">
            <Link href={href("/credits")} className="hover:text-white">{t("Photo credits")}</Link>

          </p>
        </div>
      </div>
    </footer>
  );
}
