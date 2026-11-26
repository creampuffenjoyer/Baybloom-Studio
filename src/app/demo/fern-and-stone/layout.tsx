import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/fern-and-stone/shell";
import { site } from "@/templates/fern-and-stone/site";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense><TemplateChrome slug="fern-and-stone" title={site.name} /></Suspense>
      <Shell>{children}</Shell>
    </>
  );
}
