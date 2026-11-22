import "dotenv/config";
import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { assertHistoricalMigrationSafe } from "./migration-preflight.mjs";

const mode = process.argv[2];
if (!["dev", "deploy"].includes(mode)) throw new Error("Expected migrate mode: dev or deploy");
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("A database URL is required for migration preflight");
const client = new PrismaClient({ datasources: { db: { url } } });
try {
  await assertHistoricalMigrationSafe(client);
} finally {
  await client.$disconnect();
}
const child = spawn(process.execPath, ["node_modules/prisma/build/index.js", "migrate", mode, ...process.argv.slice(3)], {
  stdio: "inherit", env: process.env,
});
child.on("error", () => { console.error("Could not start Prisma migration command"); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
