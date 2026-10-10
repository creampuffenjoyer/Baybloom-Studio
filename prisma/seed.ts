/**
 * Seed data: categories, styles, features, add-ons and 8 sample designs.
 * Images come from public/images/designs/<slug>/credits.json, written by the
 * image-sourcing step (freely licensed Wikimedia Commons photos, spec §7A).
 *
 * Idempotent: re-running updates designs in place and replaces their images,
 * tiers and feature links.
 *
 * Optional: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create an admin.
 */
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  type ImageKind,
  type ProductType,
  type TierLevel,
} from "@prisma/client";

const db = new PrismaClient();
const peso = (amount: number) => amount * 100;

const CATEGORIES = [
  { slug: "beach", name: "Beach", description: "Sand, surf and sunset-facing villas." },
  { slug: "mountain", name: "Mountain", description: "Lodges and chalets with a view of the peaks." },
  { slug: "lake", name: "Lake", description: "Calm-water retreats, jetties and boathouses." },
  { slug: "eco", name: "Eco", description: "Low-impact stays woven into the landscape." },
  { slug: "luxury", name: "Luxury", description: "Suites, spas and private-pool villas." },
  { slug: "boutique", name: "Boutique", description: "Small, characterful hotels with a story." },
];

const STYLES = [
  { slug: "tropical-modern", name: "Tropical Modern" },
  { slug: "alpine-rustic", name: "Alpine Rustic" },
  { slug: "contemporary-minimal", name: "Contemporary Minimal" },
  { slug: "colonial-heritage", name: "Colonial Heritage" },
  { slug: "organic-eco", name: "Organic Eco" },
];

const WEB: ProductType[] = ["WEBSITE"];
const BUILT: ProductType[] = ["ARCHITECTURE", "INTERIOR"];

const FEATURES: { slug: string; name: string; group: string; appliesTo: ProductType[] }[] = [
  { slug: "online-booking", name: "Online booking", group: "Booking", appliesTo: WEB },
  { slug: "availability-calendar", name: "Room availability calendar", group: "Booking", appliesTo: WEB },
  { slug: "payment-gateway", name: "Payment gateway", group: "Booking", appliesTo: WEB },
  { slug: "event-inquiry", name: "Event & wedding inquiry", group: "Booking", appliesTo: WEB },
  { slug: "gallery", name: "Photo gallery", group: "Content", appliesTo: WEB },
  { slug: "virtual-tour", name: "Virtual tour", group: "Content", appliesTo: WEB },
  { slug: "blog", name: "Blog", group: "Content", appliesTo: WEB },
  { slug: "cms-admin", name: "CMS admin", group: "Content", appliesTo: WEB },
  { slug: "multi-language", name: "Multi-language", group: "Marketing", appliesTo: WEB },
  { slug: "seo-setup", name: "SEO setup", group: "Marketing", appliesTo: WEB },
  { slug: "pwa", name: "Mobile app-style PWA", group: "Marketing", appliesTo: WEB },
  { slug: "floor-plans", name: "Floor plans", group: "Drawings", appliesTo: BUILT },
  { slug: "cad-files", name: "CAD files", group: "Drawings", appliesTo: BUILT },
  { slug: "lighting-plan", name: "Lighting plan", group: "Drawings", appliesTo: BUILT },
  { slug: "landscape-plan", name: "Landscape plan", group: "Drawings", appliesTo: BUILT },
  { slug: "3d-renders", name: "3D renders", group: "Visuals", appliesTo: BUILT },
  { slug: "material-schedule", name: "Material schedule", group: "Specs & costing", appliesTo: BUILT },
  { slug: "cost-estimate", name: "Cost estimate", group: "Specs & costing", appliesTo: BUILT },
  { slug: "revision-rounds", name: "Revision rounds", group: "Specs & costing", appliesTo: BUILT },
];

/** Add-ons that apply to every design of the given product types. */
const GLOBAL_ADDONS = [
  { name: "Extra revision round", description: "One more round of changes after delivery.", price: 6500, productTypes: [] as ProductType[] },
  { name: "Custom branding", description: "Your logo, colours and typography applied throughout.", price: 12000, productTypes: WEB },
  { name: "Hosting setup", description: "Domain, SSL and hosting configured for you.", price: 8500, productTypes: WEB },
  { name: "Additional language", description: "One extra language version of every page.", price: 9000, productTypes: WEB },
  { name: "Extra 3D render", description: "One additional photoreal render of a space of your choice.", price: 7500, productTypes: BUILT },
];

type TierSeed = { level: TierLevel; price: number; revisions: number; inclusions: string[] };

