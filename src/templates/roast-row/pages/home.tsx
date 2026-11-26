import Link from "next/link";
import { SitePhoto, pesos } from "../../_kit/hospitality-site";
import { branches, menu } from "../content";
import photos from "../photos.json";
import { href } from "../site";
import { CoffeeCounter } from "./coffee";
import { ProductMotion } from "./product-motion";

export function HomePage() {
  const signature = menu.find((item) => item.id === "brown-sugar");
  return (
    <>
      <section className="rr-hero" aria-labelledby="roast-headline">
        <div className="rr-hero-inner">
          <div className="rr-hero-copy">
            <p className="rr-label">Specialty coffee · Quezon City</p>
            <h1 className="rr-display" id="roast-headline">GOOD ON<br />THE <em>GO.</em></h1>
            <p className="rr-intro">Dialed-in coffee, fresh bakes and two neighborhood counters.</p>
            <a href="#counter" className="rr-button">Open the counter <span aria-hidden="true">↓</span></a>
          </div>
          <figure className="rr-product">
            <div className="rr-product-type" aria-hidden="true">RR</div>
            <ProductMotion photo={photos.product} />
            {signature && <figcaption className="rr-product-tag"><strong>{signature.name}</strong><span>Over ice · {pesos(signature.price)}</span></figcaption>}
          </figure>
        </div>
      </section>
      <CoffeeCounter />
      <section className="rr-neighborhoods" aria-labelledby="roast-branches">
        <div className="rr-neighborhood-photo"><SitePhoto photo={photos.hero} sizes="(min-width: 800px) 55vw, 100vw" /></div>
        <div className="rr-neighborhood-copy">
          <p className="rr-label">Drop by</p>
          <h2 className="rr-display" id="roast-branches">TWO STOPS.<br />ONE GOOD CUP.</h2>
          <ul>{branches.map((branch) => <li key={branch.id}><strong>{branch.name}</strong><span>{branch.hours}</span></li>)}</ul>
          <Link href={href("/visit")} className="rr-text-link">Find a counter <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section className="rr-discover" aria-labelledby="rr-discover-heading">
        <h2 className="rr-display" id="rr-discover-heading">A LITTLE MORE COFFEE.</h2>
        <div className="rr-discover-grid">
          <Link href={href("/coffee")}><span><SitePhoto photo={photos.beans} sizes="(min-width: 800px) 45vw, 100vw" /></span><span>Find your cup <span aria-hidden="true">↗</span></span></Link>
          <Link href={href("/workshops")}><span><SitePhoto photo={photos.workshop} sizes="(min-width: 800px) 45vw, 100vw" /></span><span>Learn behind the bar <span aria-hidden="true">↗</span></span></Link>
        </div>
      </section>
    </>
  );
}
