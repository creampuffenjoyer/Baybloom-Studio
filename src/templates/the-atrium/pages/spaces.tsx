import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import { arrangements, spaces } from "../content";
import photos from "../photos.json";
import { href } from "../site";

export function SpacesPage() {
  return (
    <div className="at-frame at-inner">
      <header className="at-page-heading">
        <p className="at-overline">The property</p><h1>Where to gather.</h1>
        <p>Compare three rooms by size, setup and shelter. Each can host a different part of the day.</p>
      </header>
      <div className="at-spaces-list">
        {spaces.map((room, index) => (
          <section id={room.id} className="at-space-card at-reveal" key={room.id}>
            <div className="at-space-card-photo"><SitePhoto photo={photos[room.photo]} sizes="(min-width: 850px) 52vw, 100vw" priority={index === 0} /></div>
            <div className="at-space-card-copy">
              <p className="at-overline">{room.size} · {room.shelter === "indoor" ? "Covered" : "Open air"}</p>
              <h2>{room.name}</h2><p>{room.blurb}</p>
              <dl aria-label="Capacity by setup" className="at-capacity-list">{arrangements.map(({ id, label }) => <div key={id}><dt>{label}</dt><dd>{room.capacity[id]} guests</dd></div>)}</dl>
              <ul className="at-space-details">{room.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              <div className="at-page-actions">
                <Link className="at-button" href={href(`/plan?space=${room.id}`)}>Try a layout <span aria-hidden="true">↗</span></Link>
                {room.id === "glasshouse" && <Link className="at-text-link" href={href("/tour")}>Take the tour</Link>}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
