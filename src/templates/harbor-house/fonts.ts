import { Caveat, Nunito_Sans, Young_Serif } from "next/font/google";

export const display = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--hh-display", display: "swap" });

export const body = Nunito_Sans({ subsets: ["latin"], variable: "--hh-body", display: "swap" });

/** Only for the hosts' handwritten notes. */
export const hand = Caveat({ subsets: ["latin"], weight: ["500"], variable: "--hh-hand", display: "swap" });
