"use client";

import type { CSSProperties } from "react";
import { SitePhoto } from "../../_kit/hospitality-site";
import { useAtriumMode } from "../mode";
import photos from "../photos.json";

export function HallScene({ lead = false, comparison, setting = "room" }: {
  lead?: boolean;
  comparison?: number;
  setting?: "room" | "table";
}) {
  const { mode } = useAtriumMode();
  const comparing = comparison !== undefined;
  const styled = setting === "table";
  const sizes = styled ? "(min-width: 1250px) 780px, (min-width: 761px) 58vw, 100vw" : "(min-width: 1440px) 1440px, 100vw";

  return (
    <div className="at-scene" data-comparing={comparing || undefined} style={comparing ? { "--at-split": `${comparison}%` } as CSSProperties : undefined}>
      <div className="at-scene-frame at-scene-day" aria-hidden={!comparing && mode !== "day"}>
        <SitePhoto photo={styled ? photos.weddingTable : photos.glasshouseDay} sizes={sizes} priority={lead} />
      </div>
      <div className="at-scene-frame at-scene-night" aria-hidden={!comparing && mode !== "night"}>
        <SitePhoto photo={styled ? photos.reception : photos.glasshouseNight} sizes={sizes} />
      </div>
      {comparing && <div className="at-compare-divider" aria-hidden="true"><span>↔</span></div>}
    </div>
  );
}

export function SceneCaption() {
  const { mode } = useAtriumMode();
  return <p role="status" className="at-scene-caption">{mode === "day" ? "Soft daylight through the glass roof" : "Warm pendant lighting after dark"}</p>;
}
