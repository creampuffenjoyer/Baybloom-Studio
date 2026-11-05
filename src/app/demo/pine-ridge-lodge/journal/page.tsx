import type { Metadata } from "next";
import { JournalPage } from "@/templates/pine-ridge-lodge/pages/journal";

export const metadata: Metadata = { title: "Lodge journal" };

export default function Page() {
  return <JournalPage />;
}
