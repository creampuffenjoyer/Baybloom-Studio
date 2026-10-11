import photos from "./photos.json";
import type { StayExtra } from "../_kit/use-stay-booking";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

export type Villa = {
  slug: string;
  name: string;
  short: string;
  description: string[];
  price: number;
  size: number;
  maxGuests: number;
  beds: string;
  view: string;
  photos: PhotoKey[];
  amenities: string[];
};

export const villas: Villa[] = [
  {
    slug: "overwater-villa",
    name: "Overwater Villa",
    short: "Stilted over the house reef, with a plunge pool and a ladder straight into the lagoon.",
    description: [
      "Our overwater villas stand on hardwood stilts at the end of a 200-metre boardwalk, far enough out that the only sound at night is the tide moving under the deck.",
      "Inside, a king bed faces floor-to-ceiling doors that fold back completely. Outside there is a private plunge pool, two loungers and a ladder down to the reef, where parrotfish feed every morning.",
    ],
    price: 32000,
    size: 110,
    maxGuests: 2,
    beds: "1 king bed",
    view: "Open lagoon",
    photos: ["overwater-row", "boardwalk", "plunge-pool", "jetty"],
    amenities: ["Private plunge pool", "Lagoon ladder", "Outdoor rain shower", "Daily breakfast in villa", "Snorkel set", "Espresso machine"],
  },
  {
    slug: "garden-pool-villa",
    name: "Garden Pool Villa",
    short: "A walled garden, a 6-metre pool and an outdoor bathtub under the frangipani.",
    description: [
      "Set back among palms and frangipani, the garden villas are the most private on the island. A high stone wall wraps a lawn, a 6-metre pool and a sala for afternoon naps.",
      "The bedroom opens on to the pool deck, and the bathroom has an outdoor stone tub for star-gazing. The beach is a two-minute walk along a sand path.",
    ],
    price: 18500,
    size: 85,
    maxGuests: 3,
    beds: "1 king bed + day bed",
    view: "Private garden",
    photos: ["bedroom", "pool-edge", "palms-dusk"],
    amenities: ["Private 6 m pool", "Outdoor stone bathtub", "Garden sala", "Daily breakfast", "Bluetooth speaker", "Minibar"],
  },
  {
    slug: "beachfront-bungalow",
    name: "Beachfront Bungalow",
    short: "Thatched, breezy and ten steps from the water, with a hammock on the veranda.",
    description: [
      "Our original bungalows sit in a single row along the beach, built by local craftsmen from nipa, bamboo and narra wood. Doors open straight on to the sand.",
      "They are simple in the best way: a big bed under a mosquito net, a ceiling fan, a hammock on the veranda and the sunset right in front of you.",
    ],
    price: 14800,
    size: 48,
    maxGuests: 2,
    beds: "1 queen bed",
    view: "Beach and sunset",
    photos: ["villas-row", "bedroom-2", "sunset"],
    amenities: ["Veranda hammock", "Ceiling fan and A/C", "Outdoor shower", "Daily breakfast", "Beach towels", "Reading light"],
  },
  {
    slug: "lagoon-family-villa",
    name: "Lagoon Family Villa",
    short: "Two bedrooms around a shared pool deck, made for families and friends.",
    description: [
      "Two separate bedrooms, each with its own bathroom, face each other across a shared pool deck, so everyone gets privacy and the long lunches happen in the middle.",
      "There is a shallow ledge in the pool for little ones, a kitchenette for snacks, and the kids' club and beach are just across the path.",
    ],
    price: 26500,
    size: 140,
    maxGuests: 5,
    beds: "1 king + 2 singles",
    view: "Pool and lagoon",
    photos: ["pool", "aerial-villa", "pool-edge"],
    amenities: ["Shared pool with kids' ledge", "Two en-suite bedrooms", "Kitchenette", "Daily breakfast", "Kids' club access", "Board games"],
  },
];

export const extras: StayExtra[] = [
  { id: "transfer", name: "Speedboat transfer from El Nido (return)", price: 3500, per: "guest" },
  { id: "dinner", name: "Sandbar dinner for two", price: 9500, per: "stay" },
  { id: "massage", name: "60-minute beach massage", price: 2800, per: "guest" },
  { id: "late", name: "Late check-out (until 4 pm)", price: 4000, per: "stay" },
];

export type Experience = {
  slug: string;
  name: string;
  summary: string;
  detail: string;
  duration: string;
  price: string;
  photo: PhotoKey;
};

