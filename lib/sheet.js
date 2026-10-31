// The planning sheet's rating system ("Build Rating" + "Rating Engine" tabs), ported to code.
// It rates a set of material picks (not a physical layup): averages each material's 1–5
// ratings, runs the sheet's checks and bonuses, and compares the picks to production skis.
// Pure functions, no DOM, so it runs in the browser and on a server.
import * as D from "./sheet-data.js";
import * as M from "./models.js";

// Every ski to compare against: the planning sheet's 13 (with this season's test notes where
// they were tested again) plus the 2026/27 test and review skis in models.js.
export const ALL_MODELS = [
  ...D.SKI_MODELS.map((m) => ({ ...m, origin: "sheet", ...(M.SHEET_MODEL_2027[m.model] ? { y2027: M.SHEET_MODEL_2027[m.model] } : {}) })),
  ...M.MODELS_2027.map((m) => ({ ...m, origin: "2027" })),
];

// Layup flags (Metal, Fiberglass, Carbon, Flax/basalt, Hardwood core) for a physical design.
export function flagsOfBuild(b) {
  const lams = [...(b.laminatesTop || []), ...(b.laminatesBottom || [])].filter((l) => l.gsm > 0);
  const has = (...fs) => (lams.some((l) => fs.includes(l.fiber)) ? "Y" : "N");
  const metal = [b.metalTop, b.metalBottom].some((m) => m && m.material && m.material !== "none") ? "Y" : "N";
  const hard = (b.core?.blend || []).some((x) => x.pct > 0 && ["beech", "ash", "maple"].includes(x.wood)) ? "Y" : "N";
  return [metal, has("eglass"), has("carbon"), has("flax", "basalt"), hard];
}

export const ATTR_KEYS = D.ATTRIBUTES.map((a) => a.key);
const HARDWOOD = new Set(["beech", "ash", "maple"]);
const LIGHT_CORE = new Set(["poplar", "aspen", "paulownia", "bamboo"]);
const SOFT_CORE = new Set(["paulownia", "balsa", "foam-pu-pvc"]);
const DAMPING_FABRIC = new Set(["flax", "basalt", "aramid-kevlar"]);
const HIGH_PRESSURE = new Set(["pneumatic-cold", "pneumatic-heat"]);
const r1 = (x) => Math.round(x * 10) / 10;
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const clamp10 = (x) => Math.max(0, Math.min(10, x));
const join = (xs) => xs.join(", ");

export function defaultState() {
  return { picks: { ...D.SHEET_PICKS }, notes: { ...D.SHEET_NOTES }, ratings: {}, settings: JSON.parse(JSON.stringify(D.DEFAULT_SETTINGS)) };
}
export function blankState() {
  return { picks: {}, notes: {}, ratings: {}, settings: JSON.parse(JSON.stringify(D.DEFAULT_SETTINGS)) };
}
// Merge a saved state over the defaults so older saves keep working.
export function normalizeState(s) {
  const d = defaultState();
  if (!s || typeof s !== "object") return d;
  const st = { ...d, ...s, settings: { ...d.settings, ...(s.settings || {}) } };
  st.settings.targets = { ...d.settings.targets, ...(s.settings?.targets || {}) };
  st.settings.synergyWeights = { ...d.settings.synergyWeights, ...(s.settings?.synergyWeights || {}) };
  // Every use case counts equally, so importance from older saves is ignored.
  st.settings.useCases = d.settings.useCases;
  st.picks = s.picks || {}; st.notes = s.notes || {}; st.ratings = s.ratings || {};
  return st;
}
export const ratingsOf = (m, state) => state.ratings?.[m.id] || m.ratings;

