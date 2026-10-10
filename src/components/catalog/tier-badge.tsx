import type { TierLevel } from "@prisma/client";
import { TIER_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

const STYLE: Record<TierLevel, string> = {
  STARTER: "bg-white/90 text-bay",
  STANDARD: "bg-seaglass/95 text-bay-deep",
  PREMIUM: "bg-bay text-white",
};

export function TierBadge({ level, className }: { level: TierLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase shadow-sm backdrop-blur",
        STYLE[level],
        className,
      )}
    >
      {level === "PREMIUM" ? "Up to Premium" : TIER_LABEL[level]}
    </span>
  );
}
