import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountNav, AccountNavList } from "@/app/(store)/(client)/account/account-nav";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account · Baybloom Studio" },
  robots: { index: false },
};

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
        Client area
      </p>
      <h1 className="mt-3 text-4xl font-medium sm:text-5xl">My account</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Suspense fallback={<AccountNavList pathname={null} />}>
          <AccountNav />
        </Suspense>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
