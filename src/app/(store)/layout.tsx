import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Toaster } from "@/components/ui/sonner";
import { CompareTray } from "@/components/compare/compare-tray";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";

/** Storefront chrome. Template demos under /demo render without it. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
