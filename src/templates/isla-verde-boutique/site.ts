import { makeHref, type Theme } from "../_kit/theme";

/** Where the site is mounted. The packaged template sets this to "". */
export const BASE = "/demo/isla-verde-boutique";
export const href = makeHref(BASE);

export const site = {
  name: "Isla Verde",
  tagline: "A heritage hotel on Calle Crisologo",
  phone: "+63 77 555 0188",
  email: "stay@islaverde.example",
  address: ["21 Calle Crisologo", "Vigan City, Ilocos Sur 2700", "Philippines"],
  checkIn: "3:00 pm",
  checkOut: "12:00 noon",
  social: { instagram: "#", facebook: "#" },
};

export const nav = [
  { href: "/rooms", label: "Rooms" },
  { href: "/dining", label: "Dining" },
  { href: "/events", label: "Events" },
  { href: "/story", label: "Our story" },
  { href: "/journal", label: "Journal" },
];

export const theme: Theme = {
  bg: "#f6f1e7", // ivory
  surface: "#fbf8f2",
  soft: "#ece4d4",
  ink: "#1f1d1a",
  muted: "#5d574c",
  line: "#dcd2bf",
  accent: "#1d3a2e", // verde
  onAccent: "#f6f1e7",
  deep: "#1d3a2e",
  onDeep: "#f6f1e7",
  alt: "#a8326a", // bougainvillea
};

/** The hotel's signature: photos framed in an arch, like the doorways on Calle Crisologo. */
export const arch = "rounded-t-[999px]";
