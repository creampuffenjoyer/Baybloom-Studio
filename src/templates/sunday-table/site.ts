import { makeHref, type Theme } from "../_kit/theme";

export const BASE = "/demo/sunday-table";
export const href = makeHref(BASE);

export const site = {
  name: "Sunday Table",
  location: "Kapitolyo, Pasig City",
  description: "A Filipino family restaurant in Kapitolyo serving shared plates and party trays.",
  hours: "Tuesday–Sunday, 11 am–9 pm",
  neighborhood: "Kapitolyo, Pasig City",
};

export const theme: Theme = {
  bg: "#fbf1df",
  surface: "#fff9ef",
  soft: "#f1dfc6",
  ink: "#312319",
  muted: "#685343",
  line: "#baa88d",
  accent: "#982e28",
  onAccent: "#fff5e8",
  deep: "#3a482d",
  onDeep: "#fff4df",
  alt: "#e6b446",
};
