import photos from "./photos.json";
import type { StayExtra } from "../_kit/use-stay-booking";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

export type Villa = {
  slug: string;
  name: string;
  line: string;
  description: string[];
  price: number;
  size: number;
  maxGuests: number;
  bedrooms: number;
  setting: "Waterfront" | "Garden" | "Over water";
  jetty: boolean;
  sauna: boolean;
  photos: PhotoKey[];
};

export const villas: Villa[] = [
  {
    slug: "shore-villa",
    name: "Shore Villa",
    line: "Glass on three sides, the lake on the fourth.",
    description: [
      "The Shore Villa sits on the waterline itself, with a timber deck that becomes a private jetty. Swim before breakfast; it is eight steps from bed to lake.",
      "Inside it is spare and warm: oak floors, linen, a wood stove and one long window that frames the far shore.",
    ],
    price: 3400,
    size: 62,
    maxGuests: 2,
    bedrooms: 1,
    setting: "Waterfront",
    jetty: true,
    sauna: false,
    photos: ["villas", "jetties", "morning"],
  },
  {
    slug: "garden-villa",
    name: "Garden Villa",
    line: "Among the birches, a minute’s walk from the shore.",
    description: [
      "Set back among silver birches, the Garden Villa is the quietest on the estate. Morning light comes through the trees; evening light comes off the lake.",
      "A small terrace faces west for long dinners outside in summer.",
    ],
    price: 2600,
    size: 48,
    maxGuests: 3,
    bedrooms: 1,
    setting: "Garden",
    jetty: false,
    sauna: false,
    photos: ["cabin", "mist", "canoes"],
  },
  {
    slug: "family-villa",
    name: "Family Villa",
    line: "Two bedrooms, a loft and a rowing boat of your own.",
    description: [
      "The Family Villa has two bedrooms, a sleeping loft for children and a kitchen built for actual cooking. The rowing boat tied below is yours for the week.",
      "A wood-fired sauna sits a few steps from the water.",
    ],
    price: 4200,
    size: 96,
    maxGuests: 5,
    bedrooms: 2,
    setting: "Waterfront",
    jetty: true,
    sauna: true,
    photos: ["red-house", "rowboats", "sauna-smoke"],
  },
  {
    slug: "boathouse",
    name: "The Boathouse",
    line: "A suite built over the water, with its own sauna.",
    description: [
      "Our old boathouse now stands as a suite over the lake, with water under the floorboards and a cedar sauna at the end of the pier.",
      "At night you can hear the lake move. Most guests say it is the best sleep they’ve had in years.",
    ],
    price: 5100,
    size: 70,
    maxGuests: 2,
    bedrooms: 1,
    setting: "Over water",
    jetty: true,
    sauna: true,
    photos: ["bathhouse", "sunset", "sauna"],
  },
];

export const extras: StayExtra[] = [
  { id: "breakfast", name: "Breakfast basket each morning", price: 220, per: "guest" },
  { id: "sauna", name: "Lakeside sauna, private session", price: 450, per: "stay" },
  { id: "transfer", name: "Transfer from Karlstad station", price: 600, per: "stay" },
];

export type Experience = { slug: string; name: string; when: string; price: string; text: string; photo: PhotoKey };

export const experiences: Experience[] = [
  { slug: "kayak", name: "Kayak at first light", when: "Daily, 06:00", price: "Free for guests", text: "The lake is glass at dawn. Take a kayak from the jetty and follow the shore north to the reed beds, where the herons feed.", photo: "kayaks" },
  { slug: "cruise", name: "Sunset cruise", when: "Fridays, 19:30", price: "SEK 450 per person", text: "Ninety minutes on our restored 1930s launch with a glass of something cold, as the sun goes down behind the western hills.", photo: "sunset" },
  { slug: "dinner", name: "Private dinner on the jetty", when: "On request", price: "From SEK 1,200 per person", text: "Our chef cooks four courses from the lake and the forest: perch, chanterelles, lingonberries. Served at a single table at the end of the jetty.", photo: "vineyard-lake" },
  { slug: "sauna", name: "Sauna and swim", when: "Daily, 16:00–22:00", price: "SEK 450 per session", text: "Heat in the cedar sauna, then a slow walk down the steps into the lake. Repeat until it’s time for dinner.", photo: "sauna-modern" },
];

export const tourScenes: { id: string; name: string; photo: PhotoKey }[] = [
  { id: "jetty", name: "The jetties", photo: "jetties" },
  { id: "shore", name: "The shore", photo: "town" },
  { id: "sauna", name: "The sauna", photo: "sauna-modern" },
  { id: "boathouse", name: "The Boathouse", photo: "bathhouse" },
];
