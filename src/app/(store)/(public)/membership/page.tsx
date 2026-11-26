import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderContactDialog } from "@/components/order-contact-dialog";
import { STUDIO_EMAIL_HREF } from "@/lib/checkout-methods";
import { onlineCheckoutEnabled } from "@/lib/online-checkout";
import { getCurrentUser } from "@/lib/session";
import { hasPremium } from "@/lib/membership";
import { membershipCheckoutReady, syncMembership } from "@/lib/membership-payment";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { startMembershipCheckout } from "./actions";

export const metadata: Metadata = {title: "Membership"};
type Query = Promise<Record<string, string | string[] | undefined>>;
const signIn = "/login?callbackUrl=%2Fmembership";
const phpMembershipEmail = `${STUDIO_EMAIL_HREF}?subject=${encodeURIComponent("Baybloom lifetime Premium in PHP")}`;

export default function MembershipPage({searchParams}: {searchParams: Query}) {
  return <div className="container-page py-10 sm:py-16">
    <h1 className="font-serif text-4xl sm:text-5xl">Membership</h1>
    <p className="mt-4 max-w-2xl text-muted-foreground">Personalize a template and save a draft before you order your website.</p>
    <Suspense fallback={<p role="status" className="py-8">Loading membership options…</p>}>
      <MembershipOptions searchParams={searchParams} />
    </Suspense>
  </div>;
}

async function MembershipOptions({searchParams}: {searchParams: Query}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  let notice = "";
  if (query.canceled) notice = "Checkout canceled. You can resume whenever you’re ready.";
  if (query.retry) notice = query.retry === "later" ? "Your earlier payment is being checked. Please try again later." : "Your previous checkout expired. Start a new checkout below.";
  if (query.error || query.unavailable) notice = "Checkout is temporarily unavailable. Please try again later.";
  if (query.slow) notice = "Please wait a minute before starting checkout again.";
  if (user && typeof query.session_id === "string" && membershipCheckoutReady()) {
    // Retrieve only sessions already associated with the signed-in account.
    const payment = await db.membershipPayment.findFirst({where: {userId: user.id, sessionId: query.session_id}, select: {status: true}});
    if (payment?.status === "PENDING") {
      try {
        await syncMembership(await stripe().checkout.sessions.retrieve(query.session_id));
        notice = "Your payment status has been refreshed.";
      } catch {
        notice = "Payment confirmation is still pending. Refresh this page shortly.";
      }
    }
  }
  const premium = user ? await hasPremium(user.id) : false;
  return <>
    {notice && <p role="status" className="mt-6 rounded-lg border border-border bg-white p-4">{notice}</p>}
    <section aria-label="Account plans" className="mt-8 grid gap-4 sm:grid-cols-2">
      <article className="flex flex-col items-start rounded-xl border border-border bg-white p-6">
        <h2 className="text-2xl">Regular</h2>
        <p className="mt-2 text-xl font-medium">Free</p>
        <p className="my-4 grow text-sm leading-relaxed">Personalize and save drafts for Regular templates that have an editor.</p>
        {user ? <Link href="/designs" className="inline-flex min-h-11 items-center font-medium underline">Browse templates</Link>
          : <Button asChild variant="outline" className="min-h-11"><Link href="/register?callbackUrl=%2Fmembership">Create a free account</Link></Button>}
      </article>
      <article id="premium" className="scroll-mt-24 rounded-xl bg-bay p-6 text-white">
        <h2 className="text-2xl text-white">Premium</h2>
        <p className="mt-2 text-xl font-medium">$10 USD <span className="text-base font-normal">once, for lifetime access</span></p>
        <p className="my-4 text-sm leading-relaxed">Unlock every available template editor and save drafts for your website order.</p>
        {premium ? <p className="font-semibold">Premium active</p>
          : !user ? <Button asChild variant="secondary"><Link href={signIn}>Sign in to upgrade</Link></Button>
          : onlineCheckoutEnabled() && membershipCheckoutReady() ? <form action={startMembershipCheckout}><Button type="submit" variant="secondary">Get lifetime access · $10 USD</Button></form>
          : <OrderContactDialog subject="Baybloom lifetime Premium">
              <Button type="button" variant="secondary">Get lifetime access · $10 USD</Button>
            </OrderContactDialog>}
        {!premium && <a className="mt-2 flex min-h-11 w-fit items-center text-sm font-medium underline underline-offset-4" href={phpMembershipEmail}>Email us for PHP pricing</a>}
      </article>
    </section>
    <p className="mt-6 text-sm text-muted-foreground">Website purchases are priced separately. Your source ZIP is delivered with your paid website order.</p>
  </>;
}
