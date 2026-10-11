import type { Metadata } from "next";
import { PlanningPage } from "@/templates/bloomfield-gardens/pages/planning";

export const metadata: Metadata = { title: "Planning your day" };

export default function Page() {
  return <PlanningPage />;
}
