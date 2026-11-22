import { Suspense } from "react";
import type { Metadata } from "next";
import { BloomfieldPreview } from "./preview";
export const metadata: Metadata = { title: "Explore Bloomfield Gardens", robots: { index: false, follow: true } };
export default function Page() { return <Suspense fallback={<p className="p-6" role="status">Loading the preview…</p>}><BloomfieldPreview /></Suspense>; }
