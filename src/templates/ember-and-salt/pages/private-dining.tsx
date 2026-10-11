import Image from "next/image";
import { formatMoney } from "../../_kit/dates";
import { InquiryForm } from "../components/inquiry-form";
import { photo, spaces } from "../content";

export function PrivateDiningPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-16 pb-16 sm:px-8">
        <h1 className="max-w-4xl font-t-display text-6xl leading-[0.92] sm:text-8xl">Private dining</h1>
        <p className="mt-6 max-w-[54ch] text-lg text-t-muted">
          Birthdays, rehearsal dinners, team nights and launches. Set menus start at ₱2,800 a head, and
          our sommelier will match wines to your budget.
        </p>
      </section>

      <ul className="mx-auto max-w-7xl space-y-px px-5 sm:px-8">
        {spaces.map((s) => {
          const p = photo(s.photo);
          return (
            <li key={s.slug} className="grid gap-8 border-t border-t-line py-12 md:grid-cols-[1.1fr_1fr] md:gap-14">
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div>
                <h2 className="font-t-display text-4xl sm:text-5xl">{s.name}</h2>
                <p className="mt-4 text-lg leading-relaxed text-t-muted">{s.description}</p>
                <dl className="mt-6 space-y-2">
                  <div className="flex gap-4 border-b border-dotted border-t-line pb-2">
                    <dt className="w-40 text-t-muted">Capacity</dt>
                    <dd>
                      {s.seats}
                      {s.standing && `, ${s.standing}`}
                    </dd>
                  </div>
                  <div className="flex gap-4 border-b border-dotted border-t-line pb-2">
                    <dt className="w-40 text-t-muted">Minimum spend</dt>
                    <dd>{formatMoney(s.minimum)}</dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="inquire" className="mt-16 bg-t-surface">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="inquire" className="font-t-display text-5xl leading-none">
              Start planning
            </h2>
            <p className="mt-5 max-w-[40ch] text-lg text-t-muted">
              Share a few details and we’ll send sample menus, availability and a quote.
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
