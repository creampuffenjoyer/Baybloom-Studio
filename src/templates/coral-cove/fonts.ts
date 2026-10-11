import { Bricolage_Grotesque, Figtree } from "next/font/google";

export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--cc-display",
  display: "swap",
});

export const body = Figtree({ subsets: ["latin"], variable: "--cc-body", display: "swap" });
