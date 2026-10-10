import Link from "next/link";
import { LockIcon } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { loginHref } from "@/lib/urls";
import { cn } from "@/lib/utils";

export type CardPrice = { priceCents: number; currency: string } | null | undefined;

/**
 * Card price: "From ₱…" for clients, a locked chip for visitors.
 * `price === undefined` means pricing is unknown here (e.g. a cached section),
 * which renders the same locked chip since visitors are the common case.
 */
export function PriceChip({
  price,
  callbackUrl,
  className,
}: {
  price: CardPrice;
  callbackUrl?: string;
  className?: string;
}) {
  if (price) {
    return (
      <p className={cn("text-sm text-ink", className)}>
        <span className="text-muted-foreground">From </span>
        <span className="font-semibold text-bay">
          {formatPrice(price.priceCents, price.currency)}
        </span>
      </p>
    );
  }
  return (
    <Link
      href={loginHref(callbackUrl)}
      className={cn(
        "relative z-10 inline-flex items-center gap-1.5 rounded-full bg-sand-deep px-3 py-1 text-xs font-medium text-bay transition-colors hover:bg-secondary",
        className,
      )}
    >
      <LockIcon className="size-3" aria-hidden />
      Log in to see pricing
    </Link>
  );
}
