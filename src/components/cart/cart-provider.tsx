"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Cart } from "@/lib/cart";

type CartContext = {
  cart: Cart | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  busy: boolean;
  refresh: () => Promise<void>;
  add: (input: { designId: string; tierId: string; addonIds: string[] }) => Promise<boolean>;
  remove: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<string | null>;
  removeCoupon: () => Promise<void>;
};

const Ctx = createContext<CartContext | null>(null);

async function request(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

/** Client-side view of the server cart; the server recomputes every total. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const res = await request("/api/cart");
    setCart(res.ok ? (res.body as Cart) : null);
  }, []);

  useEffect(() => {
    // Initial sync with the server cart (an external system).
    void request("/api/cart").then((res) => setCart(res.ok ? (res.body as Cart) : null));
  }, []);

  const add = useCallback<CartContext["add"]>(async (input) => {
    setBusy(true);
    try {
      const res = await request("/api/cart", { method: "POST", body: JSON.stringify(input) });
      if (!res.ok) {
        toast.error(res.body.error ?? "Couldn't add that to your cart.");
        return false;
      }
      setCart(res.body as Cart);
      return true;
    } finally {
      setBusy(false);
    }
  }, []);

  const remove = useCallback<CartContext["remove"]>(async (itemId) => {
    // Optimistic: drop the line immediately; the response carries real totals.
    setCart((c) => (c ? { ...c, lines: c.lines.filter((l) => l.id !== itemId) } : c));
    const res = await request(`/api/cart/${itemId}`, { method: "DELETE" });
    if (res.ok) setCart(res.body as Cart);
    else void refresh();
  }, [refresh]);

  const applyCoupon = useCallback<CartContext["applyCoupon"]>(async (code) => {
    const res = await request("/api/cart/coupon", { method: "POST", body: JSON.stringify({ code }) });
    if (!res.ok) return (res.body.error as string) ?? "That code isn't valid.";
    setCart(res.body as Cart);
    return null;
  }, []);

  const removeCoupon = useCallback(async () => {
    const res = await request("/api/cart/coupon", { method: "DELETE" });
    if (res.ok) setCart(res.body as Cart);
  }, []);

  const value = useMemo(
    () => ({ cart, open, setOpen, busy, refresh, add, remove, applyCoupon, removeCoupon }),
    [cart, open, busy, refresh, add, remove, applyCoupon, removeCoupon],
  );
  return <Ctx value={value}>{children}</Ctx>;
}

export function useCart() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
