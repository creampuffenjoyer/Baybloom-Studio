import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-10 sm:px-10">
      <h1 className="sr-only">Reserve a villa</h1>
      <Suspense fallback={<div className="h-[520px] animate-pulse bg-tpl-soft" />}>
        <BookFlow />
      </Suspense>
    </div>
  );
}
