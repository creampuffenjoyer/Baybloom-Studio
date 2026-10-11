// Packs every template demo into a standalone Next.js + Tailwind project and
// zips it to storage/deliverables/<slug>/<slug>-source.zip (the seed attaches it).
//   node scripts/pack-templates.mjs [slug...] [--keep]   (--keep leaves the unzipped copy in storage/build)
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { zipSync } from "fflate";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const keep = args.includes("--keep");
const only = args.filter((a) => !a.startsWith("--"));
const versions = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
const dep = (name) => versions.dependencies[name] ?? versions.devDependencies[name];

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
  const out = path.join(ROOT, "storage", "build", slug);
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
    if (rel === "layout.tsx") continue;
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
${shellImport}
import "./globals.css";

${metadata.trim()}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
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
        scripts: { dev: "next dev", build: "next build", start: "next start", lint: "eslint" },
        dependencies: { next: dep("next"), react: dep("react"), "react-dom": dep("react-dom") },
        devDependencies: {
          "@tailwindcss/postcss": dep("tailwindcss"),
          "@types/node": dep("@types/node"),
          "@types/react": dep("@types/react"),
          "@types/react-dom": dep("@types/react-dom"),
          eslint: dep("eslint"),
          "eslint-config-next": dep("eslint-config-next"),
          tailwindcss: dep("tailwindcss"),
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
};

export default nextConfig;
`,
  );
  await write(path.join(out, "postcss.config.mjs"), `export default { plugins: { "@tailwindcss/postcss": {} } };\n`);
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

Requires Node.js 20.9 or newer. Deploys as-is to Vercel, Netlify or any Node host.

## Pages

${pages.map((p) => `- \`${p}\``).join("\n")}

## Make it yours

- **Business details, navigation and colours:** \`src/templates/${slug}/site.ts\`. The \`theme\` object sets every colour; Tailwind exposes them as \`bg-tpl-*\`, \`text-tpl-*\` and so on.
- **Rooms, menus, treatments, prices and copy:** \`src/templates/${slug}/content.ts\`.
- **Fonts:** \`src/templates/${slug}/fonts.ts\` (Google Fonts via \`next/font\`).
- **Photos:** replace the files in \`public/templates/${slug}/\` and update \`src/templates/${slug}/photos.json\` (alt text and credits). The sample photos are freely licensed; keep the credits page or use your own photography.
- **Page layouts:** \`src/templates/${slug}/pages/\` and \`components/\`. Shared building blocks (calendar, availability, lightbox, booking state) live in \`src/templates/_kit/\`.

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
  const files = {};
  for (const file of await walk(out)) {
    files[`${slug}/${path.relative(out, file).split(path.sep).join("/")}`] = new Uint8Array(await readFile(file));
  }
  const zipped = zipSync(files, { level: 6 });
  const zipPath = path.join(ROOT, "storage", "deliverables", slug, `${slug}-source.zip`);
  await mkdir(path.dirname(zipPath), { recursive: true });
  await writeFile(zipPath, zipped);
  if (!keep) await rm(out, { recursive: true, force: true });
  console.log(`packed ${slug}: ${Object.keys(files).length} files, ${((await stat(zipPath)).size / 1048576).toFixed(1)} MB`);
}
