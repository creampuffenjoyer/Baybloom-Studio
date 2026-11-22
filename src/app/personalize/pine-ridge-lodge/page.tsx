import type { Metadata } from "next";
import { HarborEditor } from "../harbor-house/workspace";

export const metadata: Metadata = { title: "Personalize Pine Ridge Lodge", robots: { index: false, follow: false } };

export default function Page() {
  return <HarborEditor template="pine-ridge-lodge" />;
}
