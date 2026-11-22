import { spawnSync } from "node:child_process";
import { setPriority, constants } from "node:os";
import { testDatabaseConfig } from "./personalization-test-config.mjs";
try { setPriority(0, constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* best effort */ }
const { target } = testDatabaseConfig();
const env = { ...process.env, TEST_DATABASE_URL: target };
delete env.DATABASE_URL; delete env.DIRECT_URL;
const result = spawnSync(process.execPath, ["--test", "tests/retention.integration.mjs"], { env, stdio: "inherit", windowsHide: true });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
