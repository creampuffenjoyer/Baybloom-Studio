import type { Metadata } from "next";
import { VillasPage } from "@/templates/coral-cove/pages/villas";

export const metadata: Metadata = { title: "Villas" };

export default function Page() {
  return <VillasPage />;
}
