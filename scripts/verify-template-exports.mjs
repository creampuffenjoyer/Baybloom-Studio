import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { phase3Exports } from "../tests/helpers/phase3-exports.mjs";

const stage = process.argv.find(arg => arg.startsWith("--stage="))?.slice(8) ?? "all";
if (!["all", "baseline", "personalized"].includes(stage)) throw new Error("Stage must be all, baseline or personalized");
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run with npm run templates:verify:phase3 [-- --stage=baseline|personalized]");
const root = path.resolve("storage/phase3");
await mkdir(path.join(root, "logs"), { recursive: true });
const env = { ...process.env, DATABASE_URL: "", DIRECT_URL: "", AUTH_SECRET: "", RESEND_API_KEY: "",
  STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "",
  NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS ?? "2",
  UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE ?? "2",
};
const slugs = phase3Exports.map(item => item.template);
const reportFile = path.join(root, "verification.json");
let report;
try { report = JSON.parse(await readFile(reportFile, "utf8")); } catch { report = {}; }
const exists = async file => !!await stat(file).catch(() => null);
async function run(args, cwd, label) {
  const log = path.join(root, "logs", `${label}.log`);
  const stream = createWriteStream(log);
  const child = spawn(process.execPath, args, { cwd, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.pipe(stream, { end: false }); child.stderr.pipe(stream, { end: false });
  const code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
  await new Promise(resolve => stream.end(resolve));
  if (code !== 0) throw new Error(`${label} failed (${code}). See ${log}\n${(await readFile(log, "utf8")).slice(-5000)}`);
}
async function fingerprint(dir) {
  const hash = createHash("sha256");
  async function walk(folder) {
    for (const item of (await readdir(folder, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : 1)) {
      if (["node_modules", ".next", ".git", "next-env.d.ts", "AGENTS.md"].includes(item.name) || item.name.endsWith(".tsbuildinfo")) continue;
      const file = path.join(folder, item.name);
      if (item.isDirectory()) await walk(file);
      else { hash.update(path.relative(dir, file)); hash.update(await readFile(file)); }
    }
  }
  await walk(dir); return hash.digest("hex");
}
async function build(slug, kind) {
  const project = path.join(root, kind === "baseline" ? "build" : "personalized", slug);
  const label = `${kind}-${slug}`;
  if (!await exists(path.join(project, "package.json"))) throw new Error(`Prepare ${project} first`);
  if (!await exists(path.join(project, "node_modules/next/package.json"))) {
    console.log(`Installing ${label}`);
    await run([npm, kind === "baseline" ? "install" : "ci", "--no-audit", "--no-fund"], project, `${label}-install`);
  }
  const before = await fingerprint(project);
  if (report[label]?.fingerprint === before && await exists(path.join(project, ".next/BUILD_ID"))) {
    console.log(`Verified build retained: ${label}`); return;
  }
  console.log(`Building ${label}`);
  const start = Date.now();
  await run([npm, "run", "build"], project, `${label}-build`);
  report[label] = { fingerprint: await fingerprint(project), node: process.version, verifiedAt: new Date().toISOString(), seconds: Math.round((Date.now()-start)/1000) };
  await writeFile(reportFile, JSON.stringify(report, null, 2) + "\n");
  console.log(`Passed ${label} (${report[label].seconds}s)`);
}
async function builds(kind) {
  // Keep installs and builds sequential on shared development machines.
  for (const slug of slugs) await build(slug, kind);
}
if (stage !== "personalized") {
  const missing = [];
  for (const slug of slugs) if (!await exists(path.join(root, "build", slug, "package.json"))) missing.push(slug);
  if (missing.length) await run(["scripts/pack-templates.mjs", ...missing, "--keep", "--output-root=storage/phase3"], process.cwd(), "bootstrap");
  await builds("baseline");
}
if (stage === "all") {
  await run(["scripts/pack-templates.mjs", ...slugs, "--keep", "--output-root=storage/phase3/release", "--lockfiles=storage/phase3/build"], process.cwd(), "releases");
  await run(["--import", "tsx", "scripts/prepare-phase3-exports.mjs"], process.cwd(), "personalized-preparation");
}
if (stage !== "baseline") await builds("personalized");
console.log(`Phase 3 ${stage} verification complete. Report: ${reportFile}`);
