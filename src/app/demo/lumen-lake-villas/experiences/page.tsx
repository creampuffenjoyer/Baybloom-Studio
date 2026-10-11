import type { Metadata } from "next";
import { ExperiencesPage } from "@/templates/lumen-lake-villas/pages/experiences";

export const metadata: Metadata = { title: "Experiences" };

export default function Page() {
  return <ExperiencesPage />;
}
