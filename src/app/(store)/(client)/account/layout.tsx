import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountNav, AccountNavList } from "@/app/(store)/(client)/account/account-nav";
import { PageHeading } from "@/components/layout/page-heading";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account · Baybloom Studio" },
  robots: { index: false },
};

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="container-page py-12 sm:py-16">
      <PageHeading eyebrow="Your space at Baybloom" title="My account">
        <p>Your details, purchases and downloads, all together.</p>
      </PageHeading>
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Suspense fallback={<AccountNavList pathname={null} />}>
          <AccountNav />
        </Suspense>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
