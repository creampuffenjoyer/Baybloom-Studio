import photos from "./photos.json";

export type PhotoKey = keyof typeof photos;
export const photo = (key: PhotoKey) => photos[key];

export type Ritual = "massage" | "facial" | "body" | "bathing";
export const RITUALS: { id: Ritual; label: string; line: string }[] = [
  { id: "massage", label: "Massage", line: "Hands-on work for tired backs and busy minds." },
  { id: "facial", label: "Facials", line: "Botanical skincare from a farm in La Trinidad." },
  { id: "body", label: "Body", line: "Scrubs and wraps to wake up the skin." },
  { id: "bathing", label: "Bathing", line: "Heat, steam and still water." },
];

export type Treatment = {
  slug: string;
  name: string;
  ritual: Ritual;
  summary: string;
  description: string[];
  options: { minutes: number; price: number }[];
  includes: string[];
  goodFor: string;
  photo: PhotoKey;
  forTwo?: boolean;
};

export const treatments: Treatment[] = [
  {
    slug: "hilot",
    name: "Hilot healing massage",
    ritual: "massage",
    summary: "Traditional Filipino massage with warm coconut oil and banana leaves.",
    description: [
      "Hilot is a centuries-old Filipino healing practice. Your therapist reads tension through touch, then works it out with long, flowing strokes and warm virgin coconut oil.",
      "We finish with banana leaves warmed over a low flame and laid across the back, an old trick for drawing out the last of the knots.",
    ],
    options: [
      { minutes: 60, price: 2400 },
      { minutes: 90, price: 3300 },
    ],
    includes: ["Foot ritual on arrival", "Warm banana-leaf compress", "Ginger tea in the garden lounge"],
    goodFor: "Stress, poor sleep, first-time spa guests",
    photo: "room",
  },
  {
    slug: "deep-tissue",
    name: "Deep tissue massage",
    ritual: "massage",
    summary: "Slow, firm pressure for runners, desk workers and long-haul flyers.",
    description: [
      "A focused massage that works through the deeper layers of muscle. Tell us where it hurts and we’ll spend the time there.",
      "Arnica and eucalyptus oil help with recovery afterwards.",
    ],
    options: [
      { minutes: 60, price: 2600 },
      { minutes: 90, price: 3600 },
    ],
    includes: ["Pressure consultation", "Arnica and eucalyptus oil", "Heat pack for the shoulders"],
    goodFor: "Tight shoulders, sports recovery",
    photo: "table",
  },
  {
    slug: "hot-stone",
    name: "Hot stone massage",
    ritual: "massage",
    summary: "River stones from the Bued, warmed and worked along the spine.",
    description: [
      "Smooth basalt stones are warmed to 50 °C and used as an extension of your therapist’s hands, melting tension faster than pressure alone.",
      "A deeply warming treatment for Baguio’s cool evenings.",
    ],
    options: [{ minutes: 90, price: 3800 }],
    includes: ["Warm stone placement", "Scalp massage", "Tea and dried mango"],
    goodFor: "Cold hands and feet, deep relaxation",
    photo: "stones",
  },
  {
    slug: "botanical-facial",
    name: "Botanical facial",
    ritual: "facial",
    summary: "Cleanse, steam, mask and massage with plant-based skincare.",
    description: [
      "A facial built around your skin on the day. We use small-batch skincare made from calamansi, moringa and rice water, all grown in Benguet.",
      "Includes a face, neck and shoulder massage while the mask sets.",
    ],
    options: [
      { minutes: 45, price: 2200 },
      { minutes: 75, price: 3200 },
    ],
    includes: ["Skin consultation", "Steam and gentle extraction", "Take-home sample kit"],
    goodFor: "Dull or dry skin, a pre-event glow",
    photo: "oil",
  },
  {
    slug: "coffee-scrub",
    name: "Coffee and coconut scrub",
    ritual: "body",
    summary: "Benguet arabica grounds and coconut sugar, rinsed under a rain shower.",
    description: [
      "A full-body scrub with locally roasted coffee, coconut sugar and oil, followed by a warm rain shower and a rich body butter.",
      "Your skin will feel new, and you’ll smell like breakfast.",
    ],
    options: [{ minutes: 45, price: 1900 }],
    includes: ["Full-body scrub", "Rain shower", "Shea and coconut body butter"],
    goodFor: "Rough skin, before a beach trip",
    photo: "leaves",
  },
  {
    slug: "eucalyptus-wrap",
    name: "Eucalyptus body wrap",
    ritual: "body",
    summary: "A warm green-clay wrap that clears the head and the chest.",
    description: [
      "Green clay and eucalyptus oil are painted on and wrapped in warm linen while you rest. A scalp massage keeps you company.",
      "Lovely when you’re coming down with something, or just coming down from the week.",
    ],
    options: [{ minutes: 60, price: 2500 }],
    includes: ["Dry brushing", "Green clay and eucalyptus wrap", "Scalp massage"],
    goodFor: "Congestion, heavy legs",
    photo: "eucalyptus",
  },
  {
    slug: "thermal-circuit",
    name: "Thermal circuit",
    ritual: "bathing",
    summary: "Two hours between the steam room, sauna, warm pool and cold plunge.",
    description: [
      "Our bathhouse follows an old pattern: heat, cold, rest, repeat. Start in the steam room, plunge, then float in the long pool under the timber roof.",
      "Robes, slippers and towels are provided, and tea is served in the quiet room.",
    ],
    options: [{ minutes: 120, price: 1500 }],
    includes: ["Steam room and sauna", "Warm pool and cold plunge", "Quiet room with tea"],
    goodFor: "A slow afternoon, pairing with any treatment",
    photo: "long-pool",
  },
  {
    slug: "private-soak",
    name: "Private soak for two",
    ritual: "bathing",
    summary: "A private bathing room for two, with a mineral soak and tea.",
    description: [
      "Book the vaulted bath room just for the two of you: a deep mineral soak, a rain shower and a daybed for afterwards.",
      "We bring tea and a small plate of seasonal fruit halfway through.",
    ],
    options: [{ minutes: 60, price: 3600 }],
    includes: ["Private bath room", "Mineral salts", "Tea and fruit"],
    goodFor: "Couples, birthdays",
    photo: "bath-hall",
    forTwo: true,
  },
];

