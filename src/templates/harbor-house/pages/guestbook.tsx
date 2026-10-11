import { GuestbookForm } from "../components/guestbook-form";
import { guestbook } from "../content";

export function GuestbookPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-t-display text-5xl sm:text-6xl">The guestbook</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-t-muted">It lives on the hall table. Here are a few recent pages.</p>
      <div className="mt-12 columns-1 gap-6 md:columns-2">
        {guestbook.map((g, i) => (
          <figure
            key={g.who}
            className={`mb-6 break-inside-avoid p-7 ${i % 3 === 0 ? "bg-t-soft" : "bg-t-surface ring-1 ring-t-line"}`}
            style={{ rotate: `${i % 2 ? 0.8 : -0.8}deg` }}
          >
            <blockquote className="font-[family-name:var(--hh-hand)] text-[1.75rem] leading-snug">{g.text}</blockquote>
            <figcaption className="mt-4 text-sm text-t-muted">
              {g.who}, {g.from}, {g.month}
            </figcaption>
          </figure>
        ))}
      </div>
      <section aria-labelledby="sign" className="mt-16 max-w-2xl">
        <h2 id="sign" className="font-t-display text-3xl">
          Stayed with us?
        </h2>
        <p className="mt-2 mb-6 text-t-muted">Leave a few words for Mila and Joel.</p>
        <GuestbookForm />
      </section>
    </div>
  );
}
