import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/the-atrium/shell";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: "The Atrium", template: "%s · The Atrium" },
  description: "A glasshouse, gallery and garden court for weddings, private celebrations and work gatherings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><Suspense><TemplateChrome slug="the-atrium" title="The Atrium" /></Suspense><Shell>{children}</Shell></>;
}
