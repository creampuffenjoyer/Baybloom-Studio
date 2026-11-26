import { Suspense } from "react";
import { CoffeePage } from "@/templates/roast-row/pages/coffee";

export const metadata = { title: "Menu" };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading the menu…</p>}><CoffeePage /></Suspense>;
}
