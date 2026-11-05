import type { Metadata } from "next";
import { CreditsPage } from "@/templates/isla-verde-boutique/pages/credits";

export const metadata: Metadata = { title: "Photo credits" };

export default function Page() {
  return <CreditsPage />;
}
