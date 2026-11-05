import { Suspense } from "react";
import type { Metadata } from "next";
import { LumenPreview } from "./preview";
export const metadata: Metadata = { title: "Explore Lumen Lake Villas", robots: { index: false, follow: true } };
export default function Page() { return <Suspense fallback={<p className="p-6" role="status">Loading the preview…</p>}><LumenPreview /></Suspense>; }