// Yes picks plus an auto-filled option for every required layer you haven't picked:
// the easiest material in that layer that you haven't marked No.
export function buildMaterials(state) {
  const yes = D.MATERIALS.filter((m) => state.picks[m.id] === "Yes");
  const autoFilled = [], missing = [];
  if (yes.length) {
    for (const L of D.LAYERS) {
      if (L.need !== "Required" || yes.some((m) => m.category === L.category)) continue;
      const opts = D.MATERIALS.filter((m) => m.category === L.category && state.picks[m.id] !== "No").sort((a, b) => b.overall - a.overall || a.num - b.num);
      if (opts.length) autoFilled.push(opts[0]); else missing.push(L.category);
    }
  }
  return { yes, autoFilled, missing, all: [...yes, ...autoFilled].sort((a, b) => a.num - b.num) };
}

export function attributesOf(materials, state) {
  return Object.fromEntries(ATTR_KEYS.map((k, i) => [k, avg(materials.map((m) => ratingsOf(m, state)?.[i]).filter((x) => x != null))]));
}
export function fitsOf(attrs, settings) {
  return settings.useCases.map((u) => {
    let s = 0, w = 0;
    // The sheet works from attributes rounded to one decimal, so this does too.
    ATTR_KEYS.forEach((k, i) => { if (attrs[k] != null && u.w[i] > 0) { s += u.w[i] * r1(attrs[k]); w += u.w[i]; } });
    return { key: u.key, name: u.name, importance: u.importance, fit: w ? 2 * s / w : null, driver: D.ATTRIBUTES[u.w.indexOf(Math.max(...u.w))].name.split(" /")[0].toLowerCase() };
  });
}
export const performanceOf = (fits) => {
  const v = fits.filter((f) => f.fit != null), w = v.reduce((a, f) => a + f.importance, 0);
  return w ? v.reduce((a, f) => a + f.importance * f.fit, 0) / w : null;
};

function layupFlags(materials) {
  const has = (pred) => materials.some(pred);
  return [
    has((m) => m.category === "Metal") ? "Y" : "N",
    has((m) => m.id === "fiberglass-triaxial-e-glass") ? "Y" : "N",
    has((m) => m.id === "carbon-fiber") ? "Y" : "N",
    has((m) => m.id === "flax" || m.id === "basalt") ? "Y" : "N",
    has((m) => HARDWOOD.has(m.id)) ? "Y" : "N",
  ];
}

export function compareModels(attrs, flags, settings, list = ALL_MODELS) {
  const sim = settings.similarity;
  const b = ATTR_KEYS.map((k) => (attrs[k] == null ? null : r1(attrs[k])));
  return list.map((m) => {
    const pairs = b.map((v, i) => [v, m.ratings[i]]).filter(([v]) => v != null);
    const rms = Math.sqrt(avg(pairs.map(([v, w]) => (v - w) ** 2)) ?? 0);
    const attrPct = Math.max(0, 100 * (1 - rms / sim.distanceScale));
    const known = m.flags.map((f, i) => [f, flags[i]]).filter(([f]) => f !== "?");
    const hits = known.filter(([f, g]) => f === g).length;
    // Unknown flags are ignored, as in the sheet, unless fewer than 4 of the 5 are known: then each
    // unknown counts as half a match, so a ski that only publishes "has metal" can't be a 100% match.
    const layupPct = known.length >= 4 ? 100 * hits / known.length : 100 * (hits + 0.5 * (m.flags.length - known.length)) / m.flags.length;
    const diffs = m.flags.map((f, i) => (f !== "?" && f !== flags[i] ? `${D.LAYUP_FLAGS[i]} (${f === "Y" ? "it has it" : "it doesn't"})` : null)).filter(Boolean);
    const mAttrs = Object.fromEntries(ATTR_KEYS.map((k, i) => [k, m.ratings[i]]));
    const fits = fitsOf(mAttrs, settings);
    return { ...m, attrPct, layupPct, overallPct: sim.attributeWeight * attrPct + sim.layupWeight * layupPct, diffs, fits, performance: performanceOf(fits) };
  }).sort((a, b) => b.overallPct - a.overallPct).map((m, i) => ({ ...m, rank: i + 1 }));
}

