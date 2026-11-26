import Link from "next/link";
import { pesos, SitePhoto } from "../../_kit/hospitality-site";
import { stays } from "../content";
import photos from "../photos.json";
import { href } from "../site";
import { GroupFit } from "./fit";
import { GallerySwitch } from "./gallery-switch";

export function HomePage() {
  return (
    <>
      <section className="bk-home-hero" aria-labelledby="barkadas-title">
        <div className="bk-headline">
          <div><p className="bk-eyebrow">Tagaytay · Private rooms &amp; whole house</p><h1 id="barkadas-title">Bring the <br className="bk-mobile-break" />whole crew.</h1></div>
          <p>From four in the garden room to twelve under one roof. Bring your people. We’ll show you where everyone sleeps.</p>
        </div>
        <div className="bk-masthead">
          <GallerySwitch />
          <GroupFit />
        </div>
      </section>
      <section className="bk-stay-spread" aria-labelledby="barkadas-stays">
        <div><SitePhoto photo={photos.detail} sizes="(min-width: 800px) 50vw, 100vw" /></div>
        <div className="bk-stay-spread-copy">
          <p className="bk-eyebrow">Stay options</p>
          <h2 id="barkadas-stays">Room for the group chat.</h2>
          <ul>{stays.map((stay) => <li key={stay.id}><Link href={href(`/stays#${stay.id}`)}>{stay.name}</Link><span>{stay.guests} guests · {pesos(stay.price)} / night</span></li>)}</ul>
          <Link className="bk-text-link" href={href("/guide")}>Read the guest guide <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section className="bk-discover" aria-labelledby="bk-discover-heading">
        <h2 id="bk-discover-heading">Around the house.</h2>
        <div className="bk-discover-grid">
          <Link href={href("/gallery")}><span className="bk-gallery-photo"><SitePhoto photo={photos.upstairs} sizes="(min-width: 760px) 45vw, 54vw" /></span><span className="bk-gallery-caption"><strong>Tour the bedrooms</strong><span aria-hidden="true">↗</span></span></Link>
          <Link href={href("/weekend")}><span className="bk-gallery-photo"><SitePhoto photo={photos.ridge} sizes="(min-width: 760px) 45vw, 54vw" /></span><span className="bk-gallery-caption"><strong>Plan a weekend</strong><span aria-hidden="true">↗</span></span></Link>
        </div>
      </section>
    </>
  );
}
