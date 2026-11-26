import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderContactDialog } from "@/components/order-contact-dialog";
import { onlineCheckoutEnabled } from "@/lib/online-checkout";
import { getCurrentUser } from "@/lib/session";
import { hasPremium, membershipLibrary } from "@/lib/membership";
import { includesFile, regularTemplate } from "@/lib/membership-plans";
import { membershipCheckoutReady, syncMembership } from "@/lib/membership-payment";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import editors from "@/lib/personalization/export-templates.json";
import { startMembershipCheckout } from "./actions";

export const metadata: Metadata = {title: "Membership & template library"};
type Query = Promise<Record<string, string | string[] | undefined>>;
const signIn = "/login?callbackUrl=%2Fmembership";

export default function MembershipPage({searchParams}: {searchParams: Query}) {
  return <div className="container-page py-10 sm:py-16">
    <h1 className="font-serif text-4xl sm:text-5xl">Membership & template library</h1>
    <p className="mt-4 max-w-2xl text-muted-foreground">Choose a template and make it your own. Start with the Regular collection or unlock the entire studio library for life.</p>
    <Suspense fallback={<p role="status" className="py-8">Loading the library…</p>}>
      <Library searchParams={searchParams} />
    </Suspense>
  </div>;
}

async function Library({searchParams}: {searchParams: Query}) {
  const [user, query, designs] = await Promise.all([getCurrentUser(), searchParams, membershipLibrary()]);
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
  const regularCount = designs.filter(design => regularTemplate(design.slug)).length;
  return <>
    {notice && <p role="status" className="mt-6 rounded-lg border border-border bg-white p-4">{notice}</p>}
    <section aria-label="Account plans" className="my-8 grid gap-4 sm:grid-cols-2">
      <article className="flex flex-col items-start rounded-xl border border-border bg-white p-6">
        <h2 className="text-2xl">Regular</h2>
        <p className="mt-2 text-xl font-medium">Free</p>
        <p className="my-4 grow text-sm leading-relaxed">{regularCount} templates across {new Set(designs.map(d => d.category.name)).size} industries. Includes their source files, available editors and starter downloads.</p>
        {user ? <Link href="#library" className="font-medium underline">Browse your library</Link> : <Button asChild variant="outline"><Link href="/register?callbackUrl=%2Fmembership">Create a free account</Link></Button>}
      </article>
      <article id="premium" className="scroll-mt-24 rounded-xl bg-bay p-6 text-white">
        <h2 className="text-2xl text-white">Premium</h2>
        <p className="mt-2 text-xl font-medium">$10 USD <span className="text-base font-normal">once, for lifetime access</span></p>
        <p className="my-4 text-sm leading-relaxed">All {designs.length} digital templates, every available editor and all Premium downloads. Custom design, setup and revisions are priced separately.</p>
        {premium ? <Link className="font-semibold underline" href="#library">Premium active · Open your library</Link>
          : !user ? <Button asChild variant="secondary"><Link href={signIn}>Sign in to upgrade</Link></Button>
          : onlineCheckoutEnabled() && membershipCheckoutReady() ? <form action={startMembershipCheckout}><Button type="submit" variant="secondary">Get lifetime access · $10 USD</Button></form>
          : <OrderContactDialog subject="Baybloom lifetime Premium">
              <Button type="button" variant="secondary">Get lifetime access · $10 USD</Button>
            </OrderContactDialog>}
      </article>
    </section>
    <section id="library" className="scroll-mt-24">
      <h2 className="font-serif text-3xl">Template library</h2>
      {Array.from(new Set(designs.map(d => d.category.name))).map(category => <section key={category} className="mt-7">
        <h3 className="border-b border-border pb-2 text-lg font-semibold">{category}</h3>
        <ul className="divide-y divide-border">{designs.filter(d => d.category.name === category).map(design => {
          const regular = regularTemplate(design.slug);
          const accessible = !!user && (premium || regular);
          return <li key={design.slug} id={design.slug} className="grid scroll-mt-24 gap-3 py-4 sm:grid-cols-[1fr_1.5fr]">
            <div><h4 className="text-xl">{design.title}</h4><p className="text-sm text-muted-foreground">{regular ? "Regular collection" : "Premium collection"}</p></div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link href={`/demo/${design.slug}`} className="font-medium underline">Live demo</Link>
              {accessible ? <>
                {Object.hasOwn(editors, design.slug) && <Link href={`/personalize/${design.slug}`} className="font-medium underline">Open editor</Link>}
                {design.files.filter(file => includesFile(premium, design.slug, file)).map(file =>
                  <a key={file.id} href={`/api/membership/files/${file.id}`} className="underline underline-offset-2">{file.name}</a>)}
              </> : <Link href={regular ? signIn : "#premium"} className="font-medium text-bay underline">{regular ? "Sign in to download" : "Unlock with Premium"}</Link>}
            </div>
          </li>;
        })}</ul>
      </section>)}
    </section>
  </>;
}
