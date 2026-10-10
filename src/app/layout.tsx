import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Toaster } from "@/components/ui/sonner";
import { CompareTray } from "@/components/compare/compare-tray";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Suspense } from "react";
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
    default: "Baybloom Studio · Designs for resorts that bloom",
    template: "%s · Baybloom Studio",
  },
  description:
    "Ready-made resort website templates, villa plans and interior concepts. Browse the catalog, sign in to see pricing, and buy online.",
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
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-bay focus:shadow-lg"
        >
          Skip to content
        </a>
        <MotionProvider>
          <CartProvider>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <Suspense fallback={null}>
              <CompareTray />
              <CartDrawer />
            </Suspense>
          </CartProvider>
        </MotionProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
