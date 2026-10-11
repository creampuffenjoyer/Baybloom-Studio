import type { Metadata } from "next";
import { Shell } from "@/templates/isla-verde-boutique/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Isla Verde \u00b7 Heritage hotel on Calle Crisologo, Vigan", template: "%s · Isla Verde" },
  description: "Twelve rooms in a restored 1887 bahay na bato in the Historic Town of Vigan, with Ilocano dining and a courtyard for weddings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="isla-verde-boutique" title="Isla Verde" />
    </Shell>
  );
}
