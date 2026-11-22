"use client";

import { useIsla } from "../language";

import { CreditsList } from "../../_kit/credits-list";


export function CreditsPage() {
  const { t, photos } = useIsla();
  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 sm:px-8">
      <h1 className="font-tpl-display text-6xl italic">{t("Photo credits")}</h1>
      <p className="mt-4 text-lg text-tpl-muted">{t("The photographs on this site are used under the licences below.")}</p>
      <CreditsList photos={photos} labels={{ by: t("Photo by"), edited: t(". Cropped and resized.") }} className="mt-10 divide-y divide-tpl-line" />
    </div>
  );
}
