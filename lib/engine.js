// Ski Layup Lab — physics engine.
// Pure functions, no DOM: runs in the browser or in Node (portable to a server later).
// Units inside the engine: SI (m, kg, Pa, N). Inputs use builder units (cm, mm, oz/yd²).

export const ENGINE_VERSION = "1.0.0";

const GPa = 1e9;
const OZYD2_TO_GSM = 33.906;

// ---------------------------------------------------------------- material data
// Wood: longitudinal modulus (E) and density at 12% moisture. US species from the
// USDA Wood Handbook (FPL-GTR-282); paulownia, bamboo and foam from manufacturer
// and literature ranges (estimates). G is the longitudinal shear modulus (~0.07·E for wood).
// eta = material loss factor (damping), literature ranges; treat as estimates.
export const WOODS = {
  poplar:    { name: "Poplar (yellow-poplar)", E: 10.9, rho: 470, eta: 0.010, durability: 3.5, kind: "light" },
  aspen:     { name: "Aspen", E: 8.1, rho: 426, eta: 0.010, durability: 2.5, kind: "light" },
  paulownia: { name: "Paulownia", E: 5.0, rho: 280, eta: 0.014, durability: 3.0, kind: "soft" },
  bamboo:    { name: "Bamboo (laminated)", E: 11.0, rho: 650, eta: 0.010, durability: 4.0, kind: "light" },
  beech:     { name: "Beech", E: 11.9, rho: 717, eta: 0.012, durability: 4.5, kind: "hard" },
  ash:       { name: "Ash", E: 12.0, rho: 672, eta: 0.010, durability: 4.5, kind: "hard" },
  maple:     { name: "Maple (hard)", E: 12.6, rho: 706, eta: 0.009, durability: 4.5, kind: "hard" },
  balsa:     { name: "Balsa", E: 3.4, rho: 160, eta: 0.015, durability: 1.5, kind: "soft" },
  foam:      { name: "Foam (PVC, 130 kg/m³)", E: 0.17, rho: 130, eta: 0.020, durability: 2.0, kind: "soft" },
};

// Fibers for laminate micromechanics. E1 along the fiber, E2 across it, G12 in-plane shear.
export const FIBERS = {
  eglass: { name: "E-glass", E1: 72, E2: 72, G12: 30, nu12: 0.22, rho: 2540, eta: 0.008 },
  carbon: { name: "Carbon (standard modulus)", E1: 230, E2: 15, G12: 15, nu12: 0.20, rho: 1780, eta: 0.004 },
  basalt: { name: "Basalt", E1: 89, E2: 89, G12: 35, nu12: 0.26, rho: 2670, eta: 0.010 },
  flax:   { name: "Flax", E1: 50, E2: 7, G12: 2.5, nu12: 0.30, rho: 1450, eta: 0.020 },
  aramid: { name: "Aramid (Kevlar 49)", E1: 124, E2: 5, G12: 2.8, nu12: 0.36, rho: 1440, eta: 0.018 },
};
export const EPOXY = { E: 3.2, nu: 0.35, rho: 1150 };

// Fabric architectures as ply angle fractions (degrees from the ski's long axis).
export const ARCHITECTURES = {
  triax:  { name: "Triax 0/±45°", plies: [[0, 1 / 3], [45, 1 / 3], [-45, 1 / 3]], knock: 1.0 },
  biax45: { name: "Biax ±45°", plies: [[45, 0.5], [-45, 0.5]], knock: 1.0 },
  ud:     { name: "Unidirectional 0°", plies: [[0, 1]], knock: 1.0 },
  woven:  { name: "Woven 0/90°", plies: [[0, 0.5], [90, 0.5]], knock: 0.9 },
};

export const METALS = {
  none:    null,
  titanal: { name: "Titanal", E: 70, G: 26.5, rho: 2780, eta: 0.001 },
  al7075:  { name: "7075-T6 aluminum", E: 71.7, G: 26.9, rho: 2810, eta: 0.001 },
};

export const BASES = {
  sintered: { name: "Sintered UHMW", E: 0.7, G: 0.25, rho: 935, eta: 0.05, glide: 4.0, durability: 4.5 },
  graphite: { name: "Sintered graphite (race)", E: 0.7, G: 0.25, rho: 950, eta: 0.05, glide: 5.0, durability: 3.5 },
  extruded: { name: "Extruded PE", E: 1.0, G: 0.35, rho: 950, eta: 0.05, glide: 2.5, durability: 4.0 },
};

export const SIDEWALLS = {
  abs:      { name: "ABS", E: 2.2, G: 0.8, rho: 1050, eta: 0.03, durability: 3.5 },
  uhmw:     { name: "UHMW (P-Tex)", E: 0.7, G: 0.25, rho: 935, eta: 0.05, durability: 4.5 },
  phenolic: { name: "Phenolic", E: 7.0, G: 2.5, rho: 1340, eta: 0.02, durability: 4.0 },
  cap:      { name: "Cap (no sidewall)", E: 0, G: 0, rho: 0, eta: 0, durability: 3.0 },
};

export const TOPSHEETS = {
  nylon: { name: "Nylon (PA12)", E: 1.4, G: 0.5, rho: 1010, eta: 0.03, durability: 3.5 },
  tpu:   { name: "TPU", E: 0.25, G: 0.09, rho: 1150, eta: 0.10, durability: 4.0 },
};

export const STEEL = { name: "Hardened steel edge", E: 200, G: 77, rho: 7850, eta: 0.001 };
export const RUBBER = { name: "Rubber (VDS)", E: 0.005, G: 0.002, rho: 1200, eta: 0.5 };

export const PRESSES = {
  "vacuum-cold": { name: "Vacuum bag, room temp", psi: 13, metalOK: false, heated: false },
  "vacuum-heat": { name: "Vacuum bag + heat", psi: 13, metalOK: false, heated: true },
  "pneumatic-cold": { name: "Pneumatic press, cold", psi: 60, metalOK: true, heated: false },
  "pneumatic-heat": { name: "Heated pneumatic press", psi: 60, metalOK: true, heated: true },
  "jack-frame": { name: "Hydraulic jack frame", psi: 40, metalOK: true, heated: false },
  "undecided": { name: "Not decided", psi: null, metalOK: null, heated: false },
  "factory": { name: "Factory press (production ski)", psi: 100, metalOK: true, heated: true },
};

// Use cases: weights over the six attributes [edge, damping, pop, glide, lightness, durability].
// Every use case counts equally in Performance, so a weak spot can't hide behind a strong one.
const EQUAL = 1 / 6;
export const USE_CASES = [
  { key: "racing", name: "Racing (gates)", importance: EQUAL, w: [0.35, 0.25, 0.15, 0.20, 0.00, 0.05] },
  { key: "park", name: "Park / freestyle", importance: EQUAL, w: [0.10, 0.20, 0.30, 0.00, 0.20, 0.20] },
  { key: "east", name: "Hardpack & ice", importance: EQUAL, w: [0.35, 0.30, 0.10, 0.00, 0.05, 0.20] },
  { key: "soft", name: "Soft snow", importance: EQUAL, w: [0.10, 0.25, 0.25, 0.10, 0.20, 0.10] },
  { key: "mixed", name: "Mixed terrain", importance: EQUAL, w: [0.20, 0.25, 0.20, 0.05, 0.15, 0.15] },
  { key: "allday", name: "All-day comfort", importance: EQUAL, w: [0.15, 0.25, 0.15, 0.05, 0.30, 0.10] },
];
export const ATTRS = [
  { key: "edge", name: "Edge grip" },
  { key: "damping", name: "Damping / stability" },
  { key: "pop", name: "Pop / energy" },
  { key: "glide", name: "Glide" },
  { key: "lightness", name: "Lightness" },
  { key: "durability", name: "Durability" },
];

// ---------------------------------------------------------------- units
// The engine computes in SI; this only formats numbers for people. "metric" uses the ski
// industry's usual units (g, cm, mm, N); "us" uses lb/oz, inches, feet, lbf and psi.
const N_M2_TO_LBF_IN2 = 0.224808943 * 1550.0031;
export const UNIT_KINDS = {
  massG:     { metric: ["g", 1, 0],          us: ["lb", 1 / 453.59237, 2] },
  massSmallG:{ metric: ["g", 1, 0],          us: ["oz", 1 / 28.349523, 1] },
  lenCm:     { metric: ["cm", 1, 0],         us: ["in", 1 / 2.54, 1] },
  lenM:      { metric: ["m", 1, 1],          us: ["ft", 3.2808399, 1] },
  widthMm:   { metric: ["mm", 1, 0],         us: ["in", 1 / 25.4, 2] },
  thickMm:   { metric: ["mm", 1, 1],         us: ["in", 1 / 25.4, 3] },
  forceN:    { metric: ["N", 1, 0],          us: ["lbf", 0.224808943, 1] },
  rateNmm:   { metric: ["N/mm", 1, 1],       us: ["lbf/in", 5.71014715, 1] },
  energyJ:   { metric: ["J", 1, 2],          us: ["ft·lbf", 0.737562149, 2] },
  stiffNm2:  { metric: ["N·m²", 1, 0],       us: ["lbf·in²", N_M2_TO_LBF_IN2, 0] },
  inertia:   { metric: ["kg·m²", 1, 2],      us: ["lb·in²", 3417.17146, 0] },
  massPerLen:{ metric: ["g/m", 1, 0],        us: ["oz/ft", 0.3048 / 28.349523, 2] },
  arealGsm:  { metric: ["g/m²", 1, 0],       us: ["oz/yd²", 1 / OZYD2_TO_GSM, 1] },
  torqueNm:  { metric: ["N·m", 1, 0],        us: ["ft·lbf", 0.737562149, 1] },
  pressPsi:  { metric: ["bar", 0.0689475729, 1], us: ["psi", 1, 0] },
};
export function makeUnits(system = "metric") {
  const sys = system === "us" ? "us" : "metric";
  const num = (x, d) => Number.isFinite(x) ? x.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
  const spec = (kind) => UNIT_KINDS[kind][sys];
  const val = (kind, v) => {
    if (kind === "tempC") return sys === "us" ? v * 9 / 5 + 32 : v;
    return v * spec(kind)[1];
  };
  const unit = (kind) => kind === "tempC" ? (sys === "us" ? "°F" : "°C") : spec(kind)[0];
  const digits = (kind, d) => d ?? (kind === "tempC" ? 0 : spec(kind)[2]);
  return {
    system: sys, val, unit, num,
    n: (kind, v, d) => num(val(kind, v), digits(kind, d)),
    fmt: (kind, v, d) => `${num(val(kind, v), digits(kind, d))} ${unit(kind)}`,
    range: (kind, a, b, d) => `${num(val(kind, a), digits(kind, d))}–${num(val(kind, b), digits(kind, d))} ${unit(kind)}`,
  };
}
const METRIC = makeUnits("metric");

