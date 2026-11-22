import type { Metadata } from "next";
import { ContactPage } from "@/templates/lumen-lake-villas/pages/contact";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <ContactPage />;
}
