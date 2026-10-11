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
