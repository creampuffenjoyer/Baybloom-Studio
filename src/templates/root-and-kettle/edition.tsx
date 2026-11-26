import Link from "next/link";
import { Photo } from "../_kit/studio/photo";
import photos from "./photos.json";
import { BASE } from "./site";

const pairings = [
  {
    plate: "Charred squash & lentils",
    cup: "Single-origin pour-over",
    reason: "Take a bite of the crisp sage before a sip. The light roast lifts the lemon in the tahini dressing.",
    food: 390,
    drink: 190,
    image: photos.squash
  },
  {
    plate: "Market greens toast",
    cup: "Mint matcha",
    reason: "The creamy oat milk softens the pickled shallots. Fresh mint and dressed greens share the same bright finish.",
    food: 320,
    drink: 215,
    image: photos.matcha
  },
  {
    plate: "Miso mushroom bowl",
    cup: "Iced filter coffee",
    reason: "Flash-chilled coffee keeps its clean finish alongside brown rice and deeply roasted mushrooms.",
    food: 420,
    drink: 175,
    image: photos.coffee
  },
];

export function Front() {
  return (
    <section className="kettle-front">
      <div className="kettle-banner">
        <span>Plant-based kitchen</span>
        <span>Wednesday — Sunday</span>
        <span>Specialty brew bar</span>
      </div>
      <div className="kettle-grid">
        <div className="kettle-poster">
          <p className="edition-kicker">Lunch service / 11 am–3 pm</p>
          <h1>The lunch<br /><i>counter.</i></h1>
          <p>Charred squash, crisp sage and something good to drink.</p>
          <Link href={(BASE || "/") + "#menu"}>See today’s menu ↓</Link>
        </div>
        <figure>
          <Photo hero photo={photos.spread} sizes="(min-width: 750px) 54vw, 100vw" />
          <figcaption>
            <span>From the morning market</span>
            <Link href={BASE + "/pairings"}>What to drink with it ↗</Link>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export function Feature() {
  return (
    <article className="kettle-pairings">
      <header>
        <p className="edition-kicker">Root & Kettle / Counter orders</p>
        <h1>A plate <i>and a cup.</i></h1>
        <p>Three orders we like together. Lift a ticket for the barista’s pairing note.</p>
      </header>
      <div className="kettle-tickets">
        {pairings.map((p, i) => <details key={p.plate} open={i === 0}>
          <summary>
            <span className="edition-kicker">Lunch ticket / 0{i + 1}</span>
            <strong>{p.plate}</strong>
            <span>+ {p.cup}</span>
            <b>₱{p.food + p.drink} <span aria-hidden="true">⌄</span></b>
          </summary>
          <Photo photo={p.image} sizes="(min-width: 750px) 30vw, 90vw" />
          <p>{p.reason}</p>
          <small>Plate ₱{p.food} · Cup ₱{p.drink}</small>
        </details>)}
      </div>
      <Link className="edition-link" href={(BASE || "/") + "#visit"}>Counter hours and table requests ↗</Link>
    </article>
  );
}
