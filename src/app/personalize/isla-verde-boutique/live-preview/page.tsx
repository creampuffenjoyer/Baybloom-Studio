import type { Metadata } from "next";
import { LivePreview } from "./preview";

export const metadata: Metadata = { title: "Isla Verde live preview", robots: { index: false, follow: false } };

export default function Page() {
  return <LivePreview />;
}
