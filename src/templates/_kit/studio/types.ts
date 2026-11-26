import type { PhotoRecord } from "../photos";

export type StudioPhoto = PhotoRecord & { position?: string };
export type StudioLink = { label: string; href: string };

type SectionHeading = { id: string; title: string; eyebrow?: string; intro?: string };
export type StudioCard = {
  title: string;
  image: string;
  meta: string;
  description?: string;
  details?: string;
  link?: StudioLink;
};

export type StudioSection = SectionHeading & (
  | { type: "cards"; items: StudioCard[] }
  | { type: "gallery"; items: StudioCard[]; backdrop?: string }
  | { type: "editorial"; image?: string; detailPhoto?: string; body: string; link?: StudioLink }
  | { type: "menu"; groups: { title: string; image: string; items: { name: string; price: string; description: string }[] }[] }
  | { type: "pricing"; packages: { name: string; price: string; description: string; features: string[]; featured?: boolean }[]; link: StudioLink }
  | { type: "list"; image?: string; items: { name: string; description: string }[] }
  | { type: "links"; items: (StudioLink & { image: string })[] }
  | { type: "faq"; items: { question: string; answer: string }[] }
  | { type: "request"; options: string[]; optionLabel: string; dateLabel?: string; notesLabel: string; submitLabel: string; confirmation: string; images?: string[] }
  | { type: "note"; body: string }
);

export type SocialDesign = {
  id: string;
  format: "post" | "story";
  layout: "postcards" | "letter" | "journal" | "label" | "menu-board" | "photo-notice";
  photo: string;
  supportingPhotos?: string[];
  label: string;
  headline: string;
  caption: string;
};

export type StudioSite = {
  name: string;
  description: string;
  variant: "retreat" | "kitchen" | "events" | "agency" | "photo" | "fashion" | "living";
  theme: { paper: string; surface: string; ink: string; muted: string; line: string; accent: string; onAccent: string; deep: string; onDeep: string };
  nav: StudioLink[];
  mastheadNote?: string;
  sections: StudioSection[];
  footer: string;
  desk: { heading: string; lines: string[]; links: StudioLink[] };
  social?: SocialDesign[];
};

export function studioHref(base: string, target: string) {
  if (target.startsWith("#")) return `${base || "/"}${target}`;
  return `${base}${target}` || "/";
}
