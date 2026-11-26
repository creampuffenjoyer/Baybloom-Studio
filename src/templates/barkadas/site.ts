import { makeHref, type Theme } from "../_kit/theme";

export const BASE = "/demo/barkadas";
export const href = makeHref(BASE);

export const site = {
  name: "Barkadas",
  location: "Tagaytay, Cavite",
  description: "Private rooms and a whole-house rental for group weekends in Tagaytay.",
  checkIn: "3 pm",
  checkOut: "11 am",
  listingUrl: "",
};

export const theme: Theme = {
  bg: "#ececdf",
  surface: "#faf9f0",
  soft: "#dfe4d4",
  ink: "#25302a",
  muted: "#4d5c52",
  line: "#a2aa99",
  accent: "#294f3e",
  onAccent: "#fffaf0",
  deep: "#253b30",
  onDeep: "#f6f1db",
  alt: "#d9b77d",
};
