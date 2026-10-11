import { Suspense } from "react";
import { ReserveFlow } from "../components/reserve-flow";

export function ReservePage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16 pb-24 sm:px-8">
      <h1 className="font-tpl-display text-6xl leading-none sm:text-8xl">Reserve a table</h1>
      <p className="mt-5 max-w-[52ch] text-lg text-tpl-muted">
        We release tables 60 days ahead. For nine or more, take a look at private dining.
      </p>
      <div className="mt-14">
        <Suspense fallback={<div className="h-[640px] animate-pulse bg-tpl-surface" />}>
          <ReserveFlow />
        </Suspense>
      </div>
    </div>
  );
}
