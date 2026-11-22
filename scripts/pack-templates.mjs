// Packs every template demo into a standalone Next.js + Tailwind project and
// zips it to storage/deliverables/<slug>/<slug>-source.zip (the seed attaches it).
//   node scripts/pack-templates.mjs [slug...] [--keep]   (--keep leaves the unzipped copy in storage/build)
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { zipSync } from "fflate";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const keep = args.includes("--keep");
const locksArg = args.find(a => a.startsWith("--lockfiles="));
const locksRoot = locksArg ? path.resolve(locksArg.slice("--lockfiles=".length)) : undefined;
const only = args.filter((a) => !a.startsWith("--"));
// Tests can use an isolated output directory without replacing the private deliverables.
const outputArg = args.find((a) => a.startsWith("--output-root="));
const outputRoot = outputArg ? path.resolve(outputArg.slice("--output-root=".length)) : path.join(ROOT, "storage");
if (path.relative(ROOT, outputRoot).startsWith("..") || path.isAbsolute(path.relative(ROOT, outputRoot)) || outputRoot === ROOT) throw new Error("Output must be a child directory of the workspace");
const exportTemplates = JSON.parse(await readFile(path.join(ROOT, "src/lib/personalization/export-templates.json"), "utf8"));
const versions = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
const dep = (name) => versions.dependencies[name] ?? versions.devDependencies[name];
const installed = async (name) => JSON.parse(await readFile(path.join(ROOT, "node_modules", name, "package.json"), "utf8")).version;
const tailwindVersion = await installed("tailwindcss");

