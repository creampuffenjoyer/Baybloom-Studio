import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDay } from "../../_kit/dates";
import { photo, posts } from "../content";
import { arch, href } from "../site";

const longDate = (d: string) => formatDay(d, { day: "numeric", month: "long", year: "numeric" });

export function JournalPage() {
  const [lead, ...rest] = posts;
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
      <h1 className="font-t-display text-6xl italic sm:text-8xl">Journal</h1>
      <p className="mt-5 max-w-[50ch] text-lg text-t-muted">Notes from the house and the old town around it.</p>
      <Link href={href(`/journal/${lead.slug}`)} className="group mt-14 grid gap-10 border-t border-t-line pt-14 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={photo(lead.photo).src} alt={photo(lead.photo).alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="text-t-muted">
            {longDate(lead.date)} · {lead.minutes} min read
          </p>
          <h2 className="mt-3 font-t-display text-5xl italic group-hover:text-t-alt">{lead.title}</h2>
          <p className="mt-4 text-lg text-t-muted">{lead.dek}</p>
        </div>
      </Link>
      <ul className="mt-16 grid gap-12 border-t border-t-line pt-14 md:grid-cols-2">
        {rest.map((p) => (
          <li key={p.slug}>
            <Link href={href(`/journal/${p.slug}`)} className="group block">
              <p className="text-t-muted">
                {longDate(p.date)} · {p.minutes} min read
              </p>
              <h2 className="mt-2 font-t-display text-4xl italic group-hover:text-t-alt">{p.title}</h2>
              <p className="mt-3 text-t-muted">{p.dek}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PostPage({ slug }: { slug: string }) {
  const p = posts.find((x) => x.slug === slug);
  if (!p) notFound();
  const others = posts.filter((x) => x.slug !== slug);
  return (
    <article className="px-5 pt-16 sm:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-t-muted">
          <Link href={href("/journal")} className="hover:text-t-ink">
            Journal
          </Link>
          {" · "}
          {longDate(p.date)}
        </p>
        <h1 className="mt-4 font-t-display text-5xl leading-tight italic sm:text-7xl">{p.title}</h1>
        <p className="mt-5 text-xl text-t-muted">{p.dek}</p>
      </header>
      <div className={`relative mx-auto mt-12 aspect-[4/5] max-w-xl overflow-hidden ${arch}`}>
        <Image src={photo(p.photo).src} alt={photo(p.photo).alt} fill priority sizes="(min-width: 640px) 576px, 100vw" className="object-cover" />
      </div>
      <div className="mx-auto mt-14 max-w-[62ch] space-y-6 font-t-display text-xl leading-[1.7] first-letter:float-left first-letter:mr-3 first-letter:font-t-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-t-alt">
        {p.body.map((para) => (
          <p key={para.slice(0, 16)}>{para}</p>
        ))}
      </div>
      <aside aria-labelledby="more" className="mx-auto mt-20 max-w-3xl border-t border-t-line pt-10">
        <h2 id="more" className="font-t-display text-3xl italic">
          More from the journal
        </h2>
        <ul className="mt-6 space-y-4">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={href(`/journal/${o.slug}`)} className="font-t-display text-2xl italic hover:text-t-alt">
                {o.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
