import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/harbor-house";
export const href = makeHref(BASE);

export const site = {
  name: "Harbor House",
  tagline: "A bed and breakfast by the harbour in Basco, Batanes",
  hosts: "Mila and Joel",
  phone: "+63 918 555 0164",
  email: "hello@harborhouse.example",
  address: ["7 Abad Street, Kayvalugan", "Basco, Batanes 3900", "Philippines"],
  checkIn: "2 pm",
  checkOut: "11 am",
  social: { instagram: "#", facebook: "#" },
};

export const nav = [
  { href: "/rooms", label: "Rooms" },
  { href: "/breakfast", label: "Breakfast" },
  { href: "/guide", label: "Around Basco" },
  { href: "/guestbook", label: "Guestbook" },
  { href: "/contact", label: "Contact" },
];

export const theme: Theme = {
  bg: "#fcfaf5", // whitewash
  surface: "#ffffff",
  soft: "#f8e7a8", // butter
  ink: "#22303f",
  muted: "#55606d",
  line: "#e6dfcf",
  accent: "#24557f", // harbour blue
  onAccent: "#ffffff",
  deep: "#22303f",
  onDeep: "#fcfaf5",
  alt: "#c3a27c", // rope
};
