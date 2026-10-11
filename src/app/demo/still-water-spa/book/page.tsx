import type { Metadata } from "next";
import { BookPage } from "@/templates/still-water-spa/pages/book";

export const metadata: Metadata = { title: "Book a treatment" };

export default function Page() {
  return <BookPage />;
}
