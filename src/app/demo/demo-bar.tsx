"use client";

import Link from "next/link";
import { useState } from "react";
import { Bloom } from "@/components/brand/logo";

/**
 * Floating Baybloom bar shown on top of every template demo. It lives outside
 * src/templates so it never ships in the packaged source.
 */
export function DemoBar({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show Baybloom demo bar"
        className="fixed bottom-4 left-4 z-[90] grid size-11 place-items-center rounded-full bg-[#0a3742] text-[#e36a5d] shadow-lg ring-1 ring-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9cc5b4]"
      >
        <Bloom className="size-5" />
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Baybloom template demo"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto flex max-w-xl items-center gap-3 rounded-full bg-[#0a3742]/95 py-1.5 pr-1.5 pl-4 font-[family-name:var(--font-body)] text-sm text-white shadow-2xl ring-1 ring-white/15 backdrop-blur"
    >
      <Bloom className="size-4 shrink-0 text-[#e36a5d]" />
      <p className="min-w-0 flex-1 truncate">
        <span className="text-white/65">Live demo of </span>
        <span className="font-semibold">{title}</span>
      </p>
      <Link
        href="/designs"
        className="hidden rounded-full px-3 py-2 text-white/80 hover:text-white sm:block"
      >
        All templates
      </Link>
      <Link
        href={`/designs/${slug}`}
        className="shrink-0 rounded-full bg-[#c4493d] px-4 py-2 font-semibold hover:bg-[#b03f34]"
      >
        Get this template
      </Link>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Hide demo bar"
        className="grid size-9 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
