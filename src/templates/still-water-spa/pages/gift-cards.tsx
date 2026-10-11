import Image from "next/image";
import { GiftForm } from "../components/gift-form";
import { photo } from "../content";
import { pebbles } from "../site";

export function GiftCardsPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-12 pb-16 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="font-t-display text-6xl sm:text-7xl">Give an afternoon off</h1>
        <p className="mt-5 max-w-[50ch] text-lg text-t-muted">
          Digital gift cards, sent straight away or on the day you choose. Valid for twelve months on any
          treatment, package or membership.
        </p>
        <div className="mt-12">
          <GiftForm />
        </div>
      </div>
      <div className={`relative hidden aspect-[4/5] overflow-hidden lg:block ${pebbles[1]}`}>
        <Image src={photo("treatment-room").src} alt={photo("treatment-room").alt} fill priority sizes="40vw" className="object-cover" />
      </div>
    </div>
  );
}
