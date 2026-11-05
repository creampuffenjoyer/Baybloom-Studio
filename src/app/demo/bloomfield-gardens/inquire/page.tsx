import type { Metadata } from "next";
import { InquirePage } from "@/templates/bloomfield-gardens/pages/inquire";

export const metadata: Metadata = { title: "Check your date" };

export default function Page() {
  return <InquirePage />;
}
