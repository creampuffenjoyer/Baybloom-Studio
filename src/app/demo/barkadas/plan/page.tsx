import { Suspense } from "react";
import { PlanPage } from "@/templates/barkadas/pages/plan";

export const metadata = { title: "Stay planner" };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading the stay planner…</p>}><PlanPage /></Suspense>;
}