// ---------------------------------------------------------------- laminate micromechanics
// Rule of mixtures for E1 and nu12, Halpin–Tsai for E2 (xi=2) and G12 (xi=1), then
// classical lamination theory over the fabric's ply angles. Returns effective in-plane
// properties of one cured fabric layer (balanced, so no extension–shear coupling).
function udPly(fiber, vf) {
  const m = EPOXY;
  const Gm = m.E / (2 * (1 + m.nu));
  const E1 = vf * fiber.E1 + (1 - vf) * m.E;
  const nu12 = vf * fiber.nu12 + (1 - vf) * m.nu;
  const ht = (pf, pm, xi) => {
    const r = pf / pm;
    const eta = (r - 1) / (r + xi);
    return pm * (1 + xi * eta * vf) / (1 - eta * vf);
  };
  const E2 = ht(fiber.E2, m.E, 2);
  const G12 = ht(fiber.G12, Gm, 1);
  return { E1, E2, G12, nu12 };
}

function qbar(p, deg) {
  const nu21 = p.nu12 * p.E2 / p.E1;
  const d = 1 - p.nu12 * nu21;
  const Q11 = p.E1 / d, Q22 = p.E2 / d, Q12 = p.nu12 * p.E2 / d, Q66 = p.G12;
  const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  const c2 = c * c, s2 = s * s, c4 = c2 * c2, s4 = s2 * s2, sc = s2 * c2;
  return {
    q11: Q11 * c4 + 2 * (Q12 + 2 * Q66) * sc + Q22 * s4,
    q22: Q11 * s4 + 2 * (Q12 + 2 * Q66) * sc + Q22 * c4,
    q12: (Q11 + Q22 - 4 * Q66) * sc + Q12 * (s4 + c4),
    q66: (Q11 + Q22 - 2 * Q12 - 2 * Q66) * sc + Q66 * (s4 + c4),
  };
}

export function laminateProps(fiberKey, archKey, gsm, vf) {
  const fiber = FIBERS[fiberKey], arch = ARCHITECTURES[archKey];
  if (!fiber || !arch) throw new Error(`Unknown fabric ${fiberKey}/${archKey}`);
  const ply = udPly(fiber, vf);
  let a11 = 0, a22 = 0, a12 = 0, a66 = 0;
  for (const [deg, frac] of arch.plies) {
    const q = qbar(ply, deg);
    a11 += frac * q.q11; a22 += frac * q.q22; a12 += frac * q.q12; a66 += frac * q.q66;
  }
  const Ex = (a11 * a22 - a12 * a12) / a22 * arch.knock;
  const Gxy = a66 * arch.knock;
  const t = (gsm / 1000) / (fiber.rho * vf); // m
  const resinMass = EPOXY.rho * (1 - vf) * t;  // kg/m²
  const arealMass = gsm / 1000 + resinMass;    // kg/m²
  return {
    t, E: Ex * GPa, G: Gxy * GPa, rho: arealMass / t, arealMass,
    eta: fiber.eta, name: `${fiber.name} ${arch.name}`,
  };
}

// ---------------------------------------------------------------- geometry
function circleThrough(p1, p2, p3) {
  const [x1, y1] = p1, [x2, y2] = p2, [x3, y3] = p3;
  const d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
  if (Math.abs(d) < 1e-12) return null;
  const s1 = x1 * x1 + y1 * y1, s2 = x2 * x2 + y2 * y2, s3 = x3 * x3 + y3 * y3;
  const cx = (s1 * (y2 - y3) + s2 * (y3 - y1) + s3 * (y1 - y2)) / d;
  const cy = (s1 * (x3 - x2) + s2 * (x1 - x3) + s3 * (x2 - x1)) / d;
  return { cx, cy, r: Math.hypot(x1 - cx, y1 - cy) };
}

export function geometry(b) {
  const L = b.lengthCm / 100;
  const sTail = b.tailContactCm / 100;
  const sTip = L - b.tipContactCm / 100;
  const sWaist = L / 2 + (b.waistOffsetCm || 0) / 100;
  const sBoot = L / 2 + (b.mountOffsetCm || 0) / 100;
  const circ = circleThrough([sTail, b.tailWidth / 2000], [sWaist, b.waistWidth / 2000], [sTip, b.tipWidth / 2000]);
  const width = (s) => {
    // Beyond the contact points the outline rounds off: tips are round, tails a bit squarer.
    if (s <= sTail) { const u = 1 - s / sTail; return (b.tailWidth / 1000) * Math.sqrt(Math.max(0, 1 - u ** 6)) * 0.97 + 0.03 * b.tailWidth / 1000 * (1 - u); }
    if (s >= sTip) { const u = (s - sTip) / (L - sTip); return (b.tipWidth / 1000) * Math.sqrt(Math.max(0, 1 - u ** 4)); }
    if (!circ) return b.waistWidth / 1000;
    const dy = Math.sqrt(Math.max(0, circ.r * circ.r - (s - circ.cx) ** 2));
    const y = circ.cy > b.waistWidth / 2000 ? circ.cy - dy : circ.cy + dy;
    return 2 * y;
  };
  const c = b.core;
  const plateauHalf = (c.plateauCm / 100) / 2;
  const coreT = (s) => {
    const a = sBoot - plateauHalf, z = sBoot + plateauHalf;
    if (s >= a && s <= z) return c.underfootMm / 1000;
    if (s < a) {
      if (s >= sTail) { const u = (a - s) / (a - sTail); return (c.tailMm + (c.underfootMm - c.tailMm) * Math.pow(1 - u, c.shape)) / 1000; }
      const u = (sTail - s) / sTail; return (c.tailMm + (c.endMm - c.tailMm) * u) / 1000;
    }
    if (s <= sTip) { const u = (s - z) / (sTip - z); return (c.tipMm + (c.underfootMm - c.tipMm) * Math.pow(1 - u, c.shape)) / 1000; }
    const u = (s - sTip) / (L - sTip); return (c.tipMm + (c.endMm - c.tipMm) * u) / 1000;
  };
  // Camber contact points (where rocker starts) for the flattening calculation.
  const camTail = Math.max(sTail, (b.tailRockerCm || 0) / 100);
  const camTip = Math.min(sTip, L - (b.tipRockerCm || 0) / 100);
  return { L, sTail, sTip, sWaist, sBoot, width, coreT, sidecutR: circ ? circ.r : Infinity, camTail, camTip };
}

// ---------------------------------------------------------------- section analysis
function blendCore(blend) {
  let tot = 0, E = 0, rho = 0, eta = 0, dur = 0, hardPct = 0, softPct = 0;
  for (const p of blend) {
    const w = WOODS[p.wood]; if (!w || !(p.pct > 0)) continue;
    tot += p.pct; E += p.pct * w.E; rho += p.pct * w.rho; eta += p.pct * w.eta; dur += p.pct * w.durability;
    if (w.kind === "hard") hardPct += p.pct;
    if (w.kind === "soft") softPct += p.pct;
  }
  if (tot <= 0) return { E: WOODS.poplar.E * GPa, G: WOODS.poplar.E * 0.07 * GPa, rho: WOODS.poplar.rho, eta: 0.01, durability: 3.5, hardFrac: 0, softFrac: 0 };
  return { E: E / tot * GPa, G: 0.07 * E / tot * GPa, rho: rho / tot, eta: eta / tot, durability: dur / tot, hardFrac: hardPct / tot, softFrac: softPct / tot };
}

function prepareLayers(b) {
  const vf = b.vf;
  const lam = (list) => (list || []).filter((x) => x && x.gsm > 0).map((x) => ({ ...laminateProps(x.fiber, x.arch, x.gsm * (x.plies || 1), vf), spec: x }));
  const metal = (m) => {
    if (!m || m.material === "none" || !METALS[m.material] || !(m.thicknessMm > 0)) return null;
    const M = METALS[m.material];
    return { t: m.thicknessMm / 1000, E: M.E * GPa, G: M.G * GPa, rho: M.rho, eta: M.eta, coverage: m.coverage ?? 1, name: M.name };
  };
  return {
    base: BASES[b.base.material], baseT: b.base.thicknessMm / 1000,
    lamBottom: lam(b.laminatesBottom), lamTop: lam(b.laminatesTop),
    metalBottom: metal(b.metalBottom), metalTop: metal(b.metalTop),
    core: blendCore(b.core.blend),
    side: SIDEWALLS[b.sidewall.material], sideW: b.sidewall.material === "cap" ? 0 : b.sidewall.widthMm / 1000,
    top: TOPSHEETS[b.topsheet.material], topT: b.topsheet.thicknessMm / 1000,
    edgeW: b.edges.widthMm / 1000, edgeH: b.edges.heightMm / 1000,
    rubber: b.rubber && b.rubber.on ? { t: b.rubber.thicknessMm / 1000, w: b.rubber.widthMm / 1000 } : null,
  };
}

