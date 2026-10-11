import type { Metadata } from "next";
import { ReservePage } from "@/templates/ember-and-salt/pages/reserve";

export const metadata: Metadata = { title: "Reserve a table" };

export default function Page() {
  return <ReservePage />;
}
