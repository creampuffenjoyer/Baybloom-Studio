import { PHOTO_REGISTRY as bloomRegistry } from "@/templates/bloomfield-gardens/photo-placements";
import { PHOTO_REGISTRY as spaRegistry } from "@/templates/still-water-spa/photo-placements";
import { PHOTO_REGISTRY as emberRegistry } from "@/templates/ember-and-salt/photo-placements";
import { PHOTO_REGISTRY as islaRegistry } from "@/templates/isla-verde-boutique/photo-placements";
import { PHOTO_REGISTRY as lumenRegistry } from "@/templates/lumen-lake-villas/photo-placements";
import { PHOTO_REGISTRY as pineRegistry } from "@/templates/pine-ridge-lodge/photo-placements";
import { z } from "zod";
import { CORAL_GALLERY_IMAGE_KEYS } from "./coral-gallery-images";
import { PINE_PHOTO_KEYS } from "./pine-photos";
import { PINE_COPY_KEYS } from "./pine-copy-keys";
import { LUMEN_PHOTO_KEYS } from "./lumen-photos";
import { LUMEN_COPY_KEYS } from "./lumen-copy-keys";
import { ISLA_PHOTO_KEYS } from "./isla-photos";
import { ISLA_COPY_KEYS } from "./isla-copy-keys";
import { EMBER_MENU_KEYS, EMBER_SECTION_KEYS, EMBER_DISH_KEYS } from "./ember-menu-keys";
import { EMBER_PHOTO_KEYS } from "./ember-photos";
import { EMBER_COPY_KEYS } from "./ember-copy-keys";
import { SPA_PHOTO_KEYS } from "./spa-photos";
import { SPA_COPY_KEYS } from "./spa-copy-keys";
import { BLOOM_PHOTO_KEYS } from "./bloom-photos";
import { BLOOM_COPY_KEYS } from "./bloom-copy-keys";
import { HOUSE_PHOTO_KEYS } from "./house-photos";
import { CORAL_PHOTO_KEYS } from "./coral-photos";
import { isCoralPhotoPlacement } from "@/templates/coral-cove/photo-placements";
import { isHarborPhotoPlacement } from "@/templates/harbor-house/photo-placements";

// Store overrides rather than copies of template content. Missing fields retain
// the template default, including its existing translations.
const shortText = z.string().trim().min(1).max(120);
const longText = z.string().trim().min(1).max(500);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const breakfastSectionSchema = z.strictObject({ title: shortText.optional(), items: z.string().trim().min(1).max(1200).optional() });
const placeSchema = z.strictObject({ name: shortText.optional(), distance: shortText.optional(), note: longText.optional() });
const harborRoomSchema = z.strictObject({
  name: shortText.optional(), postcard: longText.optional(), description: longText.optional(),
  bed: shortText.optional(), view: shortText.optional(), features: z.string().trim().min(1).max(1200).optional(),
  price: z.number().int().min(0).max(10_000_000).optional(), maxGuests: z.number().int().min(1).max(12).optional(),
});

export const harborDraftSchema = z.strictObject({
  version: z.literal(1),
  template: z.literal("harbor-house"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(isHarborPhotoPlacement)).optional(),
  housePhotoAlt: z.record(z.string(), shortText).refine(copy => Object.keys(copy).every(key => (HOUSE_PHOTO_KEYS as readonly string[]).includes(key))).optional(),
  business: z.strictObject({
    name: shortText.optional(),
    tagline: longText.optional(),
    hosts: shortText.optional(),
    phone: shortText.optional(),
    email: z.email().max(254).optional(),
    address: z.array(z.string().trim().max(120)).length(3).refine((lines) => lines.some(Boolean)).optional(),
  }),
  home: z.strictObject({
    headline: shortText.optional(),
    welcome: longText.optional(),
  }),
  theme: z.strictObject({ accent: hexColor.optional() }),
  rooms: z.strictObject({
    "lighthouse-room": harborRoomSchema.optional(),
    "captains-room": harborRoomSchema.optional(),
    "rose-room": harborRoomSchema.optional(),
    "attic-twin": harborRoomSchema.optional(),
  }).optional(),
  breakfast: z.strictObject({
    heading: shortText.optional(), intro: longText.optional(), takeaway: longText.optional(),
    morning: breakfastSectionSchema.optional(), advance: breakfastSectionSchema.optional(),
  }).optional(),
  guide: z.strictObject({
    heading: shortText.optional(), intro: longText.optional(),
    places: z.strictObject({
      "naidi-hills": placeSchema.optional(), "vayang-hills": placeSchema.optional(),
      "valugan-beach": placeSchema.optional(), "honesty-coffee": placeSchema.optional(),
      "chawa-view": placeSchema.optional(), "kusina": placeSchema.optional(),
    }).optional(),
  }).optional(),
});

