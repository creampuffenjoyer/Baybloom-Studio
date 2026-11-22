import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyHarborDraft, parseHarborDraft, emptyDraft, parseDraft } from "../src/lib/personalization/harbor-draft.ts";

test("Bloomfield validates space capacities, package prices and known photos", () => {
  const draft = { ...emptyDraft("bloomfield-gardens"), bloomSpaces: { "the-lawn": { name: "Garden Lawn", ceremony: 120 } }, bloomPackages: { first: { price: 125000 } }, bloomPhotoAlt: { lawn: "Our lawn" } };
  assert.equal(parseDraft(draft, "bloomfield-gardens").success, true);
  assert.equal(parseDraft({ ...draft, bloomSpaces: { unknown: { name: "No" } } }, "bloomfield-gardens").success, false);
  assert.equal(parseDraft({ ...draft, bloomSpaces: { "the-lawn": { ceremony: -1 } } }, "bloomfield-gardens").success, false);
  assert.equal(parseDraft({ ...draft, bloomPhotoAlt: { unknown: "No" } }, "bloomfield-gardens").success, false);
});

test("Still Water validates treatment, package and staff overrides", () => {
  const draft = { ...emptyDraft("still-water-spa"), spaTreatments: { hilot: { name: "Garden massage", prices: { first: 2800 } } }, spaPackages: { first: { name: "Garden afternoon", minutes: 120 } }, spaTherapists: { first: { name: "Alex", years: 3 } }, spaReviews: { first: { quote: "A wonderful visit." } } };
  assert.equal(parseDraft(draft, "still-water-spa").success, true);
  assert.equal(parseDraft({ ...draft, spaTreatments: { unknown: { name: "No" } } }, "still-water-spa").success, false);
  assert.equal(parseDraft({ ...draft, spaTreatments: { hilot: { prices: { first: -1 } } } }, "still-water-spa").success, false);
});

test("a draft can contain validated Harbor House overrides", () => {
  const draft = emptyHarborDraft();
  draft.business.name = "  Bay House  ";
  draft.home.headline = "A quieter kind of stay";
  draft.theme.accent = "#24557f";
  const result = parseHarborDraft(draft);
  assert.equal(result.success, true);
  assert.equal(result.data.business.name, "Bay House");
});

test("Coral and Harbor drafts cannot be confused", () => {
  const coral = emptyDraft("coral-cove");
  coral.business.name = "My island resort";
  assert.equal(parseDraft(coral, "coral-cove").success, true);
  assert.equal(parseDraft(coral, "harbor-house").success, false);
  assert.equal(parseDraft(emptyHarborDraft(), "coral-cove").success, false);
  const pine = emptyDraft("pine-ridge-lodge");
  assert.equal(parseDraft(pine, "pine-ridge-lodge").success, true);
  assert.equal(parseDraft(pine, "coral-cove").success, false);
  assert.equal(parseDraft(coral, "pine-ridge-lodge").success, false);
  const lumen = emptyDraft("lumen-lake-villas");
  assert.equal(parseDraft(lumen, "lumen-lake-villas").success, true);
  assert.equal(parseDraft(pine, "lumen-lake-villas").success, false);
  assert.equal(parseDraft(lumen, "harbor-house").success, false);
  const isla = emptyDraft("isla-verde-boutique");
  assert.equal(parseDraft(isla, "isla-verde-boutique").success, true);
  assert.equal(parseDraft(lumen, "isla-verde-boutique").success, false);
  assert.equal(parseDraft(isla, "lumen-lake-villas").success, false);
  const ember = emptyDraft("ember-and-salt");
  assert.equal(parseDraft(ember, "ember-and-salt").success, true);
  assert.equal(parseDraft(isla, "ember-and-salt").success, false);
  assert.equal(parseDraft(ember, "isla-verde-boutique").success, false);
  const spa = emptyDraft("still-water-spa");
  assert.equal(parseDraft(spa, "still-water-spa").success, true);
  assert.equal(parseDraft(ember, "still-water-spa").success, false);
  assert.equal(parseDraft(spa, "ember-and-salt").success, false);
  const bloomfield = emptyDraft("bloomfield-gardens");
  assert.equal(parseDraft(bloomfield, "bloomfield-gardens").success, true);
  assert.equal(parseDraft(spa, "bloomfield-gardens").success, false);
  assert.equal(parseDraft(bloomfield, "still-water-spa").success, false);
});

