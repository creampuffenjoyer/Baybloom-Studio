import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "../../_kit/dates";
import { RITUALS, photo, treatments } from "../content";
import { href, pebbles } from "../site";

export function TreatmentsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-10 sm:px-8">
        <h1 className="font-t-display text-6xl sm:text-7xl">Treatments</h1>
        <p className="mt-5 max-w-[56ch] text-lg text-t-muted">
          Every treatment begins with a warm foot ritual and ends with tea. Arrive twenty minutes early to
          change and settle in.
        </p>
        <nav aria-label="Rituals" className="mt-8 flex flex-wrap gap-2">
          {RITUALS.map((r) => (
            <a key={r.id} href={`#${r.id}`} className="rounded-full bg-t-surface px-4 py-2 text-[15px] hover:bg-t-soft">
              {r.label}
            </a>
          ))}
        </nav>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-5 py-10 sm:px-8">
        {RITUALS.map((r) => (
          <section key={r.id} id={r.id} aria-labelledby={`h-${r.id}`} className="scroll-mt-28">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-t-line pb-4">
              <h2 id={`h-${r.id}`} className="font-t-display text-4xl">
                {r.label}
              </h2>
              <p className="text-t-muted">{r.line}</p>
            </div>
            <ul className="divide-y divide-t-line">
              {treatments
                .filter((t) => t.ritual === r.id)
                .map((t, i) => {
                  const p = photo(t.photo);
                  return (
                    <li key={t.slug} className="grid items-center gap-6 py-8 sm:grid-cols-[140px_1fr_auto]">
                      <div className={`relative aspect-square w-28 overflow-hidden sm:w-full ${pebbles[i % 3]}`}>
                        <Image src={p.src} alt="" fill sizes="140px" className="object-cover" />
                      </div>
                      <div>
                        <h3 className="font-t-display text-2xl">
                          <Link href={href(`/treatments/${t.slug}`)} className="hover:text-t-accent">
                            {t.name}
                          </Link>
                        </h3>
                        <p className="mt-1 max-w-[52ch] text-t-muted">{t.summary}</p>
                        <p className="mt-2 text-[15px]">
                          {t.options.map((o) => `${o.minutes} min · ${formatMoney(o.price)}`).join("   /   ")}
                          {t.forTwo && <span className="text-t-muted"> for two</span>}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:flex-col sm:items-end">
                        <Link
                          href={`${href("/book")}?treatment=${t.slug}`}
                          className="rounded-full bg-t-accent px-5 py-2.5 text-[15px] font-semibold text-t-on-accent"
                        >
                          Book
                        </Link>
                        <Link href={href(`/treatments/${t.slug}`)} className="px-2 py-2.5 text-[15px] underline underline-offset-4">
                          Details
                        </Link>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
