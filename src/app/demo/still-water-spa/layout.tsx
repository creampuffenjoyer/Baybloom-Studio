import type { Metadata } from "next";
import { Shell } from "@/templates/still-water-spa/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Still Water \u00b7 Day spa and bathhouse, Baguio", template: "%s · Still Water" },
  description: "Hilot massage, botanical facials and a thermal circuit in the pines of Baguio. Book a treatment online.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="still-water-spa" title="Still Water" />
    </Shell>
  );
}
