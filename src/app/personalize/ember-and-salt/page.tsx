import type { Metadata } from "next";
import { HarborEditor } from "../harbor-house/workspace";

export const metadata: Metadata = { title: "Personalize Ember & Salt", robots: { index: false, follow: false } };

export default function Page() {
  return <HarborEditor template="ember-and-salt" />;
}
