import type { Metadata } from "next";
import { Shell } from "@/templates/coral-cove/shell";
import { Suspense } from "react";
import { PreviewChrome } from "./preview-chrome";

export const metadata: Metadata = {
  title: { default: "Coral Cove · Barefoot island resort, Palawan", template: "%s · Coral Cove" },
  description: "Twenty-two villas on a white-sand cove in El Nido, Palawan, with a house reef thirty metres offshore.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <Suspense><PreviewChrome /></Suspense>
    <Shell>
      {children}
    </Shell>
    </>
  );
}
