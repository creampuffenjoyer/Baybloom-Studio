import { spawn } from "node:child_process";
const template = process.argv[2] ?? "";
if (template && !["coral-cove", "harbor-house"].includes(template)) throw Error("Choose coral-cove or harbor-house, or omit the argument to check both.");
const child = spawn(process.execPath, ["--conditions=react-server", "--import", "tsx", "--test", "--test-concurrency=1", "tests/photo-rollout.browser.mjs"], { windowsHide: true, stdio: "inherit", env: { ...process.env, PHOTO_INCLUDE_PILOTS: "1", PHOTO_TEMPLATE: template, RAYON_NUM_THREADS: "2", UV_THREADPOOL_SIZE: "2" } });
child.once("error", error => { throw error; });
child.once("close", code => { process.exitCode = code ?? 1; });