export function rate(stateIn) {
  const state = normalizeState(stateIn);
  const S = state.settings;
  const { yes, autoFilled, missing, all } = buildMaterials(state);
  if (!yes.length) return { empty: true, state, yes, autoFilled, missing, all };
  const ids = new Set(all.map((m) => m.id));
  const inCat = (c) => all.filter((m) => m.category === c);
  const attrs = attributesOf(all, state);
  const fits = fitsOf(attrs, S);
  const performance = performanceOf(fits);
  const metals = inCat("Metal"), cores = inCat("Core"), bases = inCat("Base"), sides = inCat("Sidewall"), lams = inCat("Laminate");
  const hasHard = cores.some((m) => HARDWOOD.has(m.id));

  const results = D.CHECKS.map((c) => ({ ...c, triggered: false, message: "OK" }));
  const hit = (name, message) => { const c = results.find((x) => x.name === name); c.triggered = true; c.message = message; };
  if (missing.length) hit("Required layer missing", `No usable ${join(missing).toLowerCase()}: every option is marked No. Change one to Maybe or Yes.`);
  if (bases.length > 1) hit("One base material", `Pick one base: ${join(bases.map((m) => m.name))}.`);
  if (cores.some((m) => SOFT_CORE.has(m.id)) && !hasHard) hit("Hardwood under the bindings", "Light core with no hardwood. Add ash, beech or maple under the bindings so the screws hold.");
  if (metals.length && S.press.startsWith("vacuum")) hit("Metal layer vs press", "A vacuum bag can't press metal well enough to bond it. Use a pneumatic press or drop the metal.");
  if (metals.length && (S.press === "undecided" || !S.press)) hit("Press chosen for metal", "You have a metal layer but no press picked.");
  if (ids.has("titanal")) hit("Metal is available", "Titanal isn't sold retail. Use 7075-T6 aluminum or plan a source.");
  if (metals.length > 1) hit("One metal type", `Pick one metal: ${join(metals.map((m) => m.name))}.`);
  if (ids.has("hardened-steel-edges") && !ids.has("rubber-strip-vds")) hit("Edges have a rubber strip", "Add a rubber strip (VDS) over the edges to protect the bond.");
  if (ids.has("carbon-fiber") && ![...ids].some((i) => DAMPING_FABRIC.has(i))) hit("Carbon is damped", "Carbon with nothing damp (flax, basalt or aramid) can feel chattery.");
  if (lams.length && !ids.has("fiberglass-triaxial-e-glass") && !ids.has("basalt")) hit("Main structural layer", "No fiberglass or basalt. Carbon, aramid or flax alone is pricey and harder to work; most builds use triax as the main layer.");
  if (cores.length > 3) hit("Core material count", "More than three core woods is hard to laminate evenly.");
  if (sides.length > 1) hit("Sidewall count", `Pick one sidewall: ${join(sides.map((m) => m.name))}.`);
  if (ids.has("balsa")) hit("Balsa durability", "Balsa crushes in the press and rots easily.");
  if (attrs.lightness != null && attrs.lightness < 2) hit("Very heavy build", `Very heavy: lightness ${r1(attrs.lightness)}/5.`);
  if (bases.some((m) => m.id.startsWith("sintered"))) hit("Base upkeep", "Sintered base: plan on regular hot waxing (see Edge tuning).");
  const hard = all.filter((m) => m.obtain <= 2 && state.picks[m.id] === "Yes");
  if (hard.length) hit("Hard-to-find picks", `Order early: ${join(hard.map((m) => m.name))}.`);
  const attrRows = D.ATTRIBUTES.map((a) => {
    const v = attrs[a.key], t = S.targets[a.key], gap = v == null ? null : r1(v) - t;
    const status = v == null ? "No rating" : gap >= 0 ? "On target" : gap >= -0.5 ? "Close" : "Below target";
    if (status === "Below target") hit(`${a.name.split(" /")[0]} vs target`.replace("Damping vs", "Damping vs"), `${a.name} ${r1(v)} is below your target of ${t}.`);
    return { ...a, value: v, target: t, gap, status };
  });
  const lightCore = cores.some((m) => LIGHT_CORE.has(m.id));
  if (lightCore && hasHard) hit("Bonus: light core + hardwood", "Light core with hardwood stringers: good weight-to-strength balance.");
  if (ids.has("hardened-steel-edges") && ids.has("rubber-strip-vds")) hit("Bonus: edges + rubber strip", "Rubber strip protects the edge bond.");
  if (metals.length && HIGH_PRESSURE.has(S.press)) hit("Bonus: metal + high-pressure press", "Metal layer paired with a pneumatic press.");
  if (ids.has("carbon-fiber") && [...ids].some((i) => DAMPING_FABRIC.has(i))) hit("Bonus: damped carbon", "Carbon paired with a damping layer.");

  const fired = results.filter((c) => c.triggered);
  const pts = (area) => fired.filter((c) => c.area === area).reduce((a, c) => a + c.points, 0);
  const named = (area) => fired.filter((c) => c.area === area && c.points !== 0).map((c) => `${c.name} (${c.points > 0 ? "+" : ""}${c.points.toFixed(2)})`);

  const flags = layupFlags(all);
  const models = compareModels(attrs, flags, S);
  const closestLayup = [...models].sort((a, b) => b.layupPct - a.layupPct || b.overallPct - a.overallPct)[0];
  const avgBuild = avg(all.map((m) => m.build)), avgObtain = avg(all.map((m) => m.obtain));
  const n4 = all.filter((m) => m.tier === "$$$$").length, n3 = all.filter((m) => m.tier === "$$$").length;
  const damp = attrs.damping ?? 0, pop = attrs.pop ?? 0;
  const sub = {
    proven: { name: "Proven layup", score: clamp10(closestLayup.layupPct / 10), now: `Closest layup: ${closestLayup.model} (${Math.round(closestLayup.layupPct)}% of flags match).${closestLayup.diffs.length ? " Differs on: " + join(closestLayup.diffs) + "." : ""}`, how: "10 × share of layup flags (metal, fiberglass, carbon, flax/basalt, hardwood core) you share with the closest-matching production ski." },
    structure: { name: "Structure", score: clamp10(9 + 2 * pts("Structure")), now: named("Structure").join("; ") || "No structure flags.", how: "Starts at 9. Each triggered structure check adds or subtracts 2 × its points." },
    manufacturability: { name: "Manufacturability", score: clamp10(2 * avgBuild + 2 * pts("Manufacturing")), now: [`Average building ease ${r1(avgBuild)}/5`, ...named("Manufacturing")].join("; ") + ".", how: "2 × average building ease of everything in the build, then ± 2 × manufacturing points." },
    ride: { name: "Ride balance", score: clamp10(10 - 1.5 * Math.abs(damp - pop) + 2 * pts("Ride balance")), now: [`Damping ${r1(damp)} vs pop ${r1(pop)} (gap ${r1(Math.abs(damp - pop))})`, ...named("Ride balance")].join("; ") + ".", how: "Starts at 10, minus 1.5 × the gap between damping and pop, then ± 2 × ride-balance points." },
    sourcing: { name: "Sourcing & cost", score: clamp10(2 * avgObtain - 0.5 * n4 - 0.25 * n3 + 2 * pts("Sourcing")), now: `Average ease to obtain ${r1(avgObtain)}/5; ${n4} $$$$ and ${n3} $$$ picks.`, how: "2 × average ease to obtain, minus 0.5 per $$$$ pick and 0.25 per $$$ pick, then ± 2 × sourcing points." },
  };
  const W = S.synergyWeights, wSum = Object.values(W).reduce((a, b) => a + b, 0) || 1;
  const synergy = Object.entries(sub).reduce((a, [k, v]) => a + (W[k] || 0) * v.score, 0) / wSum;
  const overall = performance == null ? synergy : (synergy + performance) / 2;
  const sev = (s) => fired.filter((c) => c.severity === s).length;
  const issues = fired.filter((c) => c.severity !== "Bonus").sort((a, b) => ["High", "Medium", "Low", "Info"].indexOf(a.severity) - ["High", "Medium", "Low", "Info"].indexOf(b.severity));
  const bonuses = fired.filter((c) => c.severity === "Bonus");
  const word = overall >= 8.5 ? "Excellent" : overall >= 7 ? "Solid" : overall >= 5.5 ? "Workable" : "Needs work";
  const weakest = Object.values(sub).sort((a, b) => a.score - b.score)[0];
  const fitSorted = fits.filter((f) => f.fit != null).sort((a, b) => b.fit - a.fit);
  return {
    empty: false, state, yes, autoFilled, missing, all, attrs, attrRows, fits, performance, synergy, overall, word, sub, weakest,
    checks: results, issues, bonuses, flags, models, closest: models.find((m) => !m.estimated) || models[0], closestLayup,
    status: `${missing.length ? "Incomplete build" : "Complete build"}  ·  Flags: ${sev("High")} high, ${sev("Medium")} medium, ${sev("Low")} low, ${sev("Info")} info  ·  Bonuses: ${bonuses.length}`,
    bestFit: fitSorted[0], worstFit: fitSorted.at(-1),
    highlights: highlightsOf(attrRows, fitSorted, sub),
  };
}

