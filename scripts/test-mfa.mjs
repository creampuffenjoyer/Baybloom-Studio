import { spawnSync } from "node:child_process";
import { setPriority, constants } from "node:os";
import { testDatabaseConfig } from "./personalization-test-config.mjs";
try { setPriority(0, constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* best effort */ }
const { target, direct } = testDatabaseConfig();
const env = { ...process.env, DATABASE_URL: target, DIRECT_URL: direct, TEST_DATABASE_URL: target, RAYON_NUM_THREADS: "2", UV_THREADPOOL_SIZE: "2" };
const migration = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env, stdio: "inherit", windowsHide: true });
if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status ?? 1);
delete env.DATABASE_URL; delete env.DIRECT_URL;
const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--test", "tests/mfa.integration.mjs"], { env, stdio: "inherit", windowsHide: true });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
