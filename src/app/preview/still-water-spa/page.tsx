import { Suspense } from "react";
import type { Metadata } from "next";
import { StillWaterPreview } from "./preview";
export const metadata: Metadata = { title: "Explore Still Water Spa", robots: { index: false, follow: true } };
export default function Page() { return <Suspense fallback={<p className="p-6" role="status">Loading the preview…</p>}><StillWaterPreview /></Suspense>; }