function highlightsOf(attrRows, fitSorted, sub) {
  const rated = attrRows.filter((a) => a.value != null);
  const strongest = [...rated].sort((a, b) => b.value - a.value)[0];
  const furthest = [...rated].sort((a, b) => a.gap - b.gap)[0];
  const subs = Object.values(sub).sort((a, b) => b.score - a.score);
  return [
    ["Strongest attribute", `${strongest.name} (${r1(strongest.value)}/5)`],
    ["Furthest below target", furthest.gap < 0 ? `${furthest.name} (${furthest.gap.toFixed(1)})` : "None: every attribute meets its target"],
    ["Best use case", `${fitSorted[0].name} (${r1(fitSorted[0].fit)}/10)`],
    ["Weakest use case", `${fitSorted.at(-1).name} (${r1(fitSorted.at(-1).fit)}/10)`],
    ["Strongest synergy area", `${subs[0].name} (${r1(subs[0].score)})`],
    ["Weakest synergy area", `${subs.at(-1).name} (${r1(subs.at(-1).score)})`],
  ];
}

// "My Picks" tab: counts, picks by layer, quick stats and build flags.
export function picksSummary(stateIn) {
  const state = normalizeState(stateIn);
  const { yes, autoFilled, missing } = buildMaterials(state);
  const by = (v) => D.MATERIALS.filter((m) => (state.picks[m.id] || "") === v);
  const counts = { Yes: by("Yes"), Maybe: by("Maybe"), No: by("No"), "": by("") };
  const layers = D.LAYERS.map((L) => {
    const ms = D.MATERIALS.filter((m) => m.category === L.category);
    const c = (v) => ms.filter((m) => (state.picks[m.id] || "") === v).length;
    const yesPicks = ms.filter((m) => state.picks[m.id] === "Yes").map((m) => m.name);
    const auto = autoFilled.find((m) => m.category === L.category);
    const status = yesPicks.length ? "Picked" : L.need !== "Required" ? (L.need === "Recommended" ? "Worth adding" : "Optional")
      : !yes.length ? "Will auto-fill" : auto ? `Auto-filled: ${auto.name}` : "No usable option";
    return { ...L, yes: c("Yes"), maybe: c("Maybe"), no: c("No"), undecided: c(""), status, yesPicks };
  });
  const minBy = (arr, k) => { const lo = Math.min(...arr.map((m) => m[k])); return arr.filter((m) => m[k] === lo).map((m) => m.name); };
  const coreYes = yes.filter((m) => m.category === "Core");
  const flags = [
    ["Metal layer", yes.some((m) => m.category === "Metal") ? "You picked a metal layer: plan on a pneumatic press, not a vacuum bag (see Press)." : "—"],
    ["Light core without hardwood", coreYes.length && !coreYes.some((m) => HARDWOOD.has(m.id)) && coreYes.some((m) => SOFT_CORE.has(m.id)) ? "Your core has no hardwood: add ash, beech or maple under the bindings." : "—"],
    ["Base care", yes.some((m) => m.id.startsWith("sintered")) ? "Sintered base picked: plan on regular hot waxing (see Edge tuning)." : "—"],
    ["Hard-to-find materials", yes.some((m) => m.obtain <= 2) ? "At least one pick scores 2 or less on ease to obtain. Order it early." : "—"],
  ];
  return {
    counts, layers, missing, autoFilled,
    avgEase: yes.length ? avg(yes.map((m) => m.overall)) : null,
    hardestBuild: yes.length ? minBy(yes, "build") : [], hardestGet: yes.length ? minBy(yes, "obtain") : [],
    tiers: yes.map((m) => `${m.name} (${m.tier})`), flags,
  };
}

