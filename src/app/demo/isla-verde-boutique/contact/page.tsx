import type { Metadata } from "next";
import { ContactPage } from "@/templates/isla-verde-boutique/pages/contact";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <ContactPage />;
}
