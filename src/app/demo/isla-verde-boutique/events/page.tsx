import type { Metadata } from "next";
import { EventsPage } from "@/templates/isla-verde-boutique/pages/events";

export const metadata: Metadata = { title: "Weddings and events" };

export default function Page() {
  return <EventsPage />;
}
