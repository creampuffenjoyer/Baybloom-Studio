import { Instrument_Sans, Instrument_Serif } from "next/font/google";

export const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--ll-display",
  display: "swap",
});

export const body = Instrument_Sans({ subsets: ["latin"], variable: "--ll-body", display: "swap" });
