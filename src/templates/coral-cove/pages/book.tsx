"use client";
import { useCoral } from "../language";
import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  const { t } = useCoral();
  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 pb-24 sm:px-8 sm:pt-20">
      <h1 className="font-tpl-display text-5xl leading-[0.95] font-extrabold tracking-[-0.045em] [font-stretch:88%] sm:text-6xl">{t("Plan your island stay")}</h1>
      <p className="mt-3 max-w-[56ch] text-lg text-tpl-muted">{t("Try dates, compare villas and build a sample stay. Availability is simulated. No reservation, payment or email is created.")}</p>
      <div className="mt-10">
        <Suspense fallback={<div className="h-[520px] animate-pulse rounded-3xl bg-tpl-soft" />}>
          <BookFlow />
        </Suspense>
      </div>
    </div>
  );
}
