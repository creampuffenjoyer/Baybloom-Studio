import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pt-14 sm:px-8">
      <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">Book your stay</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-tpl-muted">Breakfast, the sauna and the boot room are included.</p>
      <div className="mt-12">
        <Suspense fallback={<div className="h-[560px] animate-pulse rounded-md bg-tpl-soft" />}>
          <BookFlow />
        </Suspense>
      </div>
    </div>
  );
}
