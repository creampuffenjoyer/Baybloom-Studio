import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/coral-cove";
export const href = makeHref(BASE);

export const site = {
  name: "Coral Cove",
  tagline: "A barefoot island resort on Isla Calma, Palawan",
  phone: "+63 917 555 0142",
  whatsapp: "+63 917 555 0142",
  email: "stay@coralcove.example",
  address: ["Sitio Lagunda, Isla Calma", "El Nido, Palawan 5313", "Philippines"],
  checkIn: "2:00 pm",
  checkOut: "11:00 am",
  social: { instagram: "#", facebook: "#" },
};

export const nav = [
  { href: "/villas", label: "Villas" },
  { href: "/experiences", label: "Experiences" },
  { href: "/offers", label: "Offers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export const theme: Theme = {
  bg: "#ffffff",
  surface: "#ffffff",
  soft: "#f4e9d8", // sand
  ink: "#0d2b33",
  muted: "#4a6269",
  line: "#dbe5e4",
  accent: "#cf3f2b", // coral, 4.6:1 with white
  onAccent: "#ffffff",
  deep: "#0b5e5b", // lagoon
  onDeep: "#ffffff",
  alt: "#9fe0d6", // shallows
};
