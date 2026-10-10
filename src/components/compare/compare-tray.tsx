"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { GitCompareArrowsIcon, XIcon } from "lucide-react";
import { COMPARE_MAX, compareHref, useCompare } from "@/components/compare/compare-store";

/** Floating bar listing the designs picked for comparison. */
export function CompareTray() {
  const pathname = usePathname();
  const { items, remove, clear } = useCompare();
  const visible = items.length > 0 && pathname !== "/compare";

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Compare selection"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-bay-deep p-3 text-white shadow-2xl sm:inset-x-0"
        >
          <ul className="flex gap-2">
            {Array.from({ length: COMPARE_MAX }, (_, i) => {
              const item = items[i];
              return (
                <li key={item?.slug ?? `empty-${i}`}>
                  {item ? (
                    <div className="group relative size-12 overflow-hidden rounded-lg ring-1 ring-white/20">
                      <Image src={item.heroImage} alt={item.title} fill sizes="48px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        aria-label={`Remove ${item.title}`}
                        className="absolute inset-0 grid place-items-center bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="size-12 rounded-lg border border-dashed border-white/25" aria-hidden />
                  )}
                </li>
              );
            })}
          </ul>
          <p className="hidden flex-1 text-sm text-white/80 sm:block">
            {items.length < 2 ? "Pick one more to compare" : `${items.length} designs selected`}
          </p>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={clear}
              className="rounded-full px-3 py-2 text-sm text-white/75 hover:text-white"
            >
              Clear
            </button>
            <Link
              href={compareHref(items)}
              aria-disabled={items.length < 2}
              className="inline-flex items-center gap-2 rounded-full bg-hibiscus-strong px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-hibiscus-strong/90 aria-disabled:pointer-events-none aria-disabled:opacity-50"
            >
              <GitCompareArrowsIcon className="size-4" /> Compare
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