// Build the stack of rectangles at a station: each {name, group, b (width), h, z0 (bottom), E, G, rho, eta}
function sectionAt(P, w, tCore) {
  const R = [];
  let z = 0;
  const add = (name, group, bw, h, E, G, rho, eta) => { if (h > 0 && bw > 0) R.push({ name, group, b: bw, h, z0: z, E, G, rho, eta }); };
  // Base between the edges; edges at both sides over the same height (edge body).
  add("Base", "base", Math.max(0, w - 2 * P.edgeW), P.baseT, P.base.E * GPa, P.base.G * GPa, P.base.rho, P.base.eta);
  R.push({ name: "Edges", group: "edges", b: 2 * P.edgeW, h: P.edgeH, z0: 0, E: STEEL.E * GPa, G: STEEL.G * GPa, rho: STEEL.rho, eta: STEEL.eta });
  // Edge tangs: serrated (about half solid), ~4 mm wide and 0.6 mm thick each side, sitting on the base.
  R.push({ name: "Edge tangs", group: "edges", b: 2 * 0.004 * 0.5, h: 0.0006, z0: P.baseT, E: STEEL.E * GPa * 0.3, G: STEEL.G * GPa * 0.3, rho: STEEL.rho, eta: STEEL.eta });
  z += P.baseT;
  if (P.rubber) { R.push({ name: "Rubber (VDS)", group: "rubber", b: Math.min(w, 2 * P.rubber.w), h: P.rubber.t, z0: z, E: RUBBER.E * GPa, G: RUBBER.G * GPa, rho: RUBBER.rho, eta: RUBBER.eta }); z += P.rubber.t; }
  P.lamBottom.forEach((l, i) => { add(`Bottom laminate ${i + 1}`, "laminate", w, l.t, l.E, l.G, l.rho, l.eta); R[R.length - 1].fiber = l.spec.fiber; z += l.t; });
  if (P.metalBottom) { const m = P.metalBottom; add("Bottom metal", "metal", w * m.coverage, m.t, m.E, m.G, m.rho, m.eta); z += m.t; }
  const coreW = Math.max(0, w - 2 * P.sideW);
  add("Core", "core", coreW, tCore, P.core.E, P.core.G, P.core.rho, P.core.eta);
  if (P.sideW > 0) R.push({ name: "Sidewalls", group: "sidewall", b: 2 * P.sideW, h: tCore, z0: z, E: P.side.E * GPa, G: P.side.G * GPa, rho: P.side.rho, eta: P.side.eta });
  z += tCore;
  if (P.metalTop) { const m = P.metalTop; add("Top metal", "metal", w * m.coverage, m.t, m.E, m.G, m.rho, m.eta); z += m.t; }
  P.lamTop.forEach((l, i) => { add(`Top laminate ${i + 1}`, "laminate", w, l.t, l.E, l.G, l.rho, l.eta); R[R.length - 1].fiber = l.spec.fiber; z += l.t; });
  add("Topsheet", "topsheet", w, P.topT, P.top.E * GPa, P.top.G * GPa, P.top.rho, P.top.eta);
  z += P.topT;
  return { rects: R, total: z };
}

export function sectionProps(rects, total, w) {
  let EA = 0, EAz = 0, mu = 0;
  for (const r of rects) { const A = r.b * r.h, zc = r.z0 + r.h / 2; EA += r.E * A; EAz += r.E * A * zc; mu += r.rho * A; }
  const zbar = EAz / EA;
  let EI = 0, D66 = 0;
  const parts = [];
  for (const r of rects) {
    const A = r.b * r.h, zc = r.z0 + r.h / 2;
    const ei = r.E * (r.b * r.h ** 3 / 12 + A * (zc - zbar) ** 2);
    EI += ei;
    const zt = r.z0 + r.h - zbar, zb = r.z0 - zbar;
    // Plate twisting stiffness per unit width, times width share of this rectangle.
    D66 += r.G * r.b * (zt ** 3 - zb ** 3) / 3;
    parts.push({ name: r.name, group: r.group, ei, mass: r.rho * A, eta: r.eta });
  }
  // Thin-section torsion GJ = 4·ΣG·b·(zt³−zb³)/3, corrected for finite width/thickness ratio.
  const corr = Math.max(0.5, 1 - 0.63 * total / Math.max(w, 1e-6));
  const GJ = 4 * D66 * corr;
  return { EI, GJ, mu, zbar, parts };
}

// First free–free bending frequency by the Rayleigh quotient, using the uniform beam's
// first mode shape (βL = 4.730). Returns f1 in Hz and the squared mode curvature per station.
export function rayleighF1(s, EI, mu, L) {
  const beta = 4.730040745, sig = 0.982502215, n = s.length, ds = L / (n - 1);
  let num = 0, den = 0;
  const curv2 = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = beta * s[i] / L;
    const phi = Math.cosh(a) + Math.cos(a) - sig * (Math.sinh(a) + Math.sin(a));
    const k = (beta / L) ** 2 * (Math.cosh(a) - Math.cos(a) - sig * (Math.sinh(a) - Math.sin(a)));
    const wgt = ((i === 0 || i === n - 1) ? 0.5 : 1) * ds;
    curv2[i] = k * k;
    num += EI[i] * k * k * wgt;
    den += mu[i] * phi * phi * wgt;
  }
  return { f1: Math.sqrt(num / den) / (2 * Math.PI), curv2 };
}

