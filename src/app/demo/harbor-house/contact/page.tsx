import type { Metadata } from "next";
import { ContactPage } from "@/templates/harbor-house/pages/contact";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <ContactPage />;
}
