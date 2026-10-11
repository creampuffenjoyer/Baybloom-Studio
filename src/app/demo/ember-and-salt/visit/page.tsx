import type { Metadata } from "next";
import { VisitPage } from "@/templates/ember-and-salt/pages/visit";

export const metadata: Metadata = { title: "Visit" };

export default function Page() {
  return <VisitPage />;
}
