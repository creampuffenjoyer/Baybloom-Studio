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
const photos = JSON.parse(readFileSync("src/templates/ember-and-salt/photos.json", "utf8"));
const { menus } = load("src/templates/ember-and-salt/content.ts", () => photos);
const { filterMenu } = load("src/templates/ember-and-salt/menu-search.ts");
const names = (result) => Array.from(result.flatMap((section) => section.dishes.map((dish) => dish.name)));
test("menu search combines ingredient and dietary filters without changing source data", () => {
  const dinner = menus.find((menu) => menu.id === "dinner");
  const before = JSON.stringify(dinner);
  assert.deepEqual(names(filterMenu(dinner, "  CALAMANSI  ", "v")), ["Ember-roast squash"]);
  assert.deepEqual(names(filterMenu(dinner, "calamansi", "vg")), []);
  assert.deepEqual(names(filterMenu(dinner, "does not exist", "all")), []);
  assert.equal(names(filterMenu(dinner, "", "all")).length, dinner.sections.reduce((n, s) => n + s.dishes.length, 0));
  assert.equal(JSON.stringify(dinner), before);
});
