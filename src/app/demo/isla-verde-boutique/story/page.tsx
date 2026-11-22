import type { Metadata } from "next";
import { StoryPage } from "@/templates/isla-verde-boutique/pages/story";

export const metadata: Metadata = { title: "Our story" };

export default function Page() {
  return <StoryPage />;
}
