"use client";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";

export function CartStatus() {
  const { loadState, refresh, busy } = useCart();
  if (loadState === "loading") return <p className="p-6" role="status">Loading your cart…</p>;
  if (loadState === "signed-out") return <p className="p-6"><Link className="underline" href="/login">Log in to view your cart</Link></p>;
  return <div className="space-y-3 p-6" role="alert">
    <p>We couldn’t refresh your cart. Please retry before checking out.</p>
    <button className="rounded-full border px-4 py-2" disabled={busy} onClick={() => void refresh()}>{busy ? "Refreshing…" : "Retry"}</button>
  </div>;
}
