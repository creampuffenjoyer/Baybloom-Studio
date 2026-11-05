import type { Metadata } from "next";
import { GuidePage } from "@/templates/harbor-house/pages/guide";

export const metadata: Metadata = { title: "Around Basco" };

export default function Page() {
  return <GuidePage />;
}
