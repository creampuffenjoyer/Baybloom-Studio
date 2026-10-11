import type { Metadata } from "next";
import { PackagesPage } from "@/templates/still-water-spa/pages/packages";

export const metadata: Metadata = { title: "Packages and memberships" };

export default function Page() {
  return <PackagesPage />;
}
