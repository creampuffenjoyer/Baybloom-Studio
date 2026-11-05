"use client";

import { TourViewer } from "../components/tour-viewer";
import { useLumen } from "../language";

export function TourPage() {
  const { t } = useLumen();
  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-10 sm:px-10">
      <h1 className="font-tpl-display text-7xl sm:text-8xl">{t("Guided lake tour")}</h1>
      <p className="mt-6 mb-14 max-w-[48ch] text-lg text-tpl-muted">{t("Walk the shore before you arrive. Drag the view, or use the arrow keys.")}</p>
      <TourViewer />
    </div>
  );
}
