import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/still-water-spa";
export const href = makeHref(BASE);

export const site = {
  name: "Still Water",
  tagline: "Day spa and bathhouse",
  phone: "+63 74 555 0123",
  email: "rest@stillwater.example",
  address: ["14 Pine Ridge Road, Camp John Hay", "Baguio City, Benguet 2600", "Philippines"],
  hours: [
    { days: "Monday – Friday", time: "10 am – 9 pm" },
    { days: "Saturday – Sunday", time: "9 am – 10 pm" },
  ],
  social: { instagram: "#", facebook: "#" },
};

export const nav = [
  { href: "/treatments", label: "Treatments" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/gift-cards", label: "Gift cards" },
  { href: "/visit", label: "Visit" },
];

export const theme: Theme = {
  bg: "#eef1ec", // mist
  surface: "#f7f8f5",
  soft: "#e1e7de",
  ink: "#2d3a32", // moss
  muted: "#56655b",
  line: "#d0d8cc",
  accent: "#66588f", // dusk lilac, 6:1 with white
  onAccent: "#ffffff",
  deep: "#2d3a32",
  onDeep: "#eef1ec",
  alt: "#d9cfc1", // stone
};

/** Organic pebble outlines used to mask photos. */
export const pebbles = [
  "rounded-[58%_42%_47%_53%/52%_44%_56%_48%]",
  "rounded-[44%_56%_61%_39%/48%_57%_43%_52%]",
  "rounded-[52%_48%_38%_62%/60%_45%_55%_40%]",
];
