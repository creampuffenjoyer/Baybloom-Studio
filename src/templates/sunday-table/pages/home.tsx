import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import photos from "../photos.json";
import { href, site } from "../site";
import { PartyStart } from "./party-start";

export function HomePage() {
  return (
    <>
      <section className="st-hero" aria-labelledby="sunday-title">
        <div className="st-masthead">
          <p className="st-eyebrow">Filipino family kitchen · Kapitolyo</p>
          <h1 id="sunday-title">Good food.<br className="st-mobile-break" /> <em>Big table.</em></h1>
          <p>Pass the plates, pull up another chair, and save room for flan.</p>
        </div>
        <div className="st-feast">
          <SitePhoto photo={photos.feast} priority sizes="(min-width: 1360px) 1290px, 100vw" />
          <Link className="st-sticker" href={href("/menu")}><span>What’s<br />cooking?</span><span aria-hidden="true">↗</span></Link>
        </div>
        <nav className="st-dining-links" aria-label="Ways to enjoy Sunday Table">
          <Link href={href("/visit#table")}><span>Dine in</span><span aria-hidden="true">↗</span></Link>
          <Link href={href("/menu#takeout")}><span>Take it home</span><span aria-hidden="true">↗</span></Link>
          <a href="#party-trays"><span>Feed a crowd</span><span aria-hidden="true">↓</span></a>
        </nav>
      </section>
      <section className="st-party-feature" id="party-trays" aria-labelledby="party-headline">
        <div className="st-party-photo"><SitePhoto photo={photos.hero} sizes="(min-width: 840px) 50vw, 100vw" /></div>
        <div className="st-party-copy">
          <p className="st-eyebrow">Birthdays · Reunions · Sunday lunch</p>
          <h2 id="party-headline">Everyone gets a plate.</h2>
          <PartyStart />
        </div>
      </section>
      <section className="st-visit-feature" aria-labelledby="sunday-visit">
        <div><p className="st-eyebrow">Find us in {site.neighborhood}</p><h2 id="sunday-visit">Come hungry.</h2><p>{site.hours}</p></div>
        <Link className="st-button" href={href("/visit")}>Plan a visit <span aria-hidden="true">↗</span></Link>
      </section>
      <section className="st-discover" aria-labelledby="st-discover-heading">
        <h2 id="st-discover-heading">More from our table.</h2>
        <div className="st-discover-grid">
          <Link href={href("/kitchen")}><span><SitePhoto photo={photos.kitchen} sizes="(min-width: 780px) 45vw, 54vw" /></span><span>Inside the kitchen <span aria-hidden="true">↗</span></span></Link>
          <Link href={href("/gatherings")}><span><SitePhoto photo={photos.gathering} sizes="(min-width: 780px) 45vw, 54vw" /></span><span>Gather the family <span aria-hidden="true">↗</span></span></Link>
        </div>
      </section>
    </>
  );
}
