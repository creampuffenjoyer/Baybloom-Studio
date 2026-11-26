import { Suspense } from "react";
import { TourPage } from "@/templates/the-atrium/pages/tour";

export const metadata = { title: "Day-to-night tour" };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading…</p>}><TourPage /></Suspense>;
}
