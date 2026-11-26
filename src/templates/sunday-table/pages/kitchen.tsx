import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import { kitchenNotes } from "../gatherings";
import photos from "../photos.json";
import { href } from "../site";

export function KitchenPage() {
  return (
    <div className="st-editor">
      <header className="st-page-title st-editor-title"><p className="st-eyebrow">The Sunday Table kitchen</p><h1>Made to pass around.</h1><p>How a few dishes turn into a whole afternoon around the table.</p></header>
      <section className="st-kitchen-spread" aria-labelledby="st-kitchen-heading">
        <div className="st-editor-photo"><SitePhoto photo={photos.kitchen} priority sizes="(min-width: 820px) 49vw, 100vw" /></div>
        <div className="st-editor-copy"><p className="st-eyebrow">From the kitchen</p><h2 id="st-kitchen-heading">Cook for the table.</h2><p>We plan the meal around one slow dish, one from the grill and more rice than you think you need. Everything arrives in the middle.</p>
          <dl className="st-kitchen-notes">{kitchenNotes.map((note) => <div key={note.name}><dt>{note.name}</dt><dd>{note.detail}</dd></div>)}</dl>
          <Link className="st-button" href={href("/menu")}>Browse the menu <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <div className="st-editor-callout"><p>Cooking for a few more? Our family-style trays travel well.</p><Link className="st-button" href={href("/catering")}>Build a tray order <span aria-hidden="true">↗</span></Link></div>
    </div>
  );
}
