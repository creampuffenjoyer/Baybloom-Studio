import { Bodoni_Moda, Karla } from "next/font/google";

export const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--iv-display",
  display: "swap",
});

export const body = Karla({ subsets: ["latin"], variable: "--iv-body", display: "swap" });
