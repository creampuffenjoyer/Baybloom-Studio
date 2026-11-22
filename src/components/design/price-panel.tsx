"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { motion } from "motion/react";
import { Loader2Icon, LockIcon, ShoppingBagIcon, ZapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import type { DesignPricing } from "@/lib/catalog";
import { formatPrice, TIER_LABEL } from "@/lib/format";
import { loginHref } from "@/lib/urls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CompareToggle } from "@/components/compare/compare-toggle";
import type { CompareItem } from "@/components/compare/compare-store";

/** Signed-in view: choose a tier and add-ons. Fades in from a blur (spec §7.1). */
export function PricePicker({
  designId,
  pricing,
  compareItem,
}: {
  designId: string;
  pricing: DesignPricing;
  compareItem: CompareItem;
}) {
  const router = useRouter();
  const { add, setOpen, busy } = useCart();
  const [tierId, setTierId] = useState(
    pricing.tiers.find((t) => t.level === "STANDARD")?.id ?? pricing.tiers[0]?.id,
  );
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const groupId = useId();

  const tier = pricing.tiers.find((t) => t.id === tierId);
  const addonsTotal = pricing.addons
    .filter((a) => addonIds.includes(a.id))
    .reduce((sum, a) => sum + a.priceCents, 0);
  const total = (tier?.priceCents ?? 0) + addonsTotal;
  const currency = tier?.currency ?? "PHP";

  return (
    <motion.div
      initial={false}
      className="space-y-6"
    >
      <fieldset>
        <legend id={groupId} className="mb-3 text-sm font-semibold text-ink">
          Choose a tier
        </legend>
        <div className="space-y-2">
          {pricing.tiers.map((t) => {
            const checked = t.id === tierId;
            return (
              <label
                key={t.id}
                className={cn(
                  "flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                  checked
                    ? "border-bay bg-secondary/70"
                    : "border-border bg-white hover:border-bay/40",
                )}
              >
                <span className="flex items-center gap-3">
                  <input type="radio" name={`tier-${groupId}`} value={t.id} checked={checked} onChange={() => setTierId(t.id)} className="size-4 shrink-0 accent-bay" />
                  <span className="font-medium">{TIER_LABEL[t.level]}</span>
                </span>
                <span className="font-semibold text-bay tabular-nums">
                  {formatPrice(t.priceCents, t.currency)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {pricing.addons.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-ink">Add-ons</legend>
          <ul className="space-y-2.5">
            {pricing.addons.map((a) => (
              <AddonRow
                key={a.id}
                addon={a}
                checked={addonIds.includes(a.id)}
                onToggle={() =>
                  setAddonIds((ids) =>
                    ids.includes(a.id) ? ids.filter((i) => i !== a.id) : [...ids, a.id],
                  )
                }
              />
            ))}
          </ul>
        </fieldset>
      )}

      <div className="flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <motion.span
          key={total}
          initial={{ opacity: 0.4, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl font-medium text-bay"
        >
          {formatPrice(total, currency)}
        </motion.span>
      </div>

      <div className="grid gap-2">
        <Button
          disabled={busy || !tierId}
          onClick={async () => {
            if (tierId && (await add({ designId, tierId, addonIds }))) router.push("/checkout");
          }}
          className="h-12 rounded-lg bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90"
        >
          <ZapIcon /> Buy now
        </Button>
        <Button
          disabled={busy || !tierId}
          variant="outline"
          onClick={async () => {
            if (tierId && (await add({ designId, tierId, addonIds }))) setOpen(true);
          }}
          className="h-12 rounded-lg bg-white text-base"
        >
          {busy ? <Loader2Icon className="animate-spin" /> : <ShoppingBagIcon />} Add to cart
        </Button>
        <CompareToggle item={compareItem} signedIn variant="button" className="mt-1" />
        <p className="text-center text-xs text-muted-foreground">
          Secure payment by Stripe. Files are available to download right after payment.
        </p>
      </div>
    </motion.div>
  );
}

function AddonRow({
  addon,
  checked,
  onToggle,
}: {
  addon: DesignPricing["addons"][number];
  checked: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  return (
    <li className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-0.5 size-[18px] bg-white data-[state=checked]:border-bay data-[state=checked]:bg-bay"
      />
      <label htmlFor={id} className="flex flex-1 cursor-pointer justify-between gap-3 text-sm">
        <span>
          <span className="font-medium text-ink">{addon.name}</span>
          {addon.description && (
            <span className="block text-xs text-muted-foreground">{addon.description}</span>
          )}
        </span>
        <span className="shrink-0 font-medium text-bay">
          +{formatPrice(addon.priceCents, addon.currency)}
        </span>
      </label>
    </li>
  );
}

/**
 * Visitor view. Price data is only available after signing in.
 */
export function LockedPrice({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-sand p-5">
        <LockIcon aria-hidden className="size-5 text-bay" />
        <p className="mt-3 font-medium text-ink">Choose the tier that suits you</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Log in to compare prices, see what each tier includes and choose your add-ons. Creating an account is free.</p>
      </div>
      <div className="grid gap-2">
        <Button asChild className="h-12 rounded-lg bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90">
          <Link href={loginHref(callbackUrl)}>Log in to see prices</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-lg bg-white text-base">
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            Create a free account
          </Link>
        </Button>
      </div>
    </div>
  );
}
