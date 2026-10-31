// Everything from the "My DIY Ski Build — Material Decision Workbook" Google Sheet, copied
// Oct 27, 2026. Prices are approximate as of Oct 2026; "(est.)" = no sourced figure.
// Rows are kept in the sheet's own column order so they can be re-imported the same way.

const MATERIAL_COLUMNS = ["num", "category", "name", "role", "properties", "pros", "cons", "feel", "foundIn", "cost", "tier",
  "obtain", "where", "build", "buildNotes", "upkeep", "overall", "sources", "pick", "note"];

const MATERIAL_ROWS = [
  ["1","Core","Poplar","Main core wood in most skis","Light to medium weight (~22–31 lb/ft³); softer flex; machines cleanly","Light, durable, cheap, consistent","Less damp and powerful than hardwoods on its own","Lively and easy; usually blended with beech or ash for power","Völkl Mantra 88 / Kendo 88 (poplar + beech core); most all-mountain skis","~$1.50–4.50 per board ft","$","5","Any lumberyard or hardwood dealer. US lumberyard \"poplar\" is usually tulip poplar, a different species from the European poplar most brands use","5","Planes, cuts and glues easily. Laminate strips with alternating grain. Standard dust mask.","4","4.7","S2, S3, S32, S33","Yes","maby mix "],
  ["2","Core","Aspen","Light core wood, usually blended","~26 lb/ft³; very elastic","Light, springy, inexpensive","Poor rot resistance if water gets past the topsheet or sidewall","Smooth and springy","Blended cores in many North American skis","~$3–6 per board ft (est.)","$","3","Regional hardwood dealers; less common than poplar on the East Coast (est.)","4","Works like poplar. Seal it well since it rots easily.","4","3.7","S1, S3","No","rot restisans worrys me about integrity"],
  ["3","Core","Beech","Hardwood for power and binding-screw retention","Heavy and hard (~32–56 lb/ft³); damp","Stable at speed, damp, holds binding screws well","Heavy; makes a ski more demanding","Powerful, quiet, planted","European carving and race skis; part of the Mantra 88 core","~$5–9 per board ft (est.)","$$","4","Hardwood dealers","3","Harder on blades; dense strips take more force to bend in the press.","2","3.0","S1, S3, S33","Yes","i think that could increase power transfer"],
  ["4","Core","Ash","Hardwood stringers or underfoot blocks","Strong, heavy (~35–53 lb/ft³), good elasticity","Pop and power; very durable","Heavy","Energetic and stable","Hard-charging and big-mountain skis","~$4–8 per board ft (est.)","$","4","Hardwood dealers","3","Use as stringers or underfoot instead of a full core to save weight.","2","3.0","S2, S3, S4","Maybe","potential use if i want more pop  but "],
  ["5","Core","Maple","Hardwood stringers or full cores (North American brands)","Heavy and durable (~39–47 lb/ft³); predictable","Precise, durable, excellent screw hold","A full maple core can feel harsh","Precise and powerful; can be harsh","Common in North American hard-charging skis","~$5–9 per board ft (est.)","$$","5","Any lumberyard","3","Hard wood, so keep blades sharp. Great underfoot for binding screws.","2","3.3","S1, S3, S4","Maybe","feels to harsh "],
  ["6","Core","Paulownia","Ultralight core wood","Very light (~18 lb/ft³ / 288 kg/m³); rot resistant; soft surface","Big weight savings; dimensionally stable; resists rot","Weak screw grip, dents easily, less damp","Light and quick; can feel flighty at speed","Rossignol Experience Basalt; ON3P touring layup; Liberty Envy (blend)","~$15 per board ft","$$","2","Specialty lumber suppliers, mostly online","4","Very easy to cut, but silica in some trees dulls blades. Add a hardwood insert underfoot for bindings.","4","3.3","S2, S5, S6, S15, S37","No"],
  ["7","Core","Bamboo","Strong, poppy core material","~19–25 lb/ft³ raw; strong and springy; heavier once glued into laminates","Strong, snappy rebound, fast-growing plant","Needs heavy chemical processing (including formaldehyde); glue adds weight","Poppy and durable","ON3P (mostly bamboo cores); Liberty","~$8–15 per board ft equivalent (est.)","$$","2","Bamboo strip or plywood suppliers","3","Comes pre-laminated. Buy raw strips, not finished flooring.","4","3.0","S1, S2, S3, S6","Maybe","i dont like request chem proscs"],
  ["8","Core","Balsa","Lightest wood; touring niche","~7–9 lb/ft³; very soft; rots easily","The lightest option","Fragile and rot-prone; K2's engineer said it wasn't worth the price over paulownia","Featherlight with little damping","Rare; some lightweight touring skis","Short hobby sheets are cheap; ski-length stock costs more (est.)","$$","3","Hobby and model shops (short lengths); marine composite suppliers","3","Crushes easily in the press and needs full encapsulation.","2","2.7","S1, S3","No"],
  ["9","Core","Foam (PU / PVC)","Cheap or ultralight core","Light and uniform","Cheap to mass-produce; light","Less energy return and shorter life than wood; poor screw hold","Vague or dead feel; wears out sooner","Entry-level and rental skis","PVC foam core sheet ~$20–60 (est.)","$","3","Composite suppliers","3","Needs hardwood or inserts underfoot for bindings.","3","3.0","S2, S29, S31","No"],
  ["10","Laminate","Fiberglass (triaxial E-glass)","Main reinforcement above and below the core","0° fibers control flex; ±45° fibers control torsion","Cheap, predictable, forgiving","Heavier than carbon for the same stiffness","Smooth, natural flex","Almost every ski","~$10–23 per linear yd (20–22 oz, 50\" wide)","$$","5","Fiberglass Supply, Noah's Marine, Fibre Glast","4","Wet layup with epoxy. Itchy, so wear long sleeves and gloves. Cut with sharp shears.","4","4.3","S11, S12, S28","Maybe"],
  ["11","Laminate","Carbon fiber","Stiffness at low weight; stringers or full layers","Best stiffness-to-weight; rebounds quickly","Light, strong, lively","Can feel chattery or \"tinny\"; expensive","Snappy and light, less damp","Moment (all models); Völkl carbon tips on the Mantra 88","~$40–90 per linear yd woven; UD tape is cheaper","$$$","5","US Composites, Fibre Glast, Composite Envisions","3","Conductive dust, so wear a respirator. Mistakes are costly. Stringers are easier than full sheets.","3","3.7","S2, S13, S14, S36","Maybe"],
  ["12","Laminate","Basalt","Fiberglass alternative made from volcanic rock","Stronger than E-glass; good vibration damping","Damp, smooth, durable","Costs more than glass; fewer suppliers","Quiet, smooth, stable","Rossignol Experience Basalt","~$45–57 per linear yd (9–13 oz twill)","$$$","4","Composite suppliers","4","Handles like fiberglass.","4","4.0","S15, S16","Maybe"],
  ["13","Laminate","Aramid (Kevlar)","Damping and impact layer","Light and tough; weak in compression","Absorbs vibration and impacts","Hard to cut and sand; pricey","Smoother, more forgiving","Wagner aramid impact upgrade","~$38–51 per linear yd (5 oz)","$$$","4","Fiberglass Supply, Noah's Marine","2","Needs Kevlar shears; fuzzes when sanded.","4","3.3","S17, S18, S24","Maybe"],
  ["14","Laminate","Flax","Natural-fiber damping layer","Low density, damp; better strength-to-weight than E-glass","Damp, eco-friendly, can give a wood-grain look","Pricey; fewer suppliers","Smooth, natural feel","Niche and eco-focused builds","~$30/yd (16\" UD) to ~$100/yd (50\" twill)","$$$","3","Composite Envisions, Rock West Composites","4","Wets out like fiberglass. Keep it dry before layup (est.).","4","3.7","S19, S20","Yes"],
  ["15","Metal","Titanal","Aluminum alloy layers for power and damping","~88% aluminum plus zinc, magnesium and copper (no titanium); same strength in every direction; anodized for bonding","Damp, stable, grippy on ice","Heavy and demanding; made by only one company (AMAG)","Planted and powerful; tiring if skied lazily","Völkl Mantra 88 / Kendo (Tailored Titanal Frame); Blizzard Brahma","Not sold retail (est.)","$$$$","1","AMAG sells it to ski manufacturers","2","Bonding relies on a special anodized surface, which is very hard to replicate at home. Needs a high-pressure press.","2","1.7","S7, S8, S9, S33","Maybe"],
  ["16","Metal","7075-T6 aluminum","DIY stand-in for Titanal","Same zinc-magnesium-copper alloy family; ~73,000 psi yield strength","Anyone can buy it","Hard to bond without surface treatment; long thin sheets are hard to find","Similar damp, powerful feel if it bonds well","DIY builds","~$146 for a 4×4 ft sheet at 0.04\" (too short for a full-length ski)","$$$$","3","McMaster-Carr, Zoro, OnlineMetals","2","Sand, etch and prime before gluing or it will delaminate. Needs a high-pressure press.","2","2.3","S7, S9, S10","Yes"],
  ["17","Base","Extruded polyethylene","Running surface on budget skis","Melted and extruded; HDPE around 500,000 g/mol","Cheap, tough, easy to repair","Holds less wax, so it's slower","Low maintenance","Entry-level and rental skis","~$15–30 per pair (est.)","$","4","DIY ski and snowboard supply shops","4","Cuts with a knife. Buy stock with a treated bonding side.","5","4.3","S21, S22, S40","No"],
  ["18","Base","Sintered UHMW polyethylene","Running surface on performance skis","Powder pressed into a block, then sliced; porous","Faster, absorbs wax, very durable","Costs more; P-Tex repairs don't match it; needs regular waxing","Fast and durable","Völkl Mantra 88 (P-Tex 2100); Moment (DuraSurf 4001)","~$30–60 per pair (est.)","$$","3","DIY suppliers; the big makers (DuraSurf, IMS) mainly sell to manufacturers","3","Buy it pre-treated on the bonding side and don't touch that side.","3","3.0","S21, S22, S36, S38, S40","Yes"],
  ["19","Base","Sintered graphite (race base)","Fastest running surface","High graphite content","Best glide","Pricey; needs frequent waxing","Fastest","Race skis; Wagner \"World Cup\" base","~$50–90 per pair (est.)","$$$","2","Specialty suppliers","3","Same handling as sintered base.","2","2.3","S22, S23","Maybe"],
  ["20","Edge","Hardened steel edges","Grip on hard snow and ice","Repair stock is 2.2 mm wide with a 1.4 mm step","Essential grip; thicker edges survive more tunes","Heavy; hard to bend and cut","Grip and precision","Every alpine ski","~$9 for two 1-ft repair pieces; full pair of edges ~$40–70 (est.)","$$","2","Repair lengths at tuning shops; full lengths from builder suppliers (hard to find locally)","2","Bend to the sidecut with an edge bender. Cut with a Dremel or cutoff wheel. See Edge Tuning tab.","5","3.0","S23, S25, S26, S35","Yes"],
  ["21","Sidewall","ABS","Protects the core and transfers power to the edge","Tough, damp plastic","Damp, good edge grip, easy to machine","Can crack (\"blow out\") on big impacts","Solid edge grip and dampness","Most sidewall skis","~$10–20 per pair (est.)","$","4","Builder suppliers","4","Sand or flame-treat the bonding faces. Gets cut back during edge tuning.","4","4.0","S27, S39, S45","No"],
  ["22","Sidewall","UHMW (P-Tex) sidewall","Tougher sidewall alternative","Very impact resistant","Fewer sidewall blowouts","Harder to bond","Durable","Wagner Custom Skis","~$15–30 per pair (est.)","$","3","Plastics suppliers","2","Hard to glue, so buy treated stock.","4","3.0","S24","Maybe"],
  ["23","Sidewall","Phenolic","Race sidewall and underfoot reinforcement","Very hard and dimensionally stable","Precise and strong","Hard to machine (est.)","Precise, race feel","World Cup race skis; underfoot in some freeride skis","~$20–40 per pair (est.)","$$","3","Industrial plastics suppliers (sheet)","2","Very dusty; use carbide tooling and a respirator.","2","2.3","S29","Yes"],
  ["24","Damping","Rubber strip (VDS)","Layer between the edges and the laminate","Thin rubber foil","Prevents delamination and adds damping","Adds a little weight","You won't notice it, but the skis last longer","Most skis","~$10–15 per pair (est.)","$","3","Builder suppliers","5","Cut to width with scissors.","5","4.3","S28, S39","Yes"],
  ["25","Topsheet","Nylon / TPU","Top protection and graphics","Tough plastic sheet","Protects the core and holds graphics","Chips over time; needs surface treatment to bond","—","Most skis","~$15–30 per pair (est.)","$","3","Builder suppliers","3","Print graphics before pressing. Flame-treat the bonding side.","5","3.7","S27, S39","Yes"],
  ["26","Resin","Epoxy","Glues every layer together","Two-part; 25–50 min working time depending on hardener","Strong, flexible bond","Skin sensitizer; mix ratio has to be exact","—","Every ski","~$66 (3-pint kit) to ~$189 (1.5 gal kit)","$$","5","Fiberglass Supply (Resin Research), marine suppliers","3","Always wear nitrile gloves. Slow hardener gives you more time for layup.","—","4.0","S30, S46","Yes"],
];

