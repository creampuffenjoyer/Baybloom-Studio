import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/roast-row/shell";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: "Roast Row", template: "%s · Roast Row" },
  description: "Specialty coffee, fresh bakes and pickup in Quezon City.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><Suspense><TemplateChrome slug="roast-row" title="Roast Row" /></Suspense><Shell>{children}</Shell></>;
}
