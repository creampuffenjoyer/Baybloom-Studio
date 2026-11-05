import type { Metadata } from "next";
import { TreatmentsPage } from "@/templates/still-water-spa/pages/treatments";

export const metadata: Metadata = { title: "Treatments" };

export default function Page() {
  return <TreatmentsPage />;
}
