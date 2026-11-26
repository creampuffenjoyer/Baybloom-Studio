import type { PhotoRecord } from "@/templates/_kit/photos";
import studioCollection from "./studio-collection.json";
import afterglow from "@/templates/afterglow-rental/photos.json";
import barkadas from "@/templates/barkadas/photos.json";
import bloomfield from "@/templates/bloomfield-gardens/photos.json";
import coralCove from "@/templates/coral-cove/photos.json";
import commonRoom from "@/templates/common-room/photos.json";
import emberAndSalt from "@/templates/ember-and-salt/photos.json";
import fernAndStone from "@/templates/fern-and-stone/photos.json";
import formAndField from "@/templates/form-and-field/photos.json";
import harborHouse from "@/templates/harbor-house/photos.json";
import islaVerde from "@/templates/isla-verde-boutique/photos.json";
import lumenLake from "@/templates/lumen-lake-villas/photos.json";
import pineRidge from "@/templates/pine-ridge-lodge/photos.json";
import planeAndLight from "@/templates/plane-and-light/photos.json";
import quietForm from "@/templates/quiet-form/photos.json";
import roastRow from "@/templates/roast-row/photos.json";
import rootAndKettle from "@/templates/root-and-kettle/photos.json";
import stillWater from "@/templates/still-water-spa/photos.json";
import sundayTable from "@/templates/sunday-table/photos.json";
import atrium from "@/templates/the-atrium/photos.json";

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
  "roast-row": Object.values(roastRow),
  "sunday-table": Object.values(sundayTable),
  barkadas: Object.values(barkadas),
  "the-atrium": Object.values(atrium),
  "fern-and-stone": Object.values(fernAndStone),
  "root-and-kettle": Object.values(rootAndKettle),
  "afterglow-rental": Object.values(afterglow),
  "form-and-field": Object.values(formAndField),
  "plane-and-light": Object.values(planeAndLight),
  "quiet-form": Object.values(quietForm),
  "common-room": Object.values(commonRoom),
};

/** Photography (not screenshots) for storefront art direction, by industry. */
export const INDUSTRY_COVERS: Record<string, { src: string; alt: string }> = {
  resort: { src: coralCove.hero.src, alt: coralCove.hero.alt },
  hotel: { src: islaVerde.courtyard.src, alt: islaVerde.courtyard.alt },
  restaurant: { src: emberAndSalt.logs.src, alt: emberAndSalt.logs.alt },
  spa: { src: stillWater["long-pool"].src, alt: stillWater["long-pool"].alt },
  venue: { src: bloomfield["rose-tunnel"].src, alt: bloomfield["rose-tunnel"].alt },
  creative: { src: formAndField.sculpture.src, alt: formAndField.sculpture.alt },
  fashion: { src: quietForm.look.src, alt: quietForm.look.alt },
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
  previewOnly?: boolean;
};

/** The templates in the home-page switcher, in display order. */
export const SHOWCASE: ShowcaseTemplate[] = [
  { slug: "bloomfield-gardens", title: "Bloomfield Gardens", kind: "Wedding venue", color: "#f1d5d0", light: true, line: "Couples check their date before they inquire." },
  { slug: "coral-cove", title: "Coral Cove", kind: "Beach resort", color: "#0b5e5b", light: false, line: "A boarding-pass booking bar over the lagoon." },
  { slug: "ember-and-salt", title: "Ember & Salt", kind: "Restaurant & bar", color: "#2a1015", light: false, line: "A menu set like a printed card, and table reservations." },
  { slug: "still-water-spa", title: "Still Water", kind: "Day spa", color: "#5d7b6c", light: false, line: "Treatments by ritual and calm, three-step booking." },
  { slug: "isla-verde-boutique", title: "Isla Verde", kind: "Heritage hotel", color: "#1d3a2e", light: false, line: "Arched frames, a journal and a story to tell." },
  { slug: "harbor-house", title: "Harbor House", kind: "Bed & breakfast", color: "#f5d56e", light: true, line: "Rooms as postcards and a handwritten welcome." },
  { slug: "pine-ridge-lodge", title: "Pine Ridge Lodge", kind: "Mountain lodge", color: "#c7802f", light: true, line: "Flip the whole home page between winter and summer." },
  { slug: "lumen-lake-villas", title: "Lumen Lake Villas", kind: "Lakeside villas", color: "#dfe8ee", light: true, line: "Quiet, minimal and a virtual tour of the shore." },
  { slug: "roast-row", title: "Roast Row", kind: "Specialty café", color: "#183c9b", light: false, line: "Build a multi-item pickup bag at either counter." },
  { slug: "sunday-table", title: "Sunday Table", kind: "Family restaurant", color: "#982e28", light: false, line: "Build a catering spread and see how many people it feeds." },
  { slug: "barkadas", title: "Barkadas", kind: "Vacation rental", color: "#294f3e", light: false, line: "Find a stay with enough beds and parking for the group." },
  { slug: "the-atrium", title: "The Atrium", kind: "Wedding & event venue", color: "#594237", light: false, line: "Picture a wedding under glass, then plan the day from vows to dinner." },
  ...studioCollection.map(({ slug, title, kind, color, summary }) => ({ slug, title, kind, color, light: false, line: summary })),
];

export function listedShowcase(directory: { slug: string; status: string }[]) {
  const status = new Map(directory.map(item => [item.slug, item.status]));
  return SHOWCASE.filter(item => status.has(item.slug)).map(item => ({
    ...item, previewOnly: status.get(item.slug) === "DRAFT",
  }));
}
