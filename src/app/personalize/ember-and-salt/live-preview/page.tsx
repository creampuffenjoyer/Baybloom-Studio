import type { Metadata } from "next";
import { LivePreview } from "./preview";

export const metadata: Metadata = { title: "Ember & Salt live preview", robots: { index: false, follow: false } };

export default function Page() {
  return <LivePreview />;
}
