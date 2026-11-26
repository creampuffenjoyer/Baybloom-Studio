import { makeHref, type Theme } from "../_kit/theme";

export const BASE = "/demo/the-atrium";
export const href = makeHref(BASE);

export const site = {
  name: "The Atrium",
  location: "Metro Manila, Philippines",
  description: "A glasshouse, gallery and garden court for weddings, private celebrations and work gatherings.",
};

export const theme: Theme = {
  bg: "#f9f5ee",
  surface: "#fffcf7",
  soft: "#eee4d7",
  ink: "#34271f",
  muted: "#615146",
  line: "#cbbbad",
  accent: "#674832",
  onAccent: "#fff8ed",
  deep: "#4a352b",
  onDeep: "#fff2e4",
  alt: "#ab775a",
};

export const afterDarkTheme: Theme = {
  bg: "#241c18",
  surface: "#30251f",
  soft: "#3d2e26",
  ink: "#fff3e5",
  muted: "#dac7b7",
  line: "#7d685a",
  accent: "#f0c6a2",
  onAccent: "#35241b",
  deep: "#211712",
  onDeep: "#ffeedc",
  alt: "#da9d76",
};
