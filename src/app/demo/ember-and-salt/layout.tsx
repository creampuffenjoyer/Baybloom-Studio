import type { Metadata } from "next";
import { Shell } from "@/templates/ember-and-salt/shell";
import { DemoBar } from "../demo-bar";

export const metadata: Metadata = {
  title: { default: "Ember & Salt \u00b7 Wood-fired kitchen and bar, Poblacion", template: "%s · Ember & Salt" },
  description: "A wood-fired kitchen and cocktail bar in Poblacion, Makati. Reserve a table, see the menu or plan a private dinner.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <DemoBar slug="ember-and-salt" title="Ember & Salt" />
    </Shell>
  );
}
