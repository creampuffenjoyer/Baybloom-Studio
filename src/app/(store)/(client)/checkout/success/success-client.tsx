"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useCart } from "@/components/cart/cart-provider";

/** Animated checkmark: the circle and tick draw themselves in (spec §7.1). */
export function SuccessCheck() {
  return (
    <motion.svg
      viewBox="0 0 80 80"
      className="mx-auto size-24"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      aria-hidden
    >
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="var(--seaglass)"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M24 41 L35 52 L57 29"
        fill="none"
        stroke="var(--bay)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.5, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

/** After a paid order: forget the used promo code and refresh the cart badge. */
export function SuccessEffects() {
  const { refresh } = useCart();
  useEffect(() => {
    void fetch("/api/cart/coupon", { method: "DELETE" }).then(() => refresh());
  }, [refresh]);
  return null;
}

/** Re-checks a pending order every few seconds (until the webhook lands). */
export function PendingRefresher({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    let tries = 0;
    const t = setInterval(() => {
      if (++tries > 20) return clearInterval(t);
      router.refresh();
    }, 3000);
    return () => clearInterval(t);
  }, [active, router]);
  return null;
}
