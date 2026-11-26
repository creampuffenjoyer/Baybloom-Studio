import { Suspense } from "react";
import { PlanPage } from "@/templates/the-atrium/pages/plan";

export const metadata = { title: "Event planner" };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading…</p>}><PlanPage /></Suspense>;
}
