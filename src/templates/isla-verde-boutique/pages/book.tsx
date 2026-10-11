import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
      <h1 className="font-t-display text-6xl italic sm:text-7xl">Reserve your stay</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-t-muted">Our best rate, with breakfast and a walking tour of the old town.</p>
      <div className="mt-12">
        <Suspense fallback={<div className="h-[560px] animate-pulse bg-t-soft" />}>
          <BookFlow />
        </Suspense>
      </div>
    </div>
  );
}
