import type { Metadata } from "next";
import { RoomsPage } from "@/templates/harbor-house/pages/rooms";

export const metadata: Metadata = { title: "Rooms" };

export default function Page() {
  return <RoomsPage />;
}