test("Coral villa overrides validate fixed villa keys and booking limits", () => {
  const draft = { ...emptyDraft("coral-cove"), villas: { "overwater-villa": { name: "Reef Suite", price: 0, maxGuests: 5, description: "First paragraph\nSecond paragraph" } } };
  assert.equal(parseDraft(draft, "coral-cove").success, true);
  assert.equal(parseDraft({ ...draft, villas: { unknown: { name: "Oops" } } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, villas: { "overwater-villa": { maxGuests: 6 } } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, villas: { "overwater-villa": { price: -1 } } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, experiences: { "house-reef": { name: "Reef discovery" } } }, "coral-cove").success, true);
  assert.equal(parseDraft({ ...draft, experiences: { unknown: { name: "Oops" } } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, offers: { honeymoon: { headline: "Your escape", includes: "Breakfast\nDinner" } }, galleryAlt: { hero: "Sunset at the cove" } }, "coral-cove").success, true);
  assert.equal(parseDraft({ ...draft, offers: { unknown: { name: "Oops" } } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, galleryAlt: { unknown: "Oops" } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, contactFaqs: { cancellation: { question: "Can I cancel?", answer: "Contact us for details." } } }, "coral-cove").success, true);
  assert.equal(parseDraft({ ...draft, contactFaqs: { unknown: { question: "Oops" } } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, homeSections: { reefHeading: "Life by the lake", travel: { first: { title: "Arrive", text: "Meet us here." } } } }, "coral-cove").success, true);
  assert.equal(parseDraft({ ...draft, homeSections: { travel: { fourth: { title: "Oops" } } } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, homeSections: { useGalleryReef: true, useGalleryStrip: false } }, "coral-cove").success, true);
  assert.equal(parseDraft({ ...draft, homeSections: { useGalleryReef: "yes" } }, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, reviews: { first: { quote: "A wonderful stay", name: "Guest" } }, reviewsHidden: true }, "coral-cove").success, true);
  assert.equal(parseDraft({ ...draft, reviews: { fourth: { name: "Oops" } } }, "coral-cove").success, false);
});

test("Pine Ridge draft validates room, activity, menu and article overrides", () => {
  const draft = { ...emptyDraft("pine-ridge-lodge"), pineRooms: { "trapper-twin": { name: "Forest Room", price: 250, maxGuests: 6 } }, pineActivities: { "ridge-ski": { name: "Mountain adventure" } }, pineMenu: { first: { price: 0 } }, pinePosts: { "larch-season-is-coming": { title: "Autumn" } } };
  assert.equal(parseDraft(draft, "pine-ridge-lodge").success, true);
  assert.equal(parseDraft({ ...draft, pineRooms: { unknown: { name: "Bad" } } }, "pine-ridge-lodge").success, false);
  assert.equal(parseDraft({ ...draft, pineRooms: { "trapper-twin": { maxGuests: 7 } } }, "pine-ridge-lodge").success, false);
  assert.equal(parseDraft(draft, "coral-cove").success, false);
  assert.equal(parseDraft({ ...draft, pineSeasons: { winter: { months: "December to March" } }, pinePhotoAlt: { "twin-room": "Bedroom" } }, "pine-ridge-lodge").success, true);
  assert.equal(parseDraft({ ...draft, pinePhotoAlt: { invalid: "Bad" } }, "pine-ridge-lodge").success, false);
  assert.equal(parseDraft({ ...draft, pineCopy: { "Supper at the long table": "Dinner by the fire" } }, "pine-ridge-lodge").success, true);
  assert.equal(parseDraft({ ...draft, pineCopy: { "not an editable string": "Bad" } }, "pine-ridge-lodge").success, false);
  assert.equal(parseDraft({ ...draft, pineExtras: { rental: { name: "Equipment", price: 80 } } }, "pine-ridge-lodge").success, true);
  assert.equal(parseDraft({ ...draft, pineExtras: { rental: { price: -1 } } }, "pine-ridge-lodge").success, false);
  assert.equal(parseDraft({ ...draft, pinePosts: { "larch-season-is-coming": { date: "2026-09-02" } } }, "pine-ridge-lodge").success, true);
  assert.equal(parseDraft({ ...draft, pinePosts: { "larch-season-is-coming": { date: "invalid" } } }, "pine-ridge-lodge").success, false);
});

test("Lumen draft validates villas, experiences, extras, tours and photos", () => {
  const draft = { ...emptyDraft("lumen-lake-villas"), lumenVillas: { "shore-villa": { name: "Lake Suite", price: 4500, maxGuests: 5, jetty: false } }, lumenExperiences: { kayak: { name: "Morning paddle" } }, lumenExtras: { breakfast: { price: 300 } }, lumenTour: { jetty: "Lakeside jetty" }, lumenPhotoAlt: { villas: "Our lake villa" }, lumenCopy: { "Compare the villas": "Explore the stays" } };
  assert.equal(parseDraft(draft, "lumen-lake-villas").success, true);
  assert.equal(parseDraft({ ...draft, lumenVillas: { "shore-villa": { maxGuests: 6 } } }, "lumen-lake-villas").success, false);
  assert.equal(parseDraft({ ...draft, lumenPhotoAlt: { invalid: "Oops" } }, "lumen-lake-villas").success, false);
  assert.equal(parseDraft(draft, "pine-ridge-lodge").success, false);
});

