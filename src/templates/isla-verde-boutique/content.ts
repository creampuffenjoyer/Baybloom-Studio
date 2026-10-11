import photos from "./photos.json";
import type { StayExtra } from "../_kit/use-stay-booking";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

export type Room = {
  slug: string;
  name: string;
  short: string;
  description: string[];
  price: number;
  size: number;
  maxGuests: number;
  bed: string;
  outlook: string;
  photos: PhotoKey[];
  details: string[];
};

export const rooms: Room[] = [
  {
    slug: "casa-room",
    name: "Casa Room",
    short: "Narra floors, capiz windows and a carved bed in the original house.",
    description: [
      "Our eight Casa Rooms are on the upper floor of the 1887 house, where the family once slept. Wide narra floorboards creak just enough, and sliding capiz windows filter the afternoon light.",
      "Each has a carved four-poster bed, a writing desk and a rain shower in a new bathroom tucked behind the old wardrobe wall.",
    ],
    price: 7800,
    size: 32,
    maxGuests: 2,
    bed: "Queen four-poster",
    outlook: "Calle Crisologo",
    photos: ["carved-bed", "heritage-room", "balcony"],
    details: ["Original narra floors", "Capiz shell windows", "Rain shower", "Breakfast for two", "Nespresso and local tsokolate"],
  },
  {
    slug: "courtyard-suite",
    name: "Courtyard Suite",
    short: "A canopied bed and a sitting room over the bougainvillea courtyard.",
    description: [
      "The suites open on to the inner courtyard, where breakfast is served under the acacia. A separate sitting room with teak armchairs is the best place in the house to read.",
      "The bathroom has twin teak vanities and a deep tub beneath tall shuttered windows.",
    ],
    price: 11500,
    size: 48,
    maxGuests: 3,
    bed: "King canopy bed",
    outlook: "Inner courtyard",
    photos: ["canopy-bed", "suite", "vanity"],
    details: ["Separate sitting room", "Twin teak vanities", "Freestanding tub", "Breakfast in the courtyard", "Evening turndown"],
  },
  {
    slug: "pool-suite",
    name: "Pool Courtyard Suite",
    short: "A whitewashed suite with its own walled pool.",
    description: [
      "Built in the old carriage house, the two Pool Courtyard Suites each have a private walled courtyard with a plunge pool and a daybed under the frangipani.",
      "Inside: a canopied king bed, a bathtub beneath the windows and doors that fold back on to the water.",
    ],
    price: 16800,
    size: 64,
    maxGuests: 2,
    bed: "King canopy bed",
    outlook: "Private pool courtyard",
    photos: ["pool-courtyard", "bathtub", "canopy-bed"],
    details: ["Private plunge pool", "Outdoor daybed", "Bathtub with a view", "Breakfast served in your courtyard", "Late check-out on request"],
  },
  {
    slug: "mansion-suite",
    name: "The Mansion Suite",
    short: "The family’s own rooms: a salon, a bedroom and a balcony on the street.",
    description: [
      "The whole front of the upper floor: a grand salon with the original chandeliers, a bedroom with a carved bed, and a long balcony over the cobbles of Calle Crisologo.",
      "Our butler serves afternoon merienda in the salon, and a kalesa ride around the old town is included.",
    ],
    price: 22000,
    size: 95,
    maxGuests: 4,
    bed: "King four-poster + sofa bed",
    outlook: "Calle Crisologo balcony",
    photos: ["salon", "balcony", "heritage-room"],
    details: ["Private salon", "Street balcony", "Butler and afternoon merienda", "Kalesa tour of the old town", "Breakfast for four"],
  },
];

export const extras: StayExtra[] = [
  { id: "airport", name: "Laoag airport transfer (return)", price: 3800, per: "stay" },
  { id: "kalesa", name: "Kalesa tour of the old town", price: 1200, per: "stay" },
  { id: "dinner", name: "Tasting dinner at Comedor", price: 2900, per: "guest" },
];

export const menuHighlights = [
  { name: "Vigan empanada", detail: "Longganisa, egg and green papaya in a rice-flour crust" },
  { name: "Pinakbet", detail: "Bagnet, squash, bitter melon and bagoong from Lingayen" },
  { name: "Poqui-poqui", detail: "Smoked aubergine and egg, pandesal from our oven" },
  { name: "Sinanglao", detail: "Beef broth with kamias, a Vigan breakfast" },
  { name: "Royal bibingka", detail: "With carabao cheese and salted egg" },
];

export type Post = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  minutes: number;
  photo: PhotoKey;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "a-morning-on-calle-crisologo",
    title: "A morning on Calle Crisologo",
    dek: "Before the tour buses: bread, kalesas and the best light of the day.",
    date: "2026-09-14",
    minutes: 4,
    photo: "street",
    body: [
      "The street wakes up slowly. By six the bakers at the corner are pulling the first trays of pandesal, and the kalesa drivers are brushing down their horses outside the cathedral.",
      "Walk the length of Crisologo before eight and you’ll have the cobbles almost to yourself. The light comes in low from the east and catches the capiz windows on the upper floors, which is why our photographer guests are always up before breakfast.",
      "Finish at the plaza for a cup of tsokolate and a slice of royal bibingka, then come home for a second breakfast in the courtyard. Nobody will judge you.",
    ],
  },
  {
    slug: "restoring-the-capiz-windows",
    title: "Restoring two hundred capiz windows",
    dek: "How a family of craftsmen in Iloilo helped us bring the house back to life.",
    date: "2026-07-02",
    minutes: 6,
    photo: "balcony",
    body: [
      "When we opened the house in 2019, half the capiz panes were cracked or missing. Modern glass would have been easy, but the windows are the soul of a bahay na bato.",
      "We found the Dela Cruz family in Iloilo, who have worked windowpane oyster shell for four generations. Over eight months, they cut, polished and set almost three thousand pieces by hand.",
      "The result is a soft, pearly light that changes through the day. Ask at the front desk and we’ll show you the one original pane we kept, from 1887.",
    ],
  },
  {
    slug: "the-longganisa-question",
    title: "The longganisa question",
    dek: "Vigan or Lucban? Our chef settles it, sort of.",
    date: "2026-05-20",
    minutes: 3,
    photo: "dining-table",
    body: [
      "Every region has its sausage, and every guest has an opinion. Vigan longganisa is small, garlicky and unapologetically sour from the sukang Iloco.",
      "Chef Mila buys hers from the same stall in the public market her grandmother did, and serves it at breakfast with garlic rice, tomato and a fried egg with a properly crisp edge.",
      "Our position is diplomatic: try both, and then agree that ours is better.",
    ],
  },
];

export const eventSpaces = [
  { name: "The Courtyard", capacity: "Up to 120 seated", note: "Under the acacia and strings of lights." },
  { name: "The Salon", capacity: "Up to 40 seated", note: "Chandeliers, narra floors and the old piano." },
  { name: "The Library", capacity: "Up to 16 seated", note: "Private dinners among the bookshelves." },
];
