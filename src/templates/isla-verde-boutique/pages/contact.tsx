import { SimpleForm } from "../components/simple-form";
import { site } from "../site";

export function ContactPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-16 px-5 pt-16 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h1 className="font-tpl-display text-6xl italic sm:text-7xl">Write to us</h1>
        <address className="mt-8 font-tpl-display text-2xl leading-snug not-italic">
          {site.address.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </address>
        <p className="mt-6 text-lg">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="border-b border-tpl-ink">
            {site.phone}
          </a>
          <br />
          <a href={`mailto:${site.email}`} className="text-tpl-muted">
            {site.email}
          </a>
        </p>
        <div className="mt-10 space-y-4 text-tpl-muted">
          <p>
            <span className="text-tpl-ink">Getting here.</span> Laoag International Airport is 80 minutes by car; we can
            collect you. Buses from Manila arrive at the Vigan terminal, five minutes away.
          </p>
          <p>
            <span className="text-tpl-ink">Check-in</span> from {site.checkIn}, <span className="text-tpl-ink">check-out</span> by{" "}
            {site.checkOut}.
          </p>
        </div>
      </div>
      <div className="lg:pt-6">
        <SimpleForm
          submitLabel="Send message"
          sentTitle="Message received."
          sentBody="We reply to every message within a day, usually much sooner."
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "subject", label: "About", type: "select", options: ["A stay", "Dining", "An event", "Press", "Something else"], wide: true },
            { name: "message", label: "Message", type: "textarea", required: true },
          ]}
        />
      </div>
    </div>
  );
}
