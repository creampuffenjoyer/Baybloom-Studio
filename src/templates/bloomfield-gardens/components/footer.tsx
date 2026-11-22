"use client";

import { LocalLink as Link } from "../language";
import { href, nav, site } from "../site";
import { Sprig } from "./sprig";
import { usePersonalization } from "../personalization";

export function Footer() {
  const { business, viewings } = usePersonalization();
  return (
    <footer className="mt-24 bg-tpl-deep text-tpl-on-deep">
      <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8">
        <Sprig className="mx-auto w-28 text-tpl-alt" />
        <p className="mt-6 font-tpl-display text-5xl italic">{business?.name || site.name}</p>
        <p className="mt-2 text-tpl-on-deep/70">{business?.tagline || site.tagline}</p>
        <nav aria-label="Footer" className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
          {[...nav, { href: "/inquire", label: "Inquire" }].map((i) => (
            <Link key={i.href} href={href(i.href)} className="hover:text-tpl-alt">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 border-t border-white/15 pt-8 text-[15px] text-tpl-on-deep/75 sm:grid-cols-3">
          <address className="not-italic">{(business?.address ?? site.address).join(", ")}</address>
          <p>
            <a href={`tel:${(business?.phone || site.phone).replace(/\s/g, "")}`}>{business?.phone || site.phone}</a>
            <br />
            <a href={`mailto:${business?.email || site.email}`}>{business?.email || site.email}</a>
          </p>
          <p>{viewings || site.viewings}</p>
        </div>
        <p className="mt-10 text-sm text-tpl-on-deep/55">
          <Link href={href("/credits")} className="hover:text-tpl-on-deep">
            Photo credits
          </Link>
        </p>
      </div>
    </footer>
  );
}
