import { Suspense } from "react";
import type { Metadata } from "next";
import { PinePreview } from "./preview";

export const metadata: Metadata = { title: "Explore Pine Ridge Lodge", robots: { index: false, follow: true } };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading the preview…</p>}><PinePreview /></Suspense>;
}
