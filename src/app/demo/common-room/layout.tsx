import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/templates/common-room/shell";
import { site } from "@/templates/common-room/site";
import { TemplateChrome } from "../template-chrome";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense><TemplateChrome slug="common-room" title={site.name} /></Suspense>
      <Shell>{children}</Shell>
    </>
  );
}
