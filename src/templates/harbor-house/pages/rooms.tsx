"use client";

import { useHarbor } from "../language";

import { Postcard } from "../components/postcard";



export function RoomsPage() {
  const { t, rooms } = useHarbor();
  return (
    <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-tpl-display text-5xl sm:text-6xl">{t("Our rooms")}</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tpl-muted">
        {t("Four rooms in a 1930s stone house by the harbour. Breakfast is included. Check-in from 2 pm; check-out by 11 am.")}
      </p>
      <div className="mt-14 grid gap-12 md:grid-cols-2">
        {rooms.map((r, i) => (
          <Postcard key={r.slug} room={r} tilt={i % 2 ? 1 : -1} />
        ))}
      </div>
    </section>
  );
}
