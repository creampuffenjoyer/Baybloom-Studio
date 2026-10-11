import type { Metadata } from "next";
import { Shell } from "@/templates/bloomfield-gardens/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Bloomfield Gardens \u00b7 Garden weddings in Tagaytay", template: "%s · Bloomfield Gardens" },
  description: "A garden estate above Taal Lake for weddings of twenty to two hundred: lawns, a rose walk, a Victorian glasshouse and a hay barn.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="bloomfield-gardens" title="Bloomfield Gardens" />
    </Shell>
  );
}
