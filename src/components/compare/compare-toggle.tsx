"use client";

import { usePathname, useRouter } from "next/navigation";
import { CheckIcon, GitCompareArrowsIcon } from "lucide-react";
import { toast } from "sonner";
import { COMPARE_MAX, type CompareItem, useCompare } from "@/components/compare/compare-store";
import { loginHref } from "@/lib/urls";
import { cn } from "@/lib/utils";

/** Adds/removes a design from the compare tray. Compare is for signed-in clients. */
export function CompareToggle({
  item,
  signedIn,
  variant = "icon",
  className,
}: {
  item: CompareItem;
  signedIn: boolean;
  variant?: "icon" | "button";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { has, add, remove, full } = useCompare();
  const selected = has(item.slug);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) {
      toast("Log in to compare designs", {
        action: { label: "Log in", onClick: () => router.push(loginHref(pathname)) },
      });
      return;
    }
    if (selected) return remove(item.slug);
    if (full) {
      toast(`You can compare up to ${COMPARE_MAX} designs. Remove one first.`);
      return;
    }
    add(item);
  }

  const label = selected ? `Remove ${item.title} from compare` : `Add ${item.title} to compare`;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          selected
            ? "border-bay bg-secondary text-bay"
            : "border-border bg-white text-ink/80 hover:border-bay/40",
          className,
        )}
      >
        {selected ? <CheckIcon className="size-4" /> : <GitCompareArrowsIcon className="size-4" />}
        {selected ? "Added to compare" : "Compare"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-10 place-items-center rounded-full shadow-sm backdrop-blur transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected ? "bg-bay text-white" : "bg-white/90 text-ink/70 hover:bg-white",
        className,
      )}
    >
      {selected ? <CheckIcon className="size-[18px]" /> : <GitCompareArrowsIcon className="size-[18px]" />}
    </button>
  );
}
