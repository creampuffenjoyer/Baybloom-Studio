"use client";
import { useBloomCopy } from "../copy";
import { Suspense } from "react";
import { InquiryFlow } from "../components/inquiry-flow";
import { useBloomfield } from "../language";

export function InquirePage() {
  const copy = useBloomCopy();
  const { translate } = useBloomfield();
  return (
    <div className="px-5 pt-14 pb-10 sm:px-8">
      <h1 className="text-center font-tpl-display text-6xl font-medium italic sm:text-7xl">{translate(copy("Check your date"))}</h1>
      <p className="mx-auto mt-4 max-w-[52ch] text-center text-lg text-tpl-muted">
        {translate("Explore a sample inquiry in three short steps. No date is held and no message is sent.")}
      </p>
      <div className="mt-12">
        <Suspense fallback={<div className="mx-auto h-[520px] max-w-4xl animate-pulse rounded-[2rem] bg-tpl-soft" />}>
          <InquiryFlow />
        </Suspense>
      </div>
    </div>
  );
}
