// 2026/27 skis from this season's tests and reviews, the "top skis" picks by category, and a
// DIY recipe per category that turns what the top picks share into settings for the Design tab.
//
// Ratings use the same six 1–5 attributes as the planning sheet so every ski can be compared
// with your picks and your design. For skis in the Ski Essentials 2027 test they come from the
// testers' average scores (0–10):
//   edge = 1 + 0.4 × Edge Grip        damping = 1 + 0.4 × Stability
//   pop  = 1 + 0.4 × average of Quickness and Playfulness
//   lightness from weight scaled to 177 cm (the scale the sheet's own ratings follow)
//   glide from the base, durability from metal, edge size and sidewalls.
// Skis without tester scores have hand estimates from their construction and the review text,
// marked est. Everything here is a starting point for comparison, not a lab measurement.

export const SOURCES_2027 = {
  SE: { title: "Ski Essentials 2027 Ski Test (tester scores and specs)", url: "https://www.skiessentials.com/2027-ski-test/category/mens" },
  FSF: { title: "Freeskier: The Best Frontside Skis of 2027 (Sep 2026)", url: "https://www.freeskier.com/the-best-fronside-skis-of-2027" },
  FSP: { title: "Freeskier: The Best All-Mountain Playful Skis of 2027 (Sep 2026)", url: "https://www.freeskier.com/best-of-all-mountain-playful" },
  FSC: { title: "Freeskier: The Best All-Mountain Charger Skis of 2027 (Sep 2026)", url: "https://www.freeskier.com/the-best-all-mountain-chargers-of-2027" },
  FSK: { title: "Freeskier: The Best Park Skis of 2026", url: "https://www.freeskier.com/best-of-park-skis-for-2026" },
  PWF: { title: "POWDER: The Best Freeride Skis of 2027 (Oct 2026)", url: "https://www.powder.com/gear/the-best-freeride-skis-of-2027" },
  PWP: { title: "POWDER: The Best Powder Skis of 2027 (Oct 2026)", url: "https://www.powder.com/gear/best-powder-skis-of-2027" },
  PWA: { title: "POWDER: The Best All-Mountain Skis of 2027 (Oct 2026)", url: "https://www.powder.com/gear/the-best-all-mountain-skis-of-2027" },
  NSA: { title: "Newschoolers Best of Test: All-Mountain Skis 26/27", url: "https://www.newschoolers.com/news/best-of-test-newschoolers-gear-week-our-favourite-all-mountain-skis-for-26-27.54164/" },
  CSK: { title: "Clever Skier: Best Park Skis of 2026 (Aug 2026)", url: "https://cleverskier.com/best-park-skis/" },
  P7C: { title: "Powder7: The 10 Best Men's Carving Skis of 2027", url: "https://www.powder7.com/best-mens-carving-skis/guide" },
};

