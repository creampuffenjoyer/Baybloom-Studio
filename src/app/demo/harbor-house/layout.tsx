import type { Metadata } from "next";
import { Shell } from "@/templates/harbor-house/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Harbor House \u00b7 Bed and breakfast by the harbour, Batanes", template: "%s · Harbor House" },
  description: "A four-room bed and breakfast on the harbour in Basco, Batanes, with home-cooked Ivatan breakfasts and a hand-drawn map of the island.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="harbor-house" title="Harbor House" />
    </Shell>
  );
}
