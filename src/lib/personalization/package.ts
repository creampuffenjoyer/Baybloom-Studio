import { captureTemplateSnapshot, packageTemplateSnapshot, type ExportAssets } from "./export";

/** Compatibility entry point; new callers use the shared versioned snapshot API. */
export function packageHarborDraft(archive: Uint8Array, snapshot: ExportAssets & { content: unknown }) {
  const frozen = captureTemplateSnapshot(archive, snapshot.content, snapshot);
  if (frozen.template !== "harbor-house") throw new Error("Expected Harbor House");
  return packageTemplateSnapshot(archive, frozen);
}
