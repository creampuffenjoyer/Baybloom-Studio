import photos from "./photos.json";
import type { StayExtra } from "../_kit/use-stay-booking";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

export type Season = "winter" | "summer";

/** Everything on the home page that changes with the season switch. */
export const seasons: Record<Season, { label: string; headline: string; lede: string; hero: PhotoKey; months: string }> = {
  winter: {
    label: "Winter",
    headline: "First tracks, then the fire.",
    lede: "Ski-in from the Ridge chair, dry your boots by the stone fireplace and eat elk stew under the beams. Our season runs December to April.",
    hero: "snow-chalets",
    months: "December – April",
  },
  summer: {
    label: "Summer",
    headline: "Long trails, cold lakes, warm beds.",
    lede: "Hike to Larch Lake, paddle at sunrise and come home to a sauna and a long table on the terrace. Our summer runs June to October.",
    hero: "lodge-lake",
    months: "June – October",
  },
};

export type Activity = { name: string; season: Season; detail: string; level: string; duration: string; photo: PhotoKey };

export const activities: Activity[] = [
  { name: "Ski and ride the Ridge", season: "winter", detail: "Ski-in, ski-out from the Ridge chair, with 62 runs and a 1,100 m vertical. Lift passes at the front desk.", level: "All levels", duration: "Full day", photo: "ski-slope" },
  { name: "Backcountry touring", season: "winter", detail: "Guided tours to the Whitebark bowls with avalanche-certified guides. Skins and transceivers provided.", level: "Strong skiers", duration: "6 hours", photo: "skiers" },
  { name: "Snowshoe to the falls", season: "winter", detail: "A gentle loop through old cedars to the frozen Cascade Falls, with hot chocolate at the turnaround.", level: "Easy", duration: "3 hours", photo: "ski-village" },
  { name: "Larch Lake hike", season: "summer", detail: "Our favourite day hike: up through the meadows to a turquoise lake ringed by peaks. 14 km return.", level: "Moderate", duration: "6 hours", photo: "trail" },
  { name: "Sunrise paddle", season: "summer", detail: "Canoes leave the lodge dock at 6 am, when the lake is glass and the mist still lies on the water.", level: "Easy", duration: "2 hours", photo: "canoe-dock" },
  { name: "Wildflower meadows", season: "summer", detail: "A naturalist-led walk through the high meadows in July, when the lupin and paintbrush are out.", level: "Easy", duration: "4 hours", photo: "meadow-hike" },
  { name: "Larch season", season: "summer", detail: "For two weeks in late September the larches turn gold. Book early: it’s our busiest fortnight.", level: "Moderate", duration: "Half day", photo: "autumn-hike" },
];

export type Room = {
  slug: string;
  name: string;
  short: string;
  description: string[];
  price: number;
  size: number;
  maxGuests: number;
  beds: string;
  photos: PhotoKey[];
  features: string[];
};

