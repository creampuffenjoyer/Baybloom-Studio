"use client";
import { usePine } from "../language";
import { Suspense } from "react";
import { BookFlow } from "../components/book-flow";

export function BookPage() {
  const { t } = usePine();
  return (
    <div className="mx-auto max-w-5xl px-5 pt-14 sm:px-8">
      <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">{t("Plan a sample stay")}</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-tpl-muted">{t("Sample availability and estimates only. No reservation, payment or email is created.")}</p>
      <div className="mt-12">
        <Suspense fallback={<div className="h-[560px] animate-pulse rounded-md bg-tpl-soft" />}>
          <BookFlow />
        </Suspense>
      </div>
    </div>
  );
}
