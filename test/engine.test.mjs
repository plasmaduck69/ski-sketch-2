// Physics checks against textbook results, calibration against published ski weights,
// and optimizer behavior. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "../lib/engine.js";

const near = (got, want, tol, msg) => assert.ok(Math.abs(got - want) <= tol * Math.abs(want), `${msg}: got ${got}, want ${want}`);

test("unidirectional laminate stiffness equals the rule of mixtures", () => {
  const vf = 0.5, p = E.laminateProps("carbon", "ud", 300, vf);
  near(p.E / 1e9, vf * E.FIBERS.carbon.E1 + (1 - vf) * E.EPOXY.E, 0.01, "Ex");
  near(p.t, 0.3 / (E.FIBERS.carbon.rho * vf), 1e-9, "ply thickness");
});

test("±45° fabric trades bending stiffness for shear stiffness", () => {
  const a = E.laminateProps("carbon", "biax45", 300, 0.4), b = E.laminateProps("carbon", "woven", 300, 0.4);
  assert.ok(a.G > b.G && a.E < b.E);
});

test("section stiffness matches E·b·h³/12 and stacking", () => {
  const r = { name: "x", group: "x", b: 0.09, h: 0.012, z0: 0, E: 10e9, G: 0.7e9, rho: 500, eta: 0.01 };
  const one = E.sectionProps([r], 0.012, 0.09);
  near(one.EI, 10e9 * 0.09 * 0.012 ** 3 / 12, 1e-9, "EI");
  const two = E.sectionProps([{ ...r, h: 0.006 }, { ...r, h: 0.006, z0: 0.006 }], 0.012, 0.09);
  near(two.EI, one.EI, 1e-9, "stacked");
});

test("three-point flex of a uniform ski matches 48EI/L³", () => {
  const b = E.clone(E.BASE_BUILD);
  Object.assign(b, { tipWidth: 90, waistWidth: 90, tailWidth: 90, tipRockerCm: 0, tailRockerCm: 0, mountOffsetCm: 0, tipContactCm: 20, tailContactCm: 20 });
  Object.assign(b.core, { underfootMm: 10, tipMm: 10, tailMm: 10, endMm: 10 });
  const r = E.analyze(b, { stations: 801 });
  const span = r.geometry.camTip - r.geometry.camTail;
  near(r.flexRate * 1000, 48 * r.stations[400].EI / span ** 3, 0.01, "k");
});

test("Rayleigh frequency of a uniform free–free beam", () => {
  const n = 401, L = 1.7, s = Array.from({ length: n }, (_, i) => i * L / (n - 1));
  near(E.rayleighF1(s, s.map(() => 200), s.map(() => 1), L).f1, 4.730040745 ** 2 / (2 * Math.PI) * Math.sqrt(200 / L ** 4), 0.002, "f1");
});

test("production reference layups reproduce published weights", () => {
  for (const ref of E.REFERENCES) near(E.analyze(ref.build).weightG, ref.publishedWeightG, 0.015, ref.id);
});

test("unit system changes text, not physics", () => {
  const m = E.analyze(E.SHEET_DRAFT), u = E.analyze(E.SHEET_DRAFT, { units: "us" });
  assert.equal(u.weightG, m.weightG);
  assert.match(u.attributes.why.lightness, /lb/);
});

test("optimizer improves on the start and respects locks and weight limit", () => {
  const res = E.optimize(E.SHEET_DRAFT, { goal: "east" });
  assert.ok(res.candidates[0].score >= res.baseline.score);
  const locked = E.optimize(E.SHEET_DRAFT, { goal: "park", lock: ["core", "metal"], maxWeight177: 1900 });
  for (const c of locked.candidates) {
    assert.ok(!c.changes.some((x) => x.dim === "core" || x.dim === "metal"));
    assert.ok(c.weight177 <= 1900);
  }
});

test("materials list covers the layup and adds up", () => {
  const m = E.billOfMaterials(E.SHEET_DRAFT);
  const groups = new Set(m.items.map((i) => i.group));
  for (const g of ["Core", "Fiberglass & fabrics", "Epoxy", "Base", "Edges", "Sidewalls", "Damping", "Topsheet", "Metal"]) assert.ok(groups.has(g), g);
  assert.equal(Math.round(m.items.reduce((a, i) => a + i.cost, 0) * 100) / 100, m.total);
  assert.ok(m.items.every((i) => i.buy.startsWith("https://www.amazon.com/s?k=")));
  const noMetal = E.billOfMaterials(E.BASE_BUILD);
  assert.ok(!noMetal.items.some((i) => i.group === "Metal"));
});
