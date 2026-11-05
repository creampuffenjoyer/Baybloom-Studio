import type { PhotoRecord } from "@/templates/_kit/photos";
import bloomfield from "@/templates/bloomfield-gardens/photos.json";
import coralCove from "@/templates/coral-cove/photos.json";
import emberAndSalt from "@/templates/ember-and-salt/photos.json";
import harborHouse from "@/templates/harbor-house/photos.json";
import islaVerde from "@/templates/isla-verde-boutique/photos.json";
import lumenLake from "@/templates/lumen-lake-villas/photos.json";
import pineRidge from "@/templates/pine-ridge-lodge/photos.json";
import stillWater from "@/templates/still-water-spa/photos.json";

/** Store-side registry of the template demos (photos used inside each demo). */
export const TEMPLATE_PHOTOS: Record<string, PhotoRecord[]> = {
  "coral-cove": Object.values(coralCove),
  "pine-ridge-lodge": Object.values(pineRidge),
  "lumen-lake-villas": Object.values(lumenLake),
  "isla-verde-boutique": Object.values(islaVerde),
  "harbor-house": Object.values(harborHouse),
  "ember-and-salt": Object.values(emberAndSalt),
  "still-water-spa": Object.values(stillWater),
  "bloomfield-gardens": Object.values(bloomfield),
};

/** Photography (not screenshots) for storefront art direction, by industry. */
export const INDUSTRY_COVERS: Record<string, { src: string; alt: string }> = {
  resort: { src: coralCove.hero.src, alt: coralCove.hero.alt },
  hotel: { src: islaVerde.courtyard.src, alt: islaVerde.courtyard.alt },
  restaurant: { src: emberAndSalt.logs.src, alt: emberAndSalt.logs.alt },
  spa: { src: stillWater["long-pool"].src, alt: stillWater["long-pool"].alt },
  venue: { src: bloomfield["rose-tunnel"].src, alt: bloomfield["rose-tunnel"].alt },
};

export type ShowcaseTemplate = {
  slug: string;
  title: string;
  kind: string;
  /** Backdrop colour, matching the catalog cover (scripts/compose-covers.mjs). */
  color: string;
  /** Whether text on `color` should be dark. */
  light: boolean;
  line: string;
};

/** The templates in the home-page switcher, in display order. */
export const SHOWCASE: ShowcaseTemplate[] = [
  { slug: "coral-cove", title: "Coral Cove", kind: "Beach resort", color: "#0b5e5b", light: false, line: "A boarding-pass booking bar over the lagoon." },
  { slug: "ember-and-salt", title: "Ember & Salt", kind: "Restaurant & bar", color: "#2a1015", light: false, line: "A menu set like a printed card, and table reservations." },
  { slug: "still-water-spa", title: "Still Water", kind: "Day spa", color: "#5d7b6c", light: false, line: "Treatments by ritual and calm, three-step booking." },
  { slug: "bloomfield-gardens", title: "Bloomfield Gardens", kind: "Wedding venue", color: "#f1d5d0", light: true, line: "Couples check their date before they inquire." },
  { slug: "isla-verde-boutique", title: "Isla Verde", kind: "Heritage hotel", color: "#1d3a2e", light: false, line: "Arched frames, a journal and a story to tell." },
  { slug: "harbor-house", title: "Harbor House", kind: "Bed & breakfast", color: "#f5d56e", light: true, line: "Rooms as postcards and a handwritten welcome." },
  { slug: "pine-ridge-lodge", title: "Pine Ridge Lodge", kind: "Mountain lodge", color: "#c7802f", light: true, line: "Flip the whole home page between winter and summer." },
  { slug: "lumen-lake-villas", title: "Lumen Lake Villas", kind: "Lakeside villas", color: "#dfe8ee", light: true, line: "Quiet, minimal and a virtual tour of the shore." },
];
