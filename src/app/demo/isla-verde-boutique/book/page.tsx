import type { Metadata } from "next";
import { BookPage } from "@/templates/isla-verde-boutique/pages/book";

export const metadata: Metadata = { title: "Reserve your stay" };

export default function Page() {
  return <BookPage />;
}
