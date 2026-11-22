import { Alegreya, Alegreya_Sans } from "next/font/google";

export const display = Alegreya({ subsets: ["latin"], variable: "--pr-display", display: "swap" });

export const body = Alegreya_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--pr-body", display: "swap" });
