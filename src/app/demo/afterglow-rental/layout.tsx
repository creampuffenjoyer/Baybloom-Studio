import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/afterglow-rental/shell";
import { site } from "@/templates/afterglow-rental/site";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense><TemplateChrome slug="afterglow-rental" title={site.name} /></Suspense>
      <Shell>{children}</Shell>
    </>
  );
}
