import { RentalForm } from "../components/rental-form";
import { site } from "../site";

export function ContactPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-14 sm:px-8 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">Contact</h1>
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
            <strong className="text-tpl-ink">Driving:</strong> 2 hours from Kelowna airport. Winter tyres or chains are required
            on the valley road from October to April.
          </p>
          <p>
            <strong className="text-tpl-ink">Shuttle:</strong> we collect from the Whitebark village bus stop twice a day.
          </p>
        </div>
      </div>
      <section aria-labelledby="rent">
        <h2 id="rent" className="font-tpl-display text-3xl font-bold">
          Gear rental and guides
        </h2>
        <p className="mt-2 mb-6 text-tpl-muted">Tell us what you need and we’ll have it ready when you arrive.</p>
        <RentalForm />
      </section>
    </div>
  );
}
