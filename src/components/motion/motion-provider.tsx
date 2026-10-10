"use client";

import { MotionConfig } from "motion/react";

/**
 * Honour the OS "reduce motion" setting for every Motion animation (spec §7.1):
 * transform animations are skipped, opacity still fades.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
