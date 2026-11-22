import type { Metadata } from "next";
import { BookPage } from "@/templates/lumen-lake-villas/pages/book";

export const metadata: Metadata = { title: "Reserve" };

export default function Page() {
  return <BookPage />;
}
