import type { Metadata } from "next";
import { Shell } from "@/templates/coral-cove/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Coral Cove · Barefoot island resort, Palawan", template: "%s · Coral Cove" },
  description: "Twenty-two villas on a white-sand cove in El Nido, Palawan, with a house reef thirty metres offshore.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="coral-cove" title="Coral Cove" />
    </Shell>
  );
}
