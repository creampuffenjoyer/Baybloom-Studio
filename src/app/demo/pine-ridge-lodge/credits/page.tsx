import type { Metadata } from "next";
import { CreditsPage } from "@/templates/pine-ridge-lodge/pages/credits";

export const metadata: Metadata = { title: "Photo credits" };

export default function Page() {
  return <CreditsPage />;
}
