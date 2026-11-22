"use client";
import { useSpaCopy } from "../copy";
import { PlacementImage as Image } from "../components/placement-image";
import { GiftForm } from "../components/gift-form";
import { useSpaPhoto } from "../photos";
import { usePersonalization } from "../personalization";
import { pebbles } from "../site";

export function GiftCardsPage() {
  const copy = useSpaCopy();
  const photo = useSpaPhoto();
  const { photoEditing } = usePersonalization();
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-12 pb-16 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="font-tpl-display text-6xl sm:text-7xl">{copy("Give an afternoon off")}</h1>
        <p className="mt-5 max-w-[50ch] text-lg text-tpl-muted">
          Explore a sample gift card. No payment is taken and no card is sent.
        </p>
        <div className="mt-12">
          <GiftForm />
        </div>
      </div>
      <div className={`relative ${photoEditing ? "block" : "hidden"} aspect-[4/5] overflow-hidden lg:block ${pebbles[1]}`}>
        <Image placement={"gift-cards.room"} src={photo("treatment-room").src} alt={photo("treatment-room").alt} fill priority sizes="40vw" className="object-cover" />
      </div>
    </div>
  );
}
