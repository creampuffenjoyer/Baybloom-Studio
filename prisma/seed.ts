/**
 * Seed data: industries, styles, features, add-ons and the website templates
 * listed in prisma/catalog.ts. Catalog images come from
 * public/images/designs/<slug>/credits.json.
 *
 * Idempotent: re-running updates designs in place and replaces their images,
 * tiers and feature links. Categories, styles and features that are no longer
 * listed are removed once nothing uses them.
 *
 * Optional: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create an admin.
 */
import "dotenv/config";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, type ImageKind, type TierLevel } from "@prisma/client";
import { CATEGORIES, DESIGNS, FEATURES, GLOBAL_ADDONS, STYLES } from "./catalog";

const db = new PrismaClient();
const peso = (amount: number) => amount * 100;
const TIER_ORDER: TierLevel[] = ["STARTER", "STANDARD", "PREMIUM"];

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

async function readCredits(slug: string): Promise<Credit[] | null> {
  const file = path.join(process.cwd(), "public", "images", "designs", slug, "credits.json");
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
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

/** Guides that come with each tier (sample PDFs until the real ones are uploaded). */
const GUIDES: Record<TierLevel, (title: string) => { name: string; lines: string[] }> = {
  STARTER: (title) => ({
    name: `${title} - Setup guide.pdf`,
    lines: [title, "Setup guide (sample file)", "Install, run and deploy the template.", "Replace it from the admin dashboard."],
  }),
  STANDARD: (title) => ({
    name: `${title} - CMS and booking integration guide.pdf`,
    lines: [title, "CMS and booking integration guide (sample file)", "Included with the Standard and Premium tiers."],
  }),
  PREMIUM: (title) => ({
    name: `${title} - Brand customisation kit.pdf`,
    lines: [title, "Brand customisation kit (sample file)", "Included with the Premium tier only."],
  }),
};

/**
 * Every tier gets the template's source code (built by `npm run templates:pack`)
 * plus the guide for its level.
 */
async function seedDeliverables(designId: string, slug: string, title: string) {
  const tiers = await db.tier.findMany({ where: { designId }, select: { id: true, level: true } });
  await db.deliverableFile.deleteMany({ where: { designId } });
  const dir = path.join(process.cwd(), "storage", "deliverables", slug);
  await mkdir(dir, { recursive: true });

  const lowest = tiers.sort((a, b) => TIER_ORDER.indexOf(a.level) - TIER_ORDER.indexOf(b.level))[0];
  const zipName = `${slug}-source.zip`;
  const zip = await stat(path.join(dir, zipName)).catch(() => null);
  if (lowest && zip) {
    await db.deliverableFile.create({
      data: {
        designId,
        minTierId: lowest.id,
        name: `${title} - Source code.zip`,
        storageKey: `deliverables/${slug}/${zipName}`,
        sizeBytes: zip.size,
      },
    });
  } else if (!zip) {
    console.warn(`  ! No ${zipName} yet; run npm run templates:pack before seeding`);
  }

  for (const tier of tiers) {
    const { name, lines } = GUIDES[tier.level](title);
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
      update: { name: f.name, group: f.group },
    });
  }
  for (const a of GLOBAL_ADDONS) {
    const existing = await db.addon.findFirst({ where: { designId: null, name: a.name } });
    const data = {
      name: a.name,
      description: a.description,
      priceCents: peso(a.price),
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
    if (!credits?.length) {
      console.warn(`! Skipped ${d.title}: no catalog images in public/images/designs/${d.slug}`);
      continue;
    }
    const [hero] = credits;
    const publishedAt = new Date(Date.now() - d.publishedDaysAgo * 86_400_000);

    const base = {
      title: d.title,
      summary: d.summary,
      description: d.description,
      status: "PUBLISHED" as const,
      featured: d.featured ?? false,
      categoryId: categories[d.category],
      styleId: styles[d.style],
      heroImage: hero.file,
      heroAlt: hero.alt,
      demoUrl: `/demo/${d.slug}`,
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
          // Screenshots carry no photo credit of their own.
          creditName: c.author || null,
          creditUrl: c.author ? c.source : null,
          license: c.license || null,
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
    await seedDeliverables(design.id, d.slug, d.title);
    console.log(`✓ ${d.title} (${credits.length} images, ${d.tiers.length} tiers)`);
  }

  // Drop taxonomy that is no longer listed (and no longer used).
  const listed = DESIGNS.map((d) => d.slug);
  const archived = await db.design.updateMany({
    where: { slug: { notIn: listed }, status: "PUBLISHED" },
    data: { status: "ARCHIVED" },
  });
  if (archived.count) console.log(`✓ Archived ${archived.count} unlisted designs`);
  await db.category.deleteMany({
    where: { slug: { notIn: CATEGORIES.map((c) => c.slug) }, designs: { none: {} } },
  });
  await db.style.deleteMany({
    where: { slug: { notIn: STYLES.map((x) => x.slug) }, designs: { none: {} } },
  });
  await db.feature.deleteMany({ where: { slug: { notIn: FEATURES.map((f) => f.slug) } } });

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
