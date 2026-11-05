import type { Metadata } from "next";
import { VillasPage } from "@/templates/lumen-lake-villas/pages/villas";

export const metadata: Metadata = { title: "The villas" };

export default function Page() {
  return <VillasPage />;
}
