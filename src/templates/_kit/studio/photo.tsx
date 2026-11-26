import type { CSSProperties } from "react";
import { SitePhoto } from "../hospitality-site";
import type { StudioPhoto } from "./types";

export function Photo({ photo, hero = false, sizes = "100vw" }: { photo: StudioPhoto; hero?: boolean; sizes?: string }) {
  return (
    <div className="st-photo" style={{ "--st-focus": photo.position } as CSSProperties}>
      <SitePhoto photo={photo} sizes={sizes} priority={hero} className="st-image" />
    </div>
  );
}
