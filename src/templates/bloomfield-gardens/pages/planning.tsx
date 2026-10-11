import Link from "next/link";
import { Suspense } from "react";
import { DateCheck } from "../components/date-check";
import { faqs, timeline } from "../content";
import { href } from "../site";

export function PlanningPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pt-14 pb-12 text-center sm:px-8">
        <h1 className="font-t-display text-6xl font-medium italic sm:text-7xl">Planning your day</h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-lg text-t-muted">
          From the first viewing to the last dance, one coordinator looks after you. Here’s how it usually goes.
        </p>
      </section>
      <section aria-labelledby="tl" className="mx-auto max-w-4xl px-5 sm:px-8">
        <h2 id="tl" className="sr-only">
          Timeline
        </h2>
        <ol className="relative space-y-10 border-l border-t-alt/40 pl-8">
          {timeline.map((t) => (
            <li key={t.when} className="relative">
              <span aria-hidden className="absolute top-2 -left-[2.3rem] size-3 rounded-full bg-t-alt" />
              <p className="font-t-display text-3xl italic">{t.when}</p>
              <p className="mt-1 text-lg text-t-muted">{t.what}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="faq" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <h2 id="faq" className="font-t-display text-5xl font-medium italic">
          Questions couples ask
        </h2>
        <div className="mt-8 divide-y divide-t-line border-y border-t-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg">
                {q}
                <span aria-hidden className="font-t-display text-2xl text-t-alt transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-t-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-[2rem] bg-t-soft p-8 sm:p-12">
          <Suspense fallback={<div className="h-[380px]" />}>
            <DateCheck />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-t-muted">
          Prefer to talk? <Link href={href("/inquire")} className="underline underline-offset-4">Send us a note</Link> and we’ll call you back.
        </p>
      </section>
    </>
  );
}