// Rating Data: 1–5 per attribute (edge, damping, pop, glide, lightness, durability); null = doesn't affect it.
const RATING_ROWS = {
  "Poplar": [3.0, 3.0, 3.5, null, 3.5, 3.5], "Aspen": [2.5, 2.5, 3.5, null, 3.5, 2.5], "Beech": [4.0, 4.5, 3.0, null, 1.5, 4.5],
  "Ash": [4.0, 3.5, 4.5, null, 2.0, 4.5], "Maple": [4.5, 3.5, 4.0, null, 1.5, 4.5], "Paulownia": [2.0, 2.0, 3.0, null, 5.0, 3.0],
  "Bamboo": [3.5, 3.0, 4.5, null, 3.5, 4.0], "Balsa": [1.5, 1.5, 2.0, null, 5.0, 1.5], "Foam (PU / PVC)": [2.0, 2.0, 1.5, null, 4.5, 2.0],
  "Fiberglass (triaxial E-glass)": [3.0, 3.0, 3.0, null, 3.0, 4.0], "Carbon fiber": [3.5, 1.5, 5.0, null, 5.0, 3.5],
  "Basalt": [3.5, 4.0, 3.5, null, 3.5, 4.0], "Aramid (Kevlar)": [2.5, 4.5, 2.5, null, 4.0, 4.5], "Flax": [2.5, 4.5, 3.0, null, 4.0, 3.0],
  "Titanal": [5.0, 5.0, 3.0, null, 1.0, 4.5], "7075-T6 aluminum": [4.5, 4.5, 3.0, null, 1.0, 4.0],
  "Extruded polyethylene": [null, null, null, 2.5, null, 4.0], "Sintered UHMW polyethylene": [null, null, null, 4.0, null, 4.5],
  "Sintered graphite (race base)": [null, null, null, 5.0, null, 3.5], "Hardened steel edges": [5.0, null, null, null, null, 4.5],
  "ABS": [4.0, 3.5, null, null, null, 3.5], "UHMW (P-Tex) sidewall": [3.5, 3.5, null, null, null, 4.5], "Phenolic": [4.5, 3.0, null, null, null, 4.0],
  "Rubber strip (VDS)": [null, 4.0, null, null, null, 4.0], "Nylon / TPU": [null, null, null, null, null, 3.5], "Epoxy": [null, null, null, null, null, null],
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const MATERIALS = MATERIAL_ROWS.map((row) => {
  const m = Object.fromEntries(MATERIAL_COLUMNS.map((c, i) => [c, row[i] ?? ""]));
  m.id = slug(m.name);
  m.num = +m.num;
  for (const k of ["obtain", "build", "overall"]) m[k] = +m[k];
  m.upkeep = m.upkeep === "—" ? null : +m.upkeep;
  m.sources = m.sources ? m.sources.split(/,\s*/) : [];
  m.ratings = RATING_ROWS[m.name];
  m.pick = m.pick || "";
  m.note = (m.note || "").trim();
  return m;
});

export const ATTRIBUTES = [
  { key: "edge", name: "Edge grip" }, { key: "damping", name: "Damping / stability" }, { key: "pop", name: "Pop / energy" },
  { key: "glide", name: "Glide" }, { key: "lightness", name: "Lightness" }, { key: "durability", name: "Durability" },
];

// Layers and whether a build needs them. Required layers you haven't picked are auto-filled.
export const LAYERS = [
  { category: "Core", need: "Required" }, { category: "Laminate", need: "Required" }, { category: "Metal", need: "Optional" },
  { category: "Base", need: "Required" }, { category: "Edge", need: "Required" }, { category: "Sidewall", need: "Required" },
  { category: "Damping", need: "Recommended" }, { category: "Topsheet", need: "Required" }, { category: "Resin", need: "Required" },
];

// Rating Engine settings (the blue cells), as in the sheet.
export const DEFAULT_SETTINGS = {
  press: "pneumatic-cold",
  targets: { edge: 4.0, damping: 3.8, pop: 3.5, glide: 3.5, lightness: 3.0, durability: 4.0 },
  synergyWeights: { proven: 0.20, structure: 0.30, manufacturability: 0.20, ride: 0.15, sourcing: 0.15 },
  useCases: [
    { key: "racing", name: "Racing (gates)", importance: 1 / 6, w: [0.35, 0.25, 0.15, 0.20, 0.00, 0.05] },
    { key: "park", name: "Park / freestyle", importance: 1 / 6, w: [0.10, 0.20, 0.30, 0.00, 0.20, 0.20] },
    { key: "east", name: "Hardpack & ice", importance: 1 / 6, w: [0.35, 0.30, 0.10, 0.00, 0.05, 0.20] },
    { key: "soft", name: "Soft snow", importance: 1 / 6, w: [0.10, 0.25, 0.25, 0.10, 0.20, 0.10] },
    { key: "mixed", name: "Mixed terrain", importance: 1 / 6, w: [0.20, 0.25, 0.20, 0.05, 0.15, 0.15] },
    { key: "allday", name: "All-day comfort (first chair to close)", importance: 1 / 6, w: [0.15, 0.25, 0.15, 0.05, 0.30, 0.10] },
  ],
  similarity: { attributeWeight: 0.7, layupWeight: 0.3, distanceScale: 2.5 },
};

// Checks: [name, area, severity, points]. Trigger logic lives in sheet.js.
export const CHECKS = [
  ["Required layer missing", "Structure", "High", -2.00], ["One base material", "Structure", "Medium", -1.00],
  ["Hardwood under the bindings", "Structure", "High", -1.50], ["Metal layer vs press", "Manufacturing", "High", -2.00],
  ["Press chosen for metal", "Manufacturing", "Low", -0.50], ["Metal surface prep", "Manufacturing", "Warning", 0], ["Layup time vs pot life", "Manufacturing", "Warning", 0], ["Metal is available", "Sourcing", "Medium", -1.00],
  ["One metal type", "Structure", "Low", -0.50], ["Edges have a rubber strip", "Manufacturing", "Medium", -0.75],
  ["Carbon is damped", "Ride balance", "Low", -0.50], ["Main structural layer", "Structure", "Low", -0.50],
  ["Core material count", "Structure", "Low", -0.25], ["Sidewall count", "Structure", "Low", -0.25],
  ["Balsa durability", "Structure", "Low", -0.50], ["Very heavy build", "Ride balance", "Medium", -0.75],
  ["Base upkeep", "Upkeep", "Info", 0], ["Hard-to-find picks", "Sourcing", "Info", 0],
  ["Edge grip vs target", "Performance", "Low", 0], ["Damping vs target", "Performance", "Low", 0], ["Pop vs target", "Performance", "Low", 0],
  ["Glide vs target", "Performance", "Low", 0], ["Lightness vs target", "Performance", "Low", 0], ["Durability vs target", "Performance", "Low", 0],
  ["Bonus: light core + hardwood", "Structure", "Bonus", 0.50], ["Bonus: edges + rubber strip", "Manufacturing", "Bonus", 0.25],
  ["Bonus: metal + high-pressure press", "Manufacturing", "Bonus", 0.50], ["Bonus: damped carbon", "Ride balance", "Bonus", 0.25],
].map(([name, area, severity, points]) => ({ name, area, severity, points }));

// Ski Models: [model, category, waist, construction, ratings x6, flags (metal, fiberglass, carbon, flax/basalt, hardwood core), source]
export const SKI_MODELS = [
  ["Atomic Redster G9 Revoshock", "Race carver (GS)", "67", "Poplar/ash core · 2 metal sheets + Revoshock plates · carbon underfoot + fiberglass · sintered base · 17 m @176", [5.0, 4.5, 4.0, 4.5, 1.5, 4.0], "YYYNY", "https://www.skiessentials.com/2027-ski-test/skis/2027-atomic-redster-g9"],
  ["Head Supershape e-Magnum", "Frontside carver", "72", "Wood core · 2 titanal layers · graphene · carbon + fiberglass laminate · race-structured sintered base · ~2.0 kg/ski with plate @170", [4.8, 4.3, 4.0, 4.5, 1.5, 4.0], "YYYN?", "https://blisterreview.com/gear-reviews/2024-2025-head-supershape-e-magnum"],
  ["Völkl Deacon 84", "Frontside carver", "84", "Poplar/beech multilayer core · titanal frame · 3D glass · 3D ridge · rocker/camber/rocker", [4.3, 3.8, 3.8, 4.0, 2.5, 4.0], "YYNNY", "https://www.skiessentials.com/2023-ski-test/skis/2023-volkl-deacon-84"],
  ["Völkl Kendo 88", "All-mountain", "88", "Poplar/beech multilayer core · titanal frame · carbon tips · full sidewall · P-Tex 2100 sintered base (fiberglass assumed)", [4.2, 3.8, 3.6, 4.0, 2.8, 4.0], "YYYNY", "https://www.snowandrock.com/p/volkl-men-s-kendo-88-skis-ski-only-J1334214.html"],
  ["Völkl Mantra 88", "All-mountain", "88", "Poplar/beech core · titanal frame on top + full titanal sheet below · carbon tip laminate · ~1,930 g/ski @177 (fiberglass assumed)", [4.5, 4.2, 3.6, 4.0, 2.3, 4.0], "YYYNY", "https://www.skiessentials.com/Chairlift-Chat/2026-volkl-mantra-88-ski-review"],
  ["Nordica Enforcer 88", "All-mountain", "88", "Performance wood core · 2 titanal layers (Energy 2 Ti) · carbon · ~2,210 g/ski @186 (fiberglass assumed)", [4.4, 4.6, 3.0, 4.0, 1.8, 4.3], "YYYN?", "https://www.lacordee.com/en/products/nordica-enforcer-88-alpine-skis-noc-10192913"],
  ["Blizzard Brahma 88", "All-mountain", "88", "TrueBlend beech/poplar core · 2 titanal sheets · carbon tips/tails · rubber damping layer (fiberglass assumed)", [4.6, 4.5, 3.2, 4.0, 2.0, 4.2], "YYYNY", "https://www.switchbacktravel.com/reviews/blizzard-brahma-88"],
  ["Salomon Stance 88", "All-mountain", "88", "Poplar core · 2 titanal layers · fiberglass + C/FX carbon-flax inserts · sintered base", [4.3, 4.3, 3.4, 4.0, 2.2, 4.0], "YYYYN", "https://blisterreview.com/gear-reviews/2022-2023-salomon-stance-88-w"],
  ["Head Kore 87", "All-mountain (light)", "84–87", "Karuba/poplar core · triaxial carbon layers · graphene tips/tails · no metal · sandwich sidewall", [3.5, 3.0, 4.0, 4.0, 4.5, 3.3], "N?YNN", "https://www.altitude-sports.com/p/head-kore-87-skis-hdd-315454-sea24"],
  ["K2 Mindbender 89Ti", "All-mountain", "89", "Aspen micro-block core · titanal Y-Beam (1 sheet) · bio resin (fiberglass assumed)", [3.9, 3.8, 3.4, 3.8, 3.0, 3.8], "YYNNN", "https://evo.com/skis/k2-mindbender-89-ti"],
  ["Armada ARV 88", "Park / freestyle", "88", "Poplar core · ash binding insert · sintered S7 base · Impact Edge · 3D-molded sidewall · 1,690 g/ski @176 (fiberglass assumed)", [3.0, 2.8, 4.2, 4.0, 3.8, 4.3], "NYNNY", "https://skiessentials.com/2027-armada-arv-88-skis-ra0000862"],
  ["Atomic Bent 90", "Park / freestyle", "90", "Poplar core · partial sidewall + cap · HRZN tips/tails · 1,600 g/ski @175 (fiberglass assumed)", [2.8, 2.5, 3.8, 3.5, 4.3, 3.5], "NYNNN", "https://www.skiessentials.com/Chairlift-Chat/2023-atomic-bent-90-ski-review"],
  ["Faction Prodigy 1", "Park / freestyle", "88", "Poplar/ash core · full sidewall · thicker edges · anti-chip cap · 1,750 g/ski @178 (fiberglass assumed)", [3.2, 3.0, 4.3, 3.5, 3.6, 4.5], "NYNNY", "https://www.skiessentials.com/products/2024-faction-prodigy-1-ski-pr1z24/2024-ski-test/skis/2024-faction-prodigy-1"],
].map(([model, category, waist, construction, ratings, flags, source]) => ({ model, category, waist, construction, ratings, flags: flags.split(""), source }));
export const LAYUP_FLAGS = ["Metal", "Fiberglass", "Carbon", "Flax / basalt", "Hardwood core"];

export const PROFILES = [
  { name: "Full camber", shape: "Arch underfoot; ski touches the snow only near the tip and tail", hard: "Best grip, power and pop", soft: "Tip tends to dive; takes more work", park: "Works, but catchier on butters and rails (est.)", racing: "Standard for race skis and dedicated carvers", pros: "Maximum power, damping, edge grip and energy out of each turn", cons: "Dives in deep snow; demands precise weighting", typical: "SL and GS race skis; carvers", mold: "Simplest mold: a gentle arch plus tip and tail kick (est.)", fit: "Best for gates and hardpack; weakest for park and soft snow", sources: ["S49", "S50"], design: { camberMm: 5, tipRockerCm: 0, tailRockerCm: 0 } },
  { name: "Tip rocker + camber (early rise)", shape: "Camber ends before the tip, moving the contact point back", hard: "Strong grip, with easier turn entry", soft: "Tip floats better; less tip grab in mixed snow", park: "Fine", racing: "Fine at club level (est.)", pros: "Easier turn initiation; ski feels a bit shorter; tip hooks less", cons: "Slightly shorter effective edge than full camber (est.)", typical: "Frontside carvers and all-mountain skis", mold: "Longer tip curve in the mold (est.)", fit: "Strong pick if racing matters most", sources: ["S49"], design: { camberMm: 4, tipRockerCm: 30, tailRockerCm: 0 } },
  { name: "Rocker-camber-rocker (tip & tail rocker)", shape: "Camber underfoot with rocker at both ends; all-mountain skis use roughly 10–25% tip rocker", hard: "Good grip underfoot", soft: "Floats and pivots well", park: "Tail rocker helps riding switch", racing: "OK at club level (est.)", pros: "Very versatile; easy in and out of turns", cons: "A compromise: won't match pure camber on ice or full rocker in powder", typical: "Völkl Mantra 88 / Kendo 88", mold: "Mold needs both tip and tail curves (est.)", fit: "Best single-pair match for racing + park + soft snow + mixed terrain", sources: ["S38", "S49", "S50"], design: { camberMm: 3, tipRockerCm: 30, tailRockerCm: 25 } },
  { name: "Flat (zero camber)", shape: "No arch; the base sits level on the snow", hard: "Less grip than camber, more than rocker", soft: "Loose and easy", park: "Loose and easy to butter; common on park skis", racing: "Poor", pros: "Playful; easy pivots and butters", cons: "Less pop and edge hold", typical: "Park skis; powder-leaning skis", mold: "Easiest center section to build (est.)", fit: "Good for a dedicated park pair; loose in mixed terrain", sources: ["S50"], design: { camberMm: 0, tipRockerCm: 25, tailRockerCm: 20 } },
  { name: "Full rocker (reverse camber)", shape: "No camber anywhere; tip and tail rise from the middle", hard: "Weak: less stability and rebound", soft: "Best float", park: "Very loose", racing: "Poor", pros: "Maximum float and easy pivoting", cons: "Hardpack stability and rebound suffer; can feel vague or skiddy", typical: "Powder skis", mold: "One continuous curve (est.)", fit: "Not a fit for your goals", sources: ["S49", "S50"], design: { camberMm: 0, tipRockerCm: 50, tailRockerCm: 45 } },
  { name: "Twin tip (tail shape; pairs with any profile)", shape: "Tail turns up like the tip", hard: "Slightly less tail hold at the end of a turn (est.)", soft: "—", park: "Needed for landing and riding switch (est.)", racing: "Not used", pros: "Switch riding, landings, spins", cons: "Shorter effective edge (est.)", typical: "Park and freestyle skis", mold: "Tail curve mirrors the tip (est.)", fit: "Needed if park comp is the goal", sources: ["S50"], design: null },
];

export const PRESS_OPTIONS = [
  { key: "vacuum-cold", name: "Vacuum bag, room temp", how: "Mold and layup sealed in an airtight bag; a pump pulls the air out", pressure: "Up to ~14.7 psi (1 atmosphere)", cure: "12–24 hr under pressure; full cure can take ~7 days at 20 °C", cost: "~$498 for a West System vacuum bagging kit (up to 13 sq ft), plus a mold", pros: "Cheapest real option; simple; even pressure; mold only has to hold its shape", cons: "Low pressure; builders report lower quality than a press, though many get great results; slow cure", easeBuild: 4, easeUse: 4, best: "First builds; wood + fiberglass layups", sources: ["S12", "S34", "S46"] },
  { key: "vacuum-heat", name: "Vacuum bag + heat (hot box or blankets)", how: "Same bag, plus heating blankets on a PID temperature controller", pressure: "Up to ~14.7 psi", cure: "60 °C post-cure for ~15 hr is common; every +10 °C roughly halves cure time", cost: "Bag kit plus ~$150–400 for heating (est.)", pros: "Faster, stronger cure; still affordable", cons: "Needs temperature control and wiring", easeBuild: 3, easeUse: 3, best: "Making a few pairs", sources: ["S46"] },
  { key: "pneumatic-cold", name: "Pneumatic press (fire hose / air bladder), cold", how: "Rigid frame; an inflated lay-flat hose pushes the layup into the mold", pressure: "Often over 25 psi; the frame sees over 10 tons", cure: "Room temp, then post-cure in a hot box", cost: "~$600–1,500 to build (est.)", pros: "High pressure = better compaction and bonds; repeatable", cons: "Frame must be overbuilt or it bows; costly; large footprint", easeBuild: 2, easeUse: 3, best: "Metal layers and dense hardwood cores", sources: ["S34", "S46", "S47"] },
  { key: "pneumatic-heat", name: "Heated pneumatic press", how: "Pneumatic press with heating blankets above and below the mold on a PID controller", pressure: "Over 25 psi", cure: "Heated cure under pressure", cost: "~$1,000–3,000 to build (est.)", pros: "Closest to how small ski brands build; best quality; fastest turnaround", cons: "Most expensive and complex; electrical and pressure safety risks", easeBuild: 1, easeUse: 3, best: "Building many pairs at the best quality", sources: ["S46"] },
  { key: "jack-frame", name: "Hydraulic jack frame", how: "Bottle jacks push on stiff plates over the mold", pressure: "High, but uneven along a 2 m ski unless the plates are very stiff (est.)", cure: "Room temp or heated", cost: "~$400–1,000 (est.)", pros: "Jacks are cheap and easy to find", cons: "Hard to get even pressure tip to tail (est.)", easeBuild: 3, easeUse: 2, best: "Not recommended for a first build (est.)", sources: ["S46"] },
  { key: "someone-else", name: "Use someone else's press", how: "Book time at a ski-building workshop or makerspace, or take a build class", pressure: "Depends on their press", cure: "Depends on their press", cost: "Varies (est.)", pros: "No tooling cost; learn from experienced builders", cons: "Limited schedule; may have to use their materials", easeBuild: 3, easeUse: 5, best: "Your very first pair", sources: ["S48"] },
];
export const PRESS_PARTS = [
  ["Mold", "Sets the camber and rocker profile", "~$40–150 (est.)", "Cut from MDF (sealed with polyurethane) or aluminum. One mold per profile and length.", "S46, S47"],
  ["Frame (pneumatic press)", "Holds back the press force", "Varies (est.)", "Wood is cheaper but needs careful bracing; steel channel or I-beam is safer at high pressure.", "S46"],
  ["Air bladder", "Applies even pressure along the ski", "Varies (est.)", "One builder used 6\" lay-flat discharge hose rated to 60 psi, sealed with angle iron and EPDM washers.", "S47"],
  ["Pressure ladder / cross members", "Spreads the load across the mold", "~$20 in lumber vs ~$630 in aluminum tube", "Same builder's comparison for one press.", "S47"],
  ["Heating blankets + PID controller", "Heats the layup for a faster, stronger cure", "~$150–400 (est.)", "Blankets go above and below the mold.", "S46"],
  ["Air compressor, regulator, gauge", "Inflates the bladder to a set pressure", "~$100–250 if you don't own one (est.)", "Add a pressure gauge to the manifold.", "S47"],
  ["Vacuum pump, bag, breather", "For the vacuum method", "Included in the ~$498 kit", "", "S12"],
].map(([part, purpose, cost, notes, sources]) => ({ part, purpose, cost, notes, sources: sources.split(/,\s*/) }));
export const CURE_GUIDE = [
  "Keep the layup under pressure for 12–24 hours at room temperature or with heat.",
  "A full room-temperature cure (~20 °C) can take up to 7 days; a 60 °C post-cure for ~15 hours is common.",
  "Every 10 °C increase roughly halves the cure time. Check your epoxy's data sheet for its limits.",
];
// Places near Mount Laurel / Philadelphia found Oct 27, 2026 (not in the sheet).
export const PRESS_NEARBY = [
  { name: "Drexel Innovation Studio", what: "Open to all Drexel students: woodworking and a machine shop. No press listed; ask about pressing space.", link: "https://drexel.edu/engineering/resources/for-students/innovation-studio" },
  { name: "Westphal Hybrid Making Lab (Drexel)", what: "CNC routers and laser cutters for cores, templates and molds. Contact the lab director about a vacuum press.", link: "https://drexel.edu/westphal/westphal-experience/facilities/hybridmakinglab" },
  { name: "NextFab, 1800 N American St, Philadelphia", what: "Student membership $129/month: woodshop, ShopBot CNC ($25–35/hr), project storage. No press listed.", link: "https://nextfab.com/about/faqs/" },
  { name: "Weekend build classes (VT / Boston)", what: "Silo Skis (Richmond, VT) and Parlor (Boston) have run classes on their presses; 2017–2020 prices were $700–1,750.", link: "https://vtskiandride.com/diy-boards/" },
];

export const BEVELS = [
  ["FIS race (SL / GS)", "0.5–0.75°", "3°", "Very grippy and precise; edge bites instantly", "S42: race skis may come with 0.5 or 0.75 base and 3 side"],
  ["Club racing + hard-snow carving", "0.5–1°", "2–3°", "Holds on ice but still forgiving", "Between the race and recreational values in S42 (est.)"],
  ["All-mountain / recreational", "1°", "1–2°", "Balanced; easy to release turns", "S42: commonly 1/1 or 1/2"],
  ["Park / freestyle", "1°", "2° (factory example)", "Many park skiers dull the tips and tails to avoid catching on rails (est.)", "S42 factory chart lists Atomic park skis at 1/2"],
].map(([use, base, side, feel, note]) => ({ use, base, side, feel, note }));
export const BEVEL_NOTE = "Base bevel = angle of the edge off the base. Side bevel = angle off the sidewall. Higher base bevel feels surfier and pivots more; higher side bevel carves and grips harder. Tuning machines hold about ±0.2°, and bevels can vary tip to tail on one ski (S42).";
export const TUNING_EFFECTS = [
  ["Edge thickness", "Thicker edges survive more tunes and rock hits; thin edges are lighter but can bend or break.", "S23"],
  ["Sidewall material", "ABS or polyethylene above the edge has to be cut back to file the side edge, especially at side bevels over 2°. Harder sidewalls (UHMW, phenolic) take more work (est.).", "S45"],
  ["Base type", "Sintered bases hold wax better but need regular waxing; extruded is lower maintenance. P-Tex candle repairs on sintered bases hold less wax.", "S22"],
  ["Race (graphite) base", "Fastest, but needs the most frequent waxing.", "S22, S23"],
].map(([choice, effect, sources]) => ({ choice, effect, sources: sources.split(/,\s*/) }));
export const TUNING_TOOLS = [
  ["Side edge bevel guide", "Holds a file or stone at the side bevel angle", 39.95, "$39.95 (Swix Racing) to $75 (Side of BEAST)", "S43, S44"],
  ["Base edge bevel guide", "Sets the base bevel", 20.00, "$20 (Base BEAST) to $89.95 (Swix World Cup)", "S43, S44"],
  ["Mill file, 8\"", "Removes edge material fast", 18.00, "$18 (BEAST 8\" medium)", "S43"],
  ["Diamond stone (medium)", "Polishes and sharpens hardened edges", 42.00, "$42 (BEAST 4\" premium)", "S43"],
  ["Gummi stone", "Deburrs and detunes tips and tails", 15.00, "$15", "S43"],
  ["Sidewall cutter / planer", "Cuts sidewall back above the edge", 55.00, "$55 (Plane BEAST) to $132 (Swix World Cup)", "S43, S44, S45"],
  ["Waxing iron", "Hot wax after tuning", 69.95, "$69.95 (Swix T77)", "S26"],
  ["Ski vise", "Holds the ski while you work", 140.00, "~$140 (est. from kit price with and without vise)", "S43"],
].map(([tool, does, price, range, sources]) => ({ tool, does, price, range, sources: sources.split(/,\s*/) }));
export const TUNING_SHORTCUT = "Shortcut: the BEAST Pro kit bundles side and base tools, planer, file, diamond and gummi for $205 on sale ($235 regular); with a vise it's $345–365 (S43).";
export const FIRST_TUNE = [
  "Trim the ski outline and sand off excess epoxy and sidewall flash.",
  "Get the base flat. A shop stone grind is the easiest way on a brand-new ski.",
  "Set the base bevel with the base guide and file, then diamond stone.",
  "Cut the sidewall back above the edge with the planer or sidewall cutter.",
  "Set the side bevel: file first, then diamond stones for a smooth finish.",
  "Deburr with the gummi stone. For park skis, dull the tips and tails.",
  "Hot wax several times; a new sintered base soaks up a lot of wax.",
];

export const SOURCES = Object.fromEntries([
  ["S1", "Ski Magazine — What's inside ski wood cores", "https://www.skimag.com/gear/ski-wood-cores/"],
  ["S2", "Backcountry Magazine — Tech Tips: Core Concepts", "https://backcountrymagazine.com/gear/tech-tips-core-concepts"],
  ["S3", "Newschoolers forum — Ski wood core densities (user-posted, approximate)", "https://newschoolers.com/forum/thread/823132/SKI-Wood-Core---What-Kind-"],
  ["S4", "The Ski Monster — Ski construction: a look inside your skis", "https://theskimonster.com/blogs/posts/ski-construction-a-look-inside-your-skis"],
  ["S5", "ForestSource — Paulownia properties and price", "https://forestsource.io/species/paulownia"],
  ["S6", "Newschoolers forum — ON3P on bamboo vs paulownia cores", "https://www.newschoolers.com/forum/thread/925528/Custom-on3p-Jeffrey-102-is-this-the-ultimate-ski-"],
  ["S7", "Carvers.it — Titanal composition", "https://www.carvers.it/?p=1495"],
  ["S8", "Unofficial Networks — What exactly is Titanal?", "https://unofficialnetworks.com/2019/12/22/what-exactly-is-titanal-a-look-at-the-metal-that-powers-the-ski-industry/"],
  ["S9", "Blister Review — reader discussion of Titanal bonding vs 7068/7075", "https://blisterreview.com/?p=135293"],
  ["S10", "Zoro — 7075-T6 aluminum sheet, 0.04\" × 4 ft × 4 ft", "https://www.zoro.com/zoro-select-aluminum-sheet-7075-4-ft-overall-l-106114848/i/G802646755/"],
  ["S11", "Fiberglass Supply — 20 oz warp triaxial E-glass, 50\"", "https://fiberglasssupply.com/20oz-warp-triaxial-e-glass-50-wide/"],
  ["S12", "Noah's Marine — 22 oz triaxial (page also lists the West System vacuum bagging kit)", "https://noahsmarine.com/en-us/products/22-oz-triaxial-0-45-50"],
  ["S13", "US Composites — carbon fiber fabrics", "https://uscomposites.com/carbonpage.html"],
  ["S14", "Fibre Glast — 6K 2x2 twill carbon fabric", "https://www.fibreglast.com/product/1073_6K_Carbon"],
  ["S15", "Rossignol — Experience 82 Basalt (paulownia core, basalt layers)", "https://www.rossignol.com/gr/rakfs03-000.html"],
  ["S16", "Venom Carbon — basalt twill fabric, 50\"", "https://reach.dog/shop/venom-carbon/products/50-wide-x-36-twill-weave-oz-1"],
  ["S17", "Fiberglass Supply — Kevlar fabrics", "https://fiberglasssupply.com/reinforcements/kevlar-fabrics/"],
  ["S18", "Backcountry.com — Ski construction explained (aramid)", "https://www.backcountry.com/explore/ski-construction-explained-performance"],
  ["S19", "Rock West Composites — flax 2x2 twill, 50\"", "https://www.rockwestcomposites.com/13055-d-group.html"],
  ["S20", "Composite Envisions — flax unidirectional fabric", "https://compositeenvisions.com/?p=4716"],
  ["S21", "Crown Plastics DuraSurf base grades (UL Prospector)", "https://betaplastics.ulprospector.com/plastics/ja/generics/27/materials/4840"],
  ["S22", "Burton — Sintered vs extruded bases", "https://www.burton.com/blogs/the-burton-blog/sintered-vs-extruded"],
  ["S23", "Wagner Custom Skis — Base materials and steel edges", "https://shop.wagnerskis.com/blogs/journal/wagner-factory-tour-base-materials-steel-edges"],
  ["S24", "Wagner Custom Skis — What's inside custom skis", "https://wagnerskis.com/pages/whats-inside"],
  ["S25", "Sun Valley Ski Tools — ski edge material spec", "https://www.svst.com/Ski-Edge-Materal-1Ft-Pr_2"],
  ["S26", "Race-Werks — edge material and waxing iron prices", "https://race-werks.com/wax/?page=13"],
  ["S27", "Jan's — Alpine ski anatomy", "https://www.jans.com/alpine-ski-anatomy"],
  ["S28", "Holuta Ski Design blog — layer prep (VDS rubber, triax)", "https://holuta-ski-design.blogspot.com/2012/07"],
  ["S29", "Newschoolers forum — phenol sidewalls and foam cores", "https://newschoolers.com/forum/thread/877092/Are-there-any-soft-flexing-fiber-reinforced-polymers-that-could-replace-wood-as-a-skis-core-but-still-be-flexible-and-dampening-"],
  ["S30", "Fiberglass Supply — Resin Research epoxy kits", "https://fiberglasssupply.com/epoxy/resin-research-epoxy/?page=2"],
  ["S31", "Sendy — Ski construction materials", "https://sendy.io/blog/ski-construction-materials-used-impact-weight-flex-durability"],
  ["S32", "LatestCost — Poplar lumber cost per board foot (2026)", "https://latestcost.com/poplar-lumber-cost-per-board-foot/"],
  ["S33", "Ski Essentials — 2025 Völkl Mantra 88 review", "https://www.skiessentials.com/2025-ski-test/skis/2025-volkl-mantra-88"],
  ["S34", "Newschoolers forum — Making your own skis (~$200/pair; press vs vacuum bag)", "https://newschoolers.com/forum/thread/735175/Making-your-own-skis"],
  ["S35", "Boardworld forum — sourcing edge steel", "https://boardworld.com.au/forums/viewthread/27249"],
  ["S36", "Moment Skis — materials (DuraSurf 4001, carbon)", "https://momentskis.com/pages/materials-for-the-best-ski-experience"],
  ["S37", "Glamorwood — Paulownia wood limits (dents, screw grip)", "https://glamorwood.com/types-of-wood/softwood/paulownia-wood/"],
  ["S38", "Skiis & Biikes — Völkl Mantra 88 specs (P-Tex 2100, rocker-camber-rocker)", "https://skiisandbiikes.com/products/volkl-mantra-88-ski-2025"],
  ["S39", "Renoun via SkiTalk — How are skis made (VDS rubber, sidewall, topsheet)", "https://www.skitalk.com/ams/renoun-how-are-skis-made.231/?full=1"],
  ["S40", "Fischer — Alpine technical manual (base types)", "https://members.snowsports.org/wp-content/uploads/2020/12/Fischer-alpine-technical-manual-2020-2021.pdf"],
  ["S42", "evo — Edge bevel guide for skis", "https://www.evo.com/guides/ski-edge-bevel"],
  ["S43", "The Race Place — BEAST Pro ski tuning kit", "https://www.the-raceplace.com/products/beast-pro-ski-tuning-kit"],
  ["S44", "Race-Werks — edge beveling tools", "https://race-werks.com/edge-beveling/?page=2"],
  ["S45", "evo — Swix sidewall cutter", "https://www.evo.com/tools/swix-sidewall-cutter"],
  ["S46", "EngineerFix — How to build a ski press", "https://engineerfix.com/how-to-build-a-ski-press-for-custom-ski-fabrication/"],
  ["S47", "Holuta Ski Design blog — press build with lay-flat hose bladders", "https://holuta-ski-design.blogspot.com/2015/10"],
  ["S48", "PowderGuide — Ski workshop: building your own freeride ski", "https://powderguide.com/en/magazine/equipment/skiworkshop-freeride-ski-in-own-part-ii"],
  ["S49", "Jan's — Ski camber and rocker explained", "https://jans.com/ski-camber-and-rocker-explained"],
  ["S50", "Willi's Ski & Board — Camber, rocker and everything in between", "https://www.willisskiandboard.com/blogs/news/ski-construction-explained-camber-rocker-and-everything-in-between"],
].map(([id, title, url]) => [id, { id, title, url }]));

export const GUIDE = {
  purpose: "Deciding which materials to use to make my own skis, how to press them, which profile to build, and how to tune the edges afterward. Prices are approximate as of Oct 2026.",
  scales: [
    ["Ease to obtain", "Any lumberyard or big online supplier, no minimum order", "Sold only to ski manufacturers"],
    ["Ease of use: building", "Simple hand tools, forgiving of mistakes", "Needs special processes, tooling or surface treatment"],
    ["Ease of use: skiing / upkeep", "Forgiving to ski on, or low maintenance", "Demanding to ski, or needs frequent care"],
    ["Overall ease", "Average of the three ratings (calculated)", ""],
  ],
  tiers: [["$", "Under ~$30"], ["$$", "~$30–80"], ["$$$", "~$80–150"], ["$$$$", "Over ~$150, or not sold retail"]],
  notes: [
    "\"(est.)\" means no sourced figure was found. Treat it as a ballpark.",
    "Ratings are judgment calls based on the sources, not lab measurements. Wood densities come from a user-posted list (S3) and are approximate.",
  ],
};

// The sheet's own picks and notes, used as the starting point until you change them here.
export const SHEET_PICKS = Object.fromEntries(MATERIALS.map((m) => [m.id, m.pick]));
export const SHEET_NOTES = Object.fromEntries(MATERIALS.filter((m) => m.note).map((m) => [m.id, m.note]));
