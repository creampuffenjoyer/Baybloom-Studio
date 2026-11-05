import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyHarborDraft, parseHarborDraft } from "../src/lib/personalization/harbor-draft.ts";

test("a draft can contain validated Harbor House overrides", () => {
  const draft = emptyHarborDraft();
  draft.business.name = "  Bay House  ";
  draft.home.headline = "A quieter kind of stay";
  draft.theme.accent = "#24557f";
  const result = parseHarborDraft(draft);
  assert.equal(result.success, true);
  assert.equal(result.data.business.name, "Bay House");
});

test("drafts reject unsupported versions, fields and unsafe colors", () => {
  const draft = emptyHarborDraft();
  assert.equal(parseHarborDraft({ ...draft, version: 2 }).success, false);
  assert.equal(parseHarborDraft({ ...draft, template: "other" }).success, false);
  assert.equal(parseHarborDraft({ ...draft, business: { name: " " } }).success, false);
  assert.equal(parseHarborDraft({ ...draft, theme: { accent: "url(example)" } }).success, false);
  assert.equal(parseHarborDraft({ ...draft, extra: true }).success, false);
});