test("Isla Verde draft validates rooms, stories, dining, events and photos", () => {
  const draft = { ...emptyDraft("isla-verde-boutique"), islaRooms: { "casa-room": { name: "Garden Room", price: 8500, maxGuests: 4 } }, islaMenu: { first: { name: "Breakfast plate" } }, islaSpaces: { first: { capacity: "Up to 60" } }, islaPosts: { "a-morning-on-calle-crisologo": { title: "A quiet morning", date: "2026-09-14" } }, islaStory: { foundingYear: "1920", chapters: { first: { year: "1920", text: "Our story begins." } } }, islaPhotoAlt: { "carved-bed": "Garden bedroom" } };
  assert.equal(parseDraft(draft, "isla-verde-boutique").success, true);
  assert.equal(parseDraft({ ...draft, islaRooms: { "casa-room": { maxGuests: 5 } } }, "isla-verde-boutique").success, false);
  assert.equal(parseDraft({ ...draft, islaPhotoAlt: { unknown: "Bad" } }, "isla-verde-boutique").success, false);
  assert.equal(parseDraft({ ...draft, islaCopy: { "The story of the house": "Our story" }, islaStayTimes: { checkIn: "3 pm" } }, "isla-verde-boutique").success, true);
  assert.equal(parseDraft({ ...draft, islaCopy: { "unknown wording": "Bad" } }, "isla-verde-boutique").success, false);
  assert.equal(parseDraft(draft, "lumen-lake-villas").success, false);
});

test("Ember draft validates menu keys, dietary labels and restaurant details", () => {
  const draft = { ...emptyDraft("ember-and-salt"), emberDishes: { "dinner:0:0": { name: "Garden plate", diet: [] } }, emberMenus: { dinner: { served: "Evenings" } }, emberSpaces: { "back-room": { name: "Garden Room", minimum: 30000 } }, emberHours: { first: { time: "5 pm – 10 pm" } }, emberPressHidden: true, emberPhotoAlt: { room: "Our dining room" } };
  assert.equal(parseDraft(draft, "ember-and-salt").success, true);
  assert.equal(parseDraft({ ...draft, emberDishes: { "dinner:99:0": { name: "Invalid" } } }, "ember-and-salt").success, false);
  assert.equal(parseDraft({ ...draft, emberDishes: { "dinner:0:0": { diet: ["gf", "gf"] } } }, "ember-and-salt").success, false);
  assert.equal(parseDraft({ ...draft, emberPhotoAlt: { unknown: "Bad" } }, "ember-and-salt").success, false);
});

test("drafts reject unsupported versions, fields and unsafe colors", () => {
  const draft = emptyHarborDraft();
  assert.equal(parseHarborDraft({ ...draft, version: 2 }).success, false);
  assert.equal(parseHarborDraft({ ...draft, template: "other" }).success, false);
  assert.equal(parseHarborDraft({ ...draft, business: { name: " " } }).success, false);
  assert.equal(parseHarborDraft({ ...draft, theme: { accent: "url(example)" } }).success, false);
  assert.equal(parseHarborDraft({ ...draft, extra: true }).success, false);
});

test("Harbor drafts validate address and fixed room overrides while keeping old drafts compatible", () => {
  const draft = emptyHarborDraft();
  assert.equal(parseHarborDraft(draft).success, true);
  draft.business.address = ["12 Garden Lane", "Basco", "Philippines"];
  draft.rooms = { "lighthouse-room": { name: "Garden Room", postcard: "A sunny retreat", description: "A quiet room with a garden view.", bed: "King bed", view: "Garden", features: "Balcony\nBreakfast", price: 5800, maxGuests: 4 } };
  assert.equal(parseHarborDraft(draft).success, true);
  assert.equal(parseHarborDraft({ ...draft, rooms: { "unknown-room": { name: "Other" } } }).success, false);
  assert.equal(parseHarborDraft({ ...draft, rooms: { "lighthouse-room": { price: -1 } } }).success, false);
  assert.equal(parseHarborDraft({ ...draft, rooms: { "lighthouse-room": { maxGuests: 13 } } }).success, false);
  assert.equal(parseHarborDraft({ ...draft, business: { address: ["Only one line"] } }).success, false);
  assert.equal(parseDraft({ ...draft, template: "coral-cove" }, "coral-cove").success, false);
});

test("breakfast and guide overrides accept known fields and reject unknown places", () => {
  const draft = emptyHarborDraft();
  draft.breakfast = { heading: "Our table", morning: { title: "Morning feast", items: "Fresh fruit\nWarm bread" } };
  draft.guide = { heading: "Explore nearby", places: { "naidi-hills": { name: "Garden lookout", note: "A quiet walk." } } };
  assert.equal(parseHarborDraft(draft).success, true);
  assert.equal(parseHarborDraft({ ...draft, guide: { places: { unknown: { name: "Unknown" } } } }).success, false);
  assert.equal(parseDraft({ ...draft, template: "coral-cove" }, "coral-cove").success, false);
});
