import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import { copy } from "../src/templates/coral-cove/translations.ts";
import { villas, extras, experiences, offers, reviews } from "../src/templates/coral-cove/content.ts";
import { validStay, stayEstimate } from "../src/templates/coral-cove/stay-plan.ts";
import { localizedHref, languageOf } from "../src/templates/_kit/language-url.ts";
import { site, nav } from "../src/templates/coral-cove/site.ts";

const complete = text => {
  assert.ok(copy[text], `Missing translation: ${text}`);
  assert.equal(copy[text].length, 2);
  for (const value of copy[text]) assert.ok(value.trim() && !/\w\?\w|�/.test(value), `Invalid translation: ${text}`);
};

test("Coral Cove UI, FAQ, navigation, and inline editorial copy have both translations", () => {
  const root = "src/templates/coral-cove/";
  const files = ["shell.tsx", "language.tsx", ...["pages", "components"].flatMap(d => readdirSync(root+d).filter(f=>f.endsWith(".tsx")).map(f=>`${d}/${f}`))];
  for (const file of files) {
    const source=ts.createSourceFile(file,readFileSync(root+file,"utf8"),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(source)==="t" && ts.isStringLiteral(node.arguments[0])) complete(node.arguments[0].text);
      if (ts.isPropertyAssignment(node) && ["q","a","label"].includes(node.name.getText(source)) && ts.isStringLiteral(node.initializer)) complete(node.initializer.text);
      if (ts.isArrayLiteralExpression(node) && ts.isArrayLiteralExpression(node.parent) && node.elements.every(e=>ts.isStringLiteral(e))) {
        for (const el of node.elements) if (!['deposit','arrival','coral','beach-bar','sandbar','pool','paraw'].includes(el.text)) complete(el.text);
      }
      ts.forEachChild(node,visit);
    } visit(source);
  }
});

test("Coral Cove villas, activities, offers, reviews and photo alternatives have both translations", () => {
  [site.tagline, site.checkIn, site.checkOut, ...nav.map(n=>n.label)].forEach(complete);
  for (const v of villas) [v.name,v.short,...v.description,v.beds,v.view,...v.amenities].forEach(complete);
  for (const x of extras) complete(x.name);
  for (const x of experiences) [x.name,x.summary,x.detail,x.duration,x.price].forEach(complete);
  for (const x of offers) [x.name,x.headline,x.body,...x.includes,x.terms].forEach(complete);
  for (const x of reviews) [x.quote,x.stay].forEach(complete);
  for (const x of Object.values(JSON.parse(readFileSync("src/templates/coral-cove/photos.json","utf8")))) complete(x.alt);
});

test("stay plans reject impossible, past, reversed and excessive date ranges", () => {
  assert.equal(validStay("2027-02-28","2027-03-01","2027-01-01"),true);
  assert.equal(validStay("2028-02-29","2028-03-01","2027-01-01"),true);
  for (const [start,end] of [["2027-02-29","2027-03-02"],["2027-13-01","2028-01-02"],["2027-01-01","2027-01-02"],["2027-05-03","2027-05-03"],["2027-05-04","2027-05-03"],["2027-05-01","2027-06-01"],["","2027-05-03"]]) assert.equal(validStay(start,end,"2027-02-01"),false, `${start} ${end}`);
  assert.equal(validStay("2027-05-01","2027-05-31","2027-02-01"),true);
});

test("sample discounts apply per fifth night and never discount extras or imply package pricing", () => {
  assert.deepEqual(stayEstimate(160000,7000,32000,5,"stay-longer"),{freeNights:1,discount:32000,subtotal:135000});
  assert.equal(stayEstimate(320000,0,32000,10,"stay-longer").discount,64000);
  assert.equal(stayEstimate(128000,7000,32000,4,"stay-longer").discount,0);
  for (const offer of [null,"honeymoon","dive-and-stay"]) assert.equal(stayEstimate(96000,7000,32000,3,offer).subtotal,103000);
  assert.equal(villas.find(v=>v.slug==="lagoon-family-villa").pool,"shared");
  assert.equal(villas.filter(v=>v.pool==="private" && v.maxGuests>=4).length,0);
});

test("language URLs preserve stay parameters and fragments without altering external links", () => {
  assert.equal(localizedHref("/book?guests=3&room=garden-pool-villa#summary","tl"),"/book?guests=3&room=garden-pool-villa&lang=tl#summary");
  assert.equal(localizedHref("https://example.com","tl"),"https://example.com");
  assert.equal(languageOf("invalid"),"en");
});
