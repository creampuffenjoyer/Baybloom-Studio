import { Suspense } from "react";
import { CateringPage } from "@/templates/sunday-table/pages/catering";

export const metadata = { title: "Catering" };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading the party planner…</p>}><CateringPage /></Suspense>;
}
