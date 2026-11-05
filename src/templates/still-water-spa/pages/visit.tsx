import Image from "next/image";
import { photo } from "../content";
import { pebbles, site } from "../site";

const faqs = [
  ["What should I bring?", "Nothing at all. We provide robes, slippers, towels and toiletries. Bring swimwear if you’d like to use the bathhouse."],
  ["How early should I arrive?", "Twenty minutes before your treatment, so you can change, have tea and fill in a short health form."],
  ["Can I cancel?", "Yes, free of charge until 24 hours before your appointment. Later cancellations are charged at half the treatment price."],
  ["Is there parking?", "Free parking for guests in front of the spa. A Grab or taxi from Session Road takes about ten minutes."],
  ["Can I come if I’m pregnant?", "Yes, from the second trimester. Liza offers a pregnancy hilot; please let us know when you book. The sauna and steam room aren’t suitable."],
];

export function VisitPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-12 pb-16 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="font-tpl-display text-6xl sm:text-7xl">Visit</h1>
          <address className="mt-8 text-xl leading-relaxed not-italic">
            {site.address.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-5 text-lg">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-tpl-accent underline underline-offset-4">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="text-tpl-muted">
              {site.email}
            </a>
          </p>
          <dl className="mt-8 space-y-1">
            {site.hours.map((h) => (
              <div key={h.days} className="flex gap-4">
                <dt className="w-44 text-tpl-muted">{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={`relative aspect-[4/3] overflow-hidden ${pebbles[2]}`}>
          <Image src={photo("green-pool").src} alt={photo("green-pool").alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h2 id="faq" className="font-tpl-display text-4xl">
          Good to know
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-tpl-surface px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
                {q}
                <span aria-hidden className="text-xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-tpl-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
