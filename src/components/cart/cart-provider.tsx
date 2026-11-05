"use client";

import { createContext, Suspense, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createRequestQueue } from "@/lib/request-queue";
import { toast } from "sonner";
import type { Cart } from "@/lib/cart";

type CartContext = {
  cart: Cart | null;
  loadState: "loading" | "ready" | "error" | "signed-out";
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

function CartSync({ refresh }: { refresh: () => Promise<void> }) {
  const pathname = usePathname();
  useEffect(() => {
    const reload = () => { void refresh(); };
    reload();
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [refresh, pathname]);
  return null;
}

async function request(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json();
  if (res.ok && (!Array.isArray(body?.lines) || !Number.isInteger(body?.totalCents))) {
    throw new Error("Invalid cart response");
  }
  return { ok: res.ok, status: res.status, body };
}

/** Client-side view of the server cart; the server recomputes every total. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const busy = pending > 0;
  const [loadState, setLoadState] = useState<CartContext["loadState"]>("loading");
  const queue = useRef(createRequestQueue());

  const sync = useCallback((url: string, init?: RequestInit) => {
    setPending((n) => n + 1);
    return queue.current(async () => {
      try {
        const res = await request(url, init);
        if (res.ok) {
          setCart(res.body as Cart);
          setLoadState("ready");
          return null;
        }
        if (res.status === 401) {
          setCart(null);
          setLoadState("signed-out");
        } else if (res.status >= 500 || !init?.method) {
          setLoadState("error");
        }
        return typeof res.body.error === "string" ? res.body.error : "Couldn't update your cart. Please retry.";
      } catch {
        setLoadState("error");
        return "Connection interrupted. Refresh your cart before trying again.";
      } finally {
        setPending((n) => n - 1);
      }
    });
  }, []);

  const refresh = useCallback(async () => { await sync("/api/cart"); }, [sync]);

  const add = useCallback<CartContext["add"]>(async (input) => {
    const error = await sync("/api/cart", { method: "POST", body: JSON.stringify(input) });
    if (error) toast.error(error);
    return !error;
  }, [sync]);
  const remove = useCallback<CartContext["remove"]>(async (itemId) => {
    const error = await sync(`/api/cart/${encodeURIComponent(itemId)}`, { method: "DELETE" });
    if (error) toast.error(error);
  }, [sync]);
  const applyCoupon = useCallback<CartContext["applyCoupon"]>((code) =>
    sync("/api/cart/coupon", { method: "POST", body: JSON.stringify({ code }) }), [sync]);
  const removeCoupon = useCallback(async () => {
    const error = await sync("/api/cart/coupon", { method: "DELETE" });
    if (error) toast.error(error);
  }, [sync]);

  const value = useMemo(
    () => ({ cart, loadState, open, setOpen, busy, refresh, add, remove, applyCoupon, removeCoupon }),
    [cart, loadState, open, busy, refresh, add, remove, applyCoupon, removeCoupon],
  );
  return <Ctx value={value}><Suspense fallback={null}><CartSync refresh={refresh} /></Suspense>{children}</Ctx>;
}

export function useCart() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
