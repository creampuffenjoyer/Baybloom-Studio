import type { Metadata } from "next";
import { GalleryPage } from "@/templates/bloomfield-gardens/pages/gallery";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <GalleryPage />;
}
