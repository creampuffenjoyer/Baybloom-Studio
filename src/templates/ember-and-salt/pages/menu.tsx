import Image from "next/image";
import Link from "next/link";
import { MenuTabs } from "../components/menu-tabs";
import { photo } from "../content";
import { href } from "../site";

export function MenuPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-16 pb-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h1 className="font-tpl-display text-7xl leading-none sm:text-8xl">Menu</h1>
          <p className="mt-5 max-w-[50ch] text-lg text-tpl-muted">
            Plates are made to share. Two or three per person is about right, and the kitchen sends them
            out as they come off the fire.
          </p>
        </div>
        <Link href={href("/reserve")} className="self-start bg-tpl-accent px-6 py-3.5 font-semibold text-tpl-on-accent hover:bg-tpl-alt md:self-end">
          Reserve a table
        </Link>
      </section>
      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <MenuTabs />
      </div>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {(["tomahawk", "fish-plate", "cocktail", "dessert"] as const).map((k) => (
          <div key={k} className="relative aspect-square">
            <Image src={photo(k).src} alt={photo(k).alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
          </div>
        ))}
      </div>
    </>
  );
}
