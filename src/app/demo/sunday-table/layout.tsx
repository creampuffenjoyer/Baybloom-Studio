import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/sunday-table/shell";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: "Sunday Table", template: "%s · Sunday Table" },
  description: "A Filipino family restaurant in Kapitolyo serving shared plates and party trays.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><Suspense><TemplateChrome slug="sunday-table" title="Sunday Table" /></Suspense><Shell>{children}</Shell></>;
}
