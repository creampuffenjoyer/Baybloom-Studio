import type { Metadata } from "next";
import { WeddingsPage } from "@/templates/bloomfield-gardens/pages/weddings";

export const metadata: Metadata = { title: "Weddings" };

export default function Page() {
  return <WeddingsPage />;
}
