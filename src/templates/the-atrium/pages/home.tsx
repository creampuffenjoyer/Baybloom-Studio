import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import { HallScene } from "../components/scenes";
import { spaces } from "../content";
import { eventPreset, planQuery } from "../plan";
import photos from "../photos.json";
import { href } from "../site";

export function HomePage() {
  return (
    <>
      <section className="at-hero-band" aria-labelledby="atrium-headline">
        <div className="at-frame at-hero">
          <div className="at-hero-copy">
            <p className="at-overline">Weddings &amp; events in Metro Manila</p>
            <h1 id="atrium-headline">Gatherings <em>under glass.</em></h1>
            <p className="at-hero-intro">Exchange vows in a glasshouse, host drinks in the garden, or bring everyone together for a long dinner.</p>
            <div className="at-hero-actions">
              <Link className="at-button" href={href("/spaces")}>Explore the spaces <span aria-hidden="true">↗</span></Link>
              <Link className="at-text-link" href={href("/inquire?kind=tour")}>Request a walkthrough</Link>
            </div>
          </div>
          <figure className="at-hero-figure">
            <div className="at-hero-image"><HallScene lead setting="table" /></div>
            <figcaption>
              <span>Wedding tables in The Glasshouse</span>
              <Link className="at-text-link" href={href("/tour?view=compare")}>See it in both lights <span aria-hidden="true">↗</span></Link>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="at-frame at-section at-home-venues" aria-labelledby="at-space-intro">
        <div className="at-section-heading at-reveal">
          <div><p className="at-overline">Our spaces</p><h2 id="at-space-intro">Choose your setting.</h2></div>
          <p>From a covered hall for up to {spaces[0].capacity.reception} standing guests to an open-air courtyard for vows or cocktails.</p>
        </div>
        <div className="at-home-spaces">
          {spaces.map((space) => <article key={space.id} className="at-home-space at-reveal">
            <Link href={href(`/spaces#${space.id}`)}>
              <div className="at-space-photo"><SitePhoto photo={photos[space.photo]} sizes="(min-width: 900px) 38vw, (min-width: 581px) 50vw, 100vw" /></div>
              <div className="at-space-label">
                <div><h3>{space.name}</h3><p>{space.shelter === "indoor" ? "Covered" : "Open air"} · {space.size}</p></div>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
          </article>)}
        </div>
      </section>
      <section className="at-frame at-editorial at-reveal" aria-labelledby="at-home-plan">
        <div className="at-editorial-photo"><SitePhoto photo={photos.reception} sizes="(min-width: 761px) 50vw, 100vw" /></div>
        <div className="at-editorial-copy">
          <p className="at-overline">The event planner</p>
          <h2 id="at-home-plan">From vows <em>to dinner.</em></h2>
          <p>Give each part of the day a room. Check how many guests will fit, choose an indoor backup, and share the plan with your team.</p>
          <div className="at-page-actions">
            <Link className="at-button" href={href(`/plan?${planQuery(eventPreset("wedding"))}`)}>Try the wedding timeline <span aria-hidden="true">↗</span></Link>
            <Link className="at-text-link" href={href("/events")}>Other occasions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
