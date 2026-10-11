import type { Metadata } from "next";
import { SpacesPage } from "@/templates/bloomfield-gardens/pages/spaces";

export const metadata: Metadata = { title: "The estate" };

export default function Page() {
  return <SpacesPage />;
}
