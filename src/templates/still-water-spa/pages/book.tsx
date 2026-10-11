import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 pb-16 sm:px-8">
      <h1 className="font-tpl-display text-6xl sm:text-7xl">Book a treatment</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-tpl-muted">
        Three short steps. Free cancellation until 24 hours before your appointment.
      </p>
      <div className="mt-12">
        <Suspense fallback={<div className="h-[600px] animate-pulse rounded-[2rem] bg-tpl-surface" />}>
          <BookFlow />
        </Suspense>
      </div>
    </div>
  );
}
