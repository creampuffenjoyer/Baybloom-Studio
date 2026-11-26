import Link from "next/link";
import type { ReactNode } from "react";
import { ModeFrame, ModeSwitch } from "./mode";
import { VenueHost } from "./components/host";
import { href, site } from "./site";
import "./design.css";

const navigation = [
  { label: "Spaces", path: "/spaces" }, { label: "Tour", path: "/tour" },
  { label: "Events", path: "/events" }, { label: "Gallery", path: "/gallery" },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <ModeFrame>
      <a className="at-skip" href="#site-content">Skip to content</a>
      <header className="at-header">
        <div className="at-frame at-nav">
          <Link href={href()} className="at-wordmark">{site.name}</Link>
          <Link className="at-button at-nav-plan" href={href("/plan")}>Plan an event <span aria-hidden="true">↗</span></Link>
          <nav aria-label="Main menu">{navigation.map((item) => <Link key={item.path} href={href(item.path)}>{item.label}</Link>)}</nav>
          <div className="at-nav-actions" role="group" aria-label="Venue options"><ModeSwitch /><VenueHost /></div>
        </div>
      </header>
      <main id="site-content" tabIndex={-1}>{children}</main>
      <footer className="at-footer">
        <div className="at-frame at-footer-body">
          <div><Link href={href()} className="at-wordmark">{site.name}</Link><p>{site.location}</p></div>
          <div className="at-footer-links">
            <Link href={href("/inquire?kind=tour")}>Request a walkthrough</Link>
            <Link href={href("/plan")}>Event planner</Link>
            <Link href={href("/credits")}>Photo credits</Link>
          </div>
        </div>
      </footer>
    </ModeFrame>
  );
}
