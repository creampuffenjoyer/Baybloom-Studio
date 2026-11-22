import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/ember-and-salt";
export const href = makeHref(BASE);

export const site = {
  name: "Ember & Salt",
  tagline: "Wood-fired kitchen and bar",
  phone: "+63 2 8555 0190",
  email: "table@emberandsalt.example",
  address: ["32 Calle Hormiga, Poblacion", "Makati City, Metro Manila", "Philippines"],
  hours: [
    { days: "Tuesday – Thursday", time: "5:30 pm – 11 pm" },
    { days: "Friday – Saturday", time: "5:30 pm – 12 am" },
    { days: "Sunday", time: "12 pm – 4 pm, 5:30 pm – 10 pm" },
    { days: "Monday", time: "Closed" },
  ],
  social: { instagram: "#", facebook: "#" },
};

export const nav = [
  { href: "/menu", label: "Menu" },
  { href: "/private-dining", label: "Private dining" },
  { href: "/story", label: "Story" },
  { href: "/gift-cards", label: "Gift cards" },
  { href: "/visit", label: "Visit" },
];

export const theme: Theme = {
  bg: "#2a1015", // wine-dark
  surface: "#341419",
  soft: "#3d1a20",
  ink: "#eee4d6", // bone
  muted: "#bfae9f",
  line: "#57323a",
  accent: "#c8a15a", // brass
  onAccent: "#2a1015",
  deep: "#1c090d",
  onDeep: "#eee4d6",
  alt: "#e0874f", // ember
};
