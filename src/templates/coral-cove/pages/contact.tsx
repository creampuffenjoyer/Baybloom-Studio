import { ContactForm } from "../components/contact-form";
import { PageIntro } from "../components/page-intro";
import { site } from "../site";

const faqs = [
  {
    q: "How do we get to Isla Calma?",
    a: "Fly to El Nido (1 h 15 min from Manila). Our driver meets you at arrivals and takes you to the pier, where our speedboat crosses in about 40 minutes. Transfers run from 7 am to 5 pm.",
  },
  {
    q: "Is breakfast included?",
    a: "Yes, every rate includes breakfast at the beach restaurant or in your villa, plus snorkel gear, kayaks and paddleboards.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancel free of charge up to 14 days before arrival. After that, the first night is charged. Offers may have their own terms.",
  },
  {
    q: "Is the resort good for children?",
    a: "Very. The Lagoon Family Villas have a shallow pool ledge, and our kids’ club runs every morning for ages 4 to 12.",
  },
];

export function ContactPage() {
  return (
    <>
      <PageIntro
        title="Talk to us"
        lede="Questions about villas, dates or getting here? Write to us and a real person on the island will reply."
      />
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />
        <aside className="space-y-8">
          <div className="rounded-3xl bg-t-soft p-7">
            <h2 className="font-t-display text-2xl font-bold tracking-tight">Reservations</h2>
            <p className="mt-3 leading-relaxed">
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-4">
                {site.phone}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                {site.email}
              </a>
            </p>
            <p className="mt-3 text-sm text-t-muted">Every day, 7 am – 10 pm (GMT+8)</p>
          </div>
          <div className="rounded-3xl border border-t-line p-7">
            <h2 className="font-t-display text-2xl font-bold tracking-tight">Address</h2>
            <address className="mt-3 leading-relaxed not-italic">
              {site.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            <p className="mt-3 text-sm text-t-muted">
              Check-in from {site.checkIn}, check-out until {site.checkOut}.
            </p>
          </div>
        </aside>
      </div>
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <h2 id="faq" className="font-t-display text-4xl font-bold tracking-[-0.035em]">
          Good questions
        </h2>
        <div className="mt-8 divide-y divide-t-line border-y border-t-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                {f.q}
                <span aria-hidden className="text-2xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-t-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
