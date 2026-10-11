import type { Metadata } from "next";
import { Shell } from "@/templates/lumen-lake-villas/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Lumen Lake Villas \u00b7 Four villas on Lake Lumen, V\u00e4rmland", template: "%s · Lumen Lake Villas" },
  description: "Four quiet villas on the shore of Lake Lumen in V\u00e4rmland, Sweden, with saunas, rowing boats and a virtual tour.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="lumen-lake-villas" title="Lumen Lake Villas" />
    </Shell>
  );
}
