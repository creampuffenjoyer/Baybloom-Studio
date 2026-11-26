import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/barkadas/shell";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: "Barkadas", template: "%s · Barkadas" },
  description: "Private rooms and a whole-house rental for group weekends in Tagaytay.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><Suspense><TemplateChrome slug="barkadas" title="Barkadas" /></Suspense><Shell>{children}</Shell></>;
}
