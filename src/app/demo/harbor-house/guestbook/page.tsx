import type { Metadata } from "next";
import { GuestbookPage } from "@/templates/harbor-house/pages/guestbook";

export const metadata: Metadata = { title: "Guestbook" };

export default function Page() {
  return <GuestbookPage />;
}
