import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

function load(file) {
  if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"));
  const context = { exports: {}, require: (name) => load(path.resolve(path.dirname(file), name.endsWith(".json") ? name : `${name}.ts`)) };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, context);
  return context.exports;
}
const { copy } = load("src/templates/isla-verde-boutique/translations.ts");
const content = load("src/templates/isla-verde-boutique/content.ts");
const { site, nav } = load("src/templates/isla-verde-boutique/site.ts");
const photos = JSON.parse(readFileSync("src/templates/isla-verde-boutique/photos.json", "utf8"));
const root = "src/templates/isla-verde-boutique";
const skip = new Set(["slug", "id", "src", "source", "license", "licenseUrl", "author", "photos", "photo", "date", "per", "href", "phone", "email", "social", "address"]);
const required = new Set();
function collect(value) {
  if (typeof value === "string" && /[a-z]/i.test(value)) required.add(value.trim().replace(/\s+/g, " "));
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) if (!skip.has(key)) collect(item);
}
for (const name of ["rooms", "extras", "posts", "eventSpaces", "menuHighlights"]) collect(content[name]);
collect(site); collect(nav); Object.values(photos).forEach((photo) => collect(photo.alt));
const files = ["shell.tsx", "language.tsx", ...["pages", "components"].flatMap((dir) => readdirSync(`${root}/${dir}`).filter((file) => file.endsWith(".tsx")).map((file) => `${dir}/${file}`))];
for (const file of files) {
  const ast = ts.createSourceFile(file, readFileSync(`${root}/${file}`, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t" && ts.isStringLiteral(node.arguments[0])) collect(node.arguments[0].text);
    if (ts.isPropertyAssignment(node) && ["label", "text"].includes(node.name.getText(ast)) && ts.isStringLiteral(node.initializer)) collect(node.initializer.text);
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === "options" && ts.isArrayLiteralExpression(node.initializer)) node.initializer.elements.filter(ts.isStringLiteral).forEach((item) => collect(item.text));
    if (ts.isJsxAttribute(node) && node.name.text === "submitLabel" && node.initializer && ts.isStringLiteral(node.initializer)) collect(node.initializer.text);
    ts.forEachChild(node, visit);
  }
  visit(ast);
}

test("Isla has both editorial variants for rendered copy and descriptive data", () => {
  const missing = [...required].filter((key) => !copy[key]);
  assert.deepEqual(missing, [], `Missing translations: ${missing.join("\n")}`);
  for (const [key, variants] of Object.entries(copy)) {
    assert.equal(variants.length, 2, key);
    for (const value of variants) {
      assert.ok(value.trim(), key);
      assert.deepEqual([...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort(), [...key.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort(), `Parameters: ${key}`);
    }
  }
});
