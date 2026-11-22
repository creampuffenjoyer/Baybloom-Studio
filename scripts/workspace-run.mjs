import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { constants, getPriority, setPriority } from "node:os";

// Run installed tools without shell interpolation or machine-wide settings.
// All child processes (Next.js, tsx, Chrome tests) inherit these locations.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = join(root, "storage", "local-cache");
const [command, ...args] = process.argv.slice(2);
if (!["node", "npm"].includes(command)) throw new Error("Usage: node scripts/workspace-run.mjs <node|npm> <arguments...>");
try { if (getPriority(0) < constants.priority.PRIORITY_BELOW_NORMAL) setPriority(0, constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* best effort on the shared computer */ }
const paths = { temp: join(cache, "temp"), npm: join(cache, "npm"), node: join(cache, "node"), browsers: join(cache, "browsers"), xdg: join(cache, "xdg") };
for (const path of Object.values(paths)) await mkdir(path, { recursive: true });
const temp = await mkdtemp(join(paths.temp, "run-"));
const overrides = { TEMP: temp, TMP: temp, TMPDIR: temp, npm_config_cache: paths.npm,
  npm_config_update_notifier: "false", NODE_COMPILE_CACHE: paths.node, XDG_CACHE_HOME: paths.xdg,
  NODE_DISABLE_COMPILE_CACHE: "1",
  PLAYWRIGHT_BROWSERS_PATH: paths.browsers, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1",
  PUPPETEER_CACHE_DIR: paths.browsers, PUPPETEER_SKIP_DOWNLOAD: "true", RAYON_NUM_THREADS: "2", UV_THREADPOOL_SIZE: "2" };
// Windows treats environment names case-insensitively. Remove inherited aliases
// so an uppercase NPM_CONFIG_CACHE cannot win over the workspace override.
const names = new Set(Object.keys(overrides).map(name => name.toUpperCase()));
const env = { ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !names.has(name.toUpperCase()))), ...overrides };
let executable = process.execPath, childArgs = args;
if (command === "npm") {
  const inherited = process.env.npm_execpath;
  const cli = inherited && /npm-cli\.js$/.test(inherited) ? inherited : join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  if (existsSync(cli)) childArgs = [cli, ...args];
  else if (process.platform !== "win32") executable = "npm";
  else throw new Error("Installed npm CLI not found next to Node. Run with the project's Node installation.");
}
const child = spawn(executable, childArgs, { cwd: root, env, stdio: "inherit", windowsHide: true, shell: false });
process.exitCode = await new Promise(resolve => {
  child.once("error", () => { console.error("Workspace command could not start."); resolve(1); });
  child.once("exit", code => resolve(code ?? 1));
});
// Remove only the unique directory created for this invocation, after verifying
// its absolute location. Never clear a shared temp folder or an npm cache.
const within = relative(resolve(paths.temp), resolve(temp));
if (within.startsWith("run-") && !within.includes("..") && !isAbsolute(within)) {
  await rm(temp, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }).catch(() => {
    console.error("Some temporary files remain in the workspace cache.");
  });
}