// ---------------------------------------------------------------- whole-ski analysis
export function analyze(build, opts = {}) {
  const N = opts.stations || 241;
  const U = makeUnits(opts.units);
  const g = geometry(build);
  const P = prepareLayers(build);
  const L = g.L, ds = L / (N - 1);
  const st = [];
  const groupMass = {}, groupEnergy = {};
  for (let i = 0; i < N; i++) {
    const s = i * ds;
    const w = g.width(s), tc = g.coreT(s);
    const sec = sectionAt(P, w, tc);
    const sp = sectionProps(sec.rects, sec.total, w);
    st.push({ s, w, tCore: tc, total: sec.total, EI: sp.EI, GJ: sp.GJ, mu: sp.mu, zbar: sp.zbar, parts: sp.parts });
  }
  const trap = (f) => { let a = 0; for (let i = 0; i < N; i++) a += f(st[i], i) * ((i === 0 || i === N - 1) ? 0.5 : 1); return a * ds; };

  // Mass: section mass + bond-line resin per interface + fixed extras (tip/tail spacers and
  // protectors at the ends, binding-insert reinforcement underfoot).
  const interfaces = 3 + P.lamBottom.length + P.lamTop.length + (P.metalBottom ? 1 : 0) + (P.metalTop ? 1 : 0);
  const extras = (build.extrasG ?? 80) / 1000;
  const endZone = 0.06 * L, plateZone = 0.20;
  const extraPerLen = (s) => {
    let m = 0;
    if (s <= endZone || s >= L - endZone) m += 0.4 * extras / endZone;
    if (Math.abs(s - g.sBoot) <= plateZone / 2) m += 0.2 * extras / plateZone;
    return m;
  };
  const bondPerLen = (s) => (build.bondGsm / 1000) * interfaces * g.width(s);
  for (const x of st) x.muTot = x.mu + bondPerLen(x.s) + extraPerLen(x.s);
  const massBond = trap((x) => bondPerLen(x.s));
  const massExtras = trap((x) => extraPerLen(x.s));
  const mass = trap((x) => x.muTot);
  const swing = trap((x) => x.muTot * (x.s - g.sBoot) ** 2);

  // First free–free bending mode (Rayleigh quotient) and modal strain energy per layer group.
  const modal = rayleighF1(st.map((x) => x.s), st.map((x) => x.EI), st.map((x) => x.muTot), L);
  const f1 = modal.f1;
  let Usum = 0, Ueta = 0;
  for (let i = 0; i < N; i++) {
    const x = st[i], wgt = ((i === 0 || i === N - 1) ? 0.5 : 1) * ds;
    for (const p of x.parts) {
      const U = p.ei * modal.curv2[i] * wgt;
      Usum += U; Ueta += U * p.eta;
      groupEnergy[p.group] = (groupEnergy[p.group] || 0) + U;
      groupMass[p.group] = (groupMass[p.group] || 0) + p.mass * wgt;
    }
  }
  groupMass.resin = (groupMass.resin || 0) + massBond;
  groupMass.extras = massExtras;
  // Modal strain energy damping + an estimate for the rubber's constrained-layer effect.
  let eta = Ueta / Usum;
  // Constrained-layer damping: the rubber strip shears between the edge and the stiff layers
  // pressed on top of it. The stiffer that constraining layer (metal ≫ glass ≫ flax), the more
  // the rubber is worked and the more vibration it absorbs. Scaled so 0.3 mm rubber under one
  // 22 oz glass triax adds ~0.004; under titanal, roughly twice that.
  let cld = 0;
  if (P.rubber) {
    const EAc = P.lamBottom.reduce((acc, l) => acc + l.E * l.t, 0) + (P.metalBottom ? P.metalBottom.E * P.metalBottom.t * P.metalBottom.coverage : 0);
    cld = 0.004 * Math.min(1, P.rubber.t / 0.0003) * Math.min(3, Math.pow(Math.max(EAc, 1) / 1.25e7, 0.6));
    eta += cld;
  }
  const reboundPct = 100 * Math.exp(-2 * Math.PI * eta);
  const etaCLD = cld;

  // Zones.
  const avgOver = (a, z, key) => { let sum = 0, n = 0; for (const x of st) if (x.s >= a && x.s <= z) { sum += x[key]; n++; } return n ? sum / n : 0; };
  const fbA = g.sBoot + 0.25 * (g.sTip - g.sBoot), fbZ = g.sBoot + 0.75 * (g.sTip - g.sBoot);
  const tlA = g.sTail + 0.25 * (g.sBoot - g.sTail), tlZ = g.sTail + 0.75 * (g.sBoot - g.sTail);
  const ufA = g.sBoot - 0.08, ufZ = g.sBoot + 0.08;
  const zones = {
    EI: { forebody: avgOver(fbA, fbZ, "EI"), underfoot: avgOver(ufA, ufZ, "EI"), tail: avgOver(tlA, tlZ, "EI") },
    GJ: { forebody: avgOver(fbA, fbZ, "GJ"), underfoot: avgOver(ufA, ufZ, "GJ"), tail: avgOver(tlA, tlZ, "GJ") },
  };

  // Three-point flex: unit load at the boot, simply supported at the camber contact points.
  const a = g.camTail, bb = g.camTip, c = Math.min(Math.max(g.sBoot, a + 0.01), bb - 0.01);
  let delta = 0, intEI = 0;
  for (let i = 0; i < N; i++) {
    const x = st[i]; if (x.s < a || x.s > bb) continue;
    const M = x.s <= c ? (bb - c) / (bb - a) * (x.s - a) : (c - a) / (bb - a) * (bb - x.s);
    const wgt = ((i === 0 || i === N - 1) ? 0.5 : 1) * ds;
    delta += (M * M / x.EI) * wgt;
    intEI += x.EI * wgt;
  }
  const flexRate = 1 / delta / 1000; // N/mm
  const camber = (build.camberMm || 0) / 1000;
  const flattenN = camber > 0 ? camber / delta : 0;
  const camberEnergyJ = 0.5 * flattenN * camber;
  // Energy stored bending the running length from its cambered shape into a 15 m carving arc:
  // U = ½·(κ_arc + κ_camber)²·∫EI ds, with κ_camber = 8·camber/span². This is what a ski
  // gives back at the end of a carved turn, so it drives the "pop" score.
  const span = bb - a;
  const kappa = 1 / 15 + 8 * camber / (span * span);
  const turnEnergyJ = 0.5 * kappa * kappa * intEI;

  // Forebody twist under a 10 N·m torque between boot and tip contact.
  let twist = 0;
  for (const x of st) if (x.s >= g.sBoot && x.s <= g.sTip) twist += ds / x.GJ;
  const twistDeg = 10 * twist * 180 / Math.PI;

  // Underfoot stack (at the boot) for binding screws and the cross-section view.
  const iBoot = Math.round(g.sBoot / ds);
  const boot = st[iBoot];
  const bootSec = sectionAt(P, boot.w, boot.tCore);
  const aboveBaseMm = (bootSec.total - P.baseT) * 1000;
  // Balance: in-plane stiffness of the laminate + metal above vs below the core. Edges and
  // base are left out because every ski has them; this is about what the builder chooses.
  const sideEA = (list, metal) => list.reduce((acc, l) => acc + l.E * l.t, 0) + (metal ? metal.E * metal.t * metal.coverage : 0);
  const eaBottom = sideEA(P.lamBottom, P.metalBottom);
  const eaTop = sideEA(P.lamTop, P.metalTop);
  const balance = eaBottom > 0 ? eaTop / eaBottom : (eaTop > 0 ? Infinity : 1);

  const weightG = mass * 1000;
  const results = {
    engine: ENGINE_VERSION,
    stations: st.map((x) => ({ s: x.s, w: x.w, tCore: x.tCore, total: x.total, EI: x.EI, GJ: x.GJ, mu: x.muTot })),
    geometry: {
      L, sidecutR: g.sidecutR, effEdge: g.sTip - g.sTail, runLength: g.camTip - g.camTail,
      sBoot: g.sBoot, sTail: g.sTail, sTip: g.sTip, camTail: g.camTail, camTip: g.camTip,
      bootWidth: boot.w, bootThickness: boot.total,
    },
    weightG, weight177: weightG * 177 / build.lengthCm, swing, f1, eta, etaCLD, reboundPct,
    zones, flexRate, flattenN, camberEnergyJ, turnEnergyJ, twistDeg, aboveBaseMm, balance,
    groupMass: Object.fromEntries(Object.entries(groupMass).map(([k, v]) => [k, v * 1000])),
    groupEnergy: Object.fromEntries(Object.entries(groupEnergy).map(([k, v]) => [k, v / Usum])),
    bootSection: bootSec.rects.map((r) => ({ name: r.name, group: r.group, fiber: r.fiber, b: r.b, h: r.h, z0: r.z0, rho: r.rho, EGPa: r.E / GPa })),
    bootTotal: bootSec.total,
    core: P.core, layersPrepared: { lamBottom: P.lamBottom.map(strip), lamTop: P.lamTop.map(strip) },
  };
  results.units = U.system;
  results.attributes = scoreAttributes(build, results, P, U);
  results.fits = fitScores(results.attributes);
  results.issues = checkIssues(build, results, P, U);
  results.scores = overallScores(results);
  return results;
}
const strip = (l) => ({ name: l.name, tMm: l.t * 1000, EGPa: l.E / GPa, GGPa: l.G / GPa, gsm: l.arealMass * 1000 });

// ---------------------------------------------------------------- scoring
// Reference ranges come from the production reference layups (see REFERENCES) with margin.
export const RANGES = {
  GJfb: [60, 320],        // N·m², forebody torsional stiffness (log scale)
  EIuf: [140, 560],       // N·m², underfoot bending stiffness (log scale)
  run: [1.00, 1.50],      // m, running length on snow (camber contact span)
  eta: [0.008, 0.018],    // loss factor
  mu: [0.78, 1.35],       // kg/m, weight per length
  energy: [0.35, 1.8],    // J, stored bending into a 15 m carve (log scale)
  w177: [1350, 2400],     // g, weight scaled to 177 cm
};
// Thresholds for issue flags (production references sit between these).
export const LIMITS = { heavy177: 2250, light177: 1450, lowGJ: 100 };
const norm = (v, [lo, hi]) => Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
const lnorm = (v, [lo, hi]) => norm(Math.log(Math.max(v, 1e-9)), [Math.log(lo), Math.log(hi)]);
const to5 = (x) => Math.round((1 + 4 * Math.min(1, Math.max(0, x))) * 10) / 10;

export function scoreAttributes(b, r, P, U = METRIC) {
  const muAvg = r.weightG / 1000 / r.geometry.L;
  const edgeX = 0.45 * lnorm(r.zones.GJ.forebody, RANGES.GJfb) + 0.20 * lnorm(r.zones.EI.underfoot, RANGES.EIuf) + 0.15 * norm(r.geometry.runLength, RANGES.run) + 0.20 * norm(r.eta, RANGES.eta);
  const dampX = 0.6 * norm(r.eta, RANGES.eta) + 0.4 * norm(muAvg, RANGES.mu);
  const popX = 0.5 * lnorm(r.turnEnergyJ, RANGES.energy) + 0.3 * (1 - norm(r.eta, RANGES.eta)) + 0.2 * (1 - norm(r.weight177, RANGES.w177));
  const lightX = 1 - norm(r.weight177, RANGES.w177);
  const edgeDur = Math.min(5, Math.max(3, 2.25 + b.edges.widthMm));
  let dur = (P.base.durability + P.side.durability + P.top.durability + edgeDur + P.core.durability) / 5;
  if (P.metalBottom || P.metalTop) dur += 0.3;
  if (P.rubber) dur += 0.2;
  const v = {
    edge: to5(edgeX), damping: to5(dampX), pop: to5(popX), glide: P.base.glide,
    lightness: to5(lightX), durability: Math.round(Math.min(5, dur) * 10) / 10,
  };
  v.why = {
    edge: `Forebody torsion ${U.fmt("stiffNm2", r.zones.GJ.forebody)}, underfoot bending ${U.fmt("stiffNm2", r.zones.EI.underfoot)}, ${U.fmt("lenCm", r.geometry.runLength * 100, 0)} on snow, damping ${r.eta.toFixed(4)}.`,
    damping: `Loss factor ${r.eta.toFixed(4)} (rubber/constrained layer adds ${r.etaCLD.toFixed(4)}), ${U.n("massPerLen", muAvg * 1000)} ${U.unit("massPerLen") === "g/m" ? "g per meter" : "oz per foot"} of ski.`,
    pop: `${U.fmt("energyJ", r.turnEnergyJ)} stored bending into a ${U.fmt("lenM", 15, 0)} carve (camber included); ${r.reboundPct.toFixed(1)}% returned per flex cycle.`,
    glide: `${P.base.name} base.`,
    lightness: `${U.fmt("massG", r.weightG)} per ski (${U.fmt("massG", r.weight177)} scaled to ${U.fmt("lenCm", 177)}).`,
    durability: `Base, sidewall, topsheet, ${U.fmt("thickMm", b.edges.widthMm)} edges and core wood${P.metalBottom || P.metalTop ? ", plus metal" : ""}${P.rubber ? ", plus rubber" : ""}.`,
  };
  return v;
}

export function fitScores(a) {
  const vals = [a.edge, a.damping, a.pop, a.glide, a.lightness, a.durability];
  return USE_CASES.map((u) => {
    const s = u.w.reduce((acc, w, i) => acc + w * vals[i], 0) / u.w.reduce((x, y) => x + y, 0);
    return { key: u.key, name: u.name, importance: u.importance, fit: Math.round(2 * s * 10) / 10 };
  });
}

export function overallScores(r) {
  const perf = r.fits.reduce((acc, f) => acc + f.importance * f.fit, 0) / r.fits.reduce((acc, f) => acc + f.importance, 0);
  const pen = { High: 2.0, Medium: 1.0, Low: 0.4, Info: 0 };
  const quality = Math.max(0, 10 - r.issues.reduce((acc, i) => acc + (pen[i.severity] || 0), 0));
  return { performance: Math.round(perf * 10) / 10, buildQuality: Math.round(quality * 10) / 10, overall: Math.round((perf + quality) / 2 * 10) / 10 };
}

