import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import { events, venueNotes } from "../content";
import { eventPreset, planQuery } from "../plan";
import photos from "../photos.json";
import { href } from "../site";

export function EventsPage() {
  return (
    <div className="at-frame at-inner">
      <header className="at-page-heading"><p className="at-overline">Weddings, private gatherings &amp; work events</p><h1>Plan the whole day.</h1><p>Start with an example itinerary, then adapt the space and setup to your group.</p></header>
      <div className="at-spaces-list">
        {events.map((event, index) => (
          <section className="at-space-card at-reveal" key={event.id} id={event.id}>
            <div className="at-space-card-photo"><SitePhoto photo={photos[event.photo]} sizes="(min-width: 850px) 52vw, 100vw" priority={index === 0} /></div>
            <div className="at-space-card-copy">
              <p className="at-overline">{event.label}</p><h2>{event.title}.</h2><p>{event.description}</p>
              <ol className="at-agenda">{event.itinerary.map((entry) => <li key={entry}>{entry}</li>)}</ol>
              <div className="at-page-actions">
                <Link className="at-button" href={href(`/plan?${planQuery(eventPreset(event.id))}`)}>{event.id === "wedding" ? "Try the wedding timeline" : "Plan this event"} <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="at-faq at-reveal" aria-labelledby="at-faq-title"><h2 id="at-faq-title">Before you book.</h2>
        {venueNotes.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>
    </div>
  );
}
