import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import { copy } from "../src/templates/harbor-house/translations.ts";
import { rooms, extras, breakfast, places, guestbook } from "../src/templates/harbor-house/content.ts";

function complete(text) {
  assert.ok(copy[text], `Missing translation: ${text}`);
  assert.equal(copy[text].length, 2);
  for (const value of copy[text]) {
    assert.ok(value.trim(), `Empty translation: ${text}`);
    assert.ok(!/\w\?\w/.test(value), `Possible encoding corruption: ${value}`);
  }
}

test("every explicit Harbor House UI message has both language variants", () => {
  for (const directory of ["pages", "components"]) {
    for (const file of readdirSync(`src/templates/harbor-house/${directory}`)) {
      if (!file.endsWith(".tsx")) continue;
      const source = ts.createSourceFile(file, readFileSync(`src/templates/harbor-house/${directory}/${file}`, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function visit(node) {
        if (ts.isCallExpression(node) && node.expression.getText(source) === "t" && ts.isStringLiteral(node.arguments[0])) complete(node.arguments[0].text);
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
});

test("room, editorial, and accessible image content has both variants", () => {
  for (const room of rooms) for (const text of [room.name, room.postcard, ...room.description, room.bed, room.view, ...room.little]) {
    if (text !== "Abad Street") complete(text); // Proper street name is preserved.
  }
  for (const extra of extras) complete(extra.name);
  for (const section of breakfast) for (const text of [section.title, ...section.items]) complete(text);
  for (const place of places) { complete(place.note); complete(place.distance); }
  for (const review of guestbook) { complete(review.text); complete(review.month); }
  for (const photo of Object.values(JSON.parse(readFileSync("src/templates/harbor-house/photos.json", "utf8")))) complete(photo.alt);
});
