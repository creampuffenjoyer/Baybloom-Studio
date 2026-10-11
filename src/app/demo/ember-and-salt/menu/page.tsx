import type { Metadata } from "next";
import { MenuPage } from "@/templates/ember-and-salt/pages/menu";

export const metadata: Metadata = { title: "Menu" };

export default function Page() {
  return <MenuPage />;
}
