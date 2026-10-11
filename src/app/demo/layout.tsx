import type { Metadata } from "next";

// Demos are previews of templates for sale, not real businesses.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
