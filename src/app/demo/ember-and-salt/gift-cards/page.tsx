import type { Metadata } from "next";
import { GiftCardsPage } from "@/templates/ember-and-salt/pages/gift-cards";

export const metadata: Metadata = { title: "Gift cards" };

export default function Page() {
  return <GiftCardsPage />;
}