// Turn the picks into a physical layup for the Design tab. Keeps the given build's shape.
const WOOD_KEY = { poplar: "poplar", aspen: "aspen", beech: "beech", ash: "ash", maple: "maple", paulownia: "paulownia", bamboo: "bamboo", balsa: "balsa", "foam-pu-pvc": "foam" };
const FABRIC = {
  "fiberglass-triaxial-e-glass": { fiber: "eglass", arch: "triax", gsm: 746, plies: 1 },
  "carbon-fiber": { fiber: "carbon", arch: "ud", gsm: 200, plies: 1 },
  basalt: { fiber: "basalt", arch: "triax", gsm: 600, plies: 1 },
  "aramid-kevlar": { fiber: "aramid", arch: "biax45", gsm: 170, plies: 1 },
  flax: { fiber: "flax", arch: "biax45", gsm: 400, plies: 1 },
};
export function designFromPicks(stateIn, baseBuild) {
  const state = normalizeState(stateIn);
  const { all } = buildMaterials(state);
  const b = JSON.parse(JSON.stringify(baseBuild));
  const ids = new Set(all.map((m) => m.id));
  const cores = all.filter((m) => m.category === "Core").map((m) => m.id);
  if (cores.length) {
    const light = cores.filter((c) => !HARDWOOD.has(c)), hard = cores.filter((c) => HARDWOOD.has(c));
    const share = (list, total) => list.map((c, i) => ({ wood: WOOD_KEY[c], pct: Math.round(total / list.length) + (i === 0 ? total - Math.round(total / list.length) * list.length : 0) }));
    b.core.blend = light.length && hard.length ? [...share(light, 70), ...share(hard, 30)] : share(cores, 100);
  }
  const fabrics = all.filter((m) => FABRIC[m.id]).map((m) => ({ ...FABRIC[m.id] }));
  b.laminatesBottom = JSON.parse(JSON.stringify(fabrics));
  b.laminatesTop = JSON.parse(JSON.stringify(fabrics));
  const metal = ids.has("7075-t6-aluminum") ? "al7075" : ids.has("titanal") ? "titanal" : "none";
  b.metalBottom = { material: metal, thicknessMm: 0.5, coverage: 1 };
  b.metalTop = { material: metal, thicknessMm: 0.5, coverage: 1 };
  b.base.material = ids.has("sintered-graphite-race-base") ? "graphite" : ids.has("extruded-polyethylene") ? "extruded" : "sintered";
  b.sidewall.material = ids.has("phenolic") ? "phenolic" : ids.has("uhmw-p-tex-sidewall") ? "uhmw" : ids.has("abs") ? "abs" : "cap";
  if (b.sidewall.material !== "cap" && !(b.sidewall.widthMm > 0)) b.sidewall.widthMm = 4;
  b.rubber.on = ids.has("rubber-strip-vds");
  b.topsheet.material = "nylon";
  b.press = state.settings.press === "someone-else" ? "undecided" : state.settings.press;
  b.name = "From my picks";
  return b;
}
