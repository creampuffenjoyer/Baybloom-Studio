import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreditsList } from "./credits-list";
import type { PhotoRecord } from "./photos";

export const action = "inline-flex min-h-12 items-center justify-center gap-3 bg-tpl-accent px-5 py-3 text-center text-sm font-bold text-tpl-on-accent transition-opacity hover:opacity-85";
export const outlineAction = "inline-flex min-h-12 items-center justify-center gap-3 border border-current px-5 py-3 text-center text-sm font-bold transition-colors hover:bg-tpl-soft hover:text-tpl-ink";
export const input = "min-h-12 w-full rounded-sm border border-tpl-line bg-tpl-surface px-3 py-2 text-base text-tpl-ink";
export const label = "grid gap-2 text-sm font-semibold";
export const eyebrow = "font-mono text-xs font-semibold tracking-[0.14em] uppercase";
export const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";

type NavItem = { href: string; label: string };

export function SiteHeader({ title, home, links, primary, mark, className = "" }: {
  title: string;
  home: string;
  links: readonly NavItem[];
  primary: NavItem;
  mark: ReactNode;
  className?: string;
}) {
  return (
    <>
      <a href="#site-content" className="sr-only z-10 bg-tpl-surface p-3 focus:not-sr-only focus:absolute focus:top-2 focus:left-2">Skip to content</a>
      <header className={`border-b border-tpl-line ${className}`}>
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-5 gap-y-1 py-4`}>
          <Link href={home} className="inline-flex min-h-11 items-center gap-2 font-tpl-display text-xl font-bold" aria-label={`${title} home`}>
            <span aria-hidden="true">{mark}</span>{title}
          </Link>
          <nav aria-label="Main menu" className="order-last flex w-full flex-wrap gap-x-4 sm:order-0 sm:w-auto sm:gap-x-6">
            {links.map((item) => <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">{item.label}</Link>)}
          </nav>
          <Link href={primary.href} className={`${action} min-h-11 px-3 sm:px-5`}>{primary.label} <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ title, location, home, credits, children }: {
  title: string;
  location: string;
  home: string;
  credits: string;
  children?: ReactNode;
}) {
  return (
    <footer className="bg-tpl-deep text-tpl-on-deep">
      <div className={`${wrap} flex flex-wrap items-end justify-between gap-6 py-10`}>
        <div><Link href={home} className="inline-block py-2 font-tpl-display text-3xl">{title}</Link><p className="text-sm">{location}</p></div>
        {children}
        <Link href={credits} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Photo credits</Link>
      </div>
    </footer>
  );
}

export function SitePhoto({ photo, className = "", sizes, priority = false }: {
  photo: PhotoRecord;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return <Image {...{ src: photo.src, alt: photo.alt, width: photo.width, height: photo.height, sizes }} preload={priority} className={`h-full w-full object-cover ${className}`} />;
}

export function PhotoCredits({ photos }: { photos: Record<string, PhotoRecord> }) {
  return (
    <div className={`${wrap} py-16`}>
      <h1 className="font-tpl-display text-5xl">Photo credits</h1>
      <p className="mt-4 text-tpl-muted">Photography created for this Baybloom demo.</p>
      <CreditsList photos={Object.values(photos)} className="mt-8 max-w-2xl divide-y divide-tpl-line" />
    </div>
  );
}

const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
export const pesos = (amount: number) => php.format(amount);
