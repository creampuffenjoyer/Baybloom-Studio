import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 sm:pt-36">
      <h1 className="font-t-display text-5xl leading-[0.95] font-extrabold tracking-[-0.045em] [font-stretch:88%] sm:text-6xl">
        Book your villa
      </h1>
      <p className="mt-3 max-w-[56ch] text-lg text-t-muted">
        Best rate when you book here, with breakfast and snorkel gear included.
      </p>
      <div className="mt-10">
        <Suspense fallback={<div className="h-[520px] animate-pulse rounded-3xl bg-t-soft" />}>
          <BookFlow />
        </Suspense>
      </div>
    </div>
  );
}
