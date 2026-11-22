import type { Metadata } from "next";
import { HarborEditor } from "../harbor-house/workspace";

export const metadata: Metadata = { title: "Personalize Still Water Spa", robots: { index: false, follow: false } };

export default function Page() {
  return <HarborEditor template="still-water-spa" />;
}
