import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeGoogleAccount } from "../src/lib/google-account.ts";
import { sendEmail } from "../src/lib/email.ts";
import { assertHistoricalMigrationSafe } from "../scripts/migration-preflight.mjs";

test("Google never adopts an existing unverified or verified password account", async () => {
  for (const emailVerified of [null, new Date()]) {
    let writes = 0;
    const client = {
      account: { findUnique: async () => null },
      user: { findUnique: async () => ({ id: "victim", emailVerified }), create: async () => { writes++; } },
    };
    assert.equal(await authorizeGoogleAccount({ subject: "google", email: "victim@example.com" }, client), false);
    assert.equal(writes, 0);
  }
});

test("linked Google subjects work only for the matching enabled account", async () => {
  for (const [disabled, email, expected] of [[false, "victim@example.com", true], [true, "victim@example.com", false], [false, "different@example.com", false]]) {
    const client = { account: { findUnique: async () => ({ user: { disabled, email } }) } };
    assert.equal(await authorizeGoogleAccount({ subject: "google", email: "victim@example.com" }, client), expected);
  }
});

test("a concurrent password registration cannot turn into an implicit Google link", async () => {
  const client = {
    account: { findUnique: async () => null },
    user: { findUnique: async () => null, create: async () => { throw Object.assign(new Error("unique"), { code: "P2002" }); } },
  };
  assert.equal(await authorizeGoogleAccount({ subject: "google", email: "victim@example.com" }, client), false);
});

test("a new Google account is created with verified email and no password", async () => {
  let data;
  const client = {
    account: { findUnique: async () => null },
    user: { findUnique: async () => null, create: async (args) => { data = args.data; } },
  };
  assert.equal(await authorizeGoogleAccount({ subject: "google", email: "Victim@Example.com" }, client), true);
  assert.equal(data.email, "victim@example.com");
  assert.ok(data.emailVerified instanceof Date);
  assert.equal(data.passwordHash, undefined);
});

test("missing production email settings do not expose recovery tokens in logs", async (t) => {
  const previousMode = process.env.NODE_ENV;
  const previousKey = process.env.RESEND_API_KEY;
  t.after(() => {
    if (previousMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousMode;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previousKey;
  });
  process.env.NODE_ENV = "production";
  delete process.env.RESEND_API_KEY;
  const logs = t.mock.method(console, "info", () => {});
  await assert.rejects(sendEmail({ to: "victim@example.com", subject: "Reset", text: "SECRET_TOKEN", html: "SECRET_TOKEN" }), /required outside development/);
  assert.equal(logs.mock.callCount(), 0);
});

test("migration preflight blocks historical purchases and empty orders", async () => {
  for (const [count, empty] of [[1, 0], [0, 1]]) {
    const answers = [[{ migrations: "_prisma_migrations", designs: "Design" }], [], [{}], [{ count }], [{ count: empty }]];
    await assert.rejects(assertHistoricalMigrationSafe({ $queryRaw: async () => answers.shift() }), /Migration blocked/);
  }
});

test("migration preflight accepts a fresh database and preserves applied migrations", async () => {
  await assertHistoricalMigrationSafe({ $queryRaw: async () => [{ designs: null }] });
  const answers = [[{ migrations: "_prisma_migrations", designs: "Design" }], [{ applied: true }]];
  await assertHistoricalMigrationSafe({ $queryRaw: async () => answers.shift() });
  assert.equal(answers.length, 0);
});
