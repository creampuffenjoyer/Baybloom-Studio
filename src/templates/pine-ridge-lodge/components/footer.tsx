import Link from "next/link";
import { href, nav, site } from "../site";
import { Contours } from "./contours";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-tpl-deep text-tpl-on-deep">
      <Contours className="absolute inset-0 size-full text-white/[0.06]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-tpl-display text-4xl font-bold">Pine Ridge Lodge</p>
          <p className="mt-3 max-w-xs text-tpl-on-deep/75">{site.tagline}. Elevation 1,640 m.</p>
        </div>
        <div className="text-tpl-on-deep/80">
          <address className="not-italic">
            {site.address.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-3">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-tpl-accent">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="hover:text-tpl-accent">
              {site.email}
            </a>
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-y-2 text-tpl-on-deep/80">
            {[...nav, { href: "/book", label: "Book" }, { href: "/credits", label: "Photo credits" }].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} className="hover:text-tpl-accent">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
