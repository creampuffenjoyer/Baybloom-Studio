import { spawnSync } from "node:child_process";
import { testDatabaseConfig } from "./personalization-test-config.mjs";

// This runner accepts only an explicitly named disposable database. It never
// changes .env or applies migrations to the configured application database.
const { target, direct } = testDatabaseConfig();

const migrationEnv = { ...process.env, DATABASE_URL: target, DIRECT_URL: direct };
const migrate = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env: migrationEnv, stdio: "inherit" });
if (migrate.error) throw migrate.error;
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

// Remove application connection variables so accidental default-client usage
// fails closed; the integration test constructs its client from this test URL.
const testProcessEnv = { ...process.env, TEST_DATABASE_URL: target, NODE_ENV: "test",
  S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "",
};
delete testProcessEnv.DATABASE_URL;
delete testProcessEnv.DIRECT_URL;
const test = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--test", "--test-concurrency=1", "tests/commerce.integration.mjs", "tests/personalization.integration.mjs", "tests/purchase-delivery.integration.mjs", "tests/phase3-purchase.integration.mjs", "tests/photo-quota.integration.mjs"], { env: testProcessEnv, stdio: "inherit" });
if (test.error) throw test.error;
process.exit(test.status ?? 1);