const slugs = (await readdir(path.join(ROOT, "src", "templates"), { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name)
  .filter((s) => !only.length || only.includes(s));

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const write = async (file, text) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
};

for (const slug of slugs) {
  const contract = exportTemplates[slug];
  const out = path.join(outputRoot, "build", slug);
  if (path.relative(outputRoot, out).startsWith("..") || !path.relative(outputRoot, out)) throw new Error("Invalid build directory");
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  // 1. Template source and the shared kit.
  await cp(path.join(ROOT, "src", "templates", slug), path.join(out, "src", "templates", slug), { recursive: true });
  await cp(path.join(ROOT, "src", "templates", "_kit"), path.join(out, "src", "templates", "_kit"), { recursive: true });
  const sitePath = path.join(out, "src", "templates", slug, "site.ts");
  const siteSrc = await readFile(sitePath, "utf8");
  await writeFile(sitePath, siteSrc.replace(`export const BASE = "/demo/${slug}";`, `export const BASE = "";`));

  // 2. Routes: demo routes become the app's own routes.
  const demoDir = path.join(ROOT, "src", "app", "demo", slug);
  for (const file of await walk(demoDir)) {
    const rel = path.relative(demoDir, file);
    if (rel === "layout.tsx" || rel === "preview-chrome.tsx") continue;
    const text = (await readFile(file, "utf8")).replaceAll(`/demo/${slug}`, "");
    await write(path.join(out, "src", "app", rel), text.replace(/PageProps<"">/g, 'PageProps<"/">'));
  }

  // Root layout: the demo layout without the Baybloom demo bar, wrapped in <html>.
  const demoLayout = await readFile(path.join(demoDir, "layout.tsx"), "utf8");
  const metadata = demoLayout.slice(demoLayout.indexOf("export const metadata"), demoLayout.indexOf("export default"));
  const shellImport = demoLayout.match(/import \{ Shell \} from "[^"]+";/)[0];
  await write(
    path.join(out, "src", "app", "layout.tsx"),
    `import type { Metadata } from "next";
import { Suspense } from "react";
${shellImport}
${contract ? 'import { PersonalizedProvider } from "./personalized-provider";' : ""}
import "./globals.css";

${metadata.trim()}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<p role="status">Loading website…</p>}>${contract ? "<PersonalizedProvider><Shell>{children}</Shell></PersonalizedProvider>" : "<Shell>{children}</Shell>"}</Suspense>
      </body>
    </html>
  );
}
`,
  );

  // 3. Styles: Tailwind plus the template theme tokens.
  const globals = await readFile(path.join(ROOT, "src", "app", "globals.css"), "utf8");
  const tokens = globals.match(/  \/\* Template demos:[\s\S]*?--color-tpl-alt: var\(--t-alt\);/)[0];
  await write(
    path.join(out, "src", "app", "globals.css"),
    `@import "tailwindcss";
@import "tw-animate-css";

/* Theme tokens. Values are set per template in src/templates/${slug}/site.ts (theme). */
@theme inline {
${tokens.replace("/* Template demos: each template sets these --t-* values on its root. */", "/* bg-tpl-*, text-tpl-*, font-tpl-* … */")}
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`,
  );

  // 4. Photos.
  await cp(path.join(ROOT, "public", "templates", slug), path.join(out, "public", "templates", slug), { recursive: true });

  // 5. Project files.
  await write(
    path.join(out, "package.json"),
    JSON.stringify(
      {
        name: slug,
        version: "1.0.0",
        private: true,
        engines: { node: "^22.13.0 || >=24.0.0" },
        // The current Tailwind dependency includes an ESM-only module that
        // Turbopack's CSS worker cannot load in this standalone project.
        scripts: { dev: "next dev --webpack", build: "next build --webpack", start: "next start", lint: "eslint" },
        dependencies: { next: dep("next"), react: dep("react"), "react-dom": dep("react-dom") },
        devDependencies: {
          "@tailwindcss/postcss": tailwindVersion,
          "@types/node": dep("@types/node"),
          "@types/react": dep("@types/react"),
          "@types/react-dom": dep("@types/react-dom"),
          eslint: dep("eslint"),
          "eslint-config-next": dep("eslint-config-next"),
          tailwindcss: tailwindVersion,
          "tw-animate-css": dep("tw-animate-css"),
          typescript: dep("typescript"),
        },
      },
      null,
      2,
    ) + "\n",
  );
  await write(
    path.join(out, "next.config.ts"),
    `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
`,
  );
  await write(path.join(out, "postcss.config.mjs"), `const config = { plugins: { "@tailwindcss/postcss": {} } };\nexport default config;\n`);
  await write(
    path.join(out, "eslint.config.mjs"),
    `import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**", "next-env.d.ts"])]);
`,
  );
  await write(
    path.join(out, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "react-jsx",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./src/*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2,
    ) + "\n",
  );
  await write(path.join(out, ".gitignore"), "node_modules\n.next\nout\n.env*\n*.tsbuildinfo\nnext-env.d.ts\n");

  // 6. Docs: README, style guide and photo credits.
  const title = siteSrc.match(/name: "([^"]+)"/)[1];
  const theme = [...siteSrc.matchAll(/^\s+(\w+): "(#[0-9a-f]{6})",?(?:\s*\/\/\s*(.*))?$/gim)];
  const fontsSrc = await readFile(path.join(ROOT, "src", "templates", slug, "fonts.ts"), "utf8");
  const fonts = [...fontsSrc.matchAll(/export const (\w+) = (\w+)\(/g)].map(([, role, family]) => [role, family.replace(/_/g, " ")]);
  const pages = (await walk(path.join(out, "src", "app")))
    .filter((f) => f.endsWith("page.tsx"))
    .map((f) => "/" + path.relative(path.join(out, "src", "app"), path.dirname(f)).split(path.sep).join("/"))
    .map((r) => (r === "/." || r === "/" ? "/" : r))
    .sort();
  const photos = Object.values(JSON.parse(await readFile(path.join(ROOT, "src", "templates", slug, "photos.json"), "utf8")));

  await write(
    path.join(out, "README.md"),
    `# ${title} — website template by Baybloom Studio

A complete, responsive website built with Next.js (App Router) and Tailwind CSS.

## Get started

\`\`\`bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
\`\`\`

Requires Node.js 22.13+ within the 22.x line, or Node.js 24+. Use the same supported runtime for local development and your Node hosting environment.

## Pages

${pages.map((p) => `- \`${p}\``).join("\n")}

## Make it yours

- **Business details, navigation and colours:** \`src/templates/${slug}/site.ts\`. The \`theme\` object sets every colour; Tailwind exposes them as \`bg-tpl-*\`, \`text-tpl-*\` and so on.
- **Rooms, menus, treatments, prices and copy:** \`src/templates/${slug}/content.ts\`.
- **Fonts:** \`src/templates/${slug}/fonts.ts\` (Google Fonts via \`next/font\`).
- **Photos:** replace the files in \`public/templates/${slug}/\` and update \`src/templates/${slug}/photos.json\` (alt text and credits). The sample photos are freely licensed; keep the credits page or use your own photography.
- **Page layouts:** \`src/templates/${slug}/pages/\` and \`components/\`. Shared building blocks (calendar, availability, lightbox, booking state) live in \`src/templates/_kit/\`.
${["harbor-house", "coral-cove", "pine-ridge-lodge", "isla-verde-boutique"].includes(slug) ? `
## Languages

Use the language picker or add \`?lang=en\`, \`?lang=tl\`, or \`?lang=taglish\` to any page.
Edit \`src/templates/${slug}/translations.ts\` alongside English copy in the pages and content file.
Translation keys use the English text, so update both when changing copy. Keep route slugs and photo IDs unchanged.
Language changes preserve in-progress forms; a page reload starts a new sample session.
The Tagalog and Taglish copy is a draft and should receive fluent editorial review before publication.
` : ""}
${slug === "pine-ridge-lodge" ? `
## Seasonal trip planning

The default view is winter. Use \`?season=winter\` or \`?season=summer\` to share a seasonal view.
Activity interests and guest counts follow internal links into room selection and the sample stay flow.
The sample accepts 1–30 nights, within December–April for winter or June–October for summer.
These are illustrative operating windows, not live conditions or inventory.

Lift passes and dinner are estimated per guest per night. Rental is one set per night, independent of guest count.
Summer omits lift passes and uses bike rental. Activities are interests only, with no reservation or included guide fee.
Edit these rules in \`src/templates/pine-ridge-lodge/plan.ts\` and \`components/book-flow.tsx\` before connecting your own services.
Booking confirmation is handled in \`components/book-flow.tsx\`; it does not send through the demo form hook.
` : ""}

${slug === "isla-verde-boutique" ? `
## Stay discovery

The story and rooms pages share a finder for guest count and preferred setting.
Edit room settings in \`src/templates/isla-verde-boutique/components/stay-finder.tsx\`.
Booking links carry the room slug and guest count. The sample booking accepts up to four guests and thirty nights.
All prices and availability are illustrative. Booking and inquiry outcomes do not send messages or reserve inventory.
English, Tagalog and Taglish are available from the language picker. Edit UI copy in \`translations.ts\`, descriptive copy in \`content-copy.ts\`, and image descriptions in \`photo-copy.ts\` within the template folder. Preserve stable form option values, route slugs, and photo attribution.
Tagalog and Taglish use Filipino document language metadata; Taglish deliberately mixes Filipino and English copy. Switching language preserves the current page, query parameters and in-progress form values without submitting them.
` : ""}

${slug === "bloomfield-gardens" ? `
## Space finder

The space finder matches guest counts against the selected ceremony, dinner, or standing capacity in \`src/templates/bloomfield-gardens/content.ts\`. Inquiry links carry the selected space and guest count. Availability and inquiries are examples and do not hold a date or send a message. English is complete. Tagalog and Taglish are partial drafts; edit \`space-translations.ts\`, \`planning-translations.ts\`, and \`photo-translations.ts\`, and translate the remaining pages and controls before publication.
` : ""}

${slug === "ember-and-salt" ? `
## Menu discovery

The menu search matches dish names and ingredient descriptions in the selected menu, then filters by the selected dietary label. Edit the data in \`src/templates/ember-and-salt/content.ts\` and matching rules in \`menu-search.ts\`. Labels do not guarantee allergen safety; confirm ingredients and cross-contact with the kitchen. The reservation, private inquiry, and gift-card flows are samples and do not send messages, reserve tables, or take payments. This version is in English.
` : ""}

${slug === "still-water-spa" ? `
## Treatment discovery

The treatment finder matches type and duration using \`src/templates/still-water-spa/treatment-search.ts\` and the options in \`content.ts\`. Selection links preserve treatment and duration into the sample booking. Availability is illustrative: no appointment, payment, subscription, or gift is sent. English is complete. Tagalog and Taglish treatment and booking copy are partial drafts; other pages and controls remain in English. Edit \`treatment-translations.ts\` and \`booking-translations.ts\` and translate the remaining content before publication.
` : ""}

## Forms, bookings and payments

Every form and booking flow is fully interactive but **sends nothing yet**. Submissions go through
\`useDemoSubmit()\` in \`src/templates/_kit/demo-form.ts\`; pass it a \`send\` function to post to
your email service, CRM or booking engine. Availability comes from \`src/templates/_kit/availability.ts\`,
which returns deterministic sample data: replace \`isAvailable\` / \`freeSlots\` with calls to your
booking engine, reservation system or channel manager. Payment steps are marked in the code where
a gateway (Stripe, PayMongo, Xendit…) plugs in.

## Licence and support

See your Baybloom Studio receipt for the licence that came with your tier, and the setup guide in
your downloads for deployment help. Photo licences are listed in \`CREDITS.md\`.
`,
  );
  await write(
    path.join(out, "STYLEGUIDE.md"),
    `# ${title} style guide

## Colour

| Token | Value | Notes |
| --- | --- | --- |
${theme.map(([, k, v, note]) => `| \`${k}\` | \`${v}\` | ${note ?? ""} |`).join("\n")}

Use them as Tailwind utilities: \`bg-tpl-${"accent"}\`, \`text-tpl-ink\`, \`border-tpl-line\`… (\`onAccent\` → \`text-tpl-on-accent\`).

## Type

${fonts.map(([role, family]) => `- **${role}:** ${family}`).join("\n")}

Display type uses \`font-tpl-display\`; body copy uses \`font-tpl-body\`.

## Layout

- Content width: \`max-w-7xl\` (80rem) with \`px-5 sm:px-8\` gutters, unless the page sets its own.
- Section rhythm: \`py-20\`–\`py-24\` between major sections.
- Motion: one entrance sequence on the home page; everything else animates only in response to the
  visitor. All motion is disabled under \`prefers-reduced-motion\`.
`,
  );
  await write(
    path.join(out, "CREDITS.md"),
    `# Photo credits

Sample photography from Wikimedia Commons, resized and converted to WebP.

${photos.map((p) => `- ${p.alt}. Photo by [${p.author}](${p.source}), ${p.licenseUrl ? `[${p.license}](${p.licenseUrl})` : p.license}.`).join("\n")}
`,
  );

  // 7. Zip it.
  if (locksRoot) {
    const lock = JSON.parse(await readFile(path.join(locksRoot, slug, "package-lock.json"), "utf8"));
    const pkg = JSON.parse(await readFile(path.join(out, "package.json"), "utf8"));
    if (lock.name !== slug || JSON.stringify(lock.packages?.[""]?.dependencies) !== JSON.stringify(pkg.dependencies) || JSON.stringify(lock.packages?.[""]?.devDependencies) !== JSON.stringify(pkg.devDependencies)) {
      const sorted = value => JSON.stringify(Object.entries(value ?? {}).sort(([a], [b]) => a.localeCompare(b)));
      if (lock.name !== slug || sorted(lock.packages?.[""]?.dependencies) !== sorted(pkg.dependencies) || sorted(lock.packages?.[""]?.devDependencies) !== sorted(pkg.devDependencies)) throw new Error(`Lockfile does not match ${slug}`);
    }
    await write(path.join(out, "package-lock.json"), JSON.stringify(lock, null, 2) + "\n");
  }
  if (contract) {
    await write(path.join(out, "src/app/personalized.json"), "{}\n");
    await write(path.join(out, "src/app/personalized-provider.tsx"), `"use client";\nimport type { ContextType } from "react";\nimport { PersonalizationContext } from "@/templates/${slug}/personalization";\nimport value from "./personalized.json";\n// Export snapshots are validated before packaging; JSON imports widen enum literals.\nexport function PersonalizedProvider({ children }: { children: React.ReactNode }) { return <PersonalizationContext value={value as ContextType<typeof PersonalizationContext>}>{children}</PersonalizationContext>; }\n`);
    const hashes = {};
    for (const file of (await walk(out)).sort()) hashes[path.relative(out, file).split(path.sep).join("/")] = createHash("sha256").update(await readFile(file)).digest("hex");
    await write(path.join(out, "baybloom-template.json"), JSON.stringify({ formatVersion: 1, template: slug, templateVersion: contract.templateVersion, contentVersion: contract.contentVersion, files: hashes }, null, 2) + "\n");
  }
  const files = {};
  for (const file of await walk(out)) {
    files[`${slug}/${path.relative(out, file).split(path.sep).join("/")}`] = new Uint8Array(await readFile(file));
  }
  const zipped = zipSync(files, { level: 6 });
  const zipPath = path.join(outputRoot, "deliverables", slug, `${slug}-source.zip`);
  await mkdir(path.dirname(zipPath), { recursive: true });
  await writeFile(zipPath, zipped);
  if (!keep) await rm(out, { recursive: true, force: true });
  console.log(`packed ${slug}: ${Object.keys(files).length} files, ${((await stat(zipPath)).size / 1048576).toFixed(1)} MB`);
}
