import Link from "next/link";
import { href, nav, site } from "../site";
import { Logo } from "./logo";
import { Newsletter } from "./newsletter";

export function Footer() {
  return (
    <footer className="mt-24 rounded-t-[3rem] bg-tpl-deep text-tpl-on-deep">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo className="text-3xl" />
          <p className="mt-5 max-w-sm text-tpl-on-deep/75">
            Seasonal treatments, member evenings and the occasional quiet invitation. Once a month.
          </p>
          <div className="mt-5">
            <Newsletter />
          </div>
        </div>
        <div className="space-y-6 text-[15px]">
          <div>
            <h2 className="font-tpl-display text-lg">Open daily</h2>
            <dl className="mt-2 text-tpl-on-deep/75">
              {site.hours.map((h) => (
                <div key={h.days}>
                  <dt className="inline">{h.days}: </dt>
                  <dd className="inline">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-tpl-display text-lg">Find us</h2>
            <address className="mt-2 text-tpl-on-deep/75 not-italic">
              {site.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          </div>
        </div>
        <nav aria-label="Footer" className="text-[15px]">
          <h2 className="font-tpl-display text-lg">Explore</h2>
          <ul className="mt-2 space-y-1.5 text-tpl-on-deep/75">
            {[...nav, { href: "/book", label: "Book a treatment" }].map((i) => (
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
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-tpl-on-deep/60 sm:flex-row sm:justify-between sm:px-8">
          <p>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a> · {site.email}
          </p>
          <Link href={href("/credits")} className="hover:text-tpl-on-deep">
            Photo credits
          </Link>
        </div>
      </div>
    </footer>
  );
}
