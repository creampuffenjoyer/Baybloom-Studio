import { Postcard } from "../components/postcard";
import { rooms } from "../content";
import { site } from "../site";

export function RoomsPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-tpl-display text-5xl sm:text-6xl">Our rooms</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tpl-muted">
        Four rooms in a 1930s stone house on the harbour. Every stay includes breakfast. Check in from{" "}
        {site.checkIn}, check out by {site.checkOut}.
      </p>
      <div className="mt-14 grid gap-12 md:grid-cols-2">
        {rooms.map((r, i) => (
          <Postcard key={r.slug} room={r} tilt={i % 2 ? 1 : -1} />
        ))}
      </div>
    </section>
  );
}
