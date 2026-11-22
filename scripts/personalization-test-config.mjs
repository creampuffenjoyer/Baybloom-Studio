import { existsSync, readFileSync } from "node:fs";
import dotenv from "dotenv";

const readEnv = (path) => existsSync(path) ? dotenv.parse(readFileSync(path)) : {};

function identify(value, name) {
  if (!value) throw new Error(`${name} is required in .env.test.local or the environment.`);
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be a PostgreSQL connection URL.`); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || url.pathname.length < 2) throw new Error(`${name} must be a PostgreSQL connection URL with a database name.`);
  return { host: url.hostname.toLowerCase().replace(/-pooler(?=\.)/, ""), database: decodeURIComponent(url.pathname.slice(1)) };
}

export function testDatabaseConfig() {
  const testEnv = readEnv(".env.test.local");
  const appEnv = readEnv(".env");
  const target = process.env.TEST_DATABASE_URL || testEnv.TEST_DATABASE_URL;
  const direct = process.env.TEST_DIRECT_URL || testEnv.TEST_DIRECT_URL || target;
  const testDb = identify(target, "TEST_DATABASE_URL");
  const directDb = identify(direct, "TEST_DIRECT_URL");
  if (!testDb.database.includes("_test")) throw new Error("The disposable database name must contain _test.");
  if (testDb.host !== directDb.host || testDb.database !== directDb.database) throw new Error("TEST_DATABASE_URL and TEST_DIRECT_URL must refer to the same test database.");
  if (new URL(direct).hostname.includes("-pooler.")) throw new Error("Set TEST_DIRECT_URL to the direct (non-pooled) test connection for migrations.");
  for (const value of [process.env.DATABASE_URL, process.env.DIRECT_URL, appEnv.DATABASE_URL, appEnv.DIRECT_URL]) {
    if (!value) continue;
    const appDb = identify(value, "Application database URL");
    if (appDb.host === testDb.host && appDb.database === testDb.database) throw new Error("The test database matches an application database; refusing to run.");
  }
  return { target, direct };
}
