import { test } from "node:test";
import assert from "node:assert/strict";
import characters from "../app/data/characters.json";
import { baseArticles } from "../lib/seed";
import { characterProfile } from "../lib/character-profile";
import type { Article } from "../lib/models";

const abel = characters.find(c => c.slug === "abel-duran")!;
const record: Article = { ...baseArticles.find(a => a.slug === abel.slug)!, id: "test", status: "published", owner_id: "100000000000000001", version: 8, related: [], created_at: "", updated_at: "" };
test("linked and frozen legacy characters retain all original profile sections", () => {
  for (const status of ["published", "frozen"] as const) {
    const profile = characterProfile({ ...record, status });
    assert.deepEqual(profile.physical, abel.physical);
    assert.deepEqual(profile.personality, abel.personality);
    assert.deepEqual(profile.extracts, abel.extracts);
    assert.equal(profile.application, abel.application);
    assert.equal(profile.role, abel.role);
  }
});
test("new characters and editorial changes use database content without stale biography", () => {
  const profile = characterProfile({ ...record, slug: "new-character", title: "Новый герой", body: "Физические данные\n\nВозраст: 25 лет\n\nХарактер\n\nСпокойный.\n\nБиография\n\nПервая экспедиция." });
  assert.deepEqual(profile.physical, [["Возраст", "25 лет"]]);
  assert.deepEqual(profile.personality, ["Спокойный."]);
  assert.deepEqual(profile.extracts, ["Первая экспедиция."]);
  assert.equal(profile.application, "");
  const edited = characterProfile({ ...record, body: "Полностью новая биография." });
  assert.deepEqual(edited.extracts, ["Полностью новая биография."]);
  assert.deepEqual(edited.personality, []);
});
