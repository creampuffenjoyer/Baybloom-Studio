import type { Metadata } from "next";
import { HarborEditor } from "./workspace";

export const metadata: Metadata = { title: "Personalize Harbor House", robots: { index: false, follow: false } };

export default function Page() {
  return <HarborEditor />;
}