export const experiences: Experience[] = [
  {
    slug: "house-reef",
    name: "Snorkel the house reef",
    summary: "Turtles, clownfish and table corals, thirty metres from your door.",
    detail: "Free masks and fins at the beach hut. Our marine guide leads a reef walk every morning at 8, before the boats arrive.",
    duration: "Any time",
    price: "Included",
    photo: "snorkeler",
  },
  {
    slug: "island-hopping",
    name: "Island hopping by bangka",
    summary: "Hidden lagoons, a cave beach and lunch grilled on the boat.",
    detail: "A private outrigger for your group, with a captain and cook. We leave at 9 and follow the tide, not the crowds.",
    duration: "Full day",
    price: "From ₱9,800 per boat",
    photo: "bangka",
  },
  {
    slug: "diving",
    name: "Dive the outer walls",
    summary: "PADI courses and guided dives on the walls beyond the lagoon.",
    detail: "Our dive centre runs two boats a day, with try-dives in the lagoon and courses from Open Water to Rescue.",
    duration: "Half day",
    price: "From ₱4,200",
    photo: "reef-fish",
  },
  {
    slug: "sailing",
    name: "Sunset sail on a paraw",
    summary: "A traditional double-outrigger sailboat, a cooler of drinks and the best light of the day.",
    detail: "Ninety minutes along the coast as the sun goes down. Up to six guests per boat.",
    duration: "90 minutes",
    price: "₱3,500 per guest",
    photo: "paraw",
  },
  {
    slug: "spa",
    name: "Spa by the water",
    summary: "Hilot massage and coconut scrubs in an open-sided sala.",
    detail: "Our therapists trained in traditional Filipino hilot. Book treatments for two at sunset.",
    duration: "60–120 minutes",
    price: "From ₱2,800",
    photo: "spa",
  },
  {
    slug: "sandbar-dinner",
    name: "Dinner on the sandbar",
    summary: "A table for two on a strip of sand that only appears at low tide.",
    detail: "Lanterns, a five-course seafood menu and a boat to take you there and back. Timed with the tide, so ask early.",
    duration: "Evening",
    price: "₱9,500 for two",
    photo: "sandbar",
  },
];

export type Offer = {
  slug: string;
  name: string;
  headline: string;
  body: string;
  includes: string[];
  terms: string;
  photo: PhotoKey;
};

export const offers: Offer[] = [
  {
    slug: "stay-longer",
    name: "Stay 5, pay 4",
    headline: "Your fifth night is on us",
    body: "Slow down properly. Book five nights or more in any villa and the fifth night is free, plus a sunset sail for two.",
    includes: ["Every fifth night free", "Sunset paraw sail for two", "Daily breakfast"],
    terms: "Valid for stays until 15 December. Not combinable with other offers.",
    photo: "sunset",
  },
  {
    slug: "honeymoon",
    name: "Honeymoon on the lagoon",
    headline: "Three nights over the water",
    body: "Three nights in an Overwater Villa with a sandbar dinner, a couple's massage and sparkling wine on arrival.",
    includes: ["3 nights, Overwater Villa", "Sandbar dinner for two", "Couple's massage (90 min)", "Return speedboat transfers"],
    terms: "From ₱118,000 for two. Proof of marriage within 12 months.",
    photo: "overwater-row",
  },
  {
    slug: "dive-and-stay",
    name: "Dive and stay",
    headline: "Six dives, four nights",
    body: "Four nights in a Beachfront Bungalow with six guided boat dives on the outer walls, equipment included.",
    includes: ["4 nights, Beachfront Bungalow", "6 guided boat dives", "Full equipment hire", "Nitrox upgrade"],
    terms: "Certified divers only. From ₱68,500 per person, sharing.",
    photo: "reef-fish",
  },
];

export const reviews = [
  {
    quote: "We swam with a turtle before breakfast and ate grilled lapu-lapu on a sandbar at dinner. Nobody wanted to leave.",
    name: "Ana and Miguel",
    from: "Manila",
    stay: "Overwater Villa, March",
  },
  {
    quote: "The staff remembered our son's name from the first day. The family villa is genuinely made for families.",
    name: "Hannah W.",
    from: "Singapore",
    stay: "Lagoon Family Villa, April",
  },
  {
    quote: "Barefoot for a week. The bungalows are simple and perfect, and the sunsets from the veranda are absurd.",
    name: "Tom R.",
    from: "Melbourne",
    stay: "Beachfront Bungalow, January",
  },
];

export const galleryOrder: PhotoKey[] = [
  "hero",
  "overwater-row",
  "villas-row",
  "snorkeler",
  "pool",
  "bedroom",
  "sandbar",
  "palms-dusk",
  "coral",
  "boardwalk",
  "dining",
  "paraw",
  "beach-bar",
  "plunge-pool",
  "bangka",
  "sunset",
];