const SE = (slug) => `https://www.skiessentials.com/2027-ski-test/skis/2027-${slug}`;
// tests: Ski Essentials averages {float, stab, quick, play, forg, edge, vers, overall}, n = testers.
// metal: "none" | "plate" (small plate underfoot) | "strip" (narrow beam / thin partial layer) | "partial" | "1" | "2" | "3" sheets.
const RAW = [
  // ---- carving & hardpack
  { model: "Blizzard Firebird HRC", category: "Race / carver", dims: [121, 69, 102, 175], radius: "15 m", weight: null, woods: ["poplar", "beech"], core: "Poplar/beech race core (Trueblend Race)", metal: "3", metalText: "three titanal laminates", glass: true, carbon: false, flax: false, profile: "Full camber, no taper", base: "race", edges: null, sidewall: null, extra: "race plate",
    tests: { float: 3.6, stab: 9.0, quick: 8.0, play: 6.1, forg: 5.4, edge: 9.4, vers: 5.3, overall: 9.3 }, n: 8, src: SE("blizzard-firebird-hrc"),
    praise: ["Rips down hard pack like it has claws", "Very balanced"], crit: ["Not very forgiving", "Struggles on refrozen, uneven snow"],
    keys: ["Poplar/beech race core under three titanal laminates: edge grip 9.4/10, the highest here", "Full camber and no taper, so the whole edge engages from tip to tail", "Short 15 m radius on a narrow 69 mm waist, plus a race base and plate"] },
  { model: "Stöckli Montero AX", category: "Frontside carver", dims: [123, 80, 112, 173], radius: "15.5 m", weight: null, woods: ["poplar", "beech"], core: "Poplar/beech core with stringers", metal: "2", metalText: "two full titanal sheets", glass: true, carbon: false, flax: false, profile: "Rocker/camber/rocker", base: "sintered", awards: ["P7C"],
    tests: { float: 5.5, stab: 9.3, quick: 7.7, play: 5.8, forg: 6.5, edge: 9.0, vers: 7.5, overall: 8.8 }, n: 10, src: SE("stockli-montero-ax"),
    praise: ["Quiet, stable, fast, and holds a perfect edge", "Snappy, with Stöckli's dampness and stability"], crit: ["Takes work to start short turns", "Bogs down in bumps and soft snow"],
    keys: ["Two full titanal sheets over a poplar/beech core with stringers: stability 9.3/10, the highest here", "A little tip and tail rocker eases turn entry without giving up grip", "80 mm waist and 15.5 m radius: carves hard but still handles chopped-up groomers"] },
  { model: "Kästle MX74", category: "Frontside carver", dims: [123, 74, 103, 178], radius: "16.9 m", weight: [1730, 171], woods: ["poplar", "beech"], core: "Poplar/beech core", metal: "2", metalText: "two titanal layers", glass: true, carbon: false, flax: false, profile: "Mostly camber, light tip rocker", base: "sintered", extra: "HollowTech tips (hollowed shovel)", awards: ["P7C"],
    tests: { float: 4.4, stab: 8.7, quick: 8.4, play: 6.8, forg: 6.3, edge: 8.8, vers: 6.1, overall: 8.3 }, n: 9, src: SE("kastle-mx74"),
    praise: ["Great edge grip; stiff but not too stiff", "Powerful carving that's still forgiving"], crit: ["Can feel heavy in bumps"],
    keys: ["Poplar/beech core with two titanal layers for grip (8.8/10)", "HollowTech tips: a hollowed-out shovel cuts tip weight and chatter, so it's quick (8.4) for a metal ski", "Mostly camber at 74 mm with a 16.9 m radius"] },
  { model: "Kästle MX84", category: "Frontside carver", dims: [127, 84, 113, 169], radius: "16.3 m @176", weight: [1940, 176], woods: ["poplar", "beech"], core: "Poplar/beech InfiniCore with stringers", metal: "2", metalText: "two titanal laminates", glass: null, carbon: false, flax: false, profile: "Rocker/camber", base: "sintered", extra: "Hollowtech Evo shovel",
    tests: { float: 5.6, stab: 8.6, quick: 8.1, play: 6.9, forg: 6.5, edge: 8.8, vers: 6.9, overall: 8.6 }, n: 26, src: SE("kastle-mx84"),
    praise: ["One of the best wider carvers on the market", "A frontside rocket"], crit: ["Not very forgiving of mistakes", "A bit heavy"],
    keys: ["Two titanal laminates over a poplar/beech core with stringers: edge 8.8/10 from 26 testers", "Hollowtech Evo shovel keeps the tip light and calm", "84 mm waist: the widest true carver here"] },
  { model: "Völkl Peregrine 82", category: "Frontside carver", dims: [128, 82, 111, 177], radius: "~15 m (3 radii)", weight: [1990, 177], woods: ["poplar", "beech"], core: "Poplar/beech core", metal: "1", metalText: "titanal", glass: true, carbon: true, flax: false, profile: "Rocker/camber/rocker", base: "race", extra: "3D Glass, carbon tips, integrated binding", awards: ["P7C"],
    tests: { float: 5.7, stab: 8.4, quick: 8.2, play: 7.4, forg: 7.1, edge: 8.4, vers: 6.9, overall: 8.6 }, n: 11, src: SE("volkl-peregrine-82"),
    praise: ["Makes carving feel easy and fun", "Edge to edge on hard pack, absolutely exceptional"], crit: ["Slow to engage"],
    keys: ["Titanal plus Völkl's 3D Glass and carbon tips over poplar/beech", "Three-radius sidecut (about 15 m in the middle): short or long turns on demand", "The most forgiving top carver here (7.1) with 8.4 edge grip"] },
  { model: "Rossignol Hero MT Ti CAM", category: "Frontside carver", dims: [128, 73, 111, 178], radius: "15 m", weight: null, woods: ["poplar"], core: "Poplar core", metal: "1", metalText: "titanal beam", glass: true, carbon: true, flax: false, profile: "Minimal tip rocker, heavy camber", base: "sintered",
    tests: { float: 5.0, stab: 7.9, quick: 8.1, play: 7.1, forg: 7.0, edge: 8.3, vers: 6.4, overall: 8.1 }, n: 7, src: SE("rossignol-hero-mt-ti-cam"),
    praise: ["Holds immensely well on icy surfaces", "More forgiving than a beer-league GS ski"], crit: ["Soft tip, very stiff tail", "Hard for lower-level skiers to bend"] },
  { model: "Stöckli Laser SX", category: "Frontside carver", dims: [122, 74, 103, 172], radius: "15.9 m", weight: null, woods: ["poplar", "beech"], core: "Poplar/beech core", metal: "2", metalText: "two titanal sheets", glass: true, carbon: false, flax: false, profile: "Mostly camber, slight rocker", base: "sintered",
    tests: { float: 1.7, stab: 7.0, quick: 9.0, play: 6.7, forg: 7.0, edge: 8.0, vers: 5.0, overall: 8.0 }, n: 3, src: SE("stockli-laser-sx"),
    praise: ["Absolute missiles, great turn-shape variety", "Rips short to mid-radius arcs"], crit: ["Wanted more stiffness at speed"] },

  // ---- all-mountain and playful all-mountain
  { model: "Elan Ripstick 88 Black Edition", category: "All-mountain (playful)", dims: [127, 88, 106, 182], radius: "15.8 m", weight: [1600, 182], woods: ["karuba"], core: "Light wood core with four carbon rods (Quadrod)", metal: "none", metalText: "no metal", glass: null, carbon: true, flax: true, profile: "Rocker/camber/rocker", base: "race", awards: ["FSF"],
    tests: { float: 6.4, stab: 7.9, quick: 8.6, play: 8.0, forg: 7.9, edge: 7.8, vers: 7.9, overall: 8.2 }, n: 15, src: SE("elan-ripstick-88-black-edition"),
    praise: ["Snappy and energetic carving machine (Freeskier)", "A super fun ski"], crit: ["The tip can chatter at high speed", "Has a speed limit"],
    keys: ["Four carbon rods in a light wood core, plus extra carbon: stiff and snappy at only 1,600 g at 182 cm", "Flax in the layup takes the buzz out of the carbon", "Race-structured base, rocker/camber/rocker and a 15.8 m radius"] },
  { model: "Faction Dancer 89", category: "All-mountain (playful)", dims: [126, 89, 115, 179], radius: "18 m", weight: [1750, 179], woods: ["poplar"], core: "Poplar core", metal: "none", metalText: "no metal (the Ti version adds titanal)", glass: null, carbon: false, flax: false, profile: "Rocker/camber/rocker", base: "sintered", edges: 2.5,
    tests: { float: 6.0, stab: 7.3, quick: 8.3, play: 8.3, forg: 8.0, edge: 7.0, vers: 8.3, overall: 8.0 }, n: 3, src: SE("faction-dancer-89"),
    praise: ["Wicked fast edge to edge and really snappy", "Light and versatile; a one-ski quiver"], crit: ["Skis short because of the rocker"],
    keys: ["Poplar core with no metal; testers found it more playful than the metal Ti version", "XL 2.5 mm edges, park-ski durability on an all-mountain shape", "18 m radius with rocker/camber/rocker: quick (8.3) and very versatile (8.3)"] },
  { model: "Dynastar M-Free 94", category: "All-mountain (playful)", dims: [124, 94, 118, 179], radius: "17 m", weight: [1700, 179], woods: ["poplar"], core: "Hybrid 2.0: three poplar laminates with PU sidewalls", metal: "plate", metalText: "small metal plate underfoot", glass: true, carbon: false, flax: false, profile: "Rocker/camber/rocker, twin", twin: true, base: "sintered", awards: ["NSA", "FSF"],
    tests: { float: 7.4, stab: 7.2, quick: 8.6, play: 8.2, forg: 7.8, edge: 7.0, vers: 7.6, overall: 8.2 }, n: 5, src: SE("dynastar-m-free-94"),
    praise: ["Fun and forgiving, still lays down an edge", "Easy to turn but not squirrelly"], crit: ["Less bite on groomers than the M-Free 100"],
    keys: ["Hybrid core: three poplar layers with polyurethane sidewalls, 1,700 g at 179 cm and smooth", "Only a small metal plate underfoot for binding hold, no full sheet", "Twin rocker/camber/rocker at 17 m: quickness 8.6/10"] },
  { model: "Dynastar M-Free 100", category: "All-mountain (playful)", dims: [130, 100, 122, 178], radius: "17 m", weight: null, woods: ["poplar"], core: "Hybrid 2.0 poplar core with PU sidewalls", metal: "none", metalText: "metal-free", glass: true, carbon: false, flax: false, profile: "Rocker/camber/rocker, twin", twin: true, base: "sintered", awards: ["FSP"],
    tests: { float: 7.4, stab: 7.0, quick: 7.4, play: 7.3, forg: 6.8, edge: 6.8, vers: 7.1, overall: 7.4 }, n: 12, src: SE("dynastar-m-free-100"),
    praise: ["Can carve, smear, do just about anything", "Smooth and damp but a ton of energy"], crit: ["The early-rise tail felt off to one tester"] },
  { model: "Blizzard Canvas 100", category: "All-mountain (playful)", dims: [132, 100, 120, 180], radius: "17.5 m", weight: [1800, 180], woods: ["poplar", "paulownia"], core: "Poplar/paulownia core", metal: "strip", metalText: "a narrow central metal beam", glass: null, carbon: false, flax: false, profile: "Rocker/camber/rocker, twin", twin: true, base: "sintered", awards: ["FSP"],
    tests: { float: 7.7, stab: 6.5, quick: 8.1, play: 8.9, forg: 8.3, edge: 7.1, vers: 8.1, overall: 8.5 }, n: 8, src: SE("blizzard-canvas-100"),
    praise: ["Powder, groomers, trees, jumps and rails", "An easy one-ski quiver for many"], crit: ["Not enough oomph at speed", "Not a charger"],
    keys: ["Poplar/paulownia core: paulownia is very light, poplar keeps the flex lively", "A narrow metal beam down the center instead of full sheets, for damping and torsion without a stiff flex", "Twin rocker/camber/rocker at 17.5 m: playfulness 8.9 and forgiveness 8.3"] },
  { model: "Atomic Maverick 88 CTi", category: "All-mountain", dims: [125, 88.5, 110, 179], radius: "16.5 m", weight: [1770, 179], woods: ["poplar", "ash"], core: "Poplar/ash core", metal: "1", metalText: "titanal", glass: true, carbon: true, flax: false, profile: "Rocker/camber/rocker", base: "sintered", extra: "HRZN tips",
    tests: { float: 6.6, stab: 7.4, quick: 7.6, play: 6.9, forg: 6.9, edge: 7.5, vers: 7.4, overall: 7.3 }, n: 7, src: SE("atomic-maverick-88-cti"),
    praise: ["One of the best soft-snow skis under 90 mm", "A good one-ski quiver"], crit: ["Chatter in the shovel", "Wants less taper for precision"] },
  { model: "Völkl M7 Mantra", category: "All-mountain", dims: [139, 96, 121, 177], radius: "16.8 m (multi-radius)", weight: [2090, 177], woods: ["poplar", "beech"], core: "Poplar center, beech outer core", metal: "2", metalText: "full titanal sheet below, three-piece titanal on top", glass: null, carbon: true, flax: false, profile: "Rocker/camber/rocker", base: "sintered", awards: ["FSF"],
    tests: { float: 7.1, stab: 8.8, quick: 7.8, play: 6.4, forg: 6.5, edge: 8.5, vers: 7.3, overall: 8.1 }, n: 8, src: SE("volkl-m7-mantra"),
    praise: ["Great on and off piste", "Never disappoints on a groomer"], crit: ["Demanding when the terrain gets weird", "Skis a bit long"] },
  { model: "K2 Mindbender 96", category: "All-mountain", dims: [135, 96, 123, 183], radius: "20 m", weight: [1900, 183], woods: ["aspen", "paulownia"], core: "Aspen/paulownia core", metal: "2", metalText: "two titanal I-beams", glass: null, carbon: false, flax: false, profile: "Rocker/camber/rocker", base: "sintered", extra: "Dark Matter Damping", awards: ["FSF", "PWA"],
    tests: { float: 6.9, stab: 7.9, quick: 7.1, play: 6.9, forg: 6.6, edge: 7.5, vers: 8.1, overall: 8.0 }, n: 7, src: SE("k2-mindbender-96"),
    praise: ["Incredibly damp at speed, yet snappy enough to slash between trees (POWDER)", "Super stable; goes through anything"], crit: ["Average at everything to one tester", "A lot for an intermediate"],
    keys: ["Light aspen/paulownia core with two titanal I-beams: the metal runs down the middle, so the ski stays light", "Dark Matter Damping: TPU blocks packed with powdered stainless steel soak up vibration (POWDER)", "Rocker/camber/rocker at 96 mm and 20 m: versatility 8.1/10"] },
  { model: "Head Kore 94 Ti", category: "All-mountain", dims: [131, 94, 116, 177], radius: "16.3 m", weight: null, woods: ["karuba", "beech"], core: "Karuba/beech core with graphene strip", metal: "2", metalText: "two titanal sheets that stop short of the tips", glass: null, carbon: false, flax: false, extra: "flax topsheet", profile: "Rocker/camber/rocker", base: "sintered",
    tests: { float: 7.0, stab: 8.1, quick: 7.4, play: 7.1, forg: 7.9, edge: 7.9, vers: 8.2, overall: 7.9 }, n: 7, src: SE("head-kore-94-ti"),
    praise: ["So well-rounded it's hard to name its best condition", "The metal adds smoothness"], crit: ["Not a lot of energy", "Bogs down in really deep snow"] },
  { model: "Nordica Enforcer 94", category: "All-mountain", dims: [128.5, 94, 116.5, 185], radius: "18 m", weight: null, woods: ["poplar", "beech"], core: "Poplar/beech core with Pulse Core elastomer underfoot", metal: "2", metalText: "two full titanal layers", glass: null, carbon: false, flax: false, profile: "Rocker/camber/rocker", base: "sintered",
    tests: { float: 6.8, stab: 8.7, quick: 7.3, play: 6.8, forg: 6.9, edge: 8.5, vers: 8.1, overall: 8.2 }, n: 12, src: SE("nordica-enforcer-94"),
    praise: ["As much power, grip and eagerness to carve as anything", "Stable and confidence-inspiring"], crit: ["Hefty and stiff; takes work to maneuver", "Not very playful"],
    keys: ["Two full titanal layers over poplar/beech: stability 8.7 and edge 8.5", "An elastomer layer underfoot (Pulse Core) damps vibration where you stand", "Rocker/camber/rocker at 94 mm, 18 m: versatile (8.1) without going soft"] },
  { model: "Blizzard Anomaly 94", category: "All-mountain", dims: [132.5, 94, 114.5, 182], radius: "17 m", weight: [2150, 182], woods: ["poplar", "beech"], core: "Poplar/beech core (Trueblend)", metal: "2", metalText: "two titanal sheets, the top one split in three", glass: null, carbon: false, flax: false, profile: "Rocker/camber/rocker", base: "sintered",
    tests: { float: 7.0, stab: 8.0, quick: 7.75, play: 6.5, forg: 7.0, edge: 7.5, vers: 7.5, overall: 7.75 }, n: 4, src: SE("blizzard-anomaly-94"),
    praise: ["Carves incredibly well for a 94"], crit: ["Heavy on the foot", "Not much turn-shape variety"] },
  { model: "Armada AntiMatter 92", category: "All-mountain", dims: [132, 92, 118, 180], radius: "17.5 m", weight: [2000, 180], woods: ["poplar"], core: "Poplar core", metal: "1", metalText: "one titanal sheet tip to tail (Speed Metal)", glass: null, carbon: false, flax: false, profile: "Rocker/camber/rocker", base: "sintered",
    tests: { float: 6.1, stab: 7.6, quick: 7.5, play: 7.7, forg: 7.5, edge: 7.8, vers: 7.6, overall: 8.6 }, n: 13, src: SE("armada-antimatter-92"),
    praise: ["So versatile and intuitive", "Hooks into a turn instantly"], crit: ["Less playful than the Declivity it replaces"],
    keys: ["One titanal sheet tip to tail over a poplar core: metal's grip without a two-sheet ski's weight", "17.5 m radius and rocker/camber/rocker: 'hooks into a turn instantly'", "Overall 8.6/10 from 13 testers"] },

  // ---- park & freestyle
  { model: "Line Chronic 94", category: "Park / freestyle", dims: [123, 94, 117, 178], radius: "16.3 m", weight: [1920, 178], woods: ["aspen"], core: "Aspen veneer core", metal: "none", metalText: "no metal", glass: true, carbon: false, flax: false, profile: "Rocker/camber/rocker, twin", twin: true, base: "sintered", edges: 2.5, extra: "Thin Tip (wood removed from the last cm of each end)",
    tests: { float: 8.5, stab: 7.0, quick: 9.0, play: 8.5, forg: 8.0, edge: 7.0, vers: 9.0, overall: 8.5 }, n: 2, src: SE("line-chronic-94"),
    praise: ["A park ski that wants to make the whole mountain a park", "Glides effortlessly and holds a strong edge"], crit: ["Less edge hold when it gets firm", "Not light"],
    keys: ["Aspen veneer core: light wood with a consistent flex", "Thicker edges, plus Thin Tip: wood shaved out of the last centimeter of each end to cut swing weight", "Twin rocker/camber/rocker at 16.3 m: quickness 9 and versatility 9 (2 testers)"] },
  { model: "Line Blend", category: "Park / freestyle", dims: [129, 98, 120, 180], radius: "20 m (5-Cut)", weight: [1990, 180], woods: ["aspen"], core: "Aspen core", metal: "none", metalText: "no metal", glass: true, carbon: true, flax: false, profile: "Symmetric 4 mm rocker / 4 mm camber / 4 mm rocker", twin: true, base: "sintered", edges: 2.5, sidewall: "strong", extra: "Carbon Ollieband, Fatty Edge 2.5 × 2.2 mm", awards: ["CSK"],
    tests: { float: 6.0, stab: 4.5, quick: 8.0, play: 9.5, forg: 7.5, edge: 6.0, vers: 6.0, overall: 7.5 }, n: 2, src: SE("line-blend"),
    praise: ["Smooth and fun", "At home smearing turns, wiggling through moguls and jibbing"], crit: ["Not much support for hard charging"],
    keys: ["Aspen core with a Carbon Ollieband: carbon strips that add snap for ollies and presses", "Symmetric 4 mm rocker, 4 mm camber, 4 mm rocker; 2.5 × 2.2 mm Fatty Edges", "Soft, round flex for butters: playfulness 9.5/10 (2 testers)"] },
  { model: "Line Honey Badger", category: "Park / freestyle", dims: [120, 92, 116, 177], radius: "19.5 m", weight: [1661, 177], woods: ["aspen"], core: "Aspen veneer core", metal: "none", metalText: "no metal", glass: true, carbon: true, flax: false, profile: "Rocker/camber/rocker, symmetric twin", twin: true, base: "sintered", extra: "Carbon Ollieband",
    tests: null, n: 0, est: [3.0, 2.6, 4.0, 4.0, null, 3.6], src: SE("line-honey-badger"),
    praise: ["An entry park ski that won't die on you"], crit: [] },
  { model: "K2 Omen Team", category: "Park / freestyle", dims: [125, 95, 119, 184], radius: "18 m @177", weight: null, woods: ["aspen"], core: "Aspen micro-block core", metal: "none", metalText: "no metal", glass: true, carbon: true, flax: false, profile: "Rocker/camber/rocker, twin", twin: true, base: "sintered", sidewall: "strong", extra: "Carbon Boost Braid over triaxial glass, Twin Tech sidewalls", awards: ["FSK"],
    tests: { float: 6.2, stab: 7.0, quick: 7.6, play: 7.6, forg: 7.0, edge: 6.4, vers: 6.6, overall: 7.6 }, n: 5, src: SE("k2-omen-team"),
    praise: ["Inspired the most confidence of all the twin tips", "Easy turn initiation; snappy"], crit: ["Felt flat underfoot", "Skis short when center-mounted"],
    keys: ["Aspen micro-block core with a carbon braid over triaxial glass", "Twin Tech sidewalls built to take impacts", "Twin rocker/camber/rocker: 'the most confidence of all the twin tips'"] },
  { model: "Elan Playmaker 91", category: "Park / freestyle", dims: [122, 91, 116, 180], radius: "18.1 m", weight: [1630, 180], woods: ["poplar", "paulownia"], core: "TubeLite poplar/paulownia core with carbon tubes", metal: "none", metalText: "no metal", glass: true, carbon: true, flax: false, profile: "Surf Rocker (rocker/camber/rocker), directional twin", twin: true, base: "sintered", sidewall: "strong", awards: ["CSK"],
    tests: { float: 6.4, stab: 6.0, quick: 7.8, play: 7.8, forg: 7.4, edge: 5.9, vers: 7.1, overall: 7.4 }, n: 7, src: SE("elan-playmaker-91"),
    praise: ["One of the most agile and maneuverable skis on the market", "Very light and nimble"], crit: ["Squirrelly for one tester"],
    keys: ["TubeLite core: poplar and paulownia with carbon tubes, 1,630 g at 180 cm", "360° sidewalls and a sintered base", "Surf Rocker directional twin: 'one of the most agile and maneuverable skis on the market'"] },
  { model: "Fischer Nightstick 90", category: "Park / freestyle", dims: [117, 90, 115, 177], radius: "18 m", weight: [1720, 177], woods: ["poplar"], core: "Poplar core", metal: "plate", metalText: "titanal plate underfoot", glass: true, carbon: false, flax: false, profile: "Rocker/camber/rocker, near-symmetric twin", twin: true, base: "sintered", sidewall: "strong",
    tests: { float: 4.5, stab: 5.5, quick: 6.5, play: 6.5, forg: 4.5, edge: 6.0, vers: 5.5, overall: 5.5 }, n: 2, src: SE("fischer-nightstick-90"),
    praise: ["Fun, but charging"], crit: ["Turned poorly for one tester"] },
  { model: "Faction Studio 1", category: "Park / freestyle", dims: [120, 90, 120, 178], radius: "19 m", weight: [1630, 178], woods: ["poplar"], core: "Full poplar core", metal: "none", metalText: "no metal", glass: true, carbon: true, flax: false, profile: "Mostly camber, slight tip and tail rocker, symmetric twin", twin: true, base: "sintered", edges: 2.5, sidewall: "strong", extra: "full carbon stringers, carbon/rubber stomp pad", awards: ["CSK"],
    tests: { float: 4.33, stab: 5.67, quick: 8.0, play: 7.33, forg: 6.33, edge: 5.0, vers: 4.0, overall: 6.33 }, n: 3, src: SE("faction-studio-1"),
    praise: ["Smooth and fun; surprisingly capable on piste", "Very playful"], crit: ["Bounces around", "Wants to be skied centered"] },

  // ---- soft snow & freeride
  { model: "Atomic Bent 110", category: "Freeride / powder", dims: [133, 110, 124, 180], radius: "18 m", weight: [1750, 180], woods: ["poplar"], core: "Poplar core", metal: "none", metalText: "no metal", glass: true, carbon: false, flax: false, profile: "Rocker/camber/rocker", base: "sintered", awards: ["PWP"],
    tests: { float: 9.0, stab: 7.2, quick: 8.4, play: 9.2, forg: 7.8, edge: 6.8, vers: 6.8, overall: 8.2 }, n: 5, src: SE("atomic-bent-110"),
    praise: ["Pivots and slashes with the best of them; a ton of pop and rebound on hardpack (POWDER)", "Easy to turn and control"], crit: ["Shaky at higher speeds", "Lacks the guts for all-out charging (POWDER)"],
    keys: ["Poplar core and fiberglass with no metal: 1,750 g at 180 cm, easy to throw around", "Camber underfoot loads up for pop; rockered ends pivot and slash", "Flotation 9.0 and playfulness 9.2/10"] },
  { model: "Atomic Maverick 115 CTi", category: "Freeride / powder", dims: [140.5, 115, 129.5, 185], radius: "18 m", weight: [2150, 193], woods: ["poplar", "ash"], core: "Poplar/ash core with carbon stringers", metal: "partial", metalText: "partial titanal", glass: true, carbon: true, flax: false, profile: "Powder Rocker 30/50/20, lower camber", base: "sintered", awards: ["PWF"],
    tests: { float: 9.0, stab: 7.8, quick: 7.5, play: 7.0, forg: 7.2, edge: 6.8, vers: 5.5, overall: 7.8 }, n: 5, src: SE("atomic-maverick-115-cti"),
    praise: ["Surfy and playful yet solid enough to push", "The maneuverability is insane in trees"], crit: ["A powder ski first"],
    keys: ["Poplar/ash core with carbon stringers and partial titanal: 'a solid backbone' with low swing weight (POWDER)", "Powder Rocker: 30% tip rocker, 50% camber, 20% tail rocker, with lower camber, so it planes easily (flotation 9.0)", "18 m radius at 115 mm keeps it quick in trees"] },
  { model: "Fischer Nothing", category: "Freeride / powder", dims: [145, 112, 135, 196], radius: "22 m @186", weight: [2120, 186], woods: [], core: "Wood core", metal: "1", metalText: "titanal", glass: null, carbon: null, flax: null, profile: "Directional rocker/camber/rocker", base: "sintered", awards: ["PWF"],
    tests: { float: 8.2, stab: 7.4, quick: 7.4, play: 7.8, forg: 7.4, edge: 6.8, vers: 6.4, overall: 8.4 }, n: 5, src: SE("fischer-nothing"),
    praise: ["Super playful and fun freeride ski", "Stability at speed is its most appealing trait (POWDER)"], crit: ["On-trail skiing isn't its strong suit"],
    keys: ["Wood core with titanal: stability at speed is its best trait (POWDER)", "Directional rocker with a long 22 m radius", "Still 'super playful' to testers (7.8) with an 8.4 overall"] },
  { model: "Blizzard Canvas 118", category: "Freeride / powder", dims: [145, 118, 134, 180], radius: "19 m", weight: [1920, 180], woods: ["poplar", "paulownia"], core: "Poplar/paulownia core", metal: "strip", metalText: "thin partial metal damping layer", glass: null, carbon: false, flax: false, profile: "Rocker/camber/rocker, long rockered tails", twin: true, base: "sintered", awards: ["PWP"],
    tests: null, n: 0, est: [3.0, 3.3, 3.8, 4.0, null, 3.6], src: SE("blizzard-canvas-118"),
    praise: ["Pretty much unsinkable, even in light, low-density snow (POWDER)", "Extremely easy to ski"], crit: ["Not versatile"],
    keys: ["Poplar/paulownia core with only a thin partial metal layer for damping", "Long rockered tails and camber underfoot: 'pretty much unsinkable' (POWDER)", "Twin shape and 19 m radius: shifty and smeary"] },
  { model: "Armada AntiMatter 114", category: "Freeride / powder", dims: [138, 114, 132, 187], radius: "21 m", weight: [2100, 187], woods: [], core: "Wood core", metal: "1", metalText: "AntiMatter metal laminate", glass: null, carbon: null, flax: null, profile: "Directional twin rocker, camber underfoot", twin: true, base: "sintered", awards: ["PWF"],
    tests: null, n: 0, est: [3.6, 4.2, 3.2, 4.0, null, 3.9], src: SOURCES_2027.PWF.url,
    praise: ["Super stable when it got rough, and floated nicely despite not much tip splay (POWDER)"], crit: [],
    keys: ["A metal laminate for a stability-first feel: 'super stable when it got rough'", "Directional twin rocker with camber underfoot", "Floats well despite modest tip splay; 21 m radius"] },
  { model: "Salomon QST Blank", category: "Freeride / powder", dims: [140, 108, 128, 186], radius: "19 m", weight: [1870, 186], woods: ["poplar"], core: "Updated QST construction", metal: "none", metalText: "no metal published", glass: null, carbon: null, flax: null, profile: "Directional rocker, camber underfoot", base: "sintered", awards: ["PWF"],
    tests: null, n: 0, est: [3.4, 3.8, 3.6, 4.0, null, 3.6], src: SOURCES_2027.PWF.url,
    praise: ["The ski for freeride skiers who want a reliable tool for all terrain (POWDER)", "A soft flex that felt surprisingly stable and powerful at speed"], crit: [] },
  { model: "Line Bacon 115", category: "Freeride / powder", dims: [148, 115, 143, 188], radius: "18.4 m", weight: [2340, 188], woods: ["aspen", "maple"], core: "Aspen/maple core", metal: "none", metalText: "no metal", glass: true, carbon: false, flax: false, profile: "Rocker/camber/rocker, twin", twin: true, base: "sintered", sidewall: "strong",
    tests: null, n: 0, est: [3.0, 3.6, 3.4, 4.0, null, 4.0], src: SE("line-bacon-115"),
    praise: ["Fun-loving and supremely floaty", "Strong, predictable feel"], crit: ["Hefty for a powder ski"] },
  { model: "DPS Lotus 117", category: "Freeride / powder", dims: [140, 117, 127, 185], radius: "21 m", weight: [1950, 185], woods: ["poplar"], core: "Poplar core with dual carbon laminates", metal: "plate", metalText: "binding retention plate", glass: null, carbon: true, flax: false, profile: "55% camber, 45% rocker", base: "race",
    tests: null, n: 0, est: [3.2, 3.0, 3.8, null, null, 3.5], src: SE("dps-lotus-117"),
    praise: ["Easy slashing, with high-speed capacity"], crit: ["A specialty ski"] },
];

