"use client";
import { usePine } from "../language";
import { RentalForm } from "../components/rental-form";
import { usePersonalization } from "../personalization";


export function ContactPage() {
  const { t, site } = usePine();
  const page = usePersonalization().pinePages?.contact;
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-14 sm:px-8 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">{page?.heading || t("Contact")}</h1>
        <address className="mt-6 text-lg leading-relaxed not-italic">
          {site.address.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </address>
        <p className="mt-4 text-lg">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-bold text-tpl-alt underline underline-offset-4">
            {site.phone}
          </a>
          <br />
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <div className="mt-8 space-y-3 text-tpl-muted">
          <p>
            <strong className="text-tpl-ink">{t("Driving:")}</strong>{" "}{page?.driving || t("2 hours from Kelowna airport. Winter tyres or chains are required on the valley road from October to April.")}</p>
          <p>
            <strong className="text-tpl-ink">{t("Shuttle:")}</strong>{" "}{page?.shuttle || t("we collect from the Whitebark village bus stop twice a day.")}</p>
        </div>
      </div>
      <section aria-labelledby="rent">
        <h2 id="rent" className="font-tpl-display text-3xl font-bold">{page?.rentalHeading || t("Gear rental and guides")}</h2>
        <p className="mt-2 mb-6 text-tpl-muted">{t("Try a sample request for gear or a guide. Contact details and travel information are illustrative.")}</p>
        <RentalForm />
      </section>
    </div>
  );
}
