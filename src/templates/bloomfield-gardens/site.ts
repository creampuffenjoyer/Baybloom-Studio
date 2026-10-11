import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/bloomfield-gardens";
export const href = makeHref(BASE);

export const site = {
  name: "Bloomfield Gardens",
  tagline: "A garden estate for weddings and celebrations",
  phone: "+63 46 555 0177",
  email: "events@bloomfield.example",
  address: ["Bloomfield Estate, Barangay Maitim II", "Tagaytay City, Cavite 4120", "Philippines"],
  viewings: "Viewings by appointment, Tuesday to Sunday",
  social: { instagram: "#", pinterest: "#" },
};

export const nav = [
  { href: "/spaces", label: "Spaces" },
  { href: "/weddings", label: "Weddings" },
  { href: "/gallery", label: "Gallery" },
  { href: "/planning", label: "Planning" },
];

export const theme: Theme = {
  bg: "#fffaf6", // ivory
  surface: "#ffffff",
  soft: "#f6e4df", // blush
  ink: "#3a2934", // plum
  muted: "#6c5863",
  line: "#ead8d2",
  accent: "#56653a", // olive, 6.3:1 with white
  onAccent: "#ffffff",
  deep: "#3a2934",
  onDeep: "#fffaf6",
  alt: "#c9767f", // petal
};
