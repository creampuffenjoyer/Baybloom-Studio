import Image from "next/image";
import Link from "next/link";
import { photo } from "../content";
import { href, site } from "../site";

const notes = [
  { title: "Getting here", text: "Two blocks from Kalayaan Avenue. Pay parking at Century City Mall, a five-minute walk. Grab and taxis can stop at the door." },
  { title: "Dress", text: "Come as you are. The dining room is warm from the ovens, so leave the jacket in the car." },
  { title: "Children", text: "Welcome until 8 pm. We have high chairs and a short kids’ menu from the grill." },
  { title: "Access", text: "Step-free entrance and an accessible restroom on the ground floor. The Back Room is up six stairs." },
];

export function VisitPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="font-tpl-display text-6xl leading-none sm:text-8xl">Visit</h1>
          <address className="mt-8 font-tpl-display text-3xl leading-snug not-italic">
            {site.address.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-6 text-lg">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-tpl-accent">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="text-tpl-muted hover:text-tpl-ink">
              {site.email}
            </a>
          </p>
          <dl className="mt-10 max-w-md space-y-2">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 border-b border-dotted border-tpl-line pb-2">
                <dt className="text-tpl-muted">{h.days}</dt>
                <dd className="text-right">{h.time}</dd>
              </div>
            ))}
          </dl>
          <Link href={href("/reserve")} className="mt-10 inline-block bg-tpl-accent px-6 py-3.5 font-semibold text-tpl-on-accent hover:bg-tpl-alt">
            Reserve a table
          </Link>
        </div>
        <div className="relative min-h-[420px] overflow-hidden">
          <Image src={photo("room").src} alt={photo("room").alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>
      <section aria-label="Before you come" className="border-t border-tpl-line">
        <dl className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
          {notes.map((n) => (
            <div key={n.title}>
              <dt className="font-tpl-display text-2xl">{n.title}</dt>
              <dd className="mt-3 leading-relaxed text-tpl-muted">{n.text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
