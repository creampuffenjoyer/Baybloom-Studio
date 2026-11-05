"use client";
import { useCoral } from "../language";
import { ContactForm } from "../components/contact-form";
import { PageIntro } from "../components/page-intro";


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
  const { t, site } = useCoral();
  return (
    <>
      <PageIntro
        title={t("Talk to us")}
        lede={t("Explore a sample guest enquiry. Contact details and resort policies are illustrative.")}
      />
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />
        <aside className="space-y-8">
          <div className="rounded-3xl bg-tpl-soft p-7">
            <h2 className="font-tpl-display text-2xl font-bold tracking-tight">{t("Reservations")}</h2>
            <p className="mt-3 leading-relaxed">
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-4">
                {site.phone}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                {site.email}
              </a>
            </p>
            <p className="mt-3 text-sm text-tpl-muted">{t("Every day, 7 am – 10 pm (GMT+8)")}</p>
          </div>
          <div className="rounded-3xl border border-tpl-line p-7">
            <h2 className="font-tpl-display text-2xl font-bold tracking-tight">{t("Address")}</h2>
            <address className="mt-3 leading-relaxed not-italic">
              {site.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            <p className="mt-3 text-sm text-tpl-muted">{t("Check-in from")}{" "}{site.checkIn}{t(", check-out until")}{" "}{site.checkOut}.
            </p>
          </div>
        </aside>
      </div>
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <h2 id="faq" className="font-tpl-display text-4xl font-bold tracking-[-0.035em]">{t("Good questions")}</h2>
        <div className="mt-8 divide-y divide-tpl-line border-y border-tpl-line">
          {faqs.map((f) => (
            <details key={t(f.q)} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                {f.q}
                <span aria-hidden className="text-2xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-tpl-muted">{t(f.a)}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
