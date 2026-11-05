import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PencilIcon } from "lucide-react";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/session";
import { stripeConfigured } from "@/lib/stripe";
import { VerifyBanner } from "@/app/(store)/(client)/account/verify-banner";
import { CheckoutPanel } from "@/app/(store)/(client)/checkout/checkout-panel";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage(props: PageProps<"/checkout">) {
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.2em] text-hibiscus-strong uppercase">
        Secure checkout
      </p>
      <h1 className="mt-3 text-4xl font-medium sm:text-5xl">Checkout</h1>
      <div className="mt-10">
        <Suspense fallback={<div className="shimmer h-96 rounded-3xl" />}>
          <Checkout searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

const countryName = new Intl.DisplayNames(["en"], { type: "region" });

async function Checkout({ searchParams }: Pick<PageProps<"/checkout">, "searchParams">) {
  const user = await requireUser("/checkout");
  const [account, { canceled }] = await Promise.all([getAccount(user.id), searchParams]);
  if (!account) return null;

  const address = [
    account.addressLine1,
    account.addressLine2,
    [account.city, account.region, account.postalCode].filter(Boolean).join(", "),
    countryName.of(account.country),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {canceled && (
        <p role="status" className="rounded-2xl bg-white px-5 py-4 text-sm ring-1 ring-border/70">
          Payment was canceled, so you haven&apos;t been charged. Your cart is saved below.
        </p>
      )}
      {!account.emailVerified && <VerifyBanner email={account.email} />}

      <CheckoutPanel
        emailVerified={Boolean(account.emailVerified)}
        stripeReady={stripeConfigured()}
        billing={
          <section className="rounded-3xl bg-white p-6 ring-1 ring-border/70">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-medium">Billing details</h2>
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-bay hover:underline"
              >
                <PencilIcon className="size-3.5" /> Edit
              </Link>
            </div>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="mt-0.5">{account.name}</dd>
                {account.company && <dd>{account.company}</dd>}
              </div>
              <div>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="mt-0.5">{account.email}</dd>
                {account.phone && <dd>{account.phone}</dd>}
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Address</dt>
                <dd className="mt-0.5">
                  {address.length > 1 ? address.join(" · ") : "Not added yet. Add it for your receipt."}
                </dd>
              </div>
            </dl>
          </section>
        }
      />
    </div>
  );
}
