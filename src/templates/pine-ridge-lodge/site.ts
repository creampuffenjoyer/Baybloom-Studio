import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/pine-ridge-lodge";
export const href = makeHref(BASE);

export const CURRENCY = "CAD";

export const site = {
  name: "Pine Ridge Lodge",
  tagline: "A timber lodge at the top of Whitebark Valley",
  phone: "+1 250 555 0148",
  email: "lodge@pineridge.example",
  address: ["1 Ridge Road, Whitebark Valley", "British Columbia V0A 1H0", "Canada"],
  checkIn: "4 pm",
  checkOut: "11 am",
  social: { instagram: "#", facebook: "#" },
};

export const nav = [
  { href: "/rooms", label: "Rooms" },
  { href: "/activities", label: "Activities" },
  { href: "/dining", label: "Dining" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export const theme: Theme = {
  bg: "#eeede6", // paper
  surface: "#f7f6f1",
  soft: "#e2e1d6",
  ink: "#1b231f",
  muted: "#4f5a53",
  line: "#d3d2c5",
  accent: "#c7802f", // amber, 5.6:1 with ink
  onAccent: "#1b231f",
  deep: "#1e3a2f", // forest
  onDeep: "#eeede6",
  alt: "#5a3e2b", // bark
};
