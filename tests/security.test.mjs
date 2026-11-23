import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeGoogleAccount } from "../src/lib/google-account.ts";
import { sendEmail, siteUrl } from "../src/lib/email.ts";
import { assertHistoricalMigrationSafe } from "../scripts/migration-preflight.mjs";

test("public links use Railway's HTTPS service domain unless a site URL is configured", (t) => {
  const variables = {
    RAILWAY_PUBLIC_DOMAIN: "shop.example.test",
    NEXT_PUBLIC_SITE_URL: undefined,
  };
  const original = Object.fromEntries(Object.keys(variables).map((key) => [key, process.env[key]]));
  function setVariables(values) {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
  t.after(() => setVariables(original));
  setVariables(variables);

  const origin = "https://shop.example.test";
  assert.equal(siteUrl("/reset-password"), `${origin}/reset-password`);

  process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example.com/";
  assert.equal(siteUrl("/verify-email"), "https://shop.example.com/verify-email");
});

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
  assert.equal(await authorizeGoogleAccount({ subject: "google", email: "victim@example.com" }, client, async () => true), false);
});

test("a new Google account is created with verified email and no password", async () => {
  let data;
  const client = {
    account: { findUnique: async () => null },
    user: { findUnique: async () => null, create: async (args) => { data = args.data; } },
  };
  assert.equal(await authorizeGoogleAccount({ subject: "google", email: "Victim@Example.com" }, client, async () => true), true);
  assert.equal(data.email, "victim@example.com");
  assert.ok(data.emailVerified instanceof Date);
  assert.equal(data.passwordHash, undefined);
});

test("new Google identities respect signup capacity while existing links can still sign in", async () => {
  const client = { account: { findUnique: async () => null }, user: { findUnique: async () => null, create: async () => { assert.fail("must not create an account when limited"); } } };
  assert.equal(await authorizeGoogleAccount({ subject: "new", email: "new@example.com" }, client, async () => false), false);
  client.account.findUnique = async () => ({ user: { disabled: false, email: "existing@example.com" } });
  assert.equal(await authorizeGoogleAccount({ subject: "old", email: "existing@example.com" }, client, async () => { assert.fail("existing login must not consume signup capacity"); }), true);
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
