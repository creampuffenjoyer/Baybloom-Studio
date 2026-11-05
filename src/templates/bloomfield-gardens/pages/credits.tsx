"use client";

import { useBloomfield } from "../language";

import { CreditsList } from "../../_kit/credits-list";


export function CreditsPage() {
  const { photos, language } = useBloomfield();
  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 pb-10 sm:px-8">
      <h1 className="font-tpl-display text-6xl font-medium italic">Photo credits</h1>
      <p className="mt-4 text-lg text-tpl-muted">The photographs on this site are used under the licences below.</p>
      <CreditsList photos={photos} labels={language === "tl" ? { by: "Larawan ni", edited: ". Ginupit at binago ang laki." } : language === "taglish" ? { by: "Photo by", edited: ". Na-crop at na-resize." } : undefined} className="mt-10 divide-y divide-tpl-line" />
    </div>
  );
}
