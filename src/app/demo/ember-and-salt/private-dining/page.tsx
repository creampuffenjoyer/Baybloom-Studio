import type { Metadata } from "next";
import { PrivateDiningPage } from "@/templates/ember-and-salt/pages/private-dining";

export const metadata: Metadata = { title: "Private dining" };

export default function Page() {
  return <PrivateDiningPage />;
}
