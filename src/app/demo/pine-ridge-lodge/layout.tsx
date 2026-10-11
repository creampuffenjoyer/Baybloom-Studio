import type { Metadata } from "next";
import { Shell } from "@/templates/pine-ridge-lodge/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Pine Ridge Lodge \u00b7 Mountain lodge in Whitebark Valley", template: "%s · Pine Ridge Lodge" },
  description: "A timber lodge at the top of Whitebark Valley: ski-in in winter, trails and lakes in summer, and supper at the long table.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="pine-ridge-lodge" title="Pine Ridge Lodge" />
    </Shell>
  );
}
