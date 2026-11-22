import { PHOTO_REGISTRY as pine } from "../../src/templates/pine-ridge-lodge/photo-placements.ts";
import { PHOTO_REGISTRY as lumen } from "../../src/templates/lumen-lake-villas/photo-placements.ts";
import { PHOTO_REGISTRY as isla } from "../../src/templates/isla-verde-boutique/photo-placements.ts";
import { PHOTO_REGISTRY as ember } from "../../src/templates/ember-and-salt/photo-placements.ts";
import { PHOTO_REGISTRY as spa } from "../../src/templates/still-water-spa/photo-placements.ts";
import { PHOTO_REGISTRY as bloom } from "../../src/templates/bloomfield-gardens/photo-placements.ts";
import { CORAL_PHOTO_PAGES, CORAL_PHOTO_PLACEMENTS, getCoralPhotoPlacement, originalCoralPhoto } from "../../src/templates/coral-cove/photo-placements.ts";
import { HARBOR_PHOTO_PAGES, HARBOR_PHOTO_PLACEMENTS, getHarborPhotoPlacement, originalHarborPhoto } from "../../src/templates/harbor-house/photo-placements.ts";

function photoCase([template, registry]) {
  const primary = registry.placements.find(item => item.page === "home" && !item.id.startsWith("home.hero") && registry.placements.some(other => other.page !== "home" && other.photo === item.photo));
  const shared = registry.placements.find(item => item.page === "gallery" && item.photo === primary.photo) ?? registry.placements.find(item => item.page !== "home" && item.photo === primary.photo);
  const secondary = registry.placements.find(item => item.page === "home" && !item.id.startsWith("home.hero") && item.photo !== primary.photo);
  const hero = registry.placements.find(item => item.id === "home.hero" || item.id === "home.hero.winter" || item.id === "home.hero.1");
  return { template, registry, primary, shared, secondary, hero };
}
export const photoRollout = Object.entries({ "pine-ridge-lodge": pine, "lumen-lake-villas": lumen, "isla-verde-boutique": isla, "ember-and-salt": ember, "still-water-spa": spa, "bloomfield-gardens": bloom }).map(photoCase);
export const pilotPhotoCases = [
  ["coral-cove", { pages: CORAL_PHOTO_PAGES, placements: CORAL_PHOTO_PLACEMENTS, get: getCoralPhotoPlacement, original: originalCoralPhoto }],
  ["harbor-house", { pages: HARBOR_PHOTO_PAGES, placements: HARBOR_PHOTO_PLACEMENTS, get: getHarborPhotoPlacement, original: originalHarborPhoto }],
].map(photoCase);

export function selectedPhotoCases() {
  if (process.env.PHOTO_TEMPLATE && !photoRollout.some(item => item.template === process.env.PHOTO_TEMPLATE)) throw Error("Unknown PHOTO_TEMPLATE");
  return photoRollout.filter(item => !process.env.PHOTO_TEMPLATE || item.template === process.env.PHOTO_TEMPLATE);
}
