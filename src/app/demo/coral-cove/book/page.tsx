import type { Metadata } from "next";
import { BookPage } from "@/templates/coral-cove/pages/book";

export const metadata: Metadata = { title: "Book a villa" };

export default function Page() {
  return <BookPage />;
}
