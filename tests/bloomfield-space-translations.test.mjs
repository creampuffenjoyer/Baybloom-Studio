import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";

function load(file, require) {
  const context = { exports: {}, require };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, context);
  return context.exports;
}
const translations = load("src/templates/bloomfield-gardens/space-translations.ts");
const planning = load("src/templates/bloomfield-gardens/planning-translations.ts").planningTranslations;
const photoTranslations = load("src/templates/bloomfield-gardens/photo-translations.ts").photoTranslations;
const photos = JSON.parse(readFileSync("src/templates/bloomfield-gardens/photos.json", "utf8"));
const content = load("src/templates/bloomfield-gardens/content.ts", (name) => {
  if (name === "./photos.json") return photos;
  if (name === "../_kit/dates") return {};
  if (name === "../_kit/availability") return {};
  throw new Error(`Unexpected import: ${name}`);
});

test("draft planning translations cover packages, questions, timelines and reviews", () => {
  const strings = [];
  function collect(value, key = "") {
    if (typeof value === "string" && key !== "name") strings.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collect(item));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) collect(v, k);
  }
  for (const pkg of content.packages) { strings.push(pkg.name); collect(pkg); }
  for (const key of ["faqs", "timeline", "reviews"]) collect(content[key]);
  assert.deepEqual(strings.filter((value) => !planning[value]), []);
  for (const source of strings) assert.ok(planning[source].every((variant) => variant.trim()));
});

test("photo descriptions have both draft language variants", () => {
  for (const photo of Object.values(photos)) {
    assert.ok(photoTranslations[photo.alt], photo.alt);
    assert.equal(photoTranslations[photo.alt].length, 2);
    assert.ok(photoTranslations[photo.alt].every((variant) => variant.trim()));
  }
});
test("each venue has both draft translations with matching content structure", () => {
  const slugs = content.spaces.map((space) => space.slug).sort();
  assert.deepEqual(Object.keys(translations.spaceTranslations).sort(), Array.from(slugs));
  for (const space of content.spaces) for (const language of ["tl", "taglish"]) {
    const entry = translations.spaceTranslations[space.slug][language];
    assert.ok(entry.kind.trim() && entry.short.trim(), `${space.slug} ${language}`);
    assert.equal(entry.description.length, space.description.length);
    assert.equal(entry.bestFor.length, space.bestFor.length);
    assert.ok([...entry.description, ...entry.bestFor].every((value) => value.trim()));
  }
});
