import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { test } from "node:test";

const root = resolve("storage/local-cache");
test("tool children use workspace caches and their private temp directory is removed", () => {
  const code = `const fs=require('node:fs'),path=require('node:path'),os=require('node:os');const temp=os.tmpdir();fs.writeFileSync(path.join(temp,'fixture.txt'),'temporary');console.log(JSON.stringify({temp,cache:process.env.npm_config_cache,browsers:process.env.PLAYWRIGHT_BROWSERS_PATH,disabled:process.env.NODE_DISABLE_COMPILE_CACHE}));`;
  const result = spawnSync(process.execPath, ["scripts/workspace-run.mjs", "node", "-e", code], { encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  const locations = JSON.parse(result.stdout);
  for (const location of [locations.temp, locations.cache, locations.browsers]) {
    const within = relative(root, location);
    assert.ok(!within.startsWith("..") && !isAbsolute(within));
  }
  assert.equal(locations.disabled, "1");
  assert.equal(existsSync(locations.temp), false);
});
test("workspace runner propagates failures and uses the installed npm without downloading", () => {
  const failed = spawnSync(process.execPath, ["scripts/workspace-run.mjs", "node", "-e", "process.exit(7)"], { encoding: "utf8", windowsHide: true });
  assert.equal(failed.status, 7);
  const npm = spawnSync(process.execPath, ["scripts/workspace-run.mjs", "npm", "config", "get", "cache"], { encoding: "utf8", windowsHide: true, env: { ...process.env, NPM_CONFIG_CACHE: resolve("storage/incorrect-cache") } });
  assert.equal(npm.status, 0, npm.stderr);
  assert.equal(resolve(npm.stdout.trim()), resolve(root, "npm"));
});
