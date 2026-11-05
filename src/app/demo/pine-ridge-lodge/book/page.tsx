import type { Metadata } from "next";
import { BookPage } from "@/templates/pine-ridge-lodge/pages/book";

export const metadata: Metadata = { title: "Book your stay" };

export default function Page() {
  return <BookPage />;
}
