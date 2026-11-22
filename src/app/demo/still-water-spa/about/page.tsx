import type { Metadata } from "next";
import { AboutPage } from "@/templates/still-water-spa/pages/about";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return <AboutPage />;
}
