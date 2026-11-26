import Link from "next/link";
import { action, eyebrow, outlineAction, pesos, SitePhoto, wrap } from "../../_kit/hospitality-site";
import { stays } from "../content";
import photos from "../photos.json";
import { href, site } from "../site";
import { RoomLayout } from "./room-layout";

export function StaysPage() {
  return (
    <div className={`${wrap} py-12 sm:py-20`}>
      <p className={eyebrow}>Private rooms or exclusive use</p>
      <h1 className="mt-3 font-tpl-display text-5xl leading-none tracking-tight sm:text-7xl">Find your space.</h1>
      <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
        {stays.map((stay) => (
          <section key={stay.id} id={stay.id} className="scroll-m-4 overflow-hidden rounded-t-[3rem] rounded-b-md border border-tpl-line bg-tpl-surface">
            <div className="aspect-[3/2] overflow-hidden"><SitePhoto photo={photos[stay.photo]} sizes="(min-width: 768px) 520px, 100vw" /></div>
            <div className="p-5 sm:p-7">
              <h2 className="font-tpl-display text-4xl tracking-tight">{stay.name}</h2>
              <p className="mt-3 text-tpl-muted">{stay.description}</p>
              <dl className="my-4 grid gap-3 border-y border-tpl-line py-4">
                <div><dt className="text-sm font-semibold">Sleeping arrangements</dt><dd><RoomLayout stay={stay} /></dd></div>
                <div><dt className="text-sm font-semibold">Capacity and parking</dt><dd>{stay.guests} overnight guests · {stay.parking} {stay.parking === 1 ? "parking slot" : "parking slots"}</dd></div>
              </dl>
              <ul className="mb-5 flex flex-wrap gap-2" aria-label="Amenities">
                {stay.perks.map((perk) => <li key={perk} className="rounded-full bg-tpl-soft px-3 py-1 text-sm font-semibold">{perk}</li>)}
              </ul>
              <p className="font-semibold">{pesos(stay.price)} per night</p>
              <Link href={href(`/plan?stay=${stay.id}`)} className={`${action} mt-4 rounded-full`}>Estimate this stay <span className="sr-only">for {stay.name}</span></Link>
            </div>
          </section>
        ))}
      </div>
      {site.listingUrl && <a className={`${outlineAction} mt-6`} href={site.listingUrl}>View our booking listing</a>}
    </div>
  );
}
