import type { Metadata } from "next";
import { HarborEditor } from "../harbor-house/workspace";

export const metadata: Metadata = { title: "Personalize Isla Verde", robots: { index: false, follow: false } };

export default function Page() {
  return <HarborEditor template="isla-verde-boutique" />;
}
