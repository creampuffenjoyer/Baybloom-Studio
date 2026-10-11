import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/lumen-lake-villas";
export const href = makeHref(BASE);

export const CURRENCY = "SEK";

export const site = {
  name: "Lumen Lake Villas",
  tagline: "Four villas on the quiet shore of Lake Lumen",
  phone: "+46 570 555 012",
  email: "hej@lumenlake.example",
  address: ["Strandvägen 4, Lumen", "671 95 Värmland", "Sweden"],
  checkIn: "15:00",
  checkOut: "11:00",
  social: { instagram: "#" },
};

export const nav = [
  { href: "/villas", label: "Villas" },
  { href: "/experiences", label: "Experiences" },
  { href: "/tour", label: "Virtual tour" },
  { href: "/contact", label: "Contact" },
];

export const theme: Theme = {
  bg: "#fbfcfd",
  surface: "#ffffff",
  soft: "#e5ecf0", // mist
  ink: "#18242c",
  muted: "#53636e",
  line: "#dbe3e8",
  accent: "#2f5f7e", // lake, 6.6:1 with white
  onAccent: "#ffffff",
  deep: "#18242c",
  onDeep: "#fbfcfd",
  alt: "#a8957c", // birch bark
};