export const packages = [
  {
    name: "Half day of quiet",
    minutes: 210,
    price: 5900,
    items: ["Thermal circuit", "Hilot healing massage, 60 min", "Botanical facial, 45 min", "Lunch in the garden lounge"],
    photo: "pool" as PhotoKey,
  },
  {
    name: "Together",
    minutes: 150,
    price: 9800,
    items: ["Private soak for two", "Side-by-side hilot massage, 60 min", "Sparkling tea and dessert"],
    photo: "treatment-room" as PhotoKey,
  },
  {
    name: "Mountain reset",
    minutes: 180,
    price: 6200,
    items: ["Coffee and coconut scrub", "Hot stone massage, 90 min", "Thermal circuit"],
    photo: "stones" as PhotoKey,
  },
];

export const memberships = [
  { name: "Steady", price: 3900, per: "month", perks: ["One 60-minute treatment each month", "Thermal circuit any weekday", "10% off extra treatments"] },
  { name: "Deep", price: 6900, per: "month", perks: ["Two 60-minute treatments each month", "Unlimited thermal circuit", "Bring a friend once a month", "15% off retail"] },
];

export const therapists = [
  { name: "Liza", craft: "Hilot and pregnancy massage", years: 14 },
  { name: "Ramon", craft: "Deep tissue and sports massage", years: 9 },
  { name: "Joy", craft: "Facials and skin consultations", years: 11 },
  { name: "Ana", craft: "Hot stone and body treatments", years: 7 },
];

export const reviews = [
  { quote: "I fell asleep twice during the hilot. The steam room afterwards was the best hour of my month.", name: "Patricia L.", when: "September" },
  { quote: "Calm from the moment you walk in. My husband now asks for the private soak every anniversary.", name: "Nina and Carlo", when: "July" },
];
