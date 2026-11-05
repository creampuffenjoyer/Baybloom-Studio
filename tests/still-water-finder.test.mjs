import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
function load(file, require = () => { throw new Error("Unexpected import"); }) {
  const context = { exports: {}, require };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, context);
  return context.exports;
}
const photos = JSON.parse(readFileSync("src/templates/still-water-spa/photos.json", "utf8"));
const { treatments } = load("src/templates/still-water-spa/content.ts", () => photos);
const { findTreatments } = load("src/templates/still-water-spa/treatment-search.ts");
const { treatmentTranslations } = load("src/templates/still-water-spa/treatment-translations.ts");
test("treatment discovery matches type and offered duration without altering the catalogue", () => {
  const before = JSON.stringify(treatments);
  assert.equal(findTreatments(treatments, "all", null).length, treatments.length);
  const matches = findTreatments(treatments, "massage", 60);
  assert.ok(matches.length);
  assert.ok(matches.every((t) => t.ritual === "massage" && t.options.some((o) => o.minutes === 60)));
  assert.equal(findTreatments(treatments, "massage", 999).length, 0);
  assert.equal(JSON.stringify(treatments), before);
});
test("every treatment has both draft translations", () => {
  assert.deepEqual(Object.keys(treatmentTranslations).sort(), Array.from(treatments.map((t) => t.slug)).sort());
  for (const treatment of treatments) for (const language of ["tl", "taglish"]) {
    const translated = treatmentTranslations[treatment.slug][language];
    assert.ok(translated.name.trim() && translated.summary.trim() && translated.goodFor.trim());
    assert.equal(translated.description.length, treatment.description.length);
    assert.equal(translated.includes.length, treatment.includes.length);
    assert.ok([...translated.description, ...translated.includes].every((value) => value.trim()));
  }
});
