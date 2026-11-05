import type { Metadata } from "next";
import { DiningPage } from "@/templates/isla-verde-boutique/pages/dining";

export const metadata: Metadata = { title: "Comedor" };

export default function Page() {
  return <DiningPage />;
}