// ---------------------------------------------------------------- issue checks
export function checkIssues(b, r, P, U = METRIC) {
  const T = (mm, d) => U.fmt("thickMm", mm, d);
  const out = [];
  // `plain` is an optional jargon-free title/fix for the simple view.
  const add = (severity, area, title, why, fix, plain) => out.push({ severity, area, title, why, fix, ...(plain ? { plain } : {}) });
  const hasMetal = !!(P.metalBottom || P.metalTop);
  const press = PRESSES[b.press] || PRESSES.undecided;
  const fabrics = [...(b.laminatesBottom || []), ...(b.laminatesTop || [])].filter((x) => x.gsm > 0);

  // Screws need ~9 mm of depth; a metal sheet in the stack holds threads well, so allow ~1 mm less.
  const screwHigh = hasMetal ? 8.5 : 9.5, screwMed = hasMetal ? 9.5 : 10.5;
  if (r.aboveBaseMm < screwHigh) add("High", "Bindings", `Only ${T(r.aboveBaseMm)} of material above the base under the boot`,
    `Binding screws are about ${T(9, U.system === "us" ? 2 : 0)} long. With less than ~${T(10, U.system === "us" ? 2 : 0)} above the base, the screw tips can punch through or crack the base, and there is little wood for the threads to grip.`,
    `Raise the underfoot core thickness (or add a binding plate) so the stack above the base is at least ${U.range("thickMm", 10, 11, U.system === "us" ? 2 : 0)}.`);
  else if (r.aboveBaseMm < screwMed) add("Medium", "Bindings", `${T(r.aboveBaseMm)} above the base under the boot is tight for screws`,
    `Standard screws need roughly ${T(9, U.system === "us" ? 2 : 0)} of depth. A thin mount zone leaves no margin for countersinking or a slightly long screw.`,
    `Add about ${T(1, U.system === "us" ? 2 : 0)} of core underfoot or plan on a shim/plate.`);

  if (P.core.hardFrac < 0.15 && P.core.softFrac > 0.3) add("High", "Bindings", "Soft core with no hardwood under the bindings",
    "Paulownia, balsa and foam hold screws poorly. Binding pull-out is one of the most common failures on light DIY cores.",
    "Add a beech, ash or maple stringer or underfoot insert (15–30% of the core width).");

  if (hasMetal && press.metalOK === false) add("High", "Pressing", "Metal layer with a vacuum bag",
    `A vacuum bag presses at about ${U.fmt("pressPsi", 13)}. Metal layers need high, even pressure (${U.range("pressPsi", 40, 60)} or more) to squeeze out resin and bond; low pressure leaves voids that delaminate.`,
    "Use a pneumatic or jack press, or drop the metal and use extra triax or basalt for stiffness.");
  if (hasMetal && b.press === "undecided") add("Low", "Pressing", "Metal layer but no press chosen",
    "Whether metal bonds well depends almost entirely on press pressure.", "Choose a press in Shape → Press.");
  if (hasMetal && b.press !== "factory" && [b.metalBottom, b.metalTop].some((m) => m && m.material === "titanal")) add("Medium", "Sourcing", "Titanal isn't sold retail",
    "Titanal is made by AMAG for ski factories and is rarely available to home builders.", "Plan a source, or switch to 7075-T6 (etch and prime it before bonding).");
  if (hasMetal && [b.metalBottom, b.metalTop].some((m) => m && m.material === "al7075")) add("Info", "Pressing", "7075 needs surface prep",
    "Untreated aluminum bonds weakly to epoxy; most metal delaminations start at a poorly prepped sheet.", "Sand (80–120 grit), degrease, acid-etch or use a bonding primer, then lay up within hours.");

  const bal = r.balance;
  if (bal > 1.6 || bal < 1 / 1.6) add("Medium", "Structure", `Unbalanced layup (top/bottom stiffness ${bal.toFixed(2)}×)`,
    "Very different stiffness above and below the core makes the ski curl or twist as the epoxy shrinks and cools, worst after a heated press, and it shifts the neutral axis so one face carries most of the strain.",
    "Mirror the laminate (and metal) above and below the core, or keep the ratio between about 0.6× and 1.6×.",
    { title: bal < 1 ? "Much stiffer under the core than on top" : "Much stiffer on top of the core than underneath", fix: "Use the same fiberglass and metal above and below the core so the ski cures flat." });

  if (!b.rubber || !b.rubber.on) add("Medium", "Structure", "No rubber strip over the edges",
    "The rubber (VDS) layer absorbs impacts and shear between the steel edge and the laminate. Without it, edge delamination is much more likely.",
    `Add a ${T(0.3, U.system === "us" ? 3 : 1)} rubber strip over the edge tangs.`);

  const has45 = fabrics.some((x) => x.arch === "triax" || x.arch === "biax45");
  if (!has45) add("Medium", "Performance", "No ±45° fibers in the layup",
    "Torsional stiffness comes mainly from fibers at ±45°. Without them the ski twists easily and the edge washes out on ice.",
    "Use at least one triax (0/±45°) or biax (±45°) layer, ideally top and bottom.",
    { title: "Nothing in the layup stops the ski from twisting", fix: "Use a triax or ±45° fiberglass, ideally above and below the core." });
  if (r.zones.GJ.forebody < LIMITS.lowGJ) add("Low", "Performance", `Low forebody torsion (${U.fmt("stiffNm2", r.zones.GJ.forebody)})`,
    "Production all-mountain skis sit well above this. Low torsion makes edge hold vague on hardpack.", "Add a ±45° layer or a metal sheet, or thicken the core in the forebody.",
    { title: "The front of the ski twists too easily", fix: "Add stronger fiberglass or a thin metal layer, or make the core a little thicker." });

  if (r.weight177 > LIMITS.heavy177) add("Medium", "Performance", `Heavy build (${U.fmt("massG", r.weight177)} at ${U.fmt("lenCm", 177)})`,
    "Heavier than every production reference here. Expect tired legs late in the day and slow swing in moguls and the park.",
    "Swap some hardwood for poplar or paulownia, thin the metal, or use carbon/flax instead of extra glass.");
  else if (r.weight177 < LIMITS.light177) add("Info", "Performance", `Very light build (${U.fmt("massG", r.weight177)} at ${U.fmt("lenCm", 177)})`,
    "Light skis are quick but get deflected and chatter at speed on firm snow.", "If you want stability, add a damping layer (flax, basalt) or a thin metal sheet.");

  const carbonShare = (r.groupEnergy.laminate || 0) > 0 && fabrics.some((x) => x.fiber === "carbon");
  if (carbonShare && r.eta < 0.009) add("Low", "Ride", "Carbon with little damping",
    "Carbon is stiff and light but has low internal damping, so the ski can feel chattery.", "Add flax, basalt or aramid, or keep the rubber layer.",
    { title: "Carbon may make it chattery", fix: "Add flax or basalt, or keep the rubber strip." });
  if (b.press !== "factory" && fabrics.some((x) => x.fiber === "flax")) add("Info", "Building", "Keep flax dry",
    "Flax absorbs moisture, which weakens the bond and adds weight.", `Store it sealed and dry it (low oven, ~${U.fmt("tempC", 60)}) before layup.`);
  if (b.sidewall.material === "cap") add("Info", "Performance", "Cap construction",
    "Without a sidewall, less force goes straight to the edge, so cap skis grip a bit less on ice but are lighter and more forgiving.", "Use ABS or UHMW sidewalls for maximum edge hold.");
  if (b.edges.widthMm < 1.8) add("Low", "Durability", "Thin edges",
    "Thin edges survive fewer tunes and rail hits.", `Use ${U.range("thickMm", 2.0, 2.5)} edges.`);
  if (b.core.endMm < 1.5 || b.core.tipMm < 2) add("Medium", "Building", "Core is very thin at the tips/tails",
    "Thin core ends are fragile to machine and crack easily when the ski is flexed or bumped.", `Keep at least ~${T(2, U.system === "us" ? 2 : 0)} at the ends and ${U.range("thickMm", 2.5, 3.5, U.system === "us" ? 2 : 1)} at the contact points.`);
  if (b.vf > 0.5) add("Low", "Building", "Fiber fraction above 50%",
    "Hand layup in a home press usually reaches 35–45% fiber by volume; higher values overstate stiffness.", "Use 0.40 unless you vacuum-infuse.",
    { title: "Fiber setting is unrealistically high", fix: "Set fiber volume fraction back to 0.40 in the Detailed view." });
  if (P.base === BASES.sintered || P.base === BASES.graphite) add("Info", "Upkeep", "Sintered base needs regular waxing",
    "Sintered bases are fast because they hold wax; dry, they slow down and oxidize.", "Hot wax every few days on snow.");
  if (b.camberMm > 0 && r.flattenN > 900) add("Info", "Ride", `Stiff camber (${U.fmt("forceN", r.flattenN, 0)} to flatten)`,
    "A very high flattening load makes the ski hard to bend into a turn at slow speed.", "Reduce camber height or soften the underfoot.");
  const order = { High: 0, Medium: 1, Low: 2, Info: 3 };
  return out.sort((x, y) => order[x.severity] - order[y.severity]);
}

// ---------------------------------------------------------------- builds
export function clone(o) { return JSON.parse(JSON.stringify(o)); }

const triax = (oz) => ({ fiber: "eglass", arch: "triax", gsm: Math.round(oz * OZYD2_TO_GSM), plies: 1 });
export const OZ = OZYD2_TO_GSM;

export const BASE_BUILD = {
  name: "New build",
  lengthCm: 177, tipWidth: 128, waistWidth: 88, tailWidth: 111, waistOffsetCm: 0,
  tipContactCm: 20, tailContactCm: 13, mountOffsetCm: -8,
  camberMm: 4, tipRockerCm: 30, tailRockerCm: 15,
  core: { blend: [{ wood: "poplar", pct: 80 }, { wood: "ash", pct: 20 }], underfootMm: 11, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 },
  sidewall: { material: "abs", widthMm: 4 },
  base: { material: "sintered", thicknessMm: 1.3 },
  edges: { widthMm: 2.2, heightMm: 2.0 },
  rubber: { on: true, thicknessMm: 0.3, widthMm: 10 },
  laminatesBottom: [triax(22)], laminatesTop: [triax(22)],
  metalBottom: { material: "none", thicknessMm: 0.5, coverage: 1 },
  metalTop: { material: "none", thicknessMm: 0.5, coverage: 1 },
  topsheet: { material: "nylon", thicknessMm: 0.6 },
  vf: 0.40, bondGsm: 120, extrasG: 80, press: "undecided",
};

