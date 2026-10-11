import type { Metadata } from "next";
import { ActivitiesPage } from "@/templates/pine-ridge-lodge/pages/activities";

export const metadata: Metadata = { title: "Activities" };

export default function Page() {
  return <ActivitiesPage />;
}