// ---- derived ratings
const clamp = (x, lo = 1, hi = 5) => Math.min(hi, Math.max(lo, x));
const r1 = (x) => Math.round(x * 10) / 10;
const METAL_SHEETS = { "1": 1, "2": 2, "3": 3 };
function lightnessOf(m) {
  if (m.weight) return r1(clamp(4.3 - (m.weight[0] * 177 / m.weight[1] - 1620) * 0.0055));
  return { none: 3.8, plate: 3.6, strip: 3.4, partial: 3.0, "1": 2.8, "2": 2.2, "3": 1.8 }[m.metal] ?? 3;
}
const glideOf = (m) => (m.base === "race" ? 4.5 : m.base === "sintered" ? 4.0 : 3.8);
function durabilityOf(m) {
  let d = 3.5;
  if (METAL_SHEETS[m.metal]) d += 0.4;
  if (m.edges >= 2.5) d += 0.5;
  if (m.sidewall === "strong") d += 0.3;
  return r1(Math.min(4.6, d));
}
function ratingsOf(m) {
  const derived = [null, null, null, glideOf(m), lightnessOf(m), durabilityOf(m)];
  if (m.tests) {
    const t = m.tests, s = (x) => r1(clamp(1 + 0.4 * x));
    return [s(t.edge), s(t.stab), s((t.quick + t.play) / 2), ...derived.slice(3)];
  }
  return m.est.map((v, i) => v ?? derived[i]);
}
const yn = (v) => (v === true ? "Y" : v === false ? "N" : "?");
const HARD = new Set(["beech", "ash", "maple"]);
function flagsOf(m) {
  const hard = m.woods.length ? (m.woods.some((w) => HARD.has(w)) ? "Y" : "N") : "?";
  // Unlisted fiberglass is assumed, the same convention the planning sheet uses: nearly every ski has it.
  return [m.metal === "none" ? "N" : "Y", m.glass === false ? "N" : "Y", yn(m.carbon), yn(m.flax), hard];
}
function constructionOf(m) {
  const parts = [m.core, m.metalText, m.carbon ? "carbon" : null, m.flax ? "flax" : null, m.glass ? "fiberglass" : m.glass == null ? "(fiberglass assumed)" : null, m.extra, `${m.base === "race" ? "race" : "sintered"} base`, m.weight ? `${m.weight[0].toLocaleString("en-US")} g/ski @${m.weight[1]}` : null];
  return parts.filter(Boolean).join(" · ");
}

