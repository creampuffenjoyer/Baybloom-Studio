import { Cormorant, Jost } from "next/font/google";

export const display = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--bf-display",
  display: "swap",
});

export const body = Jost({ subsets: ["latin"], variable: "--bf-body", display: "swap" });
