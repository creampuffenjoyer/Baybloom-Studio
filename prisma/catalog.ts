/**
 * The Baybloom catalog: website templates for hospitality brands.
 * Each design has a live demo at /demo/<slug> (src/app/demo/<slug>) built from
 * src/templates/<slug>, and its source is packed by `npm run templates:pack`.
 */
import type { TierLevel } from "@prisma/client";

export const CATEGORIES = [
  { slug: "resort", name: "Resorts", description: "Beach, mountain and lakeside stays." },
  { slug: "hotel", name: "Hotels & B&Bs", description: "Boutique hotels, inns and guesthouses." },
  { slug: "restaurant", name: "Restaurants & cafés", description: "Menus, reservations and private dining." },
  { slug: "spa", name: "Spas & wellness", description: "Treatments, memberships and online booking." },
  { slug: "venue", name: "Wedding & event venues", description: "Spaces, packages and event inquiries." },
];

/** Visual styles (the look of the template, independent of industry). */
export const STYLES = [
  { slug: "tropical-modern", name: "Tropical Modern" },
  { slug: "alpine-rustic", name: "Alpine Rustic" },
  { slug: "contemporary-minimal", name: "Contemporary Minimal" },
  { slug: "colonial-heritage", name: "Colonial Heritage" },
  { slug: "coastal-cottage", name: "Coastal Cottage" },
  { slug: "moody-editorial", name: "Moody Editorial" },
  { slug: "organic-calm", name: "Organic Calm" },
  { slug: "romantic-garden", name: "Romantic Garden" },
];

export const FEATURES: { slug: string; name: string; group: string }[] = [
  { slug: "online-booking", name: "Room booking flow", group: "Booking" },
  { slug: "availability-calendar", name: "Availability calendar", group: "Booking" },
  { slug: "table-reservations", name: "Table reservations", group: "Booking" },
  { slug: "appointment-booking", name: "Appointment booking", group: "Booking" },
  { slug: "event-inquiry", name: "Event & wedding inquiry", group: "Booking" },
  { slug: "payment-gateway", name: "Payment gateway ready", group: "Booking" },
  { slug: "gift-cards", name: "Gift cards", group: "Booking" },
  { slug: "menu-pages", name: "Menu pages", group: "Content" },
  { slug: "gallery", name: "Photo gallery", group: "Content" },
  { slug: "virtual-tour", name: "Virtual tour", group: "Content" },
  { slug: "blog", name: "Blog / journal", group: "Content" },
  { slug: "reviews", name: "Guest reviews", group: "Content" },
  { slug: "cms-admin", name: "CMS-ready content", group: "Content" },
  { slug: "multi-language", name: "Multi-language ready", group: "Marketing" },
  { slug: "seo-setup", name: "SEO setup", group: "Marketing" },
  { slug: "newsletter", name: "Newsletter sign-up", group: "Marketing" },
  { slug: "pwa", name: "Mobile app-style PWA", group: "Marketing" },
];

/** Add-ons offered with every template. */
export const GLOBAL_ADDONS = [
  { name: "Extra revision round", description: "One more round of changes after delivery.", price: 6500 },
  { name: "Custom branding", description: "Your logo, colours and typography applied throughout.", price: 12000 },
  { name: "Hosting setup", description: "Domain, SSL and hosting configured for you.", price: 8500 },
  { name: "Additional language", description: "One extra language version of every page.", price: 9000 },
];

export type TierSeed = { level: TierLevel; price: number; revisions: number; inclusions: string[] };

type Industry = "stay" | "dining" | "spa" | "venue";

const CORE_PAGES: Record<Industry, string> = {
  stay: "Home, Rooms, Contact and Map pages",
  dining: "Home, Menu, Visit and Map pages",
  spa: "Home, Treatments, Contact and Map pages",
  venue: "Home, Spaces, Contact and Map pages",
};

const FLOW: Record<Industry, string> = {
  stay: "Room booking flow with availability calendar",
  dining: "Table reservation flow with time slots",
  spa: "Treatment booking flow with time slots",
  venue: "Event inquiry flow with date availability",
};

const REQUEST: Record<Industry, string> = {
  stay: "Booking request form",
  dining: "Reservation request form",
  spa: "Appointment request form",
  venue: "Event inquiry form",
};

