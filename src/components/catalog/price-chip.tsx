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
        <span className="text-muted-foreground">Studio service from </span>
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
        "relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-sand px-3 py-2 text-xs font-medium text-bay transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <LockIcon className="size-3" aria-hidden />
      Log in for service pricing
    </Link>
  );
}
