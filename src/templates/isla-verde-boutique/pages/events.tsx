import Image from "next/image";
import { SimpleForm } from "../components/simple-form";
import { eventSpaces, photo } from "../content";
import { arch } from "../site";

export function EventsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden text-white">
        <Image src={photo("garden-night").src} alt={photo("garden-night").alt} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-black/50" />
        <div className="mx-auto max-w-7xl px-5 py-36 sm:px-8">
          <h1 className="max-w-3xl font-tpl-display text-6xl leading-[0.98] italic sm:text-8xl">Weddings and gatherings</h1>
          <p className="mt-6 max-w-[50ch] text-lg text-white/85">
            Exchange vows in the courtyard, dine in the salon and dance on the cobbles of Calle Crisologo.
          </p>
        </div>
      </section>
      <section aria-labelledby="spaces" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 id="spaces" className="font-tpl-display text-5xl italic">
          Three rooms for celebrating
        </h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {eventSpaces.map((s, i) => {
            const p = photo((["courtyard", "salon", "library"] as const)[i]);
            return (
              <li key={s.name}>
                <div className={`relative aspect-[3/4] overflow-hidden ${arch}`}>
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <h3 className="mt-5 font-tpl-display text-3xl italic">{s.name}</h3>
                <p className="mt-1">{s.capacity}</p>
                <p className="text-tpl-muted">{s.note}</p>
              </li>
            );
          })}
        </ul>
      </section>
      <section aria-labelledby="inquire" className="bg-tpl-soft">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <h2 id="inquire" className="font-tpl-display text-5xl italic">
              Tell us your plans
            </h2>
            <p className="mt-4 text-lg text-tpl-muted">Our events team replies within two working days with dates and a proposal.</p>
          </div>
          <SimpleForm
            submitLabel="Send inquiry"
            sentTitle="Thank you."
            sentBody="Our events team will be in touch within two working days."
            fields={[
              { name: "names", label: "Your names", required: true, wide: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "phone", label: "Phone", type: "tel" },
              { name: "type", label: "Occasion", type: "select", options: ["Wedding", "Rehearsal dinner", "Birthday", "Company retreat", "Something else"] },
              { name: "guests", label: "Guests", type: "number", min: 2, max: 120, defaultValue: "60" },
              { name: "date", label: "Preferred date", type: "date" },
              { name: "rooms", label: "Rooms needed", type: "select", options: ["None", "A few", "The whole house"] },
              { name: "message", label: "Tell us more", type: "textarea" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
