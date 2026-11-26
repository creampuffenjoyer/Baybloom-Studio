import { Suspense } from "react";
import { InquirePage } from "@/templates/the-atrium/pages/inquire";

export const metadata = { title: "Inquire" };

export default function Page() {
  return <Suspense fallback={<p className="p-6" role="status">Loading…</p>}><InquirePage /></Suspense>;
}