// Starting point from the planning sheet's picks: poplar/beech core, flax laminate,
// 7075 metal layer, sintered base, phenolic sidewalls, rubber, nylon topsheet.
export const SHEET_DRAFT = {
  ...clone(BASE_BUILD), name: "First draft (from the sheet)",
  core: { blend: [{ wood: "poplar", pct: 70 }, { wood: "beech", pct: 30 }], underfootMm: 10.5, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 },
  sidewall: { material: "phenolic", widthMm: 4 },
  laminatesBottom: [{ fiber: "flax", arch: "biax45", gsm: 400, plies: 1 }],
  laminatesTop: [{ fiber: "flax", arch: "biax45", gsm: 400, plies: 1 }],
  metalBottom: { material: "al7075", thicknessMm: 0.5, coverage: 1 },
  press: "pneumatic-cold",
};

// Production references: geometry and weight as published; layups approximated from the
// published construction, with the underfoot core thickness solved (tuneToWeight) so the
// modeled weight matches the published weight. Re-run test.js after changing any layup.
export const REFERENCES = [
  {
    id: "arv88", source: "https://skiessentials.com/2027-armada-arv-88-skis-ra0000862", publishedWeightG: 1690,
    build: { ...clone(BASE_BUILD), press: "factory", name: "Armada ARV 88 (176)", lengthCm: 176, tipWidth: 119, waistWidth: 88, tailWidth: 113, tipContactCm: 18, tailContactCm: 15, mountOffsetCm: -4,
      camberMm: 3, tipRockerCm: 25, tailRockerCm: 20, edges: { widthMm: 2.5, heightMm: 2.0 },
      core: { blend: [{ wood: "poplar", pct: 90 }, { wood: "ash", pct: 10 }], underfootMm: 10.3, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 } },
  },
  {
    id: "bent90", source: "https://www.skiessentials.com/Chairlift-Chat/2023-atomic-bent-90-ski-review", publishedWeightG: 1600,
    build: { ...clone(BASE_BUILD), press: "factory", name: "Atomic Bent 90 (175)", lengthCm: 175, tipWidth: 119, waistWidth: 90, tailWidth: 109, tipContactCm: 20, tailContactCm: 13, mountOffsetCm: -6,
      camberMm: 2, tipRockerCm: 35, tailRockerCm: 17, sidewall: { material: "cap", widthMm: 0 }, edges: { widthMm: 2.0, heightMm: 2.0 },
      laminatesBottom: [triax(20)], laminatesTop: [triax(20)],
      core: { blend: [{ wood: "poplar", pct: 100 }], underfootMm: 11.6, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 } },
  },
  {
    id: "prodigy1", source: "https://www.skiessentials.com/products/2024-faction-prodigy-1-ski-pr1z24/2024-ski-test/skis/2024-faction-prodigy-1", publishedWeightG: 1750,
    build: { ...clone(BASE_BUILD), press: "factory", name: "Faction Prodigy 1 (178)", lengthCm: 178, tipWidth: 120, waistWidth: 88, tailWidth: 112, tipContactCm: 18, tailContactCm: 16, mountOffsetCm: -4,
      camberMm: 3, tipRockerCm: 25, tailRockerCm: 22, edges: { widthMm: 2.5, heightMm: 2.0 },
      core: { blend: [{ wood: "poplar", pct: 80 }, { wood: "ash", pct: 20 }], underfootMm: 10.8, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 } },
  },
  {
    id: "mantra88", source: "https://www.skiessentials.com/Chairlift-Chat/2026-volkl-mantra-88-ski-review", publishedWeightG: 1930,
    build: { ...clone(BASE_BUILD), press: "factory", name: "Völkl Mantra 88 (177)", lengthCm: 177, tipWidth: 134, waistWidth: 88, tailWidth: 114, tipContactCm: 22, tailContactCm: 12, mountOffsetCm: -9,
      camberMm: 4, tipRockerCm: 30, tailRockerCm: 15, sidewall: { material: "abs", widthMm: 4 },
      core: { blend: [{ wood: "poplar", pct: 70 }, { wood: "beech", pct: 30 }], underfootMm: 8.5, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 },
      laminatesBottom: [triax(15)], laminatesTop: [triax(15)],
      metalBottom: { material: "titanal", thicknessMm: 0.4, coverage: 1 }, metalTop: { material: "titanal", thicknessMm: 0.5, coverage: 0.55 } },
  },
  {
    id: "enforcer88", source: "https://www.lacordee.com/en/products/nordica-enforcer-88-alpine-skis-noc-10192913", publishedWeightG: 2210,
    build: { ...clone(BASE_BUILD), press: "factory", name: "Nordica Enforcer 88 (186)", lengthCm: 186, tipWidth: 122, waistWidth: 88, tailWidth: 110, tipContactCm: 22, tailContactCm: 12, mountOffsetCm: -9,
      camberMm: 3, tipRockerCm: 30, tailRockerCm: 15,
      core: { blend: [{ wood: "poplar", pct: 60 }, { wood: "beech", pct: 40 }], underfootMm: 8.4, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 },
      laminatesBottom: [triax(15)], laminatesTop: [triax(15), { fiber: "carbon", arch: "ud", gsm: 100, plies: 1 }],
      metalBottom: { material: "titanal", thicknessMm: 0.5, coverage: 1 }, metalTop: { material: "titanal", thicknessMm: 0.5, coverage: 1 } },
  },
  {
    id: "stance88w", source: "https://blisterreview.com/gear-reviews/2022-2023-salomon-stance-88-w", publishedWeightG: 1720,
    build: { ...clone(BASE_BUILD), press: "factory", name: "Salomon Stance 88 W (174)", lengthCm: 174, tipWidth: 126, waistWidth: 90, tailWidth: 108, tipContactCm: 20, tailContactCm: 11, mountOffsetCm: -8,
      camberMm: 6, tipRockerCm: 28, tailRockerCm: 12,
      core: { blend: [{ wood: "poplar", pct: 75 }, { wood: "paulownia", pct: 25 }], underfootMm: 7.7, tipMm: 3, tailMm: 3, endMm: 2, plateauCm: 30, shape: 1.0 },
      laminatesTop: [triax(12), { fiber: "flax", arch: "biax45", gsm: 200, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 80, plies: 1 }], laminatesBottom: [triax(12)],
      metalBottom: { material: "titanal", thicknessMm: 0.3, coverage: 0.9 }, metalTop: { material: "titanal", thicknessMm: 0.3, coverage: 0.6 } },
  },
];

// Solve the underfoot core thickness that reproduces a published weight (bisection).
export function tuneToWeight(build, targetG, lo = 6, hi = 18) {
  const b = clone(build);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    b.core.underfootMm = mid;
    const w = analyze(b, { stations: 121 }).weightG;
    if (w > targetG) hi = mid; else lo = mid;
  }
  b.core.underfootMm = Math.round((lo + hi) / 2 * 10) / 10;
  return b;
}

// Similarity between two analyses on a physics vector (log stiffness, weight, damping, shape).
export function similarity(r1, r2) {
  const v = (r) => [
    Math.log(r.zones.EI.underfoot), Math.log(r.zones.EI.forebody), Math.log(r.zones.GJ.forebody),
    r.weight177 / 400, r.eta * 60, r.geometry.sidecutR / 8, r.turnEnergyJ,
  ];
  const a = v(r1), b = v(r2);
  const d = Math.sqrt(a.reduce((acc, x, i) => acc + (x - b[i]) ** 2, 0) / a.length);
  return Math.round(Math.max(0, 100 * (1 - d / 1.2)) * 10) / 10;
}

