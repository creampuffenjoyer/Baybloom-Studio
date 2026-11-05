"use client";
import { usePine, LocalLink as Link } from "../language";
import Image from "next/image";

import { notFound } from "next/navigation";
import { formatMoney } from "../../_kit/dates";

import { CURRENCY, href } from "../site";

export function RoomsPage() {
  const { t, photo, rooms, site, season, seasons } = usePine();
  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
      <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">{t("Rooms")}</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tpl-muted">{t("Fourteen rooms in the lodge and one chalet in the pines. Breakfast, the sauna and the boot room are included in every stay.")}</p>
      <p className="mt-5">{t("Planning season:")} {seasons[season].label}. <Link href={href("/activities")} className="font-semibold underline">{t("Change trip plan")}</Link></p>
      <div role="region" aria-label={t("Compare rooms")} tabIndex={0} className="mt-12 overflow-x-auto rounded-md ring-1 ring-tpl-line">
        <table className="w-full min-w-[720px] bg-tpl-surface text-left">
          <caption className="sr-only">{t("Compare rooms")}</caption>
          <thead className="bg-tpl-deep text-tpl-on-deep">
            <tr>
              <th scope="col" className="p-4 font-medium">{t("Room")}</th>
              <th scope="col" className="p-4 font-medium">{t("Sleeps")}</th>
              <th scope="col" className="p-4 font-medium">{t("Beds")}</th>
              <th scope="col" className="p-4 font-medium">{t("Size")}</th>
              <th scope="col" className="p-4 font-medium">{t("From")}</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.slug} className="border-t border-tpl-line">
                <th scope="row" className="p-4">
                  <Link href={href(`/rooms/${r.slug}`)} className="flex items-center gap-4 hover:text-tpl-alt">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded">
                      <Image src={photo(r.photos[0]).src} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="font-tpl-display text-xl font-bold">{r.name}</span>
                  </Link>
                </th>
                <td className="p-4">{r.maxGuests}</td>
                <td className="p-4">{r.beds}</td>
                <td className="p-4">{r.size} m²</td>
                <td className="p-4 font-bold">{formatMoney(r.price, CURRENCY)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-tpl-muted">{t("Check-in from")}{" "}{site.checkIn}{t(", check-out by")}{" "}{site.checkOut}{t(". Prices per night in Canadian dollars, before tax.")}</p>
    </div>
  );
}

export function RoomPage({ slug }: { slug: string }) {
  const { t, photo, rooms, season, seasons } = usePine();
  const r = rooms.find((x) => x.slug === slug);
  if (!r) notFound();
  const [a, b, c] = r.photos.map(photo);
  return (
    <>
      <section className="relative isolate">
        <div className="relative aspect-[16/9] max-h-[640px] w-full overflow-hidden sm:aspect-[21/9]">
          <Image src={a.src} alt={a.alt} fill priority sizes="100vw" className="object-cover" />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-12 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Link href={href("/rooms")} className="font-medium text-tpl-alt hover:underline">{t("All rooms")}</Link>
          <h1 className="mt-2 font-tpl-display text-5xl font-bold sm:text-6xl">{r.name}</h1>
          <p className="mt-4">{t("Planning season:")} {seasons[season].label}. <Link href={href("/activities")} className="font-semibold underline">{t("Change trip plan")}</Link></p>
          <div className="mt-6 space-y-4 text-lg leading-relaxed">
            {r.description.map((d) => (
              <p key={d.slice(0, 16)}>{d}</p>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[b, c].map((p) => (
              <div key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-md bg-tpl-deep p-7 text-tpl-on-deep">
            <p className="text-tpl-on-deep/70">{t("From")}</p>
            <p className="font-tpl-display text-5xl font-bold">{formatMoney(r.price, CURRENCY)}</p>
            <p className="text-tpl-on-deep/70">{t("a night, breakfast included")}</p>
            <ul className="mt-6 space-y-2 border-t border-white/15 pt-5">
              {[`${t("Sleeps")} ${r.maxGuests}`, r.beds, `${r.size} m²`, ...r.features].map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link href={`${href("/book")}?room=${r.slug}`} className="mt-7 block rounded-md bg-tpl-accent px-6 py-3.5 text-center font-bold text-tpl-on-accent">{t("Check dates")}</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
