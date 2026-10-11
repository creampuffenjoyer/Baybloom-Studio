import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDay } from "../../_kit/dates";
import { photo, posts } from "../content";
import { href } from "../site";

const longDate = (d: string) => formatDay(d, { day: "numeric", month: "long", year: "numeric" });

export function JournalPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pt-14 sm:px-8">
      <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">Lodge journal</h1>
      <p className="mt-4 text-lg text-tpl-muted">Conditions, tips and stories from the valley.</p>
      <ul className="mt-12 space-y-12">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={href(`/journal/${p.slug}`)} className="group grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
              <span className="relative aspect-[3/2] overflow-hidden rounded-md">
                <Image src={photo(p.photo).src} alt={photo(p.photo).alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
              </span>
              <span>
                <span className="text-sm text-tpl-muted">{longDate(p.date)}</span>
                <span className="mt-1 block font-tpl-display text-3xl font-bold group-hover:text-tpl-alt">{p.title}</span>
                <span className="mt-2 block text-lg text-tpl-muted">{p.dek}</span>
              </span>
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
  return (
    <article className="mx-auto max-w-3xl px-5 pt-14 sm:px-8">
      <Link href={href("/journal")} className="font-medium text-tpl-alt hover:underline">
        Lodge journal
      </Link>
      <h1 className="mt-3 font-tpl-display text-5xl leading-tight font-bold">{p.title}</h1>
      <p className="mt-3 text-xl text-tpl-muted">{p.dek}</p>
      <p className="mt-2 text-sm text-tpl-muted">{longDate(p.date)}</p>
      <div className="relative mt-10 aspect-[3/2] overflow-hidden rounded-md">
        <Image src={photo(p.photo).src} alt={photo(p.photo).alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
      </div>
      <div className="mt-10 space-y-5 text-lg leading-relaxed">
        {p.body.map((para) => (
          <p key={para.slice(0, 16)}>{para}</p>
        ))}
      </div>
    </article>
  );
}
