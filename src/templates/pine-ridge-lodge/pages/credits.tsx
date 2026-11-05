"use client";
import { usePine } from "../language";
import { CreditsList } from "../../_kit/credits-list";
import photos from "../photos.json";

export function CreditsPage() {
  const { t } = usePine();
  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 sm:px-8">
      <h1 className="font-tpl-display text-5xl font-bold">{t("Photo credits")}</h1>
      <p className="mt-4 text-lg text-tpl-muted">{t("The photographs on this site are used under the licences below.")}</p>
      <CreditsList labels={{by: t("by"), edited: t("edited")}} photos={Object.values(photos).map(p=>({...p,alt:t(p.alt)}))} className="mt-10 divide-y divide-tpl-line" />
    </div>
  );
}
