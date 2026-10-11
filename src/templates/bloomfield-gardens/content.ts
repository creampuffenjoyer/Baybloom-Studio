import photos from "./photos.json";
import { fromDay, type Day } from "../_kit/dates";
import { isAvailable } from "../_kit/availability";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

/** Demo availability: Saturdays book up fastest. Replace with your events calendar. */
export function isDateFree(day: Day) {
  const dow = fromDay(day).getDay();
  if (dow === 1) return false; // Mondays are for the gardeners
  return isAvailable(day, "estate", dow === 6 ? 0.55 : dow === 5 || dow === 0 ? 0.35 : 0.15);
}

export type Space = {
  slug: string;
  name: string;
  kind: string;
  short: string;
  description: string[];
  ceremony?: number;
  dinner?: number;
  standing?: number;
  bestFor: string[];
  photos: PhotoKey[];
};

export const spaces: Space[] = [
  {
    slug: "the-lawn",
    name: "The Cedar Lawn",
    kind: "Ceremony and garden party",
    short: "An acre of lawn under a 120-year-old cedar, with Taal Lake on the horizon.",
    description: [
      "The lawn is where most of our couples say their vows: rows of chairs under the cedar, an aisle of loose petals and the volcano lake behind you.",
      "In the evening it becomes the garden party, with festoon lights, lawn games and a bar on the terrace.",
    ],
    ceremony: 250,
    standing: 300,
    bestFor: ["Ceremonies", "Cocktail hour", "Garden parties"],
    photos: ["lawn", "house", "night-path"],
  },
  {
    slug: "the-glasshouse",
    name: "The Glasshouse",
    kind: "Dinner and reception",
    short: "A restored Victorian glasshouse for long dinners among the ferns.",
    description: [
      "Built in 1931 for the estate’s orchid collection, the glasshouse now seats 140 for dinner beneath its white iron roof.",
      "Rain or shine, it glows. Underfloor cooling keeps it comfortable on warm afternoons, and fire heaters come out on cool Tagaytay nights.",
    ],
    dinner: 140,
    standing: 180,
    bestFor: ["Wedding breakfasts", "Rehearsal dinners", "Rainy-day ceremonies"],
    photos: ["glasshouse-dinner", "glasshouse", "glasshouse-inside"],
  },
  {
    slug: "the-barn",
    name: "The Hay Barn",
    kind: "Party and dancing",
    short: "Timber beams, festoon lights and a sprung dance floor.",
    description: [
      "Our hay barn takes 200 for dinner or a big, loud party. The beams are original; the sound system and sprung floor are very much not.",
      "Long tables run the length of the barn, with the bar and dance floor at the far end.",
    ],
    dinner: 200,
    standing: 280,
    bestFor: ["Receptions", "Dancing", "Big birthdays"],
    photos: ["barn-dinner", "barn", "florals"],
  },
  {
    slug: "the-rose-walk",
    name: "The Rose Walk",
    kind: "Intimate ceremony",
    short: "A tunnel of climbing roses ending in a stone orangery.",
    description: [
      "Sixty metres of rambling roses lead to the old orangery, a small and beautiful place for ceremonies of up to 80.",
      "The roses peak from December to April. Outside those months, our florists dress the arches for you.",
    ],
    ceremony: 80,
    dinner: 40,
    bestFor: ["Intimate weddings", "Vow renewals", "Portraits"],
    photos: ["rose-tunnel", "orangery", "pergola"],
  },
  {
    slug: "the-ruin",
    name: "The Chapel Ruin",
    kind: "Elopement",
    short: "An ivy-covered brick ruin beside the lily pond, for very small weddings.",
    description: [
      "The ruin is what remains of the estate’s first chapel. Twenty chairs, a celebrant and the sound of the fountain.",
      "Most of our elopement couples finish with a private dinner for two in the glasshouse.",
    ],
    ceremony: 20,
    bestFor: ["Elopements", "Proposals", "Photo sessions"],
    photos: ["ruin", "pond", "rose-gate"],
  },
];

export const packages = [
  {
    name: "Elope",
    price: 95000,
    guests: "Up to 20 guests",
    blurb: "A ceremony at the Chapel Ruin and dinner for two in the glasshouse.",
    includes: ["Celebrant and ceremony setup", "Bouquet and buttonhole", "Two hours of photography", "Private dinner and a night in a garden tent"],
  },
  {
    name: "Garden classic",
    price: 480000,
    guests: "Up to 140 guests",
    blurb: "Vows on the Cedar Lawn, then dinner and dancing in the glasshouse.",
    includes: ["Ceremony on the lawn", "Cocktail hour with canapés", "Four-course dinner", "Venue until midnight", "Coordinator on the day"],
    featured: true,
  },
  {
    name: "Whole estate",
    price: 1200000,
    guests: "Up to 200 guests",
    blurb: "The estate is yours from Friday afternoon to Sunday lunch.",
    includes: ["Every space, exclusively", "Welcome dinner on Friday", "Wedding day and party in the barn", "Twelve garden tents", "Sunday garden brunch"],
  },
];

export const faqs = [
  ["How far ahead should we book?", "Saturdays from December to April book 12 to 18 months ahead. Weekdays and the rainy season are much easier, and up to 30% cheaper."],
  ["Can we bring our own caterer?", "Our kitchen caters every event, but we’re happy to bring in a specialist for a cultural menu or a lechon. A corkage-style fee applies."],
  ["What if it rains?", "Every outdoor space has an indoor twin. We make the call with you at 10 am on the day, and the team moves everything in under an hour."],
  ["Do you have accommodation?", "Twelve furnished garden tents sleep 24 guests, and we partner with three hotels within ten minutes’ drive."],
  ["Is there a curfew?", "Music outdoors ends at 10 pm; the barn can party until 1 am."],
  ["Can we visit first?", "Please do. Viewings run Tuesday to Sunday, and on a few Open Garden days each year."],
];

export const timeline = [
  { when: "12–18 months before", what: "View the estate, hold your date and pay the 25% deposit." },
  { when: "9 months before", what: "Choose your spaces, menus and the shape of the day with your coordinator." },
  { when: "3 months before", what: "Menu tasting for two, florals meeting and a run-through of the timings." },
  { when: "2 weeks before", what: "Final numbers and table plan. We take it from here." },
];

export const reviews = [
  { quote: "Our guests still talk about dinner in the glasshouse. The team made a rainy morning feel like part of the plan.", name: "Bea and Marco", when: "February" },
  { quote: "We eloped at the ruin with twelve people and it was perfect. Quiet, beautiful and completely us.", name: "Sam and Jo", when: "June" },
];

export const galleryOrder: PhotoKey[] = [
  "lawn", "glasshouse-dinner", "rose-tunnel", "bouquet", "barn-dinner", "ruin", "table", "glasshouse",
  "pergola", "night-path", "florals", "pond", "orangery-out", "wildflowers", "tent-night", "rose-arch",
];
