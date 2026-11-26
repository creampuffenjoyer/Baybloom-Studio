import { Suspense } from "react";
import { CoffeePage } from "@/templates/roast-row/pages/coffee";

export const metadata = { title: "Pickup" };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading pickup…</p>}><CoffeePage pickup /></Suspense>;
}