export const rooms: Room[] = [
  {
    slug: "trapper-twin",
    name: "Trapper Twin",
    short: "Two beds, reclaimed wood walls and a boot warmer by the door.",
    description: [
      "Our twin rooms are made for skiing friends and hiking partners: two firm beds, walls of reclaimed barn wood and a heated rack for wet boots and gloves.",
      "Windows face the forest, so mornings are quiet and dark until you want them not to be.",
    ],
    price: 219,
    size: 24,
    maxGuests: 2,
    beds: "Two single beds",
    photos: ["twin-room", "lounge", "ski-slope"],
    features: ["Heated boot rack", "Forest view", "Rain shower", "Breakfast included"],
  },
  {
    slug: "hearth-room",
    name: "Hearth Room",
    short: "A king bed, a wood-burning stove and a window on the peaks.",
    description: [
      "Each Hearth Room has its own small wood stove, laid every afternoon by our housekeepers, and a king bed facing a picture window on the Whitebark peaks.",
      "There’s a deep armchair, a pile of books about the valley and a bathroom with a soaking tub.",
    ],
    price: 329,
    size: 36,
    maxGuests: 2,
    beds: "King bed",
    photos: ["fireplace", "peaks", "lobby"],
    features: ["Wood-burning stove", "Peak view", "Soaking tub", "Breakfast included"],
  },
  {
    slug: "family-loft",
    name: "Family Loft",
    short: "A queen below, two bunks up a ladder and space for the gear.",
    description: [
      "The lofts have a queen bed on the main floor and a sleeping loft with two bunks reached by a proper ladder, which children love.",
      "A mudroom with hooks and benches keeps the gear out of the bedroom.",
    ],
    price: 389,
    size: 48,
    maxGuests: 4,
    beds: "Queen bed + two bunks",
    photos: ["lounge", "terrace", "meadow-hike"],
    features: ["Sleeping loft", "Mudroom", "Board games", "Breakfast for four"],
  },
  {
    slug: "ridge-chalet",
    name: "Ridge Chalet",
    short: "A two-storey timber chalet of your own, with a hot tub on the deck.",
    description: [
      "Set apart in the pines, the chalet has two bedrooms, a living room with a fireplace, a full kitchen and a cedar hot tub on the balcony.",
      "Breakfast is delivered in a basket, or join everyone in the lodge dining room.",
    ],
    price: 649,
    size: 110,
    maxGuests: 6,
    beds: "King + queen + sofa bed",
    photos: ["chalet", "snow-chalets", "terrace"],
    features: ["Private hot tub", "Full kitchen", "Fireplace", "Breakfast basket"],
  },
];

export const extras: StayExtra[] = [
  { id: "lift", name: "Ridge lift pass (per day)", price: 119, per: "guest" },
  { id: "rental", name: "Ski or bike rental", price: 65, per: "night" },
  { id: "dinner", name: "Three-course dinner, nightly", price: 75, per: "guest" },
];

export const menu = [
  { name: "Elk and juniper stew", detail: "Root vegetables, sourdough", price: 34 },
  { name: "Cedar-plank trout", detail: "Brown butter, charred greens", price: 38 },
  { name: "Wild mushroom pie", detail: "Hand-raised pastry, red wine jus", price: 29 },
  { name: "Bison burger", detail: "Smoked cheddar, onion jam, fries", price: 27 },
  { name: "Saskatoon berry crumble", detail: "Vanilla custard", price: 14 },
];

export type Post = { slug: string; title: string; dek: string; date: string; photo: PhotoKey; body: string[] };

export const posts: Post[] = [
  {
    slug: "how-to-dress-for-a-bluebird-day",
    title: "How to dress for a bluebird day",
    dek: "Layers, sunglasses and the one thing everyone forgets.",
    date: "2026-01-18",
    photo: "skiers",
    body: [
      "A bluebird day after a storm is the best day on the mountain, and the easiest to get wrong. It’s colder than it looks, and brighter than you think.",
      "Start with a merino base layer, add a light fleece, and keep a shell in your pack for the chairlift. Goggles for the snow, sunglasses for lunch on the deck.",
      "And the thing everyone forgets? Sunscreen. At 2,000 metres the reflection off fresh snow will burn you by noon.",
    ],
  },
  {
    slug: "larch-season-is-coming",
    title: "Larch season is coming",
    dek: "Two weeks of gold, and how to see it without the crowds.",
    date: "2026-09-02",
    photo: "autumn-hike",
    body: [
      "Larches are the only conifers that lose their needles, and before they do, they turn the whole valley gold. It lasts about two weeks, usually from the third week of September.",
      "Go early. The trailhead lot fills by 8 am on weekends, so we run a shuttle from the lodge at 7.",
      "Bring a warm layer and a thermos: the best viewpoint is just above the lake, and you’ll want to sit for a while.",
    ],
  },
];
