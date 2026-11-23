import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { publicSiteOrigin } from "@/lib/site-origin";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteOrigin()),
  title: {
    default: "Baybloom Studio · Websites for hospitality brands that bloom",
    template: "%s · Baybloom Studio",
  },
  description:
    "Ready-made website templates for resorts, hotels, restaurants, spas and event venues. Try every live demo, sign in to see pricing, and buy online.",
  openGraph: {
    type: "website",
    siteName: "Baybloom Studio",
    locale: "en_PH",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f4c5c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
