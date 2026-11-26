import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "../_kit/hospitality-site";
import { themeStyle } from "../_kit/theme";
import { body, display } from "./fonts";
import { href, site, theme } from "./site";
import "./design.css";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div data-template="barkadas" style={themeStyle(theme, { display, body })} className="relative min-h-screen bg-tpl-bg font-tpl-body text-tpl-ink [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-current">
      <SiteHeader title={site.name} home={href()} mark="⌂" className="bg-tpl-bg" links={[{ href: href("/stays"), label: "Stays" }, { href: href("/gallery"), label: "Gallery" }, { href: href("/weekend"), label: "Weekend" }, { href: href("/guide"), label: "Guest guide" }]} primary={{ href: href("/plan"), label: "Plan a stay" }} />
      <main id="site-content" tabIndex={-1}>{children}</main>
      <SiteFooter title={site.name} location={site.location} home={href()} credits={href("/credits")}><p className="text-sm">Check-in {site.checkIn} · Check-out {site.checkOut}</p></SiteFooter>
    </div>
  );
}