export type HarborDraft = z.infer<typeof harborDraftSchema>;
const sharedDraftSchema = harborDraftSchema.omit({ rooms: true, breakfast: true, guide: true, housePhotoAlt: true, photoPlacements: true });
const coralVillaSchema = z.strictObject({
  name: shortText.optional(), short: longText.optional(), description: z.string().trim().min(1).max(1600).optional(),
  beds: shortText.optional(), view: shortText.optional(), amenities: z.string().trim().min(1).max(1200).optional(),
  price: z.number().int().min(0).max(10_000_000).optional(), size: z.number().int().min(1).max(100_000).optional(),
  maxGuests: z.number().int().min(1).max(5).optional(),
});
const coralExperienceSchema = z.strictObject({ name: shortText.optional(), summary: longText.optional(), detail: longText.optional(), duration: shortText.optional(), price: shortText.optional() });
const coralOfferSchema = z.strictObject({ name: shortText.optional(), headline: shortText.optional(), body: longText.optional(), includes: z.string().trim().min(1).max(1200).optional(), terms: longText.optional() });
const coralFaqSchema = z.strictObject({ question: shortText.optional(), answer: longText.optional() });
const coralTravelStepSchema = z.strictObject({ title: shortText.optional(), text: longText.optional() });
const coralReviewSchema = z.strictObject({ quote: longText.optional(), name: shortText.optional(), from: shortText.optional(), stay: shortText.optional() });
export const coralDraftSchema = sharedDraftSchema.extend({ template: z.literal("coral-cove"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(isCoralPhotoPlacement)).optional(),
  coralPhotoAlt: z.record(z.string(), shortText).refine(copy => Object.keys(copy).every(key => (CORAL_PHOTO_KEYS as readonly string[]).includes(key))).optional(), villas: z.strictObject({
  "overwater-villa": coralVillaSchema.optional(), "garden-pool-villa": coralVillaSchema.optional(),
  "beachfront-bungalow": coralVillaSchema.optional(), "lagoon-family-villa": coralVillaSchema.optional(),
}).optional(), experiences: z.strictObject({ "house-reef": coralExperienceSchema.optional(), "island-hopping": coralExperienceSchema.optional(), diving: coralExperienceSchema.optional(), sailing: coralExperienceSchema.optional(), spa: coralExperienceSchema.optional(), "sandbar-dinner": coralExperienceSchema.optional() }).optional(), offers: z.strictObject({ "stay-longer": coralOfferSchema.optional(), honeymoon: coralOfferSchema.optional(), "dive-and-stay": coralOfferSchema.optional() }).optional(), galleryAlt: z.partialRecord(z.enum(CORAL_GALLERY_IMAGE_KEYS), shortText).optional(), contactFaqs: z.strictObject({ gettingHere: coralFaqSchema.optional(), breakfast: coralFaqSchema.optional(), cancellation: coralFaqSchema.optional(), children: coralFaqSchema.optional() }).optional(), homeSections: z.strictObject({ travelHeading: shortText.optional(), travel: z.strictObject({ first: coralTravelStepSchema.optional(), second: coralTravelStepSchema.optional(), third: coralTravelStepSchema.optional() }).optional(), reefHeading: shortText.optional(), reefText: longText.optional(), useGalleryReef: z.boolean().optional(), useGalleryStrip: z.boolean().optional() }).optional(), reviews: z.strictObject({ first: coralReviewSchema.optional(), second: coralReviewSchema.optional(), third: coralReviewSchema.optional() }).optional(), reviewsHidden: z.boolean().optional() });
export type CoralDraft = z.infer<typeof coralDraftSchema>;
const pineRoomSchema = z.strictObject({ name: shortText.optional(), short: longText.optional(), description: z.string().trim().min(1).max(1600).optional(), beds: shortText.optional(), features: z.string().trim().min(1).max(1200).optional(), price: z.number().int().min(0).max(10000000).optional(), size: z.number().int().min(1).max(100000).optional(), maxGuests: z.number().int().min(1).max(6).optional() });
const pineActivitySchema = z.strictObject({ name: shortText.optional(), detail: longText.optional(), level: shortText.optional(), duration: shortText.optional() });
const pineMenuSchema = z.strictObject({ name: shortText.optional(), detail: longText.optional(), price: z.number().int().min(0).max(10000000).optional() });
const pinePostSchema = z.strictObject({ title: shortText.optional(), dek: longText.optional(), body: z.string().trim().min(1).max(3000).optional(), date: z.iso.date().optional() });
const pineSeasonSchema = z.strictObject({ headline: shortText.optional(), lede: longText.optional(), months: shortText.optional() });
const pineExtraSchema = z.strictObject({ name: shortText.optional(), price: z.number().int().min(0).max(10000000).optional() });
const pinePageSchema = z.strictObject({ heading: shortText.optional(), intro: longText.optional() });
export const pineDraftSchema = sharedDraftSchema.extend({ template: z.literal("pine-ridge-lodge"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(pineRegistry.is)).optional(),
  pineRooms: z.strictObject({ "trapper-twin": pineRoomSchema.optional(), "hearth-room": pineRoomSchema.optional(), "family-loft": pineRoomSchema.optional(), "ridge-chalet": pineRoomSchema.optional() }).optional(),
  pineActivities: z.strictObject({ "ridge-ski": pineActivitySchema.optional(), backcountry: pineActivitySchema.optional(), snowshoe: pineActivitySchema.optional(), "lake-hike": pineActivitySchema.optional(), paddle: pineActivitySchema.optional(), wildflowers: pineActivitySchema.optional(), larch: pineActivitySchema.optional() }).optional(),
  pineMenu: z.strictObject({ first: pineMenuSchema.optional(), second: pineMenuSchema.optional(), third: pineMenuSchema.optional(), fourth: pineMenuSchema.optional(), fifth: pineMenuSchema.optional() }).optional(),
  pinePosts: z.strictObject({ "how-to-dress-for-a-bluebird-day": pinePostSchema.optional(), "larch-season-is-coming": pinePostSchema.optional() }).optional(),
  pineSeasons: z.strictObject({ winter: pineSeasonSchema.optional(), summer: pineSeasonSchema.optional() }).optional(),
  pineExtras: z.strictObject({ lift: pineExtraSchema.optional(), rental: pineExtraSchema.optional(), dinner: pineExtraSchema.optional() }).optional(),
  pineStayTimes: z.strictObject({ checkIn: shortText.optional(), checkOut: shortText.optional() }).optional(),
  pinePages: z.strictObject({ rooms: pinePageSchema.optional(), activities: pinePageSchema.optional(), dining: pinePageSchema.optional(), journal: pinePageSchema.optional(), contact: z.strictObject({ heading: shortText.optional(), driving: longText.optional(), shuttle: longText.optional(), rentalHeading: shortText.optional() }).optional() }).optional(),
  pinePhotoAlt: z.partialRecord(z.enum(PINE_PHOTO_KEYS as [string, ...string[]]), shortText).optional(),
  pineCopy: z.record(z.string(), longText).refine((copy) => Object.keys(copy).every((key) => (PINE_COPY_KEYS as readonly string[]).includes(key))).optional(),
});
export type PineDraft = z.infer<typeof pineDraftSchema>;
const lumenVillaSchema = z.strictObject({ name: shortText.optional(), line: longText.optional(), description: z.string().trim().min(1).max(1600).optional(), price: z.number().int().min(0).max(10000000).optional(), size: z.number().int().min(1).max(100000).optional(), maxGuests: z.number().int().min(1).max(5).optional(), bedrooms: z.number().int().min(1).max(20).optional(), setting: z.enum(["Waterfront", "Garden", "Over water"]).optional(), jetty: z.boolean().optional(), sauna: z.boolean().optional() });
const lumenExperienceSchema = z.strictObject({ name: shortText.optional(), when: shortText.optional(), price: shortText.optional(), text: longText.optional() });
const lumenExtraSchema = z.strictObject({ name: shortText.optional(), price: z.number().int().min(0).max(10000000).optional() });
export const lumenDraftSchema = sharedDraftSchema.extend({ template: z.literal("lumen-lake-villas"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(lumenRegistry.is)).optional(),
  lumenVillas: z.strictObject({ "shore-villa": lumenVillaSchema.optional(), "garden-villa": lumenVillaSchema.optional(), "family-villa": lumenVillaSchema.optional(), boathouse: lumenVillaSchema.optional() }).optional(),
  lumenExperiences: z.strictObject({ kayak: lumenExperienceSchema.optional(), cruise: lumenExperienceSchema.optional(), dinner: lumenExperienceSchema.optional(), sauna: lumenExperienceSchema.optional() }).optional(),
  lumenExtras: z.strictObject({ breakfast: lumenExtraSchema.optional(), sauna: lumenExtraSchema.optional(), transfer: lumenExtraSchema.optional() }).optional(),
  lumenTour: z.strictObject({ jetty: shortText.optional(), shore: shortText.optional(), sauna: shortText.optional(), boathouse: shortText.optional() }).optional(),
  lumenStayTimes: z.strictObject({ checkIn: shortText.optional(), checkOut: shortText.optional() }).optional(),
  lumenPhotoAlt: z.partialRecord(z.enum(LUMEN_PHOTO_KEYS as [string, ...string[]]), shortText).optional(),
  lumenCopy: z.record(z.string(), longText).refine((copy) => Object.keys(copy).every((key) => (LUMEN_COPY_KEYS as readonly string[]).includes(key))).optional(),
});
export type LumenDraft = z.infer<typeof lumenDraftSchema>;
const islaRoomSchema = z.strictObject({ name: shortText.optional(), short: longText.optional(), description: z.string().trim().min(1).max(1600).optional(), bed: shortText.optional(), outlook: shortText.optional(), details: z.string().trim().min(1).max(1200).optional(), price: z.number().int().min(0).max(10000000).optional(), size: z.number().int().min(1).max(100000).optional(), maxGuests: z.number().int().min(1).max(4).optional() });
const islaPostSchema = z.strictObject({ title: shortText.optional(), dek: longText.optional(), body: z.string().trim().min(1).max(3000).optional(), date: z.iso.date().optional(), minutes: z.number().int().min(1).max(1000).optional() });
const islaMenuSchema = z.strictObject({ name: shortText.optional(), detail: longText.optional() });
const islaSpaceSchema = z.strictObject({ name: shortText.optional(), capacity: shortText.optional(), note: longText.optional() });
const islaExtraSchema = z.strictObject({ name: shortText.optional(), price: z.number().int().min(0).max(10000000).optional() });
const islaChapterSchema = z.strictObject({ year: shortText.optional(), text: longText.optional() });
export const islaDraftSchema = sharedDraftSchema.extend({ template: z.literal("isla-verde-boutique"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(islaRegistry.is)).optional(),
  islaRooms: z.strictObject({ "casa-room": islaRoomSchema.optional(), "courtyard-suite": islaRoomSchema.optional(), "pool-suite": islaRoomSchema.optional(), "mansion-suite": islaRoomSchema.optional() }).optional(),
  islaPosts: z.strictObject({ "a-morning-on-calle-crisologo": islaPostSchema.optional(), "restoring-the-capiz-windows": islaPostSchema.optional(), "the-longganisa-question": islaPostSchema.optional() }).optional(),
  islaMenu: z.strictObject({ first: islaMenuSchema.optional(), second: islaMenuSchema.optional(), third: islaMenuSchema.optional(), fourth: islaMenuSchema.optional(), fifth: islaMenuSchema.optional() }).optional(),
  islaSpaces: z.strictObject({ first: islaSpaceSchema.optional(), second: islaSpaceSchema.optional(), third: islaSpaceSchema.optional() }).optional(),
  islaExtras: z.strictObject({ airport: islaExtraSchema.optional(), kalesa: islaExtraSchema.optional(), dinner: islaExtraSchema.optional() }).optional(),
  islaStory: z.strictObject({ foundingYear: shortText.optional(), chapters: z.strictObject({ first: islaChapterSchema.optional(), second: islaChapterSchema.optional(), third: islaChapterSchema.optional(), fourth: islaChapterSchema.optional(), fifth: islaChapterSchema.optional() }).optional() }).optional(),
  islaStayTimes: z.strictObject({ checkIn: shortText.optional(), checkOut: shortText.optional() }).optional(),
  islaPhotoAlt: z.partialRecord(z.enum(ISLA_PHOTO_KEYS as [string, ...string[]]), shortText).optional(),
  islaCopy: z.record(z.string(), longText).refine((copy) => Object.keys(copy).every((key) => (ISLA_COPY_KEYS as readonly string[]).includes(key))).optional(),
});
export type IslaDraft = z.infer<typeof islaDraftSchema>;
const emberMenuSchema = z.strictObject({ label: shortText.optional(), served: shortText.optional() });
const emberSectionSchema = z.strictObject({ title: shortText.optional(), intro: longText.optional() });
const emberDishSchema = z.strictObject({ name: shortText.optional(), detail: longText.optional(), price: z.number().int().min(0).max(10000000).optional(), note: shortText.optional(), diet: z.array(z.enum(["v", "vg", "gf", "df"])).max(4).refine((items) => new Set(items).size === items.length).optional() });
const emberSpaceSchema = z.strictObject({ name: shortText.optional(), seats: shortText.optional(), standing: shortText.optional(), description: longText.optional(), minimum: z.number().int().min(0).max(10000000).optional() });
const emberHoursSchema = z.strictObject({ days: shortText.optional(), time: shortText.optional() });
const emberReviewSchema = z.strictObject({ quote: longText.optional(), source: shortText.optional() });
const emberSignatureSchema = z.strictObject({ name: shortText.optional(), line: longText.optional() });
export const emberDraftSchema = sharedDraftSchema.extend({ template: z.literal("ember-and-salt"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(emberRegistry.is)).optional(),
  emberCopy: z.record(z.string(), longText).refine((copy) => Object.keys(copy).every((key) => (EMBER_COPY_KEYS as readonly string[]).includes(key))).optional(),
  emberStory: z.strictObject({ heading: shortText.optional(), introduction: longText.optional(), sourcing: longText.optional(), chapters: z.strictObject({ first: z.strictObject({ year: shortText.optional(), text: longText.optional() }).optional(), second: z.strictObject({ year: shortText.optional(), text: longText.optional() }).optional(), third: z.strictObject({ year: shortText.optional(), text: longText.optional() }).optional(), fourth: z.strictObject({ year: shortText.optional(), text: longText.optional() }).optional() }).optional() }).optional(),
  emberMenus: z.record(z.string(), emberMenuSchema).refine((entries) => Object.keys(entries).every((key) => EMBER_MENU_KEYS.includes(key))).optional(),
  emberSections: z.record(z.string(), emberSectionSchema).refine((entries) => Object.keys(entries).every((key) => EMBER_SECTION_KEYS.includes(key))).optional(),
  emberDishes: z.record(z.string(), emberDishSchema).refine((entries) => Object.keys(entries).every((key) => EMBER_DISH_KEYS.includes(key))).optional(),
  emberSpaces: z.strictObject({ "back-room": emberSpaceSchema.optional(), "chefs-counter": emberSpaceSchema.optional(), "full-house": emberSpaceSchema.optional() }).optional(),
  emberHours: z.strictObject({ first: emberHoursSchema.optional(), second: emberHoursSchema.optional(), third: emberHoursSchema.optional(), fourth: emberHoursSchema.optional() }).optional(),
  emberPress: z.strictObject({ first: emberReviewSchema.optional(), second: emberReviewSchema.optional(), third: emberReviewSchema.optional() }).optional(),
  emberPressHidden: z.boolean().optional(),
  emberSignatures: z.strictObject({ first: emberSignatureSchema.optional(), second: emberSignatureSchema.optional(), third: emberSignatureSchema.optional() }).optional(),
  emberPhotoAlt: z.partialRecord(z.enum(EMBER_PHOTO_KEYS as [string, ...string[]]), shortText).optional(),
});
export type EmberDraft = z.infer<typeof emberDraftSchema>;
const spaTreatmentSchema = z.strictObject({ name: shortText.optional(), summary: longText.optional(), description: z.string().trim().min(1).max(1600).optional(), includes: z.string().trim().min(1).max(1200).optional(), goodFor: longText.optional(), prices: z.strictObject({ first: z.number().int().min(0).max(10000000).optional(), second: z.number().int().min(0).max(10000000).optional() }).optional() });
const spaPackageSchema = z.strictObject({ name: shortText.optional(), minutes: z.number().int().min(1).max(1440).optional(), price: z.number().int().min(0).max(10000000).optional(), items: z.string().trim().min(1).max(1200).optional() });
const spaPersonSchema = z.strictObject({ name: shortText.optional(), craft: shortText.optional(), years: z.number().int().min(0).max(100).optional() });
const spaReviewSchema = z.strictObject({ name: shortText.optional(), when: shortText.optional(), quote: longText.optional() });
const spaMembershipSchema = z.strictObject({ name: shortText.optional(), price: z.number().int().min(0).max(10000000).optional(), per: shortText.optional(), perks: z.string().trim().min(1).max(1200).optional() });
export const stillWaterDraftSchema = sharedDraftSchema.extend({ template: z.literal("still-water-spa"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(spaRegistry.is)).optional(),
  spaCopy: z.record(z.string(), longText).refine(copy => Object.keys(copy).every(key => (SPA_COPY_KEYS as readonly string[]).includes(key))).optional(),
  spaPhotoAlt: z.record(z.string(), shortText).refine((copy) => Object.keys(copy).every(key => (SPA_PHOTO_KEYS as readonly string[]).includes(key))).optional(),
  spaTreatments: z.strictObject({ hilot: spaTreatmentSchema.optional(), "deep-tissue": spaTreatmentSchema.optional(), "hot-stone": spaTreatmentSchema.optional(), "botanical-facial": spaTreatmentSchema.optional(), "coffee-scrub": spaTreatmentSchema.optional(), "eucalyptus-wrap": spaTreatmentSchema.optional(), "thermal-circuit": spaTreatmentSchema.optional(), "private-soak": spaTreatmentSchema.optional() }).optional(),
  spaPackages: z.strictObject({ first: spaPackageSchema.optional(), second: spaPackageSchema.optional(), third: spaPackageSchema.optional() }).optional(),
  spaTherapists: z.strictObject({ first: spaPersonSchema.optional(), second: spaPersonSchema.optional(), third: spaPersonSchema.optional(), fourth: spaPersonSchema.optional() }).optional(),
  spaReviews: z.strictObject({ first: spaReviewSchema.optional(), second: spaReviewSchema.optional() }).optional(),
  spaHours: z.strictObject({ first: z.strictObject({ days: shortText.optional(), time: shortText.optional() }).optional(), second: z.strictObject({ days: shortText.optional(), time: shortText.optional() }).optional() }).optional(),
  spaMemberships: z.strictObject({ first: spaMembershipSchema.optional(), second: spaMembershipSchema.optional() }).optional(),
  spaReviewsHidden: z.boolean().optional(),
});
export type StillWaterDraft = z.infer<typeof stillWaterDraftSchema>;
const bloomSpaceSchema = z.strictObject({ name: shortText.optional(), kind: shortText.optional(), short: longText.optional(), description: z.string().trim().min(1).max(1600).optional(), bestFor: z.string().trim().min(1).max(1200).optional(), ceremony: z.number().int().min(0).max(100000).optional(), dinner: z.number().int().min(0).max(100000).optional(), standing: z.number().int().min(0).max(100000).optional() });
const bloomPackageSchema = z.strictObject({ name: shortText.optional(), price: z.number().int().min(0).max(100000000).optional(), guests: shortText.optional(), blurb: longText.optional(), includes: z.string().trim().min(1).max(1200).optional() });
const bloomFaqSchema = z.strictObject({ question: shortText.optional(), answer: longText.optional() });
const bloomTimelineSchema = z.strictObject({ when: shortText.optional(), what: longText.optional() });
export const bloomfieldDraftSchema = sharedDraftSchema.extend({ template: z.literal("bloomfield-gardens"),
  photoPlacements: z.record(z.string(), z.strictObject({ alt: shortText.optional(), original: z.boolean().optional() })).refine(items => Object.keys(items).every(bloomRegistry.is)).optional(),
  bloomCopy: z.record(z.string(), longText).refine(copy => Object.keys(copy).every(key => (BLOOM_COPY_KEYS as readonly string[]).includes(key))).optional(),
  bloomSpaces: z.strictObject({ "the-lawn": bloomSpaceSchema.optional(), "the-glasshouse": bloomSpaceSchema.optional(), "the-barn": bloomSpaceSchema.optional(), "the-rose-walk": bloomSpaceSchema.optional(), "the-ruin": bloomSpaceSchema.optional() }).optional(),
  bloomPackages: z.strictObject({ first: bloomPackageSchema.optional(), second: bloomPackageSchema.optional(), third: bloomPackageSchema.optional() }).optional(),
  bloomFaqs: z.strictObject({ first: bloomFaqSchema.optional(), second: bloomFaqSchema.optional(), third: bloomFaqSchema.optional(), fourth: bloomFaqSchema.optional(), fifth: bloomFaqSchema.optional(), sixth: bloomFaqSchema.optional() }).optional(),
  bloomTimeline: z.strictObject({ first: bloomTimelineSchema.optional(), second: bloomTimelineSchema.optional(), third: bloomTimelineSchema.optional(), fourth: bloomTimelineSchema.optional() }).optional(),
  bloomReviews: z.strictObject({ first: spaReviewSchema.optional(), second: spaReviewSchema.optional() }).optional(),
  bloomReviewsHidden: z.boolean().optional(), viewings: shortText.optional(),
  bloomPhotoAlt: z.record(z.string(), shortText).refine(copy => Object.keys(copy).every(key => (BLOOM_PHOTO_KEYS as readonly string[]).includes(key))).optional(),
});
export type BloomfieldDraft = z.infer<typeof bloomfieldDraftSchema>;
export type PersonalizationDraft = HarborDraft | CoralDraft | PineDraft | LumenDraft | IslaDraft | EmberDraft | StillWaterDraft | BloomfieldDraft;
export const parseCoralDraft = (value: unknown) => coralDraftSchema.safeParse(value);
export const parsePineDraft = (value: unknown) => pineDraftSchema.safeParse(value);
export const parseLumenDraft = (value: unknown) => lumenDraftSchema.safeParse(value);
export const parseIslaDraft = (value: unknown) => islaDraftSchema.safeParse(value);
export const parseEmberDraft = (value: unknown) => emberDraftSchema.safeParse(value);
export const parseStillWaterDraft = (value: unknown) => stillWaterDraftSchema.safeParse(value);
export const parseBloomfieldDraft = (value: unknown) => bloomfieldDraftSchema.safeParse(value);

export function emptyHarborDraft(): HarborDraft {
  return { version: 1, template: "harbor-house", business: {}, home: {}, theme: {} };
}

/** Validate untrusted input before saving or rendering a draft. */
export function parseHarborDraft(value: unknown) {
  return harborDraftSchema.safeParse(value);
}

export function emptyDraft(template: PersonalizationDraft["template"]): PersonalizationDraft {
  return { version: 1, template, business: {}, home: {}, theme: {} };
}

export function parseDraft(value: unknown, template: PersonalizationDraft["template"]) {
  return (template === "harbor-house" ? harborDraftSchema : template === "coral-cove" ? coralDraftSchema : template === "pine-ridge-lodge" ? pineDraftSchema : template === "lumen-lake-villas" ? lumenDraftSchema : template === "isla-verde-boutique" ? islaDraftSchema : template === "ember-and-salt" ? emberDraftSchema : template === "still-water-spa" ? stillWaterDraftSchema : bloomfieldDraftSchema).safeParse(value);
}
