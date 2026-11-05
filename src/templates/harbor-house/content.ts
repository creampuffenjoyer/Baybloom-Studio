import photos from "./photos.json";
import type { StayExtra } from "../_kit/use-stay-booking";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

export type Room = {
  slug: string;
  name: string;
  postcard: string;
  description: string[];
  price: number;
  maxGuests: number;
  bed: string;
  view: string;
  photos: PhotoKey[];
  little: string[];
};

export const rooms: Room[] = [
  {
    slug: "lighthouse-room",
    name: "The Lighthouse Room",
    postcard: "You can see Naidi lighthouse from the pillow.",
    description: [
      "Our front room upstairs, with two windows on the harbour and the lighthouse on the hill beyond. Mornings are bright and the boats go out right below you.",
      "A queen bed with a cotton quilt Mila’s mother made, a reading chair by the window and a small shower room.",
    ],
    price: 4200,
    maxGuests: 2,
    bed: "Queen bed",
    view: "Harbour and lighthouse",
    photos: ["room-white", "lighthouse", "harbour"],
    little: ["Harbour view", "Quilt from Ivana weavers", "Shower room", "Fan and air-con"],
  },
  {
    slug: "captains-room",
    name: "The Captain’s Room",
    postcard: "Old beams, a four-poster and the sound of the sea.",
    description: [
      "Under the oldest beams in the house, the Captain’s Room has a timber four-poster bed, a writing desk and a window seat over the garden.",
      "It’s the quietest room, and the biggest, with a proper bathtub.",
    ],
    price: 5200,
    maxGuests: 2,
    bed: "Queen four-poster",
    view: "Garden and hills",
    photos: ["room-beams", "pillows", "headland"],
    little: ["Bathtub", "Window seat", "Writing desk", "Fan and air-con"],
  },
  {
    slug: "rose-room",
    name: "The Rose Room",
    postcard: "Cosy, pink and very fond of breakfast in bed.",
    description: [
      "A snug room with rose-print linen, a comfy armchair and a little window on the street. Perfect for one, lovely for two.",
      "Ask for breakfast in bed: Joel brings up a tray at whatever time you like.",
    ],
    price: 3800,
    maxGuests: 2,
    bed: "Double bed",
    view: "Abad Street",
    photos: ["room-floral", "tray", "yellow-boat"],
    little: ["Breakfast in bed", "Armchair", "Shared bathroom across the hall", "Fan"],
  },
  {
    slug: "attic-twin",
    name: "The Attic Twin",
    postcard: "Two beds under the eaves for friends or walkers.",
    description: [
      "Up a narrow staircase, the attic has two single beds, a skylight for stargazing and hooks for wet jackets and walking boots.",
      "Popular with cyclists doing the island loop. There’s a lockable shed for bikes.",
    ],
    price: 3400,
    maxGuests: 2,
    bed: "Two single beds",
    view: "Skylight",
    photos: ["pillows", "cliff-walk", "coast-path"],
    little: ["Skylight", "Bike shed", "Drying rack", "Shower room"],
  },
];

export const extras: StayExtra[] = [
  { id: "airport", name: "Pick-up from Basco airport", price: 400, per: "stay" },
  { id: "packed", name: "Packed lunch for a day out", price: 350, per: "guest" },
  { id: "bike", name: "Bicycle hire", price: 300, per: "night" },
];

export const breakfast = [
  { title: "Every morning", items: ["Pandesal warm from the bakery on Abad Street", "Lunis (Ivatan adobo) with fried rice and egg", "Fruit from the garden: papaya, banana and whatever the neighbours bring", "Batanes coffee, brewed strong, or ginger salabat"] },
  { title: "Ask the night before", items: ["Uvud balls (banana pith dumplings)", "Coconut crab omelette, when the season allows", "Pancakes with honey from Mahatao", "Vegetarian or gluten-free, just let us know"] },
];

export const places = [
  { name: "Naidi Hills and lighthouse", kind: "Walk", distance: "15 min on foot", note: "Best at sunset, when the lighthouse turns pink." },
  { name: "Vayang Rolling Hills", kind: "Cycle", distance: "25 min by bike", note: "Grassy headlands and cattle, with the sea on both sides." },
  { name: "Valugan Boulder Beach", kind: "Beach", distance: "10 min by tricycle", note: "Smooth volcanic boulders. For looking, not swimming." },
  { name: "Honesty Coffee Shop", kind: "Café", distance: "35 min by tricycle", note: "No staff, just an honour box. Bring small change." },
  { name: "Chawa View Deck", kind: "Walk", distance: "30 min by tricycle", note: "A staircase down the cliff to the rock pools." },
  { name: "Kusina sa Daungan", kind: "Dinner", distance: "5 min on foot", note: "Fish of the day and turmeric rice, two doors down the quay." },
];

export const guestbook = [
  { text: "We came for two nights and stayed five. Mila’s lunis is the best breakfast in the Philippines, and we’ve tried.", who: "Carla and Ben", from: "Cebu", month: "April" },
  { text: "Joel drew us a map on the back of a napkin and it was better than Google. Thank you for the umbrella!", who: "Hiro", from: "Osaka", month: "March" },
  { text: "Quiet, spotless and so kind. The Lighthouse Room at dawn is something else.", who: "Dana", from: "Manila", month: "February" },
  { text: "Perfect base for cycling the island. The bike shed and the drying rack were a godsend after the rain.", who: "Peter and Jules", from: "Melbourne", month: "December" },
];
