import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
      <h1 className="font-tpl-display text-5xl sm:text-6xl">Book a room</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-tpl-muted">Three quick steps. No payment until you arrive.</p>
      <div className="mt-10">
        <Suspense fallback={<div className="h-[520px] animate-pulse rounded-3xl bg-tpl-soft" />}>
          <BookFlow />
        </Suspense>
      </div>
    </div>
  );
}
