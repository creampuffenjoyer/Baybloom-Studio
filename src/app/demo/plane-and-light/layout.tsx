import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/plane-and-light/shell";
import { site } from "@/templates/plane-and-light/site";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense><TemplateChrome slug="plane-and-light" title={site.name} /></Suspense>
      <Shell>{children}</Shell>
    </>
  );
}
