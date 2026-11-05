import type { Metadata } from "next";
import { BreakfastPage } from "@/templates/harbor-house/pages/breakfast";

export const metadata: Metadata = { title: "Breakfast" };

export default function Page() {
  return <BreakfastPage />;
}
