// The ported planning-sheet rating reproduces the Google Sheet's numbers for the same picks.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as R from "../lib/sheet.js";
import * as E from "../lib/engine.js";
import * as D from "../lib/sheet-data.js";
import * as M from "../lib/models.js";

const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

test("scores match the sheet", () => {
  const r = R.rate(R.defaultState());
  // Overall/Performance/fits differ slightly from the sheet since Mixed terrain was added.
  assert.deepEqual([f1(r.overall), f1(r.synergy), f1(r.performance)], ["7.4", "7.7", "7.1"]);
  assert.deepEqual(Object.values(r.sub).map((s) => f1(s.score)), ["6.0", "9.0", "7.9", "8.8", "6.1"]);
  assert.deepEqual(r.fits.map((f) => f1(f.fit)), ["7.6", "6.8", "7.5", "6.9", "7.1", "6.7"]);
  // Against the sheet's own 13 skis the closest match is the sheet's.
  const sheetRank = R.compareModels(r.attrs, r.flags, r.state.settings, D.SKI_MODELS);
  assert.equal(sheetRank[0].model, "Völkl Deacon 84");
  assert.equal(f1(sheetRank[0].overallPct), "78.6");
  assert.equal(r.status, "Complete build  ·  Flags: 0 high, 0 medium, 1 low, 2 info  ·  Bonuses: 3");
});

test("auto-fill and missing layers", () => {
  const s = R.defaultState(); s.picks.epoxy = "Maybe";
  assert.deepEqual(R.rate(s).autoFilled.map((m) => m.name), ["Epoxy"]);
  s.picks.epoxy = "No";
  assert.equal(R.rate(s).issues[0].name, "Required layer missing");
  assert.equal(R.rate(R.blankState()).empty, true);
});

test("picks turn into a physics design", () => {
  const d = R.designFromPicks(R.defaultState(), E.BASE_BUILD);
  assert.deepEqual(d.core.blend, [{ wood: "poplar", pct: 70 }, { wood: "beech", pct: 30 }]);
  assert.equal(d.metalTop.material, "al7075");
  assert.ok(Number.isFinite(E.analyze(d).weightG));
});

test("2026/27 skis and top picks", () => {
  assert.equal(R.ALL_MODELS.length, D.SKI_MODELS.length + M.MODELS_2027.length);
  assert.equal(new Set(R.ALL_MODELS.map((m) => m.model)).size, R.ALL_MODELS.length, "no duplicate names");
  for (const m of M.MODELS_2027) assert.ok(m.ratings.length === 6 && m.ratings.every((v) => v >= 1 && v <= 5), m.model);
  for (const c of M.TOP_CATEGORIES) {
    for (const p of [...c.picks, ...(c.editor || [])]) assert.ok(R.ALL_MODELS.some((m) => m.model === p), p);
    for (const [area] of M.RECIPE_AREAS) assert.ok(c.recipe[area]?.patch, `${c.key} ${area}`);
  }
  // A ski that only publishes one layup trait can't be a perfect layup match.
  const r = R.rate(R.defaultState());
  assert.ok(r.models.find((m) => m.model === "Armada AntiMatter 114").layupPct < 100);
  assert.ok(!r.closest.estimated, "the headline closest ski has real ratings, not estimates");
});

test("every top-ski recipe is a clean design in the engine", () => {
  for (const c of M.TOP_CATEGORIES) {
    const b = JSON.parse(JSON.stringify(E.BASE_BUILD));
    for (const [area] of M.RECIPE_AREAS) for (const [k, v] of Object.entries(c.recipe[area].patch)) b[k] = v && typeof v === "object" && !Array.isArray(v) && b[k] && typeof b[k] === "object" ? { ...b[k], ...v } : v;
    b.press = "pneumatic-heat";
    const res = E.analyze(b);
    const serious = res.issues.filter((i) => i.severity === "High" || i.severity === "Medium").map((i) => i.title);
    assert.deepEqual(serious, [], c.key);
  }
});

test("sheet: process warnings are 0 points and leave Synergy alone", () => {
  const st = R.defaultState(); st.settings.press = "pneumatic-cold";
  const metal = { ...E.clone(E.BASE_BUILD), press: "pneumatic-cold", metalTop: { material: "al7075", thicknessMm: 0.5, coverage: 1 } };
  const plain = R.rate(st), withB = R.rate(st, { build: metal });
  assert.ok(withB.issues.some((i) => i.name === "Metal surface prep" && i.severity === "Warning"));
  assert.equal(withB.synergy, plain.synergy);
  assert.ok(!plain.issues.some((i) => i.severity === "Warning"));
  assert.match(R.rate(R.defaultState()).status, /0 high, 0 medium, 1 low, 2 info {2}·/);
});
