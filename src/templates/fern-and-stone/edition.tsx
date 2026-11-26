import Link from "next/link";
import { Photo } from "../_kit/studio/photo";
import photos from "./photos.json";
import { BASE } from "./site";

const walks = [
  {
    id: "morning",
    time: "Morning",
    title: "The garden before noon",
    image: photos.basin,
    entries: [
      ["08:45", "Meet at the tea room", "Change into a robe and take a warm cup of mint out to the covered bench."],
      ["09:00", "Quiet morning ritual", "Follow a gentle hour of breathing and movement in the garden room."],
      ["10:15", "Leave time for the ferns", "Follow the short path along the pool. Breakfast is waiting when you come back."]]
  },
  {
    id: "afternoon",
    time: "Afternoon",
    title: "Water, stone and shade",
    image: photos.pool,
    entries: [
      ["14:15", "Arrive at the bathhouse", "Leave your bag in a locker. Towels and a pair of pool sandals are ready inside."],
      ["14:30", "Limestone soak", "Spend forty-five minutes between the warm pool and the cool, shaded deck."],
      ["15:30", "Settle into the reading room", "Take tea by the window, or collect your room key if you are staying overnight."]]
  },
];

export function Front() {
  return (
    <section className="fern-front">
      <div className="fern-copy">
        <p className="edition-kicker">Fern & Stone / Guest daybook</p>
        <h1>A day among<br /><i>the ferns.</i></h1>
        <p>A limestone bath, a timber room and an afternoon you can leave open.</p>
        <div className="fern-bookmarks">
          {walks.map(w => <Link key={w.id} href={BASE + "/daybook#" + w.id}>{w.time} itinerary <span aria-hidden="true">↗</span></Link>)}
        </div>
      </div>
      <figure>
        <Photo hero photo={photos.pool} sizes="(min-width: 750px) 55vw, 100vw" />
        <figcaption>The soaking garden, from the timber deck.</figcaption>
      </figure>
    </section>
  );
}

export function Feature() {
  return (
    <article className="fern-daybook">
      <header>
        <p className="edition-kicker">Fern & Stone / Guest daybook</p>
        <h1>Hours in the garden.</h1>
        <p>Two ways to spend a half day here. Choose the pace that suits you.</p>
      </header>
      {walks.map(w => <section id={w.id} key={w.id}>
        <figure>
          <Photo photo={w.image} sizes="(min-width: 750px) 38vw, 100vw" />
          <figcaption>{w.time} itinerary</figcaption>
        </figure>
        <div>
          <h2>{w.title}</h2>
          <ol>
            {w.entries.map(([time, name, description]) => <li key={time}><time>{time}</time><div><h3>{name}</h3><p>{description}</p></div></li>)}
          </ol>
        </div>
      </section>)}
      <Link className="edition-link" href={(BASE || "/") + "#request"}>Arrange a spa visit ↗</Link>
    </article>
  );
}