// ---------------------------------------------------------------- optimizer
// Searches construction choices (not the shape) for the best layup toward a goal.
// Multi-start coordinate descent: from the current build and a few sensible starting layups,
// try every option of one choice at a time, keep the best, and repeat until nothing improves.
// Objective = 0.7 × goal score (0–10) + 0.3 × build quality (0–10), minus a penalty for going
// over the weight limit. Build quality already subtracts for every issue, so the search avoids
// layups that warp, delaminate or can't hold screws.
const ozTriax = (oz) => ({ fiber: "eglass", arch: "triax", gsm: Math.round(oz * OZYD2_TO_GSM), plies: 1 });
const symLam = (list) => (b) => { b.laminatesBottom = clone(list); b.laminatesTop = clone(list); };
const symMetal = (mat, t) => (b) => {
  b.metalBottom = { material: mat, thicknessMm: t, coverage: 1 };
  b.metalTop = { material: mat, thicknessMm: t, coverage: 1 };
};
export const OPT_SPACE = {
  core: [
    { key: "poplar", label: "Poplar core", apply: (b) => { b.core.blend = [{ wood: "poplar", pct: 100 }]; } },
    { key: "poplar-ash", label: "Poplar core with 20% ash", apply: (b) => { b.core.blend = [{ wood: "poplar", pct: 80 }, { wood: "ash", pct: 20 }]; } },
    { key: "poplar-beech", label: "Poplar core with 30% beech", apply: (b) => { b.core.blend = [{ wood: "poplar", pct: 70 }, { wood: "beech", pct: 30 }]; } },
    { key: "paulownia-ash", label: "Paulownia core with 25% ash", apply: (b) => { b.core.blend = [{ wood: "paulownia", pct: 75 }, { wood: "ash", pct: 25 }]; } },
    { key: "bamboo", label: "Bamboo core", apply: (b) => { b.core.blend = [{ wood: "bamboo", pct: 100 }]; } },
  ],
  thickness: [8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5].map((t) => ({ key: String(t), value: t, apply: (b) => { b.core.underfootMm = t; } })),
  laminate: [
    { key: "light", label: "16 oz glass triax top and bottom", apply: symLam([ozTriax(16)]) },
    { key: "std", label: "22 oz glass triax top and bottom", apply: symLam([ozTriax(22)]) },
    { key: "strong", label: "22 oz triax + 300 g/m² 0° glass, top and bottom", apply: symLam([ozTriax(22), { fiber: "eglass", arch: "ud", gsm: 300, plies: 1 }]) },
    { key: "carbon", label: "16 oz triax + 200 g/m² carbon, top and bottom", apply: symLam([ozTriax(16), { fiber: "carbon", arch: "ud", gsm: 200, plies: 1 }]) },
    { key: "flax", label: "400 g/m² flax ±45° top and bottom", apply: symLam([{ fiber: "flax", arch: "biax45", gsm: 400, plies: 1 }]) },
    { key: "basalt", label: "600 g/m² basalt triax top and bottom", apply: symLam([{ fiber: "basalt", arch: "triax", gsm: 600, plies: 1 }]) },
  ],
  metal: [
    { key: "none", label: "No metal", apply: symMetal("none", 0.5) },
    { key: "al-thin", label: "0.3 mm 7075 aluminum above and below the core", apply: symMetal("al7075", 0.3) },
    { key: "al", label: "0.5 mm 7075 aluminum above and below the core", apply: symMetal("al7075", 0.5) },
    { key: "ti", label: "0.5 mm titanal above and below the core", apply: symMetal("titanal", 0.5) },
  ],
  sidewall: ["abs", "phenolic", "uhmw", "cap"].map((m) => ({
    key: m, label: SIDEWALLS[m].name + (m === "cap" ? "" : " sidewalls"),
    apply: (b) => { b.sidewall.material = m; if (m !== "cap" && !(b.sidewall.widthMm > 0)) b.sidewall.widthMm = 4; },
  })),
};
export const OPT_GOALS = [
  { key: "performance", name: "Best overall performance" },
  ...USE_CASES.map((u) => ({ key: u.key, name: u.name })),
];

function describeDim(dim, b, U) {
  if (dim === "core") return b.core.blend.filter((x) => x.pct > 0).map((x) => `${x.pct}% ${WOODS[x.wood]?.name.split(" ")[0].toLowerCase() || x.wood}`).join(", ") + " core";
  if (dim === "thickness") return `${U.fmt("thickMm", b.core.underfootMm, U.system === "us" ? 3 : 1)} core underfoot`;
  if (dim === "laminate") {
    const side = (l) => l.length ? l.map((f) => `${U.fmt("arealGsm", f.gsm * (f.plies || 1))} ${FIBERS[f.fiber]?.name.split(" ")[0].toLowerCase()} ${ARCHITECTURES[f.arch]?.name.split(" ")[0].toLowerCase()}`).join(" + ") : "nothing";
    const t = side(b.laminatesTop), bt = side(b.laminatesBottom);
    return t === bt ? `${t}, top and bottom` : `top: ${t}; bottom: ${bt}`;
  }
  if (dim === "metal") {
    const m = (x) => !x || x.material === "none" ? "none" : `${U.fmt("thickMm", x.thicknessMm, U.system === "us" ? 3 : 1)} ${METALS[x.material].name}${(x.coverage ?? 1) < 1 ? ` (${Math.round(x.coverage * 100)}% width)` : ""}`;
    const t = m(b.metalTop), bt = m(b.metalBottom);
    if (t === "none" && bt === "none") return "No metal";
    return t === bt ? `${t} above and below the core` : `top: ${t}; bottom: ${bt}`;
  }
  if (dim === "sidewall") return SIDEWALLS[b.sidewall.material].name + (b.sidewall.material === "cap" ? "" : " sidewalls");
  return "";
}
const dimKey = (dim, b) => dim === "core" ? JSON.stringify(b.core.blend)
  : dim === "thickness" ? String(b.core.underfootMm)
  : dim === "laminate" ? JSON.stringify([b.laminatesBottom, b.laminatesTop])
  : dim === "metal" ? JSON.stringify([b.metalBottom.material === "none" ? "none" : b.metalBottom, b.metalTop.material === "none" ? "none" : b.metalTop])
  : b.sidewall.material;