type DesignSeed = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  type: ProductType;
  category: string;
  style: string;
  featured?: boolean;
  publishedDaysAgo: number;
  features: string[];
  deliverables: string[];
  tiers: TierSeed[];
  addons?: { name: string; description: string; price: number }[];
};

const webTiers = (base: number): TierSeed[] => [
  {
    level: "STARTER",
    price: base,
    revisions: 1,
    inclusions: ["Home, Rooms, Contact and Map pages", "Mobile-responsive layout", "Booking request form"],
  },
  {
    level: "STANDARD",
    price: Math.round(base * 2.1),
    revisions: 2,
    inclusions: [
      "Up to 10 pages incl. packages & dining",
      "Online booking with availability calendar",
      "CMS admin for rooms and rates",
      "Basic SEO setup",
    ],
  },
  {
    level: "PREMIUM",
    price: Math.round(base * 4.2),
    revisions: 3,
    inclusions: [
      "Unlimited pages and blog",
      "Payment gateway and multi-language",
      "Full Figma and source files",
      "Priority support and custom tweaks",
    ],
  },
];

const builtTiers = (base: number, kind: "plans" | "interiors"): TierSeed[] => [
  {
    level: "STARTER",
    price: base,
    revisions: 1,
    inclusions:
      kind === "plans"
        ? ["Concept floor plans (PDF)", "2 exterior renders", "Room schedule"]
        : ["Concept mood boards", "Furniture layout (PDF)", "2 interior renders"],
  },
  {
    level: "STANDARD",
    price: Math.round(base * 2.2),
    revisions: 3,
    inclusions:
      kind === "plans"
        ? ["Dimensioned plans, sections and elevations", "6 renders", "Material schedule", "Landscape concept"]
        : ["Full furniture & finishes schedule", "Lighting plan", "6 renders", "Supplier list"],
  },
  {
    level: "PREMIUM",
    price: Math.round(base * 4.3),
    revisions: 5,
    inclusions:
      kind === "plans"
        ? ["Editable CAD (DWG) and BIM files", "12 renders + walkthrough", "Cost estimate", "Priority support"]
        : ["Editable CAD and SketchUp files", "12 renders", "Cost estimate", "Priority support and custom tweaks"],
  },
];

