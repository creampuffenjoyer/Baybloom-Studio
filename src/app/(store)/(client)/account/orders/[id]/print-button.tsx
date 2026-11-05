"use client";

import { PrinterIcon } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-medium hover:border-bay/40"
    >
      <PrinterIcon className="size-3.5" /> Print / save PDF
    </button>
  );
}
