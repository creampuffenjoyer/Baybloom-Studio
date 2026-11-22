import { createHash } from "node:crypto";
import { strToU8, zipSync } from "fflate";

export function sourceArchive(template, revision = "first") {
  const entries = { "package.json": "{}", "package-lock.json": "{}", "src/app/layout.tsx": "standalone layout",
    "src/app/personalized-provider.tsx": "provider", "src/app/personalized.json": "{}",
    [`src/templates/${template}/personalization.tsx`]: revision };
  const files = Object.fromEntries(Object.entries(entries).map(([name, value]) => [`${template}/${name}`, strToU8(value)]));
  files[`${template}/baybloom-template.json`] = strToU8(JSON.stringify({ formatVersion: 1, template,
    templateVersion: "1.0.0", contentVersion: 1,
    files: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name.slice(template.length + 1), createHash("sha256").update(bytes).digest("hex")])),
  }));
  return zipSync(files);
}

export function activeRelease(template, archive = sourceArchive(template)) {
  const releaseId = createHash("sha256").update(archive).digest("hex");
  return { template, releaseId, release: { sha256: releaseId, template, templateVersion: "1.0.0", contentVersion: 1, archive } };
}