// Same shape as the sheet's SKI_MODELS, plus the 2026/27 details.
export const MODELS_2027 = RAW.map((m) => ({
  ...m,
  year: "2026/27",
  waist: String(m.dims[1]),
  dimsText: `${m.dims[0]}/${m.dims[1]}/${m.dims[2]} mm @${m.dims[3]} cm`,
  construction: constructionOf(m),
  ratings: ratingsOf(m),
  estimated: !m.tests,
  flags: flagsOf(m),
  source: m.src,
}));

// 2026/27 test results for skis that are already in the planning sheet's list. Their sheet
// ratings stay as they are; this adds what this season's testers said.
export const SHEET_MODEL_2027 = {
  "Atomic Bent 90": { tests: { float: 6.0, stab: 6.0, quick: 8.0, play: 8.0, forg: 7.0, edge: 6.6, vers: 7.4, overall: 7.0 }, n: 5, src: SE("atomic-bent-90"), awards: ["CSK"],
    weight: [1600, 175], profile: "20% tip rocker / 70% camber / 10% tail rocker", twin: true,
    praise: ["Incredibly mobile and easy to use", "Encourages butters and smears (Clever Skier)"], crit: ["Too light and soft to drive through rough groomers"],
    keys: ["Light poplar core and fiberglass, no metal: 1,600 g at 175 cm", "HRZN tips and tails (a beveled, rounded shape) for float and catch-free ends; 20/70/10 rocker-camber-rocker", "Park-grade edges and a Dura Cap sidewall for rails (Clever Skier)"] },
  "Armada ARV 88": { tests: { float: 6.0, stab: 5.67, quick: 6.33, play: 7.33, forg: 7.0, edge: 6.33, vers: 6.0, overall: 6.67 }, n: 3, src: SE("armada-arv-88"), awards: ["CSK"],
    praise: ["A great park ski", "Quicker edge to edge"], crit: ["Unstable to one tester", "Sluggish tip response"] },
  "Faction Prodigy 1": { tests: null, n: 0, src: SE("faction-prodigy-1"), awards: ["CSK"], profile: "18% tip rocker, 3 mm camber, 14% tail rocker",
    praise: ["Felt like a true park ski: flexible and light", "Strong pop and shock absorption (Clever Skier)"], crit: ["Ice is a challenge"],
    keys: ["Poplar/ash core: ash adds snap and strength under the binding", "XL 2.5 mm edges and a carbon/rubber stomp pad underfoot", "3 mm camber between 18% tip and 14% tail rocker"] },
};

