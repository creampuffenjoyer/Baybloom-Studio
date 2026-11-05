import type { Metadata } from "next";
import { Shell } from "@/templates/harbor-house/shell";
import { Suspense } from "react";
import { PreviewChrome } from "./preview-chrome";

export const metadata: Metadata = {
  title: { default: "Harbor House \u00b7 Bed and breakfast by the harbour, Batanes", template: "%s · Harbor House" },
  description: "A four-room bed and breakfast on the harbour in Basco, Batanes, with home-cooked Ivatan breakfasts and a hand-drawn map of the island.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <Suspense fallback={null}><PreviewChrome /></Suspense>
    <Shell>
      {children}
    </Shell>
    </>
  );
}
