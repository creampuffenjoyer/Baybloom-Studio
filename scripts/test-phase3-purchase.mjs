import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--test", "tests/purchase-delivery.browser.mjs"], {
  env: { ...process.env, BAYBLOOM_PURCHASE_PHASE: "3" }, stdio: "inherit", windowsHide: true,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
