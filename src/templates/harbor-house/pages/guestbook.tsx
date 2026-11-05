"use client";

import { useHarbor } from "../language";

import { GuestbookForm } from "../components/guestbook-form";


export function GuestbookPage() {
  const { t, guestbook } = useHarbor();
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-tpl-display text-5xl sm:text-6xl">{t("The guestbook")}</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tpl-muted">{t("It lives on the hall table. Here are a few recent pages.")}</p>
      <div className="mt-12 columns-1 gap-6 md:columns-2">
        {guestbook.map((g, i) => (
          <figure
            key={g.who}
            className={`mb-6 break-inside-avoid p-7 ${i % 3 === 0 ? "bg-tpl-soft" : "bg-tpl-surface ring-1 ring-tpl-line"}`}
            style={{ rotate: `${i % 2 ? 0.8 : -0.8}deg` }}
          >
            <blockquote className="font-[family-name:var(--hh-hand)] text-[1.75rem] leading-snug">{g.text}</blockquote>
            <figcaption className="mt-4 text-sm text-tpl-muted">
              {g.who}, {g.from}, {g.month}
            </figcaption>
          </figure>
        ))}
      </div>
      <section aria-labelledby="sign" className="mt-16 max-w-2xl">
        <h2 id="sign" className="font-tpl-display text-3xl">
          {t("Stayed with us?")}</h2>
        <p className="mt-2 mb-6 text-tpl-muted">{t("Leave a few words for Mila and Joel.")}</p>
        <GuestbookForm />
      </section>
    </div>
  );
}
