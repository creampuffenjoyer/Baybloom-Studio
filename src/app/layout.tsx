import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
