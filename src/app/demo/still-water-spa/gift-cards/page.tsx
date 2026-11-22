import type { Metadata } from "next";
import { GiftCardsPage } from "@/templates/still-water-spa/pages/gift-cards";

export const metadata: Metadata = { title: "Gift cards" };

export default function Page() {
  return <GiftCardsPage />;
}
