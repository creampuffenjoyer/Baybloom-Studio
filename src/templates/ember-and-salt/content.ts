import photos from "./photos.json";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

export type Diet = "v" | "vg" | "gf" | "df";
export const DIET_LABEL: Record<Diet, string> = {
  v: "Vegetarian",
  vg: "Vegan",
  gf: "Gluten-free",
  df: "Dairy-free",
};

export type Dish = { name: string; detail: string; price: number; diet?: Diet[]; note?: string };
export type MenuSection = { title: string; intro?: string; dishes: Dish[] };
export type Menu = { id: string; label: string; served: string; sections: MenuSection[] };

export const menus: Menu[] = [
  {
    id: "dinner",
    label: "Dinner",
    served: "Tuesday to Sunday from 5:30 pm",
    sections: [
      {
        title: "From the oven",
        intro: "Our dough ferments for 48 hours and bakes at 450 °C on Batangas stone.",
        dishes: [
          { name: "Flatbread, smoked butter", detail: "Burnt honey, sea salt from Pangasinan", price: 240, diet: ["v"] },
          { name: "Ember-roast squash", detail: "Calamansi brown butter, pili nuts, sage", price: 420, diet: ["v", "gf"] },
          { name: "Clams in the pan", detail: "Chorizo de Bilbao, garlic, white wine, grilled bread", price: 560 },
          { name: "Charred aubergine", detail: "Tahini, pomegranate, chilli oil, herbs", price: 380, diet: ["vg", "gf"] },
        ],
      },
      {
        title: "Over the coals",
        intro: "Cooked over native hardwood and coconut husk.",
        dishes: [
          { name: "Whole catch of the day", detail: "Salsa verde, charred lemon. Priced by weight", price: 1450, diet: ["gf", "df"], note: "for two" },
          { name: "Pork belly inasal", detail: "Annatto, lemongrass, pickled papaya", price: 880, diet: ["gf", "df"] },
          { name: "Half chicken", detail: "Brined 24 hours, burnt garlic, chicken-fat rice", price: 760, diet: ["gf"] },
          { name: "T-bone, dry-aged 30 days", detail: "Bone marrow butter, watercress", price: 3200, diet: ["gf"], note: "for two" },
          { name: "Hen-of-the-woods", detail: "Miso glaze, smoked egg yolk, chives", price: 640, diet: ["v", "gf"] },
        ],
      },
      {
        title: "On the side",
        dishes: [
          { name: "Duck-fat potatoes", detail: "Rosemary, aioli", price: 290, diet: ["gf"] },
          { name: "Grilled greens", detail: "Anchovy dressing, toasted crumbs", price: 260 },
          { name: "Garden leaves", detail: "Mustard vinaigrette", price: 220, diet: ["vg", "gf"] },
        ],
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    served: "Bar opens at 5 pm",
    sections: [
      {
        title: "Cocktails",
        dishes: [
          { name: "Smoke & Salt", detail: "Mezcal, calamansi, salted tamarind, charred pineapple", price: 480 },
          { name: "Ember Negroni", detail: "Gin, red bitter, vermouth rested on oak", price: 460 },
          { name: "Bramble on fire", detail: "Gin, blackberry, lemon, crushed ice", price: 440 },
          { name: "Tablea old fashioned", detail: "Bourbon, Batangas tablea, orange", price: 480 },
        ],
      },
      {
        title: "Without alcohol",
        dishes: [
          { name: "Garden spritz", detail: "Cucumber, basil, tonic", price: 220, diet: ["vg"] },
          { name: "Smoked lemonade", detail: "Grilled lemon, honey, soda", price: 200 },
        ],
      },
      {
        title: "Wine by the glass",
        intro: "Over 120 bottles on the list. Ask for the cellar book.",
        dishes: [
          { name: "Grüner Veltliner, Austria", detail: "Crisp, white pepper", price: 520 },
          { name: "Etna Rosso, Sicily", detail: "Volcanic, red cherry", price: 610 },
          { name: "Malbec, Mendoza", detail: "Plum, smoke, built for the grill", price: 580 },
        ],
      },
    ],
  },
  {
    id: "dessert",
    label: "Dessert",
    served: "Until 10:30 pm",
    sections: [
      {
        title: "Sweet",
        dishes: [
          { name: "Burnt Basque cheesecake", detail: "Ube jam, cream", price: 360, diet: ["v", "gf"] },
          { name: "Dark chocolate, smoked salt", detail: "Coffee ice cream, cocoa nib tuile", price: 380, diet: ["v"] },
          { name: "Grilled mango", detail: "Coconut sorbet, lime, chilli", price: 320, diet: ["vg", "gf"] },
        ],
      },
      {
        title: "After",
        dishes: [
          { name: "Barako espresso", detail: "Single-origin Batangas coffee", price: 140, diet: ["vg"] },
          { name: "Lambanog digestif", detail: "Infused in house with dalandan peel", price: 280 },
        ],
      },
    ],
  },
];

export const signatureDishes: { name: string; line: string; photo: PhotoKey }[] = [
  { name: "T-bone, dry-aged 30 days", line: "Thirty days in the ageing room, ten minutes over coals.", photo: "t-bone" },
  { name: "Whole catch of the day", line: "Whatever came off the boats at Navotas this morning.", photo: "fish-coals" },
  { name: "Flatbread, smoked butter", line: "The one everybody orders twice.", photo: "flatbread" },
];

export type Space = {
  slug: string;
  name: string;
  seats: string;
  standing?: string;
  description: string;
  minimum: number;
  photo: PhotoKey;
};

export const spaces: Space[] = [
  {
    slug: "back-room",
    name: "The Back Room",
    seats: "Up to 16 seated",
    description: "Our private dining room behind the wine wall, with its own sound system and a view through to the ovens.",
    minimum: 45000,
    photo: "back-room",
  },
  {
    slug: "chefs-counter",
    name: "Chef’s Counter",
    seats: "Up to 8 seated",
    description: "Eight stools at the pass for a seven-course menu cooked in front of you, with the chef talking you through each plate.",
    minimum: 32000,
    photo: "oven",
  },
  {
    slug: "full-house",
    name: "The whole house",
    seats: "Up to 60 seated",
    standing: "90 standing",
    description: "Take over the restaurant and bar for launches, rehearsal dinners and parties. Sunday to Thursday only.",
    minimum: 220000,
    photo: "room",
  },
];

export const giftAmounts = [2000, 3500, 5000, 10000];

export const press = [
  { quote: "The best thing to happen to Poblacion’s dining scene in years.", source: "City Supper Guide" },
  { quote: "Order the flatbread. Then order it again.", source: "The Weekend Table" },
  { quote: "Fire, salt and restraint.", source: "Smoke Signals magazine" },
];
