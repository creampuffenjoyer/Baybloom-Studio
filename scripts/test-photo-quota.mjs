import { spawnSync } from "node:child_process";
import { testDatabaseConfig } from "./personalization-test-config.mjs";

const { target } = testDatabaseConfig();
const env = { ...process.env, TEST_DATABASE_URL: target, NODE_ENV: "test", UV_THREADPOOL_SIZE: "2", RAYON_NUM_THREADS: "2" };
delete env.DATABASE_URL;
delete env.DIRECT_URL;
const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--test", "tests/photo-quota.integration.mjs"], { env, stdio: "inherit", windowsHide: true });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
