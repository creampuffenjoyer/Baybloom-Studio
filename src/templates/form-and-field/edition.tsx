import Link from "next/link";
import { Photo } from "../_kit/studio/photo";
import photos from "./photos.json";
import { BASE } from "./site";

export function Front() {
  return (
    <section className="field-front">
      <div className="field-top">
        <p className="edition-kicker">Independent design practice</p>
        <p>Strategy / Identity / Digital</p>
      </div>
      <h1>Form <em>&</em> Field</h1>
      <div className="field-work">
        <div>
          <p>Selected project</p>
          <h2>Northline<br />Assembly</h2>
          <Link href={BASE + "/northline"}>Open case study ↗</Link>
        </div>
        <Photo hero photo={photos.circles} sizes="(min-width: 750px) 65vw, 100vw" />
      </div>
      <div className="field-index">
        <Link href={(BASE || "/") + "#work"}>All projects ↓</Link>
        <Link href={(BASE || "/") + "#request"}>Work with the studio ↗</Link>
      </div>
    </section>
  );
}

export function Feature() {
  return (
    <article className="field-case">
      <header>
        <p className="edition-kicker">Form & Field / Selected work</p>
        <h1>Northline<br />Assembly<span>.</span></h1>
        <dl>
          <div><dt>Client</dt><dd>Independent design fair</dd></div>
          <div><dt>Scope</dt><dd>Strategy, identity, wayfinding</dd></div>
        </dl>
      </header>
      <Photo hero photo={photos.circles} />
      <div className="field-essay">
        <h2>One shape, from a pass to a pavilion.</h2>
        <div>
          <p>The fair brings independent makers into one hall. Its old signage gave every stall equal billing, but visitors had trouble finding the next room.</p>
          <p>We cut a circle into quarters and used its edges as pointers. On a folded programme, one quarter marks a workshop. Across an entrance wall, the same shape turns visitors toward the floor.</p>
        </div>
      </div>
      <figure className="field-proof" aria-label="Example Northline directional sign">
        <span>Northline<br />Assembly</span>
        <b aria-hidden="true">↗</b>
        <figcaption>Hall B / Workshops</figcaption>
      </figure>
      <div className="field-essay">
        <h2>Built for the fair crew.</h2>
        <p>A two-colour print file and a small set of sign layouts let exhibitors update room names and reprint passes on site.</p>
      </div>
      <Link className="edition-link" href={(BASE || "/") + "#work"}>Back to the project index ↗</Link>
    </article>
  );
}
