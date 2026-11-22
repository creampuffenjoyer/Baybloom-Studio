import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

function run(overrides) {
  const env = { ...process.env, ...overrides };
  return spawnSync(process.execPath, ["scripts/test-personalization-db.mjs"], { env, encoding: "utf8" });
}

test("test runner rejects a database without the test marker", () => {
  const result = run({ TEST_DATABASE_URL: "postgresql://test:test@invalid.example/application", TEST_DIRECT_URL: "postgresql://test:test@invalid.example/application" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must contain _test/);
});

test("test runner rejects the configured application database including pooled aliases", () => {
  const result = run({ TEST_DATABASE_URL: "postgresql://test:test@db-pooler.invalid/baybloom_test", TEST_DIRECT_URL: "postgresql://test:test@db.invalid/baybloom_test", DATABASE_URL: "postgresql://test:test@db.invalid/baybloom_test" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /matches an application database/);
});

test("test runner rejects mismatched database endpoints", () => {
  const result = run({ TEST_DATABASE_URL: "postgresql://test:test@one.invalid/baybloom_test", TEST_DIRECT_URL: "postgresql://test:test@two.invalid/baybloom_test" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /same test database/);
});