export function optimize(build, opts = {}) {
  const U = makeUnits(opts.units);
  const goal = opts.goal || "performance";
  const maxW = Number.isFinite(opts.maxWeight177) ? opts.maxWeight177 : Infinity;
  const lock = new Set(opts.lock || []);
  const stations = opts.stations || 121;
  const dims = Object.keys(OPT_SPACE).filter((d) => !lock.has(d));
  const base = clone(build);
  if (base.rubber) base.rubber.on = true; // the rubber strip is always worth having
  const cache = new Map();
  let evals = 0;
  const goalScore = (r) => goal === "performance" ? r.scores.performance : (r.fits.find((f) => f.key === goal) || { fit: r.scores.performance }).fit;
  const objective = (r) => 0.7 * goalScore(r) + 0.3 * r.scores.buildQuality - (r.weight177 > maxW ? 2 + (r.weight177 - maxW) / 100 : 0);
  const evaluate = (b) => {
    const key = Object.keys(OPT_SPACE).map((d) => dimKey(d, b)).join("|");
    if (!cache.has(key)) { const r = analyze(b, { stations }); evals++; cache.set(key, { s: objective(r), b: clone(b) }); }
    return cache.get(key);
  };
  const pick = (dim, k) => OPT_SPACE[dim].find((o) => o.key === k);
  const starts = [clone(build), base];
  for (const combo of [["poplar-ash", "std", "none", "abs"], ["poplar-beech", "std", "al", "abs"], ["paulownia-ash", "carbon", "none", "cap"], ["poplar-ash", "strong", "al-thin", "phenolic"]]) {
    const s = clone(base);
    ["core", "laminate", "metal", "sidewall"].forEach((d, i) => { if (!lock.has(d)) pick(d, combo[i]).apply(s); });
    starts.push(s);
  }
  const finals = [];
  if (opts.thorough) {
    // Exhaustive: every combination of the unlocked choices (thousands of layups). Meant for a
    // server; the browser uses the faster multi-start search below.
    const walk = (i, b) => {
      if (i === dims.length) { finals.push(evaluate(b)); return; }
      for (const o of OPT_SPACE[dims[i]]) { const t = clone(b); o.apply(t); walk(i + 1, t); }
    };
    walk(0, base);
  }
  for (const start of opts.thorough ? [] : starts) {
    let cur = evaluate(start);
    for (let pass = 0; pass < 4; pass++) {
      let improved = false;
      for (const dim of dims) {
        for (const o of OPT_SPACE[dim]) {
          const t = clone(cur.b); o.apply(t);
          const e = evaluate(t);
          if (e.s > cur.s + 1e-9) { cur = e; improved = true; }
        }
      }
      if (!improved) break;
    }
    finals.push(cur);
  }
  const seen = new Set();
  // Rank everything evaluated; keep the best thickness for each material combination so the
  // suggestions are genuinely different layups, not the same one 0.5 mm apart.
  const ranked = finals.concat([...cache.values()]).sort((a, b) => b.s - a.s).filter((c) => {
    const k = Object.keys(OPT_SPACE).filter((d) => d !== "thickness").map((d) => dimKey(d, c.b)).join("|");
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  const summarize = (b) => {
    const r = analyze(b, { units: U.system });
    return { score: Math.round(objective(r) * 100) / 100, goalScore: goalScore(r), scores: r.scores, weightG: r.weightG, weight177: r.weight177,
      attributes: Object.fromEntries(ATTRS.map((a) => [a.key, r.attributes[a.key]])), issues: r.issues.filter((i) => i.severity !== "Info").map((i) => i.title) };
  };
  const baseline = summarize(build);
  const candidates = ranked.slice(0, opts.top || 3).map((c) => {
    const changes = Object.keys(OPT_SPACE).filter((d) => dimKey(d, c.b) !== dimKey(d, build))
      .map((d) => ({ dim: d, from: describeDim(d, build, U), to: describeDim(d, c.b, U) }));
    if (!build.rubber?.on && c.b.rubber?.on) changes.push({ dim: "rubber", from: "No rubber strip", to: "Rubber strip over the edges" });
    return { build: c.b, changes, ...summarize(c.b) };
  });
  return { goal, thorough: !!opts.thorough, maxWeight177: Number.isFinite(maxW) ? maxW : null, locked: [...lock], evaluated: evals, baseline, candidates };
}

// ---------------------------------------------------------------- materials list
// What to buy for one pair, sized from the build. Prices come from the planning sheet
// ("DIY Build Cost" and "Materials" tabs: Fiberglass Supply, US Composites, Venom Carbon, Zoro
// list prices, Oct 2026) or are marked as estimates. Press and tuning tools are not included.
export const PRICES = {
  woodPerBoardFt: { poplar: 3, aspen: 4.5, beech: 7, ash: 6, maple: 6, paulownia: 15, bamboo: 11.5, balsa: 10, foam: 8 },
  // $ per linear yard of 50"-wide fabric, per oz/yd² of fabric weight
  fabricPerOzYd: { eglass: 0.52, carbon: 6.9, basalt: 5.1, flax: 5, aramid: 9.9 },
  epoxySmallKit: { price: 66.15, kg: 1.55, name: "Resin Research 2000CE, 3-pint kit" },
  epoxyLargeKit: { price: 189, kg: 6.2, name: "Resin Research 2000CE, 1.5-gallon kit" },
  basePair: { sintered: 45, extruded: 22, graphite: 70 },
  edgesPer8m: 55, sidewallPer8m: { abs: 15, uhmw: 22, phenolic: 30 }, rubberPer8m: 12, topsheetPair: 25,
  metalSheet: { al7075: { price: 120, lengthM: 1.83, widthM: 0.305, est: true } },
  consumables: 25, spacers: 10,
};
const amz = (q) => "https://www.amazon.com/s?k=" + encodeURIComponent(q);

export function billOfMaterials(build, opts = {}) {
  const U = makeUnits(opts.units);
  const us = U.system === "us";
  const b = build, g = geometry(b), L = g.L;
  const N = 161, ds = L / (N - 1);
  let area = 0, maxW = 0;
  for (let i = 0; i < N; i++) { const w = g.width(i * ds); area += w * ds * ((i === 0 || i === N - 1) ? 0.5 : 1); maxW = Math.max(maxW, w); }
  const lenTxt = (m) => us ? `${(m * 3.28084).toFixed(1)} ft` : `${m.toFixed(1)} m`;
  const yd = (m) => Math.ceil(m / 0.9144 * 2) / 2;
  const items = [];
  const add = (group, item, spec, qty, cost, buy, note = "", est = false) => items.push({ group, item, spec, qty, cost: Math.round(cost * 100) / 100, buy, note, est });

  // Core wood: one blank per ski, a little longer, wider and thicker than the finished core,
  // plus milling waste (strips, glue lines, planing).
  const blankM3 = (L + 0.05) * (maxW + 0.01) * ((b.core.underfootMm + 3) / 1000) * 2 * 1.6;
  const bf = blankM3 / 0.00235974;
  const blend = b.core.blend.filter((x) => x.pct > 0 && WOODS[x.wood]);
  const tot = blend.reduce((a, x) => a + x.pct, 0) || 1;
  for (const x of blend) {
    const q = Math.max(0.5, Math.ceil(bf * x.pct / tot * 2) / 2);
    const name = WOODS[x.wood].name;
    add("Core", `${name} ${x.wood === "foam" ? "sheet" : "lumber"}`, `${Math.round(x.pct / tot * 100)}% of the core`, `${q} board ft`, q * PRICES.woodPerBoardFt[x.wood], amz(`${name.split(" (")[0]} wood board lumber`),
      x.wood === "poplar" ? "Any lumberyard; often cheaper than online" : "", !["poplar"].includes(x.wood));
  }
  // Fabrics: strips are cut along the roll; a 50" roll fits several ski-width strips side by side.
  const fabrics = new Map();
  for (const f of [...(b.laminatesBottom || []), ...(b.laminatesTop || [])]) {
    if (!(f.gsm > 0) || !FIBERS[f.fiber]) continue;
    const key = `${f.fiber}|${f.arch}|${Math.round(f.gsm)}`;
    fabrics.set(key, { f, strips: (fabrics.get(key)?.strips || 0) + 2 * (f.plies || 1) });
  }
  const perWidth = Math.max(1, Math.floor(1.27 / (maxW + 0.02)));
  for (const { f, strips } of fabrics.values()) {
    const rows = Math.ceil(strips / perWidth);
    const q = yd(rows * (L + 0.15)) + 0.5;
    const oz = f.gsm / OZYD2_TO_GSM;
    const fib = FIBERS[f.fiber].name, arch = ARCHITECTURES[f.arch].name;
    add("Fiberglass & fabrics", `${fib} ${arch}`, `${U.fmt("arealGsm", f.gsm)}, 50" wide · ${strips} strips`, `${q} linear yd`, q * oz * PRICES.fabricPerOzYd[f.fiber],
      amz(`${fib.split(" (")[0]} ${arch.split(" ")[0].toLowerCase()} fabric ${Math.round(oz)} oz 50 inch`), "Includes ~0.5 yd spare", f.fiber !== "eglass");
  }
  // Epoxy: resin in every fabric layer + bond lines, for two skis, plus ~40% for mixing and squeeze-out.
  const vf = b.vf;
  let resinPerSki = 0, interfaces = 3;
  for (const f of [...(b.laminatesBottom || []), ...(b.laminatesTop || [])]) {
    if (!(f.gsm > 0) || !FIBERS[f.fiber]) continue;
    const t = (f.gsm * (f.plies || 1) / 1000) / (FIBERS[f.fiber].rho * vf);
    resinPerSki += EPOXY.rho * (1 - vf) * t * area; interfaces++;
  }
  for (const m of [b.metalBottom, b.metalTop]) if (m && m.material !== "none") interfaces++;
  resinPerSki += (b.bondGsm / 1000) * interfaces * area;
  const resinKg = resinPerSki * 2 * 1.4;
  const sk = PRICES.epoxySmallKit, lk = PRICES.epoxyLargeKit;
  const nSmall = Math.ceil(resinKg / sk.kg), useLarge = nSmall * sk.price > lk.price;
  add("Epoxy", useLarge ? lk.name : sk.name, `≈ ${U.fmt("massSmallG", resinKg * 1000, us ? 0 : 0)} mixed for the pair`, useLarge ? "1 kit" : `${nSmall} kit${nSmall > 1 ? "s" : ""}`,
    useLarge ? lk.price : nSmall * sk.price, amz("laminating epoxy resin kit slow hardener"), "Slow hardener gives more layup time");
  // Base, edges, sidewalls, rubber, topsheet.
  const baseName = BASES[b.base.material].name;
  add("Base", `${baseName} base`, `2 pieces ≥ ${U.fmt("lenCm", (L + 0.05) * 100, 0)} × ${U.fmt("widthMm", (maxW + 0.01) * 1000)}, ${U.fmt("thickMm", b.base.thicknessMm)}`, "1 pair set",
    PRICES.basePair[b.base.material], amz(`${b.base.material === "extruded" ? "extruded" : "sintered"} ptex ski base material sheet`), "Buy it pre-treated on the bonding side", true);
  const edgeM = 2 * (2 * L * 1.05 + 0.2);
  add("Edges", "Hardened steel edges", `${U.fmt("thickMm", b.edges.widthMm)} wide`, lenTxt(edgeM), PRICES.edgesPer8m * edgeM / 8, amz("ski steel edge DIY ski building"), "", true);
  if (b.sidewall.material !== "cap") {
    const sideM = 4 * L * 1.05;
    add("Sidewalls", `${SIDEWALLS[b.sidewall.material].name} sidewall strip`, `${U.fmt("thickMm", b.sidewall.widthMm)} wide, at least ${U.fmt("thickMm", b.core.underfootMm + 1)} tall`, lenTxt(sideM),
      PRICES.sidewallPer8m[b.sidewall.material] * sideM / 8, amz(`${SIDEWALLS[b.sidewall.material].name.split(" ")[0]} plastic strip ski sidewall`), "", true);
  }
  if (b.rubber && b.rubber.on) {
    const rubM = 4 * L * 1.05;
    add("Damping", "Rubber strip (VDS)", `${U.fmt("thickMm", b.rubber.thicknessMm, us ? 3 : 1)} thick, ${U.fmt("widthMm", b.rubber.widthMm)} wide`, lenTxt(rubM), PRICES.rubberPer8m * rubM / 8, amz("rubber strip ski edge damping VDS"), "", true);
  }
  add("Topsheet", `${TOPSHEETS[b.topsheet.material].name} topsheet`, `2 pieces, ${U.fmt("thickMm", b.topsheet.thicknessMm)}`, "1 pair set", PRICES.topsheetPair, amz(`${b.topsheet.material === "tpu" ? "TPU" : "nylon"} topsheet ski building`), "Flame-treat the bonding side", true);
  // Metal.
  const metalStrips = {};
  for (const m of [b.metalBottom, b.metalTop]) if (m && m.material !== "none" && METALS[m.material]) {
    const k = `${m.material}|${m.thicknessMm}`; metalStrips[k] = (metalStrips[k] || 0) + 2;
  }
  for (const [k, strips] of Object.entries(metalStrips)) {
    const [mat, t] = k.split("|");
    if (mat === "titanal") { add("Metal", "Titanal sheet", `${U.fmt("thickMm", +t)} · ${strips} strips`, "—", 0, amz("titanal sheet"), "Not sold retail; only AMAG sells it, to ski factories", true); continue; }
    const sh = PRICES.metalSheet[mat];
    const perSheet = Math.max(1, Math.floor(sh.widthM / (maxW + 0.01)));
    const sheets = Math.ceil(strips / perSheet);
    add("Metal", `${METALS[mat].name} sheet`, `${U.fmt("thickMm", +t)}, at least ${U.fmt("lenCm", (L + 0.03) * 100, 0)} long · ${strips} strips`, `${sheets} sheet${sheets > 1 ? "s" : ""}`, sheets * sh.price,
      amz(`7075 aluminum sheet ${t} mm`), "A 4×4 ft sheet is too short; look for 6 ft lengths. Etch and prime before bonding", true);
  }
  add("Other", "Tip/tail spacers and binding inserts", "ABS or UHMW scraps", "1 set", PRICES.spacers, amz("ABS plastic sheet 2mm"), "", true);
  add("Other", "Shop consumables", "Gloves, mixing cups, release film, sandpaper", "—", PRICES.consumables, amz("nitrile gloves mixing cups epoxy release film"), "", true);
  const total = items.reduce((a, x) => a + x.cost, 0);
  return { items, total: Math.round(total * 100) / 100, perSki: Math.round(total / 2 * 100) / 100, note: "One pair. Press and tuning tools not included." };
}

// A blank slate: standard shape and the parts every ski needs (base, edges, sidewalls,
// topsheet, rubber), but no fabric, no metal and a plain poplar core, so you choose the layup.
export const BLANK_BUILD = {
  ...clone(BASE_BUILD), name: "Untitled build",
  core: { ...clone(BASE_BUILD.core), blend: [{ wood: "poplar", pct: 100 }] },
  laminatesBottom: [], laminatesTop: [],
  metalBottom: { material: "none", thicknessMm: 0.5, coverage: 1 },
  metalTop: { material: "none", thicknessMm: 0.5, coverage: 1 },
  press: "undecided",
};
