import type { Metadata } from "next";
import { DiningPage } from "@/templates/pine-ridge-lodge/pages/dining";

export const metadata: Metadata = { title: "Dining" };

export default function Page() {
  return <DiningPage />;
}
