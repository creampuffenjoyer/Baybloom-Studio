import Link from "next/link";
import { href, nav, site } from "../site";

export function Footer() {
  return (
    <footer className="mt-28 bg-tpl-deep text-tpl-on-deep">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-tpl-display text-5xl italic">Isla Verde</p>
          <p className="mt-3 max-w-xs text-tpl-on-deep/75">{site.tagline}. Twelve rooms in a restored bahay na bato.</p>
        </div>
        <div className="text-[15px]">
          <h2 className="font-tpl-display text-lg italic">Visit</h2>
          <address className="mt-3 leading-relaxed text-tpl-on-deep/75 not-italic">
            {site.address.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-3 text-tpl-on-deep/75">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            <br />
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <nav aria-label="Footer" className="text-[15px]">
          <h2 className="font-tpl-display text-lg italic">The house</h2>
          <ul className="mt-3 space-y-1.5 text-tpl-on-deep/75">
            {[...nav, { href: "/contact", label: "Contact" }, { href: "/book", label: "Book your stay" }].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} className="hover:text-tpl-on-deep">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-tpl-on-deep/55 sm:flex-row sm:justify-between sm:px-8">
          <p>A restored house in the Historic Town of Vigan, a UNESCO World Heritage Site.</p>
          <Link href={href("/credits")} className="hover:text-tpl-on-deep">
            Photo credits
          </Link>
        </div>
      </div>
    </footer>
  );
}
