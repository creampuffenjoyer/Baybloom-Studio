import { readFile, stat } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { testDatabaseConfig } from "./personalization-test-config.mjs";
import { isPurchaseTemplate, purchaseTemplates, registerTemplateRelease } from "../src/lib/personalization/purchases.ts";

const [template, file, ...flags] = process.argv.slice(2);
if (!isPurchaseTemplate(template) || !file || flags.some(flag => flag !== "--test")) {
  throw new Error(`Usage: node --conditions=react-server --import tsx scripts/register-template-release.mjs <${purchaseTemplates.join("|")}> <trusted-source.zip> [--test]`);
}
let url;
if (flags.includes("--test")) {
  url = testDatabaseConfig().target;
} else {
  dotenv.config({ quiet: true });
  url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for release registration");
}
if ((await stat(file)).size > 64 * 1024 * 1024) throw new Error("Source archive too large");
const archive = await readFile(file);
const client = new PrismaClient({ datasources: { db: { url } } });
try {
  const digest = await registerTemplateRelease(template, archive, client);
  console.log(`Activated ${template} source release ${digest}${flags.includes("--test") ? " in the isolated test database" : ""}.`);
} finally { await client.$disconnect(); }
