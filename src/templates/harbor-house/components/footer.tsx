import Link from "next/link";
import { href, nav, site } from "../site";

export function Footer() {
  return (
    <footer className="mt-24 bg-t-accent text-t-on-accent">
      <svg viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden className="block h-8 w-full -translate-y-px fill-t-bg">
        <path d="M0 0 H1440 V18 Q1380 40 1320 18 T1200 18 T1080 18 T960 18 T840 18 T720 18 T600 18 T480 18 T360 18 T240 18 T120 18 T0 18 Z" />
      </svg>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-t-display text-3xl">Harbor House</p>
          <p className="mt-2 text-white/80">{site.tagline}.</p>
          <p className="mt-4 font-[family-name:var(--hh-hand)] text-3xl text-t-soft">Mila &amp; Joel</p>
        </div>
        <div className="text-[15px] text-white/85">
          <address className="not-italic">
            {site.address.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-3">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <nav aria-label="Footer" className="text-[15px]">
          <ul className="grid grid-cols-2 gap-y-2 text-white/85">
            {[...nav, { href: "/book", label: "Book a room" }, { href: "/credits", label: "Photo credits" }].map((i) => (
              <li key={i.href}>
                <Link href={href(i.href)} className="hover:text-white hover:underline">
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