export const tiers = (base: number, industry: Industry): TierSeed[] => [
  {
    level: "STARTER",
    price: base,
    revisions: 1,
    inclusions: [CORE_PAGES[industry], "Mobile-responsive layout", REQUEST[industry]],
  },
  {
    level: "STANDARD",
    price: Math.round(base * 2.1),
    revisions: 2,
    inclusions: [
      "Every page in the live demo",
      FLOW[industry],
      "CMS-ready content files",
      "Basic SEO setup",
    ],
  },
  {
    level: "PREMIUM",
    price: Math.round(base * 4.2),
    revisions: 3,
    inclusions: [
      "Everything in Standard",
      "Payment gateway and multi-language setup",
      "Brand customisation kit and style guide",
      "Priority support and custom tweaks",
    ],
  },
];

const SOURCE = "Next.js + Tailwind CSS source code for every demo page";
const GUIDE = "Setup guide and content checklist";
const TOKENS = "Style guide: colour, type and spacing tokens";

export type DesignSeed = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  style: string;
  featured?: boolean;
  publishedDaysAgo: number;
  features: string[];
  deliverables: string[];
  tiers: TierSeed[];
  addons?: { name: string; description: string; price: number }[];
};

export const DESIGNS: DesignSeed[] = [
  // ─── Resorts ────────────────────────────────────────────────────────────────
  {
    slug: "coral-cove",
    title: "Coral Cove",
    summary: "A sun-washed beach resort website, built to turn lagoon views into bookings.",
    description:
      "Coral Cove is a bright, image-led template for beachfront resorts and island hideaways. Full-bleed lagoon photography leads straight into a booking bar, so guests can check dates from the very first scroll.\n\nVilla pages pair large galleries with clear rate cards, an offers page promotes honeymoon, dive and long-stay packages, and a four-step booking flow takes guests from dates to confirmation. Every layout is tuned for mobile, where most beach bookings now happen.",
    category: "resort",
    style: "tropical-modern",
    featured: true,
    publishedDaysAgo: 3,
    features: ["online-booking", "availability-calendar", "payment-gateway", "gallery", "reviews", "seo-setup", "pwa", "cms-admin"],
    deliverables: [SOURCE, "Villa, offers and experiences templates", "Four-step booking flow components", TOKENS, GUIDE],
    tiers: tiers(18000, "stay"),
  },
  {
    slug: "pine-ridge-lodge",
    title: "Pine Ridge Lodge",
    summary: "A warm, timber-toned website for mountain lodges and ski chalets.",
    description:
      "Pine Ridge Lodge brings the feeling of a crackling fire to the browser: deep greens, warm wood tones and generous serif headlines. A seasonal switch on the home page flips between ski-season and summer-hiking content without touching code.\n\nA trail and activities guide, a lodge journal and a gear-rental inquiry form help guests plan their whole stay, while the booking flow stays one tap away.",
    category: "resort",
    style: "alpine-rustic",
    featured: true,
    publishedDaysAgo: 10,
    features: ["online-booking", "availability-calendar", "gallery", "blog", "multi-language", "seo-setup", "cms-admin"],
    deliverables: [SOURCE, "Seasonal home page (winter / summer)", "Activities guide and journal templates", TOKENS, GUIDE],
    tiers: tiers(16000, "stay"),
  },
  {
    slug: "lumen-lake-villas",
    title: "Lumen Lake Villas",
    summary: "A calm, minimal site for lakeside villas, jetties and boathouses.",
    description:
      "Lumen Lake Villas is all quiet confidence: airy layouts, soft blues and photography that lets the water do the talking. A villa comparison page helps guests choose between waterfront, garden and family options at a glance.\n\nThe experiences section showcases kayaking, sunset cruises and private dining, each with its own inquiry form, and a virtual-tour page is ready for 360° walkthroughs.",
    category: "resort",
    style: "contemporary-minimal",
    publishedDaysAgo: 18,
    features: ["online-booking", "availability-calendar", "payment-gateway", "virtual-tour", "gallery", "multi-language", "seo-setup"],
    deliverables: [SOURCE, "Villa comparison and experiences templates", "Virtual-tour page", TOKENS, GUIDE],
    tiers: tiers(20000, "stay"),
  },

  // ─── Hotels & B&Bs ──────────────────────────────────────────────────────────
  {
    slug: "isla-verde-boutique",
    title: "Isla Verde Boutique",
    summary: "An elegant, story-led website for heritage and boutique hotels.",
    description:
      "Isla Verde is made for hotels with a story to tell: restored mansions, colonial villas and characterful townhouses. Editorial layouts give room to history, architecture and the people behind the property.\n\nA dining page handles restaurant reservations, an events page takes wedding inquiries, and the journal keeps your blog looking as considered as your rooms.",
    category: "hotel",
    style: "colonial-heritage",
    featured: true,
    publishedDaysAgo: 6,
    features: ["online-booking", "availability-calendar", "event-inquiry", "table-reservations", "blog", "gallery", "cms-admin", "seo-setup"],
    deliverables: [SOURCE, "Story, journal and events templates", "Room booking flow components", TOKENS, GUIDE],
    tiers: tiers(22000, "stay").slice(0, 2),
  },
  {
    slug: "harbor-house",
    title: "Harbor House",
    summary: "A cosy, friendly website for bed & breakfasts and seaside guesthouses.",
    description:
      "Harbor House feels like a handwritten welcome note: buttery yellows, sea-blue accents and a friendly serif that suits small, owner-run places. Each room gets its own page with a simple rate card, and the breakfast page shows off what makes your mornings special.\n\nA local guide lists the walks, cafés and beaches nearby, guest reviews do the persuading, and a light, three-step booking flow keeps things personal without a full booking engine.",
    category: "hotel",
    style: "coastal-cottage",
    publishedDaysAgo: 2,
    features: ["online-booking", "availability-calendar", "reviews", "gallery", "newsletter", "seo-setup", "cms-admin"],
    deliverables: [SOURCE, "Breakfast menu and local guide templates", "Three-step booking flow components", TOKENS, GUIDE],
    tiers: tiers(12000, "stay"),
  },

  // ─── Restaurants & cafés ────────────────────────────────────────────────────
  {
    slug: "ember-and-salt",
    title: "Ember & Salt",
    summary: "A dark, moody website for wood-fired restaurants and cocktail bars.",
    description:
      "Ember & Salt sets the table before guests arrive: low light, warm ember accents and big editorial type. The menu page is organised into tabs for dinner, drinks and dessert, with dietary markers and prices that are easy to update.\n\nGuests reserve in three quick steps (party size, date and time slot, details), and a private-dining page handles group bookings and events. Gift cards, a chef's story and a visit page with hours and directions round it out.",
    category: "restaurant",
    style: "moody-editorial",
    featured: true,
    publishedDaysAgo: 1,
    features: ["table-reservations", "menu-pages", "event-inquiry", "gift-cards", "gallery", "newsletter", "seo-setup", "cms-admin"],
    deliverables: [SOURCE, "Tabbed menu with dietary markers", "Reservation flow and private-dining inquiry", TOKENS, GUIDE],
    tiers: tiers(14000, "dining"),
  },

  // ─── Spas & wellness ────────────────────────────────────────────────────────
  {
    slug: "still-water-spa",
    title: "Still Water Spa",
    summary: "A serene, earthy website for day spas, wellness retreats and studios.",
    description:
      "Still Water slows the scroll down: sage and clay tones, soft rounded shapes and generous white space. Treatments are grouped by ritual (massage, facial, body, bathing) with durations, prices and a dedicated page for each.\n\nGuests book in four calm steps (treatment, date and time, details, confirmation), and pages for packages, memberships and gift cards help lift the average spend.",
    category: "spa",
    style: "organic-calm",
    featured: true,
    publishedDaysAgo: 4,
    features: ["appointment-booking", "availability-calendar", "gift-cards", "gallery", "reviews", "newsletter", "seo-setup", "cms-admin"],
    deliverables: [SOURCE, "Treatment menu and detail templates", "Appointment booking flow components", TOKENS, GUIDE],
    tiers: tiers(15000, "spa"),
  },

  // ─── Wedding & event venues ─────────────────────────────────────────────────
  {
    slug: "bloomfield-gardens",
    title: "Bloomfield Gardens",
    summary: "A romantic, garden-fresh website for wedding and event venues.",
    description:
      "Bloomfield Gardens is all soft light and blooming borders: blush and ivory tones, elegant italic serifs and photography that sells the day. Each space (the garden lawn, glasshouse, barn) gets its own page with capacities and layouts.\n\nWedding packages are laid out side by side, a planning page answers the questions couples always ask, and a guided inquiry flow checks date availability before collecting the details your events team needs.",
    category: "venue",
    style: "romantic-garden",
    featured: true,
    publishedDaysAgo: 5,
    features: ["event-inquiry", "availability-calendar", "gallery", "virtual-tour", "reviews", "blog", "seo-setup", "cms-admin"],
    deliverables: [SOURCE, "Spaces, packages and planning templates", "Event inquiry flow with date availability", TOKENS, GUIDE],
    tiers: tiers(18000, "venue"),
  },
];
