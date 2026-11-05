import { Suspense } from "react";
import type { Metadata } from "next";
import { IslaPreview } from "./preview";

export const metadata: Metadata = { title: "Explore Isla Verde", robots: { index: false, follow: true } };
export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading the preview…</p>}><IslaPreview /></Suspense>;
}
