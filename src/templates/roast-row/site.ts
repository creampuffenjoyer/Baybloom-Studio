import { makeHref, type Theme } from "../_kit/theme";

export const BASE = "/demo/roast-row";
export const href = makeHref(BASE);

export const site = {
  name: "Roast Row",
  location: "Quezon City, Metro Manila",
  description: "Specialty coffee, fresh bakes and pickup in Quezon City.",
};

export const theme: Theme = {
  bg: "#efe5d4",
  surface: "#fbf4e7",
  soft: "#e5d9c6",
  ink: "#211b17",
  muted: "#5e5046",
  line: "#ab9b86",
  accent: "#183c9b",
  onAccent: "#ffffff",
  deep: "#152e73",
  onDeep: "#f7eccf",
  alt: "#ca5f2c",
};
