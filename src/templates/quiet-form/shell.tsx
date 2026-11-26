import type { ReactNode } from "react";
import { StudioShell } from "../_kit/studio/site";
import { BASE, site } from "./site";

export function Shell({ children }: { children: ReactNode }) {
  return <StudioShell site={site} base={BASE}>{children}</StudioShell>;
}
