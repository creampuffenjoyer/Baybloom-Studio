import type { Metadata } from "next";
import { ExperiencesPage } from "@/templates/coral-cove/pages/experiences";

export const metadata: Metadata = { title: "Experiences" };

export default function Page() {
  return <ExperiencesPage />;
}
