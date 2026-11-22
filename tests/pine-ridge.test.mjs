import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import { copy } from "../src/templates/pine-ridge-lodge/translations.ts";
import { seasons, activities, rooms, extras, menu, posts } from "../src/templates/pine-ridge-lodge/content.ts";
import { nav, site } from "../src/templates/pine-ridge-lodge/site.ts";
import { validStay, matchesSeason, extraCost, seasonOf } from "../src/templates/pine-ridge-lodge/plan.ts";

function complete(text) {
  assert.ok(copy[text], `Missing translation: ${text}`);
  assert.equal(copy[text].length,2);
  for (const value of copy[text]) assert.ok(value.trim() && !/\w\?\w|�/.test(value),`Invalid translation: ${text}`);
}
test("Pine Ridge UI and dynamic form labels have both language variants",()=>{
  const root="src/templates/pine-ridge-lodge/";
  for(const file of ["shell.tsx",...['pages','components'].flatMap(d=>readdirSync(root+d).filter(n=>n.endsWith('.tsx')).map(n=>d+'/'+n))]){
    const source=ts.createSourceFile(file,readFileSync(root+file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    function visit(n){
      if(ts.isCallExpression(n)&&n.expression.getText(source)==='t'&&ts.isStringLiteral(n.arguments[0]))complete(n.arguments[0].text);
      if(ts.isPropertyAssignment(n)&&n.name.getText(source)==='label'&&ts.isStringLiteral(n.initializer))complete(n.initializer.text);
      ts.forEachChild(n,visit);
    } visit(source);
  }
  ['Guest','Stay','Room','Room total','Skis','Snowboard','Snowshoes','Mountain bike','Canoe','Hiking poles','Language','Please fill out this field.','Please enter a valid value.'].forEach(complete);
});
test("Pine Ridge seasonal, room, menu, journal and image copy has both variants",()=>{
  for(const s of Object.values(seasons)) [s.label,s.headline,s.lede,s.months].forEach(complete);
  for(const a of activities)[a.name,a.detail,a.level,a.duration].forEach(complete);
  for(const r of rooms)[r.name,r.short,...r.description,r.beds,...r.features].forEach(complete);
  for(const x of extras)complete(x.name);
  for(const m of menu)[m.name,m.detail].forEach(complete);
  for(const p of posts)[p.title,p.dek,...p.body].forEach(complete);
  for(const p of Object.values(JSON.parse(readFileSync('src/templates/pine-ridge-lodge/photos.json','utf8'))))complete(p.alt);
  [site.tagline,site.checkIn,site.checkOut,...nav.map(n=>n.label)].forEach(complete);
});
test("Pine Ridge dates validate calendar boundaries and the entire selected season",()=>{
  assert.equal(validStay('2027-01-02','2027-01-05','2026-11-03'),true);
  for(const [a,b] of [['2027-02-29','2027-03-02'],['2026-01-02','2026-01-05'],['2027-01-02','2027-02-02'],['2027-01-02','2027-01-02']])assert.equal(validStay(a,b,'2026-11-03'),false);
  assert.equal(matchesSeason('2027-01-02','2027-01-05','winter'),true);
  assert.equal(matchesSeason('2026-12-30','2027-01-02','winter'),true);
  assert.equal(matchesSeason('2027-06-30','2027-07-02','summer'),true);
  assert.equal(matchesSeason('2027-04-30','2027-05-01','winter'),true); // Last night is April 30.
  assert.equal(matchesSeason('2027-04-30','2027-05-02','winter'),false);
  assert.equal(matchesSeason('2027-07-01','2027-07-02','winter'),false);
  assert.equal(matchesSeason('2027-05-01','2027-05-03','summer'),false);
  assert.equal(seasonOf('invalid'),'winter');
});
test("nightly add-ons scale correctly for guests and nights",()=>{
  assert.equal(extraCost('lift',119,4,3),1428);
  assert.equal(extraCost('dinner',75,4,3),900);
  assert.equal(extraCost('rental',65,4,3),195);
  assert.equal(extraCost('dinner',75,4,0),0);
  assert.equal(new Set(activities.map(a=>a.id)).size,activities.length);
  assert.equal(rooms.filter(r=>r.maxGuests>=5).map(r=>r.slug).join(),"ridge-chalet");
});
