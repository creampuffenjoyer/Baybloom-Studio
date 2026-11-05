"use client";
import { useCoral } from "../language";
import { CreditsList } from "../../_kit/credits-list";
import { PageIntro } from "../components/page-intro";
import photos from "../photos.json";

export function CreditsPage() {
  const { t } = useCoral();
  return (
    <>
      <PageIntro title={t("Photo credits")} lede={t("The photographs on this site are used under the licences below.")} />
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <CreditsList labels={{by: t("by"), edited: t("edited")}} photos={Object.values(photos).map(p=>({...p,alt:t(p.alt)}))} className="divide-y divide-tpl-line" />
      </div>
    </>
  );
}
