import type { Metadata } from "next";
import { HarborEditor } from "../harbor-house/workspace";

export const metadata: Metadata = { title: "Personalize Coral Cove", robots: { index: false, follow: false } };

export default function Page() {
  return <HarborEditor template="coral-cove" />;
}
