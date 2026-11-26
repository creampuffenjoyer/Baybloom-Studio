import Link from "next/link";
import { Photo } from "../_kit/studio/photo";
import photos from "./photos.json";
import { BASE } from "./site";

const fabrics = [
  {
    id: "linen",
    title: "Linen",
    fibre: "Flax fibre · plain weave",
    image: photos.shirt,
    feel: "Dry to the touch, with a loose drape. The uneven threads and soft creases are part of the cloth.",
    wash: "Wash cold on a gentle cycle. Reshape the collar and cuffs while damp, then hang in the shade.",
    piece: "The Day Shirt"
  },
  {
    id: "knit",
    title: "Rib cotton",
    fibre: "Cotton fibre · rib knit",
    image: photos.knit,
    feel: "Raised ribs hold a little air and stretch across the body. Fold the knit between wears to preserve its shape.",
    wash: "Wash cold, roll in a towel and dry flat. Support both shoulders when lifting the wet garment.",
    piece: "The Rib Crew"
  },
  {
    id: "canvas",
    title: "Canvas",
    fibre: "Cotton fibre · dense weave",
    image: photos.tote,
    feel: "A firm woven cloth that stands up on its own and softens along the handles with use.",
    wash: "Brush off dry dirt first. Spot clean with a damp cloth, then air-dry with the bag open.",
    piece: "The Carry Tote"
  },
];

export function Front() {
  return (
    <section className="quiet-front">
      <figure className="quiet-campaign">
        <Photo hero photo={photos.campaign} />
        <figcaption>Quiet Form / Everyday collection</figcaption>
      </figure>
      <div className="quiet-side">
        <p className="edition-kicker">Wardrobe notes</p>
        <h1>Worn<br /><i>often.</i></h1>
        <p>Linen separates and cotton layers for the days between occasions.</p>
        <Link href={(BASE || "/") + "#collection"}>Shop the pieces ↗</Link>
        <Link className="quiet-sample" href={BASE + "/fabric-library"}>
          <Photo photo={photos.scarf} sizes="8rem" />
          <span>Fabric library<br /><small>Handle & care ↗</small></span>
        </Link>
      </div>
    </section>
  );
}

export function Feature() {
  return (
    <article className="quiet-library">
      <header>
        <p className="edition-kicker">Quiet Form / Material notes</p>
        <h1>The fabric library.</h1>
        <p>Choose a cloth to read about its handle and care.</p>
        <nav aria-label="Fabric samples">
          {fabrics.map(f => <a href={"#" + f.id} key={f.id}>{f.title}</a>)}
        </nav>
      </header>
      {fabrics.map(f => <section id={f.id} key={f.id}>
        <Photo photo={f.image} sizes="(min-width: 750px) 38vw, 100vw" />
        <div>
          <p className="edition-kicker">{f.fibre}</p>
          <h2>{f.title}</h2>
          <p>{f.feel}</p>
          <details><summary>Wash & dry instructions</summary><p>{f.wash}</p></details>
          <Link className="edition-link" href={(BASE || "/") + "#collection"}>In the collection: {f.piece} ↗</Link>
        </div>
      </section>)}
    </article>
  );
}
