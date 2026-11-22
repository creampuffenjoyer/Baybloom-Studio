import type { Metadata } from "next";
import { OffersPage } from "@/templates/coral-cove/pages/offers";

export const metadata: Metadata = { title: "Offers" };

export default function Page() {
  return <OffersPage />;
}
