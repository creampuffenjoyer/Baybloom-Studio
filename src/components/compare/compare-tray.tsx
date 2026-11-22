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
      {visible && <div key="compare-space" aria-hidden className="h-36 sm:h-24" />}
      {visible && (
        <motion.aside
          key="compare-tray"
          aria-label="Compare selection"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-xl flex-wrap items-center gap-3 rounded-2xl bg-bay-deep p-3 text-white shadow-2xl sm:inset-x-0"
        >
          <ul className="flex gap-2">
            {Array.from({ length: COMPARE_MAX }, (_, i) => {
              const item = items[i];
              return (
                <li key={item?.slug ?? `empty-${i}`}>
                  {item ? (
                    <div className="group relative size-12 overflow-hidden rounded-lg ring-1 ring-white/20">
                      <Image src={item.heroImage} alt={item.title} fill sizes="48px" className="object-cover object-top" />
                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        aria-label={`Remove ${item.title}`}
                        className="absolute inset-0 grid place-items-center bg-ink/60 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
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
              className="min-h-11 rounded-lg px-3 py-2 text-sm text-white/90 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Clear
            </button>
            {items.length < 2 ? <span role="link" aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white/70"><GitCompareArrowsIcon aria-hidden className="size-4" /> Compare</span> : <Link
              href={compareHref(items)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-hibiscus-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hibiscus-strong/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <GitCompareArrowsIcon className="size-4" /> Compare
            </Link>}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
