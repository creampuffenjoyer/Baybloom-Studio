"use client";

import { href } from "../site";
import { LocalLink, useLumen } from "../language";
import { usePersonalization } from "../personalization";

export function Footer() {
  const { site, nav } = useLumen();
  const { business } = usePersonalization();
  return (
    <footer className="mt-40 border-t border-tpl-line">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 text-sm sm:px-10 md:grid-cols-4">
        <div className="md:col-span-2"><p className="font-tpl-display text-3xl">{site.name}</p>{business?.tagline && <p className="mt-3 text-tpl-muted">{business.tagline}</p>}</div>
        <address className="leading-relaxed text-tpl-muted not-italic">
          {site.address.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
          <a href={`mailto:${site.email}`} className="mt-3 block text-tpl-ink">
            {site.email}
          </a>
          {business?.phone && <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-2 block text-tpl-ink">{site.phone}</a>}
        </address>
        <ul className="space-y-1.5 text-tpl-muted">
          {[...nav, { href: "/book", label: "Reserve" }, { href: "/credits", label: "Photo credits" }].map((i) => (
            <li key={i.href}>
              <LocalLink href={href(i.href)} className="hover:text-tpl-ink">
                {i.label}
              </LocalLink>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
