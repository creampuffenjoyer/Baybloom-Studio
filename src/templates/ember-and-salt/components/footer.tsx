import Link from "next/link";
import { href, nav, site } from "../site";

export function Footer() {
  return (
    <footer className="border-t border-tpl-line bg-tpl-deep">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-tpl-display text-4xl">
            Ember <span className="text-tpl-accent">&amp;</span> Salt
          </p>
          <p className="mt-3 text-tpl-muted">{site.tagline}</p>
          <Link
            href={href("/reserve")}
            className="mt-6 inline-block bg-tpl-accent px-5 py-3 font-semibold text-tpl-on-accent hover:bg-tpl-alt"
          >
            Reserve a table
          </Link>
        </div>
        <div>
          <h2 className="font-tpl-display text-xl">Hours</h2>
          <dl className="mt-3 space-y-1.5 text-[15px]">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 border-b border-dotted border-tpl-line pb-1.5">
                <dt className="text-tpl-muted">{h.days}</dt>
                <dd className="text-right">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="grid grid-cols-2 gap-8 text-[15px]">
          <div>
            <h2 className="font-tpl-display text-xl">Find us</h2>
            <address className="mt-3 leading-relaxed text-tpl-muted not-italic">
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
            </p>
          </div>
          <nav aria-label="Footer">
            <h2 className="font-tpl-display text-xl">Explore</h2>
            <ul className="mt-3 space-y-1.5 text-tpl-muted">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={href(item.href)} className="hover:text-tpl-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-tpl-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-tpl-muted sm:flex-row sm:justify-between sm:px-8">
          <p>Prices in pesos, inclusive of VAT. A 10% service charge applies.</p>
          <p className="flex gap-5">
            <Link href={href("/credits")} className="hover:text-tpl-ink">
              Photo credits
            </Link>
            <a href={site.social.instagram} className="hover:text-tpl-ink">
              Instagram
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
