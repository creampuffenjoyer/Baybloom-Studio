import type { Metadata } from "next";
import { TourPage } from "@/templates/lumen-lake-villas/pages/tour";

export const metadata: Metadata = { title: "Virtual tour" };

export default function Page() {
  return <TourPage />;
}
