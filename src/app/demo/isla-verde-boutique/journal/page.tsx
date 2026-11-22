import type { Metadata } from "next";
import { JournalPage } from "@/templates/isla-verde-boutique/pages/journal";

export const metadata: Metadata = { title: "Journal" };

export default function Page() {
  return <JournalPage />;
}