const DESIGNS: DesignSeed[] = [
  {
    slug: "coral-cove",
    title: "Coral Cove",
    summary: "A sun-washed beach resort website, built to turn lagoon views into bookings.",
    description:
      "Coral Cove is a bright, image-led template for beachfront resorts and island hideaways. Full-bleed lagoon photography leads straight into a sticky booking bar, so guests can check dates from the very first scroll.\n\nRoom pages pair large galleries with clear rate cards, and a packages section makes it easy to promote honeymoon, dive and long-stay offers. Every layout is tuned for mobile, where most beach bookings now happen.",
    type: "WEBSITE",
    category: "beach",
    style: "tropical-modern",
    featured: true,
    publishedDaysAgo: 3,
    features: ["online-booking", "availability-calendar", "payment-gateway", "gallery", "event-inquiry", "seo-setup", "pwa", "cms-admin"],
    deliverables: [
      "Next.js + Tailwind source code",
      "Figma design file (desktop & mobile)",
      "Booking and inquiry form integrations",
      "Setup guide and content checklist",
    ],
    tiers: webTiers(18000),
  },
  {
    slug: "pine-ridge-lodge",
    title: "Pine Ridge Lodge",
    summary: "A warm, timber-toned website for mountain lodges and ski chalets.",
    description:
      "Pine Ridge Lodge brings the feeling of a crackling fire to the browser: deep greens, warm wood tones and generous serif headlines. Seasonal hero sections let you switch between ski-season and summer-hiking imagery without touching code.\n\nA trail and activities guide, weather widget slot and gear-rental inquiry form help guests plan their whole stay, while the booking flow stays one tap away.",
    type: "WEBSITE",
    category: "mountain",
    style: "alpine-rustic",
    featured: true,
    publishedDaysAgo: 10,
    features: ["online-booking", "availability-calendar", "gallery", "blog", "multi-language", "seo-setup", "cms-admin"],
    deliverables: [
      "Next.js + Tailwind source code",
      "Figma design file (desktop & mobile)",
      "Seasonal hero presets (winter / summer)",
      "Setup guide and content checklist",
    ],
    tiers: webTiers(16000),
  },
  {
    slug: "lumen-lake-villas",
    title: "Lumen Lake Villas",
    summary: "A calm, minimal site for lakeside villas, jetties and boathouses.",
    description:
      "Lumen Lake Villas is all quiet confidence: airy layouts, soft blues and photography that lets the water do the talking. A villa comparison page helps guests choose between waterfront, garden and family options at a glance.\n\nThe built-in experiences section showcases kayaking, sunset cruises and private dining, each with its own inquiry form, and the virtual tour block is ready for 360° walkthroughs.",
    type: "WEBSITE",
    category: "lake",
    style: "contemporary-minimal",
    publishedDaysAgo: 18,
    features: ["online-booking", "availability-calendar", "payment-gateway", "virtual-tour", "gallery", "multi-language", "seo-setup"],
    deliverables: [
      "Next.js + Tailwind source code",
      "Figma design file (desktop & mobile)",
      "Villa comparison and experiences templates",
      "Setup guide and content checklist",
    ],
    tiers: webTiers(20000),
  },
  {
    slug: "isla-verde-boutique",
    title: "Isla Verde Boutique",
    summary: "An elegant, story-led website for heritage and boutique hotels.",
    description:
      "Isla Verde is made for hotels with a story to tell: restored mansions, colonial villas and characterful guesthouses. Editorial layouts give room to history, architecture and the people behind the property.\n\nA dining and events section handles restaurant reservations and wedding inquiries, and the journal template keeps your blog looking as considered as your rooms.",
    type: "WEBSITE",
    category: "boutique",
    style: "colonial-heritage",
    featured: true,
    publishedDaysAgo: 6,
    features: ["online-booking", "availability-calendar", "event-inquiry", "blog", "gallery", "cms-admin", "seo-setup"],
    deliverables: [
      "Next.js + Tailwind source code",
      "Figma design file (desktop & mobile)",
      "Journal (blog) and events templates",
      "Setup guide and content checklist",
    ],
    tiers: webTiers(22000).slice(0, 2),
  },
  {
    slug: "tidewater-villa",
    title: "Tidewater Overwater Villa",
    summary: "A two-bedroom overwater villa with plunge pool, sun deck and lagoon stair.",
    description:
      "Tidewater is a 140 m² overwater villa designed around uninterrupted lagoon views. A central living pavilion opens on three sides to a timber sun deck, with a private plunge pool and a stair straight down into the water.\n\nThe plan works as a single hero villa or repeated along a jetty, with service access kept discreet beneath the boardwalk. Structural notes cover pile spacing and marine-grade materials.",
    type: "ARCHITECTURE",
    category: "beach",
    style: "tropical-modern",
    featured: true,
    publishedDaysAgo: 4,
    features: ["floor-plans", "3d-renders", "cad-files", "material-schedule", "cost-estimate", "revision-rounds"],
    deliverables: [
      "Floor plans, sections and elevations (PDF)",
      "Exterior and interior renders (JPG)",
      "Material and finishes schedule",
      "Editable CAD files (Premium)",
    ],
    tiers: builtTiers(65000, "plans"),
    addons: [
      {
        name: "Jetty cluster masterplan",
        description: "Site layout for 6–12 villas along a shared jetty.",
        price: 35000,
      },
    ],
  },
  {
    slug: "canopy-eco-pods",
    title: "Canopy Eco Pods",
    summary: "A low-impact cluster of raised forest pods, glamping tents and a clubhouse.",
    description:
      "Canopy Eco Pods is a site layout and building set for small eco resorts: eight raised timber pods, four platform tents and a pool-side clubhouse, linked by elevated boardwalks that leave the forest floor untouched.\n\nThe package favours local timber, passive cooling and rainwater harvesting, with notes on phasing so you can open with a few units and grow over time.",
    type: "ARCHITECTURE",
    category: "eco",
    style: "organic-eco",
    publishedDaysAgo: 14,
    features: ["floor-plans", "landscape-plan", "3d-renders", "material-schedule", "cost-estimate", "revision-rounds"],
    deliverables: [
      "Site plan and boardwalk layout (PDF)",
      "Pod, tent-platform and clubhouse plans",
      "Landscape and drainage concept",
      "Material schedule with local-timber options",
    ],
    tiers: builtTiers(72000, "plans"),
  },
  {
    slug: "hibiscus-suite",
    title: "Hibiscus Suite Interiors",
    summary: "A light-filled luxury suite concept with teak, linen and a garden bath.",
    description:
      "Hibiscus Suite reimagines the classic tropical suite: whitewashed walls, honey-toned teak, a four-poster bed dressed in linen and a bathroom that opens to a private garden.\n\nThe concept covers bedroom, lounge, dressing area and bath, with a lighting plan that moves from bright mornings to warm, low evening light.",
    type: "INTERIOR",
    category: "luxury",
    style: "colonial-heritage",
    featured: true,
    publishedDaysAgo: 8,
    features: ["floor-plans", "3d-renders", "lighting-plan", "material-schedule", "cost-estimate", "revision-rounds"],
    deliverables: [
      "Furniture layout and elevations (PDF)",
      "Finishes, fabrics and furniture schedule",
      "Lighting plan",
      "Interior renders (JPG)",
    ],
    tiers: builtTiers(45000, "interiors"),
  },
  {
    slug: "ridgeline-lodge-interiors",
    title: "Ridgeline Lodge Interiors",
    summary: "Cosy alpine interiors for lodge lounges, dining rooms and guest rooms.",
    description:
      "Ridgeline brings fireside comfort to mountain lodges: reclaimed timber, leather armchairs, wool throws and stone hearths. The scheme covers the lobby lounge, dining room and two guest-room types.\n\nFinishes are chosen to age well under ski boots and wet jackets, and the lighting plan layers warm pools of light for long winter evenings.",
    type: "INTERIOR",
    category: "mountain",
    style: "alpine-rustic",
    publishedDaysAgo: 21,
    features: ["floor-plans", "3d-renders", "lighting-plan", "material-schedule", "cad-files", "revision-rounds"],
    deliverables: [
      "Lounge, dining and guest-room layouts (PDF)",
      "Finishes and furniture schedule",
      "Lighting plan",
      "Interior renders (JPG)",
    ],
    tiers: builtTiers(42000, "interiors").slice(1),
  },
];

