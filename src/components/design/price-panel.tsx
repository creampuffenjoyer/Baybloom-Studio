"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { CheckIcon, LockIcon, ShoppingBagIcon, ZapIcon } from "lucide-react";
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
  pricing,
  compareItem,
}: {
  pricing: DesignPricing;
  compareItem: CompareItem;
}) {
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
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <fieldset>
        <legend id={groupId} className="mb-3 text-sm font-semibold text-ink">
          Choose a tier
        </legend>
        <div role="radiogroup" aria-labelledby={groupId} className="space-y-2">
          {pricing.tiers.map((t) => {
            const checked = t.id === tierId;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => setTierId(t.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  checked
                    ? "border-bay bg-secondary/70"
                    : "border-border bg-white hover:border-bay/40",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full border",
                      checked ? "border-bay bg-bay text-white" : "border-input",
                    )}
                  >
                    {checked && <CheckIcon className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="font-medium">{TIER_LABEL[t.level]}</span>
                </span>
                <span className="font-semibold text-bay">
                  {formatPrice(t.priceCents, t.currency)}
                </span>
              </button>
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
          disabled
          className="h-12 rounded-full bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90"
        >
          <ZapIcon /> Buy now
        </Button>
        <Button disabled variant="outline" className="h-12 rounded-full bg-white text-base">
          <ShoppingBagIcon /> Add to cart
        </Button>
        <CompareToggle item={compareItem} signedIn variant="button" className="mt-1" />
        <p className="text-center text-xs text-muted-foreground">
          Online checkout is opening soon. Prices include all files listed for the tier.
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
 * Visitor view. The blurred figures are decorative placeholders; no real
 * price data is ever sent to the browser for signed-out visitors.
 */
export function LockedPrice({ callbackUrl }: { callbackUrl: string }) {
  const controls = useAnimationControls();
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() =>
          controls.start({
            rotate: [0, -14, 12, -8, 6, 0],
            transition: { duration: 0.5 },
          })
        }
        className="relative block w-full overflow-hidden rounded-2xl bg-sand-deep p-5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Pricing is locked. Log in to view pricing."
      >
        <div aria-hidden className="space-y-3 blur-[7px] select-none">
          {["Starter", "Standard", "Premium"].map((t) => (
            <div key={t} className="flex justify-between rounded-xl bg-white px-4 py-3">
              <span className="font-medium">{t}</span>
              <span className="font-semibold tracking-wider text-bay">₱ ••,•••</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-bay shadow-md">
            <motion.span animate={controls} className="inline-flex">
              <LockIcon className="size-4" />
            </motion.span>
            Log in to view pricing
          </span>
        </div>
      </button>
      <div className="grid gap-2">
        <Button asChild className="h-12 rounded-full bg-hibiscus-strong text-base text-white hover:bg-hibiscus-strong/90">
          <Link href={loginHref(callbackUrl)}>Log in to see prices</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-full bg-white text-base">
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            Create a free account
          </Link>
        </Button>
      </div>
    </div>
  );
}
