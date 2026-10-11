import type { Metadata } from "next";
import { BookPage } from "@/templates/harbor-house/pages/book";

export const metadata: Metadata = { title: "Book a room" };

export default function Page() {
  return <BookPage />;
}
