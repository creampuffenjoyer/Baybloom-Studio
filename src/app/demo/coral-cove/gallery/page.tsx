import type { Metadata } from "next";
import { GalleryPage } from "@/templates/coral-cove/pages/gallery";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <GalleryPage />;
}
