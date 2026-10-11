import Link from "next/link";
import { href, nav, site } from "../site";

export function Footer() {
  return (
    <footer className="mt-40 border-t border-tpl-line">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 text-sm sm:px-10 md:grid-cols-4">
        <p className="font-tpl-display text-3xl md:col-span-2">Lumen Lake Villas</p>
        <address className="leading-relaxed text-tpl-muted not-italic">
          {site.address.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
          <a href={`mailto:${site.email}`} className="mt-3 block text-tpl-ink">
            {site.email}
          </a>
        </address>
        <ul className="space-y-1.5 text-tpl-muted">
          {[...nav, { href: "/book", label: "Reserve" }, { href: "/credits", label: "Photo credits" }].map((i) => (
            <li key={i.href}>
              <Link href={href(i.href)} className="hover:text-tpl-ink">
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