// ---- top skis by category
// Each pick list is ordered by a score from the Ski Essentials tester averages (named in
// `score`), using skis with at least three testers; skis named on this season's editors' lists
// without tester scores follow, marked as editor picks.
export const TOP_CATEGORIES = [
  { key: "pop", name: "Pop & energy", useCase: null, attr: "pop", blurb: "Snappy, lively skis that spring out of turns and off rollers.",
    score: { label: "(quickness + playfulness) / 2", f: (t) => (t.quick + t.play) / 2 },
    picks: ["Atomic Bent 110", "Blizzard Canvas 100", "Dynastar M-Free 94", "Elan Ripstick 88 Black Edition", "Faction Dancer 89"],
    shared: [
      "None of the five has a full metal sheet: at most a narrow center beam (Canvas 100) or a small plate underfoot (M-Free 94).",
      "Light cores: poplar, paulownia, karuba, with carbon rods in the Ripstick for stiffness without weight.",
      "Rocker/camber/rocker with real camber underfoot. The camber is what loads up and springs back.",
      "88–110 mm waists, 16–18 m radii, 1,600–1,800 g.",
    ],
    recipe: {
      core: { text: "60% poplar, 20% ash, 20% paulownia, 10.5 mm underfoot", why: "Light like the picks; the ash adds snap and holds the binding screws", patch: { core: { blend: [{ wood: "poplar", pct: 60 }, { wood: "ash", pct: 20 }, { wood: "paulownia", pct: 20 }], underfootMm: 10.5 } } },
      glass: { text: "Triax glass plus a 200 g/m² carbon UD layer, top and bottom", why: "Carbon stiffens without weight, like the Ripstick's rods", patch: { laminatesTop: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 200, plies: 1 }], laminatesBottom: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 200, plies: 1 }] } },
      metal: { text: "No metal", why: "None of the poppy picks uses a full sheet", patch: { metalTop: { material: "none", thicknessMm: 0.5, coverage: 1 }, metalBottom: { material: "none", thicknessMm: 0.5, coverage: 1 } } },
      profile: { text: "4.5 mm camber, 22 cm tip rocker, 14 cm tail rocker", why: "Camber underfoot is where the spring comes from", patch: { camberMm: 4.5, tipRockerCm: 22, tailRockerCm: 14 } },
      shape: { text: "127 / 89 / 112 mm", why: "Mid-width like the Ripstick 88 and Dancer 89", patch: { tipWidth: 127, waistWidth: 89, tailWidth: 112 } },
      edges: { text: "2.2 × 2 mm edges, ABS sidewalls", why: "Standard; keep weight down", patch: { edges: { widthMm: 2.2, heightMm: 2 }, sidewall: { material: "abs" } } },
      base: { text: "Sintered base, rubber strip on", why: "The rubber costs a little pop but keeps it from chattering", patch: { base: { material: "sintered" }, rubber: { on: true } } },
    } },
  { key: "park", name: "Park & freestyle", useCase: "park", blurb: "Twin tips that butter, land switch and survive rails.",
    score: { label: "(playfulness + quickness + overall) / 3", f: (t) => (t.play + t.quick + t.overall) / 3 },
    minTesters: 2,
    picks: ["Line Chronic 94", "Line Blend", "Atomic Bent 90", "Elan Playmaker 91", "K2 Omen Team"],
    editor: ["Faction Prodigy 1"],
    shared: [
      "All twins with light softwood cores (aspen or poplar) and no metal.",
      "Most add carbon for snap: Line's Ollieband, K2's carbon braid, Elan's carbon tubes.",
      "Tough edges and sidewalls: 2.5 mm edges (Line, Faction) and cap or impact sidewalls (Atomic, K2).",
      "90–98 mm waists, 16–20 m radii, rocker/camber/rocker with fairly even rocker at both ends.",
    ],
    recipe: {
      core: { text: "70% poplar, 30% ash, 10 mm underfoot", why: "Softwood flex for butters; ash for snap and binding hold (as in the Prodigy)", patch: { core: { blend: [{ wood: "poplar", pct: 70 }, { wood: "ash", pct: 30 }], underfootMm: 10 } } },
      glass: { text: "Triax glass plus a 150 g/m² carbon UD band, top and bottom", why: "The Ollieband idea: carbon along the ski for pop", patch: { laminatesTop: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 150, plies: 1 }], laminatesBottom: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 150, plies: 1 }] } },
      metal: { text: "No metal", why: "No park pick runs a metal sheet", patch: { metalTop: { material: "none", thicknessMm: 0.5, coverage: 1 }, metalBottom: { material: "none", thicknessMm: 0.5, coverage: 1 } } },
      profile: { text: "3 mm camber, 28 cm tip rocker, 25 cm tail rocker", why: "Near-even rocker for switch, like the Blend and Omen Team", patch: { camberMm: 3, tipRockerCm: 28, tailRockerCm: 25 } },
      shape: { text: "122 / 90 / 116 mm (nearly symmetric)", why: "A twin shape like the Bent 90 and Studio 1", patch: { tipWidth: 122, waistWidth: 90, tailWidth: 116 } },
      edges: { text: "2.5 × 2.2 mm edges, UHMW sidewalls", why: "Thick edges like Line's Fatty Edge; tough sidewalls for rails", patch: { edges: { widthMm: 2.5, heightMm: 2.2 }, sidewall: { material: "uhmw" } } },
      base: { text: "Sintered base, rubber strip on", why: "Sintered bases hold wax; rubber takes the sting out of landings", patch: { base: { material: "sintered" }, rubber: { on: true } } },
    } },
  { key: "carve", name: "Carving, hardpack & ice", useCase: "east", blurb: "Grip and stability on firm groomers and ice. Also the racing recipe.",
    score: { label: "(edge grip + stability) / 2", f: (t) => (t.edge + t.stab) / 2 },
    picks: ["Blizzard Firebird HRC", "Stöckli Montero AX", "Kästle MX74", "Kästle MX84", "Völkl Peregrine 82"],
    shared: [
      "Two or three sheets of titanal over hardwood-blend cores (poplar with beech).",
      "Mostly camber, with little or no tip rocker. The Firebird is full camber.",
      "69–84 mm waists and 15–17 m radii.",
      "Race or structured bases on the most race-bred ones.",
    ],
    recipe: {
      core: { text: "60% poplar, 40% beech, 11 mm underfoot", why: "The poplar/beech blend every top carver uses", patch: { core: { blend: [{ wood: "poplar", pct: 60 }, { wood: "beech", pct: 40 }], underfootMm: 11 } } },
      glass: { text: "Triax glass top and bottom", why: "Torsional stiffness to go with the metal", patch: { laminatesTop: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }], laminatesBottom: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }] } },
      metal: { text: "0.5 mm 7075 aluminum, full sheets top and bottom", why: "The picks use two titanal sheets. Titanal isn't sold retail, so 7075 is the DIY stand-in", patch: { metalTop: { material: "al7075", thicknessMm: 0.5, coverage: 1 }, metalBottom: { material: "al7075", thicknessMm: 0.5, coverage: 1 } } },
      profile: { text: "5 mm camber, 12 cm tip rocker, no tail rocker", why: "Mostly camber for full edge contact", patch: { camberMm: 5, tipRockerCm: 12, tailRockerCm: 0 } },
      shape: { text: "118 / 76 / 102 mm", why: "In the 69–84 mm range, about a 15 m radius at 177 cm like the picks", patch: { tipWidth: 118, waistWidth: 76, tailWidth: 102 } },
      edges: { text: "2.2 × 2 mm edges, ABS sidewalls", why: "Standard full sidewalls", patch: { edges: { widthMm: 2.2, heightMm: 2 }, sidewall: { material: "abs" } } },
      base: { text: "Graphite (race) base, rubber strip on", why: "Race bases on the Firebird and Peregrine; rubber damps the metal", patch: { base: { material: "graphite" }, rubber: { on: true } } },
    } },
  { key: "mixed", name: "Mixed terrain", useCase: "mixed", blurb: "One ski for groomers, chop, bumps and some soft snow.",
    score: { label: "(versatility + overall) / 2", f: (t) => (t.vers + t.overall) / 2 },
    picks: ["Blizzard Canvas 100", "Nordica Enforcer 94", "Faction Dancer 89", "Armada AntiMatter 92", "K2 Mindbender 96"],
    shared: [
      "89–100 mm waists with rocker/camber/rocker.",
      "Metal kept to the middle of the ski: a center beam (Canvas 100), I-beams (Mindbender 96), one sheet (AntiMatter 92). The Enforcer is the two-full-sheet exception.",
      "That keeps tips and tails soft enough for bumps and soft snow, with grip underfoot.",
      "Damping tricks instead of more weight: an elastomer layer (Enforcer), Dark Matter blocks (Mindbender).",
    ],
    recipe: {
      core: { text: "70% poplar, 30% beech, 10.5 mm underfoot", why: "Poplar flex with some hardwood for grip", patch: { core: { blend: [{ wood: "poplar", pct: 70 }, { wood: "beech", pct: 30 }], underfootMm: 10.5 } } },
      glass: { text: "Triax glass top and bottom", why: "Torsion for edge hold in chop", patch: { laminatesTop: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }], laminatesBottom: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }] } },
      metal: { text: "0.4 mm 7075 aluminum: 60% width on top, 90% width below", why: "Metal concentrated down the middle, like the beams and I-beams", patch: { metalTop: { material: "al7075", thicknessMm: 0.4, coverage: 0.6 }, metalBottom: { material: "al7075", thicknessMm: 0.4, coverage: 0.9 } } },
      profile: { text: "3.5 mm camber, 25 cm tip rocker, 15 cm tail rocker", why: "The all-mountain rocker/camber/rocker the picks share", patch: { camberMm: 3.5, tipRockerCm: 25, tailRockerCm: 15 } },
      shape: { text: "132 / 94 / 116 mm", why: "Mid-90s like the Enforcer 94 and AntiMatter 92", patch: { tipWidth: 132, waistWidth: 94, tailWidth: 116 } },
      edges: { text: "2.2 × 2 mm edges, ABS sidewalls", why: "Standard", patch: { edges: { widthMm: 2.2, heightMm: 2 }, sidewall: { material: "abs" } } },
      base: { text: "Sintered base, rubber strip on", why: "Rubber plus partial metal does the damping", patch: { base: { material: "sintered" }, rubber: { on: true } } },
    } },
  { key: "soft", name: "Soft snow", useCase: "soft", blurb: "Float and surf in powder and soft chop.",
    score: { label: "(flotation + overall) / 2", f: (t) => (t.float + t.overall) / 2 },
    picks: ["Atomic Bent 110", "Atomic Maverick 115 CTi", "Fischer Nothing"],
    editor: ["Blizzard Canvas 118", "Armada AntiMatter 114", "Salomon QST Blank"],
    shared: [
      "108–118 mm waists and longer radii (18–22 m).",
      "Long tip rocker with lower camber: Atomic's Powder Rocker is 30% tip, 50% camber, 20% tail.",
      "Light cores (poplar, paulownia, ash), with metal thin, partial or absent.",
      "Twin or directional-twin tails for slashing and landing.",
    ],
    recipe: {
      core: { text: "55% poplar, 30% paulownia, 15% ash, 10 mm underfoot", why: "Light like the Canvas 118; the ash keeps hardwood under the binding", patch: { core: { blend: [{ wood: "poplar", pct: 55 }, { wood: "paulownia", pct: 30 }, { wood: "ash", pct: 15 }], underfootMm: 10 } } },
      glass: { text: "Triax glass plus a 100 g/m² carbon UD layer, top and bottom", why: "A light backbone, like the Maverick's carbon stringers", patch: { laminatesTop: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 100, plies: 1 }], laminatesBottom: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 100, plies: 1 }] } },
      metal: { text: "0.3 mm 7075 strip, 30% of the width, top and bottom", why: "The thin partial damping layer of the Canvas and Maverick", patch: { metalTop: { material: "al7075", thicknessMm: 0.3, coverage: 0.3 }, metalBottom: { material: "al7075", thicknessMm: 0.3, coverage: 0.3 } } },
      profile: { text: "2.5 mm camber, 45 cm tip rocker, 30 cm tail rocker", why: "Lower camber and long tip rocker for float", patch: { camberMm: 2.5, tipRockerCm: 45, tailRockerCm: 30 } },
      shape: { text: "140 / 112 / 130 mm", why: "In the 108–118 mm range", patch: { tipWidth: 140, waistWidth: 112, tailWidth: 130 } },
      edges: { text: "2.2 × 2 mm edges, ABS sidewalls", why: "Standard", patch: { edges: { widthMm: 2.2, heightMm: 2 }, sidewall: { material: "abs" } } },
      base: { text: "Sintered base, rubber strip on", why: "Sintered holds wax for cold snow", patch: { base: { material: "sintered" }, rubber: { on: true } } },
    } },
  { key: "allday", name: "All-day comfort", useCase: "allday", blurb: "Light, forgiving skis that stay fun from first chair to close.",
    score: { label: "forgiveness and lightness, equally", f: (t, m) => (t.forg + (m.ratings[4] - 1) * 2.5) / 2 },
    picks: ["Elan Ripstick 88 Black Edition", "Elan Playmaker 91", "Atomic Bent 90", "Dynastar M-Free 94", "Faction Dancer 89"],
    shared: [
      "1,600–1,750 g at about 180 cm: the lightest skis here.",
      "No full metal sheets. Stiffness comes from carbon (Ripstick, Playmaker) or a hybrid core (M-Free).",
      "Forgiving rocker/camber/rocker and 88–94 mm waists.",
    ],
    recipe: {
      core: { text: "65% poplar, 20% paulownia, 15% ash, 9.5 mm underfoot", why: "Light and forgiving, with hardwood under the binding", patch: { core: { blend: [{ wood: "poplar", pct: 65 }, { wood: "paulownia", pct: 20 }, { wood: "ash", pct: 15 }], underfootMm: 9.5 } } },
      glass: { text: "Triax glass plus a 150 g/m² carbon UD layer, top and bottom", why: "Carbon instead of metal, like the Ripstick", patch: { laminatesTop: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 150, plies: 1 }], laminatesBottom: [{ fiber: "eglass", arch: "triax", gsm: 746, plies: 1 }, { fiber: "carbon", arch: "ud", gsm: 150, plies: 1 }] } },
      metal: { text: "No metal", why: "Weight is what tires you out by the end of the day", patch: { metalTop: { material: "none", thicknessMm: 0.5, coverage: 1 }, metalBottom: { material: "none", thicknessMm: 0.5, coverage: 1 } } },
      profile: { text: "3 mm camber, 25 cm tip rocker, 15 cm tail rocker", why: "Easy turn entry and release", patch: { camberMm: 3, tipRockerCm: 25, tailRockerCm: 15 } },
      shape: { text: "127 / 89 / 112 mm", why: "High-80s like the Ripstick 88 and Dancer 89", patch: { tipWidth: 127, waistWidth: 89, tailWidth: 112 } },
      edges: { text: "2.2 × 2 mm edges, ABS sidewalls", why: "Standard", patch: { edges: { widthMm: 2.2, heightMm: 2 }, sidewall: { material: "abs" } } },
      base: { text: "Sintered base, rubber strip on", why: "Rubber smooths out chatter on long days", patch: { base: { material: "sintered" }, rubber: { on: true } } },
    } },
];

export const RECIPE_AREAS = [
  ["core", "Core"], ["glass", "Fiberglass & carbon"], ["metal", "Metal"], ["profile", "Camber & rocker"],
  ["shape", "Shape (widths)"], ["edges", "Edges & sidewalls"], ["base", "Base & rubber"],
];
