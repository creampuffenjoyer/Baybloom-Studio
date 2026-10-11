import Image from "next/image";
import { SimpleForm } from "../components/simple-form";
import { menuHighlights, photo } from "../content";

export function DiningPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
        <h1 className="font-tpl-display text-6xl italic sm:text-8xl">Comedor</h1>
        <p className="mt-6 max-w-[56ch] text-lg text-tpl-muted">
          Lunch from 11:30 am and dinner from 6 pm, every day. Chef Mila cooks the Ilocano food she grew up
          with, from vegetables grown in Bantay and fish landed at Pandan.
        </p>
        <div className="relative mt-12 aspect-[21/9] overflow-hidden">
          <Image src={photo("dining-table").src} alt={photo("dining-table").alt} fill priority sizes="100vw" className="object-cover" />
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 className="font-tpl-display text-4xl italic">From the menu</h2>
          <ul className="mt-6 divide-y divide-tpl-line border-y border-tpl-line">
            {menuHighlights.map((m) => (
              <li key={m.name} className="py-4">
                <span className="font-tpl-display text-2xl italic">{m.name}</span>
                <span className="block text-tpl-muted">{m.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-tpl-display text-4xl italic">Reserve a table</h2>
          <p className="mt-3 mb-8 text-tpl-muted">Hotel guests are always seated; visitors, please book ahead on weekends.</p>
          <SimpleForm
            submitLabel="Request a table"
            sentTitle="We’ll confirm by text."
            sentBody="Our host will message you within the hour to confirm your table."
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "phone", label: "Mobile", type: "tel", required: true },
              { name: "date", label: "Date", type: "date", required: true },
              { name: "time", label: "Time", type: "select", options: ["12:00", "12:30", "13:00", "18:30", "19:00", "19:30", "20:00"], defaultValue: "19:00" },
              { name: "guests", label: "Guests", type: "number", min: 1, max: 12, defaultValue: "2" },
              { name: "occasion", label: "Occasion", type: "select", options: ["None", "Birthday", "Anniversary", "Business"] },
            ]}
          />
        </div>
      </section>
    </>
  );
}
