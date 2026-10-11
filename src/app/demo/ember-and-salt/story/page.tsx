import type { Metadata } from "next";
import { StoryPage } from "@/templates/ember-and-salt/pages/story";

export const metadata: Metadata = { title: "Our story" };

export default function Page() {
  return <StoryPage />;
}
