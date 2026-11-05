import type { Metadata } from "next";
import { RoomsPage } from "@/templates/isla-verde-boutique/pages/rooms";

export const metadata: Metadata = { title: "Rooms and suites" };

export default function Page() {
  return <RoomsPage />;
}