type Credit = {
  file: string;
  thumb: string;
  alt: string;
  kind: ImageKind;
  width: number;
  height: number;
  author: string;
  source: string;
  license: string;
  licenseUrl: string | null;
};

async function readCredits(slug: string): Promise<Credit[]> {
  const file = path.join(process.cwd(), "public", "images", "designs", slug, "credits.json");
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    throw new Error(`Missing ${file}. Run the image-sourcing step before seeding.`);
  }
}

// ─── Sample deliverables ─────────────────────────────────────────────────────

/** A tiny one-page PDF with a few lines of text (sample deliverable). */
function samplePdf(lines: string[]) {
  const esc = (t: string) => t.replace(/[\\()]/g, (c) => `\\${c}`).replace(/[^\x20-\x7e]/g, "-");
  const text = lines
    .map((l, i) => {
      const size = i === 0 ? 20 : 12;
      const y = i === 0 ? 720 : 680 - (i - 1) * 22;
      return `BT /F1 ${size} Tf 72 ${y} Td (${esc(l)}) Tj ET`;
    })
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

const FILE_SETS: Record<TierLevel, (title: string, type: ProductType) => { name: string; lines: string[] }> = {
  STARTER: (title, type) => ({
    name: `${title} - ${type === "WEBSITE" ? "Starter template pack" : "Concept drawings"}.pdf`,
    lines: [`${title}`, "Starter deliverables (sample file)", "This placeholder stands in for the real design files.", "Replace it from the admin dashboard."],
  }),
  STANDARD: (title, type) => ({
    name: `${title} - ${type === "WEBSITE" ? "Full page set & CMS guide" : "Plans, sections & schedules"}.pdf`,
    lines: [`${title}`, "Standard deliverables (sample file)", "Included with the Standard and Premium tiers."],
  }),
  PREMIUM: (title, type) => ({
    name: `${title} - ${type === "WEBSITE" ? "Source files index" : "CAD & render package index"}.pdf`,
    lines: [`${title}`, "Premium deliverables (sample file)", "Included with the Premium tier only."],
  }),
};

async function seedDeliverables(designId: string, slug: string, title: string, type: ProductType) {
  const tiers = await db.tier.findMany({ where: { designId }, select: { id: true, level: true } });
  await db.deliverableFile.deleteMany({ where: { designId } });
  const dir = path.join(process.cwd(), "storage", "deliverables", slug);
  await mkdir(dir, { recursive: true });
  for (const tier of tiers) {
    const { name, lines } = FILE_SETS[tier.level](title, type);
    const data = samplePdf(lines);
    const fileName = name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    await writeFile(path.join(dir, fileName), data);
    await db.deliverableFile.create({
      data: {
        designId,
        minTierId: tier.id,
        name,
        storageKey: `deliverables/${slug}/${fileName}`,
        sizeBytes: data.length,
      },
    });
  }
}

const COUPONS = [
  { code: "WELCOME10", percentOff: 10 },
  { code: "BLOOM5000", amountOffCents: peso(5000), minSubtotalCents: peso(40000) },
];

async function main() {
  for (const [position, c] of CATEGORIES.entries()) {
    await db.category.upsert({
      where: { slug: c.slug },
      create: { ...c, position },
      update: { name: c.name, description: c.description, position },
    });
  }
  for (const [position, s] of STYLES.entries()) {
    await db.style.upsert({
      where: { slug: s.slug },
      create: { ...s, position },
      update: { name: s.name, position },
    });
  }
  for (const f of FEATURES) {
    await db.feature.upsert({
      where: { slug: f.slug },
      create: f,
      update: { name: f.name, group: f.group, appliesTo: f.appliesTo },
    });
  }
  for (const a of GLOBAL_ADDONS) {
    const existing = await db.addon.findFirst({ where: { designId: null, name: a.name } });
    const data = {
      name: a.name,
      description: a.description,
      priceCents: peso(a.price),
      productTypes: a.productTypes,
    };
    if (existing) await db.addon.update({ where: { id: existing.id }, data });
    else await db.addon.create({ data });
  }

  const categories = Object.fromEntries(
    (await db.category.findMany()).map((c) => [c.slug, c.id]),
  );
  const styles = Object.fromEntries((await db.style.findMany()).map((s) => [s.slug, s.id]));
  const features = Object.fromEntries((await db.feature.findMany()).map((f) => [f.slug, f.id]));

  for (const d of DESIGNS) {
    const credits = await readCredits(d.slug);
    if (credits.length === 0) throw new Error(`No images recorded for ${d.slug}`);
    const [hero] = credits;
    const publishedAt = new Date(Date.now() - d.publishedDaysAgo * 86_400_000);

    const base = {
      title: d.title,
      summary: d.summary,
      description: d.description,
      type: d.type,
      status: "PUBLISHED" as const,
      featured: d.featured ?? false,
      categoryId: categories[d.category],
      styleId: styles[d.style],
      heroImage: hero.file,
      heroAlt: hero.alt,
      deliverables: d.deliverables,
      publishedAt,
    };
    const design = await db.design.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, ...base },
      update: base,
    });

    await db.$transaction([
      db.designImage.deleteMany({ where: { designId: design.id } }),
      db.designImage.createMany({
        data: credits.map((c, position) => ({
          designId: design.id,
          url: c.file,
          thumbUrl: c.thumb,
          alt: c.alt,
          kind: c.kind,
          width: c.width,
          height: c.height,
          position,
          creditName: c.author,
          creditUrl: c.source,
          license: c.license,
          licenseUrl: c.licenseUrl,
        })),
      }),
      db.designFeature.deleteMany({ where: { designId: design.id } }),
      db.designFeature.createMany({
        data: d.features.map((slug) => ({ designId: design.id, featureId: features[slug] })),
      }),
      db.tier.deleteMany({
        where: { designId: design.id, level: { notIn: d.tiers.map((t) => t.level) } },
      }),
      ...d.tiers.map((t) =>
        db.tier.upsert({
          where: { designId_level: { designId: design.id, level: t.level } },
          create: {
            designId: design.id,
            level: t.level,
            name: t.level[0] + t.level.slice(1).toLowerCase(),
            priceCents: peso(t.price),
            inclusions: t.inclusions,
            revisions: t.revisions,
          },
          update: {
            priceCents: peso(t.price),
            inclusions: t.inclusions,
            revisions: t.revisions,
          },
        }),
      ),
      db.addon.deleteMany({ where: { designId: design.id } }),
      db.addon.createMany({
        data: (d.addons ?? []).map((a) => ({
          designId: design.id,
          name: a.name,
          description: a.description,
          priceCents: peso(a.price),
        })),
      }),
    ]);
    await seedDeliverables(design.id, d.slug, d.title, d.type);
    console.log(`✓ ${d.title} (${credits.length} images, ${d.tiers.length} tiers)`);
  }

  for (const c of COUPONS) {
    await db.coupon.upsert({ where: { code: c.code }, create: c, update: { ...c, active: true } });
  }
  console.log(`✓ Coupons: ${COUPONS.map((c) => c.code).join(", ")}`);

  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
  if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
    const email = SEED_ADMIN_EMAIL.toLowerCase();
    await db.user.upsert({
      where: { email },
      create: {
        email,
        name: "Baybloom Admin",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 12),
        emailVerified: new Date(),
      },
      update: { role: "ADMIN" },
    });
    console.log(`✓ Admin user ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
