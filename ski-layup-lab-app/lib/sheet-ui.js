// Tabs that bring the whole planning sheet into the site: Materials & picks, Build rating,
// Ski models, Profiles, Press, Edge tuning, Sources and Guide. The Design tab stays in index.html.
import * as D from "./sheet-data.js";
import * as R from "./sheet.js";
import * as M from "./models.js";

const TABS = [
  ["design", "Design"], ["projects", "Projects"], ["materials", "Materials & picks"], ["rating", "Build rating"], ["models", "Ski models"], ["top", "Top skis 26/27"],
  ["profiles", "Profiles"], ["press", "Press"], ["tuning", "Edge tuning"], ["sources", "Sources"], ["guide", "Guide"],
];
const CATS = ["All", ...D.LAYERS.map((l) => l.category)];
const r1 = (x) => (x == null ? "—" : (Math.round(x * 10) / 10).toFixed(1));
const pct = (x) => `${Math.round(x * 100)}%`;
const amz = (q) => "https://www.amazon.com/s?k=" + encodeURIComponent(q);

export function initWorkbook(ctx) {
  const { $, esc } = ctx;
  let state = R.defaultState();
  let kv = null, saveTimer = 0, chain = Promise.resolve(), loaded = false;
  const view = { cat: "All", pick: "all", sort: "num", q: "", open: new Set() };
  let current = "design";

  // ---------------------------------------------------------------- storage
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (!kv) return;
      const snapshot = JSON.parse(JSON.stringify(state));
      chain = chain.catch(() => {}).then(() => kv.save(snapshot)).catch((e) => ctx.notice("Couldn't save your picks (" + esc(e?.code || e?.message || "error") + ")."));
    }, 700);
  }
  async function setKV(next) {
    kv = next;
    try {
      const saved = await kv.load();
      if (saved) state = R.normalizeState(saved);
      else if (loaded) persist(); // first time on this storage: keep what's on screen
    } catch { /* keep the current state */ }
    loaded = true;
    renderCurrent();
  }
  const change = () => { persist(); renderCurrent(); };

  // ---------------------------------------------------------------- tabs
  const tabBar = $("#tabs");
  tabBar.innerHTML = TABS.map(([k, n]) => `<a href="#${k}" data-tab="${k}" role="tab">${esc(n)}</a>`).join("");
  function show(tab) {
    if (!TABS.some(([k]) => k === tab)) tab = "design";
    current = tab;
    for (const a of tabBar.querySelectorAll("[data-tab]")) a.setAttribute("aria-selected", String(a.dataset.tab === tab));
    for (const p of document.querySelectorAll("[data-pane]")) p.hidden = p.dataset.pane !== tab;
    document.documentElement.dataset.tab = tab;
    renderCurrent();
    tabBar.querySelector(`[data-tab="${tab}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  window.addEventListener("hashchange", () => { const t = location.hash.slice(1); if (TABS.some(([k]) => k === t)) { show(t); window.scrollTo({ top: 0 }); } });
  const go = (tab, anchor) => {
    if (location.hash !== "#" + tab) location.hash = tab; else show(tab);
    if (anchor) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: "center" }));
  };

  function renderCurrent() {
    if (current === "projects") ctx.renderProjects?.();
    else if (current === "materials") renderMaterials();
    else if (current === "rating") renderRating();
    else if (current === "models") renderModels();
    else if (current === "top") renderTop();
    else if (current === "profiles") renderProfiles();
    else if (current === "press") renderPress();
    else if (current === "tuning") renderTuning();
    else if (current === "sources") renderSources();
    else if (current === "guide") renderGuide();
  }
  const pane = (k) => document.querySelector(`[data-pane="${k}"]`);
  const src = (ids) => (ids || []).filter(Boolean).map((id) => D.SOURCES[id] ? `<a href="#sources" data-src="${id}" title="${esc(D.SOURCES[id].title)}">${id}</a>` : esc(id)).join(", ");
  const head = (title, sub, actions = "") => `<div class="wb-head"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="wb-actions">${actions}</div>` : ""}</div>`;
  const meter = (label, v, max = 5) => `<span class="meter" title="${esc(label)}: ${v} of ${max}"><span class="ml">${esc(label)}</span><span class="mt"><i style="width:${(v / max) * 100}%"></i></span><span class="mv">${v}</span></span>`;
  const designButtons = `<button class="btn primary" data-wb="to-design">Make a design from my picks</button>`;

  // ---------------------------------------------------------------- materials & picks
  function renderMaterials() {
    const el = pane("materials");
    const sum = R.picksSummary(state);
    const counts = ["Yes", "Maybe", "No", ""].map((k) => `<span class="pc pc-${k || "none"}"><b>${sum.counts[k].length}</b> ${k || "Not decided"}</span>`).join("");
    const layers = sum.layers.map((L) => `<tr><td>${esc(L.category)}</td><td class="num">${L.yes}</td><td class="num">${L.maybe}</td><td class="num">${L.no}</td><td class="num">${L.undecided}</td>
      <td>${esc(L.need)}</td><td class="st ${L.status.startsWith("No usable") ? "bad" : L.status === "Picked" ? "ok" : ""}">${esc(L.status)}</td><td class="wrap">${esc(L.yesPicks.join(", ") || "—")}</td></tr>`).join("");
    const flags = sum.flags.filter(([, v]) => v !== "—").map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(v)}</li>`).join("");
    let list = D.MATERIALS.filter((m) => (view.cat === "All" || m.category === view.cat)
      && (view.pick === "all" || (state.picks[m.id] || "") === (view.pick === "none" ? "" : view.pick))
      && (!view.q || (m.name + " " + m.role + " " + m.feel + " " + m.foundIn).toLowerCase().includes(view.q.toLowerCase())));
    const sorters = { num: (a, b) => a.num - b.num, overall: (a, b) => b.overall - a.overall, obtain: (a, b) => b.obtain - a.obtain, build: (a, b) => b.build - a.build,
      upkeep: (a, b) => (b.upkeep ?? 0) - (a.upkeep ?? 0), tier: (a, b) => a.tier.length - b.tier.length, name: (a, b) => a.name.localeCompare(b.name) };
    list = [...list].sort(sorters[view.sort] || sorters.num);
    const cards = list.map((m) => materialCard(m)).join("") || `<p class="empty">No materials match these filters.</p>`;
    el.innerHTML = head("Materials & my picks", "Every layer of a ski: properties, pros and cons, on-snow feel, cost and how easy it is to get and build with. Mark your picks; the Build rating tab updates as you go.",
        `${designButtons}<button class="btn" data-wb="reset-picks">Reset to my sheet's picks</button><button class="btn" data-wb="clear-picks">Clear all picks</button>`) +
      `<div class="cols2 wb-sum">
        <div class="card"><header><h2>My picks</h2><span class="sub">${sum.avgEase != null ? `average ease of Yes picks ${r1(sum.avgEase)}/5` : "no Yes picks yet"}</span></header>
          <div class="pcs">${counts}</div>
          ${flags ? `<ul class="flags">${flags}</ul>` : ""}
          ${sum.hardestBuild.length ? `<p class="sub2"><b>Hardest to build:</b> ${esc(sum.hardestBuild.join(", "))}. <b>Hardest to get:</b> ${esc(sum.hardestGet.join(", "))}.</p>` : ""}
        </div>
        <div class="card"><header><h2>By layer</h2><span class="sub">required layers you skip are auto-filled</span></header>
          <div class="tbl-wrap"><table class="data layers"><thead><tr><th>Layer</th><th>Yes</th><th>Maybe</th><th>No</th><th>?</th><th>Needed</th><th>Status</th><th>Yes picks</th></tr></thead><tbody>${layers}</tbody></table></div>
        </div>
      </div>
      <div class="card filters">
        <div class="chips">${CATS.map((c) => `<button class="chipbtn" data-cat="${c}" aria-pressed="${view.cat === c}">${esc(c)}</button>`).join("")}</div>
        <div class="frow">
          <label>Show <select class="sel" data-view="pick">${[["all", "All picks"], ["Yes", "Yes"], ["Maybe", "Maybe"], ["No", "No"], ["none", "Not decided"]].map(([k, n]) => `<option value="${k}"${view.pick === k ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <label>Sort by <select class="sel" data-view="sort">${[["num", "Sheet order"], ["overall", "Overall ease"], ["obtain", "Ease to obtain"], ["build", "Ease to build"], ["upkeep", "Ease skiing / upkeep"], ["tier", "Cost (cheapest first)"], ["name", "Name"]].map(([k, n]) => `<option value="${k}"${view.sort === k ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <label class="grow">Search <input class="in" data-view="q" type="search" value="${esc(view.q)}" placeholder="e.g. damp, park, Völkl" style="text-align:left"></label>
        </div>
      </div>
      <div class="mat-grid">${cards}</div>`;
  }
  function materialCard(m) {
    const pick = state.picks[m.id] || "";
    const rt = R.ratingsOf(m, state), edited = !!state.ratings[m.id];
    const rateInputs = D.ATTRIBUTES.map((a, i) => `<label><span>${esc(a.name)}</span>${m.ratings[i] == null ? `<span class="na">—</span>`
      : `<input class="in" type="number" min="1" max="5" step="0.5" value="${rt[i]}" data-rate="${m.id}" data-i="${i}" aria-label="${esc(a.name)} rating for ${esc(m.name)}">`}</label>`).join("");
    const open = view.open.has(m.id);
    return `<article class="mat pick-${pick || "none"}" id="mat-${m.id}">
      <header><span class="cat">${esc(m.category)}</span><span class="tier" title="Cost tier">${esc(m.tier)}</span></header>
      <h3>${esc(m.name)}</h3>
      <p class="role">${esc(m.role)}</p>
      <div class="meters">${meter("Obtain", m.obtain)}${meter("Build", m.build)}${m.upkeep != null ? meter("Ski / upkeep", m.upkeep) : ""}${meter("Overall", m.overall)}</div>
      <p><b>Feel:</b> ${esc(m.feel)}</p>
      <p><b>Cost:</b> ${esc(m.cost)}</p>
      <div class="pickrow"><div class="seg pickseg" role="group" aria-label="Use ${esc(m.name)} in my build?">${["Yes", "Maybe", "No"].map((v) => `<button type="button" data-pick="${m.id}" data-v="${v}" aria-pressed="${pick === v}">${v}</button>`).join("")}</div>
        <input class="in note" data-note="${m.id}" value="${esc(state.notes[m.id] || "")}" placeholder="My notes" aria-label="Notes on ${esc(m.name)}"></div>
      <details data-more="${m.id}"${open ? " open" : ""}><summary>More about ${esc(m.name)}</summary>
        <dl class="mdl">
          <dt>Key properties</dt><dd>${esc(m.properties)}</dd>
          <dt>Pros</dt><dd>${esc(m.pros)}</dd><dt>Cons</dt><dd>${esc(m.cons)}</dd>
          <dt>Found in</dt><dd>${esc(m.foundIn)}</dd><dt>Where to get it</dt><dd>${esc(m.where)} · <a href="${amz(m.name.split(" (")[0] + (m.category === "Core" ? " wood lumber" : " ski building"))}" target="_blank" rel="noopener">Amazon ↗</a></dd>
          <dt>Building notes</dt><dd>${esc(m.buildNotes)}</dd>
          <dt>Sources</dt><dd>${src(m.sources)}</dd>
        </dl>
        <div class="rates"><b>Performance ratings (1–5)</b>${edited ? ` <button class="linkbtn" data-unrate="${m.id}">reset</button>` : ""}<div class="rgrid">${rateInputs}</div></div>
      </details>
    </article>`;
  }

  // ---------------------------------------------------------------- build rating
  function renderRating() {
    const el = pane("rating");
    const r = R.rate(state), S = state.settings;
    const pressSel = `<label class="presspick">Press I plan to use <select class="sel" data-set="press">${[...D.PRESS_OPTIONS.map((p) => [p.key, p.name]), ["undecided", "Not decided"]].map(([k, n]) => `<option value="${k}"${S.press === k ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></label>`;
    if (r.empty) {
      el.innerHTML = head("Build rating", "Your planning sheet's rating, from your material picks.") + `<div class="card"><p class="empty">Pick some materials as <b>Yes</b> on the <a href="#materials">Materials &amp; picks</a> tab to see the rating.</p></div>`;
      return;
    }
    const bar = (v, max = 10) => `<span class="track sm"><span class="fill" style="width:${Math.max(0, Math.min(100, v / max * 100))}%"></span></span>`;
    const verdict = (f) => (f >= 8.5 ? "Excellent" : f >= 6.5 ? "Good" : f >= 5 ? "Fair" : "Poor");
    const sev = (i) => `<span class="chip ${i.severity}">${i.severity}</span>`;
    const issues = r.issues.map((i) => `<tr><td>${sev(i)}</td><td>${esc(i.area)}</td><td>${esc(i.name)}</td><td class="wrap">${esc(i.message)}</td></tr>`).join("");
    const bon = r.bonuses.map((b) => `<li><b>${esc(b.name.replace("Bonus: ", ""))}</b> (+${b.points.toFixed(2)}): ${esc(b.message)}</li>`).join("");
    const subRows = Object.entries(r.sub).map(([k, v]) => `<tr><td>${esc(v.name)}</td><td class="num">${r1(v.score)}</td><td>${bar(v.score)}</td><td class="wrap">${esc(v.now)}</td>
      <td class="num"><input class="in w5" type="number" min="0" max="100" step="5" value="${Math.round(S.synergyWeights[k] * 100)}" data-sw="${k}" aria-label="${esc(v.name)} weight">%</td></tr>`).join("");
    const n1 = (x) => Math.round(x * 10) / 10, rated = r.fits.filter((f) => f.fit != null);
    const hi = rated.length ? Math.max(...rated.map((f) => n1(f.fit))) : 0, lo = rated.length ? Math.min(...rated.map((f) => n1(f.fit))) : 0;
    const tag = (f) => (f.fit == null || hi === lo ? "" : n1(f.fit) === hi ? `<span class="chip sw-s">strongest</span>` : n1(f.fit) === lo ? `<span class="chip sw-w">weakest</span>` : "");
    const fitRows = r.fits.map((f) => `<tr><td>${esc(f.name)} ${tag(f)}</td><td class="num">${r1(f.fit)}</td><td>${bar(f.fit ?? 0)}</td><td>${f.fit == null ? "—" : `${verdict(f.fit)}, mostly about ${esc(f.driver)}`}</td></tr>`).join("");
    const attrRows = r.attrRows.map((a) => `<tr><td>${esc(a.name)}</td><td class="num">${r1(a.value)}</td><td>${bar(a.value ?? 0, 5)}</td>
      <td class="st ${a.status === "Below target" ? "bad" : a.status === "On target" ? "ok" : ""}">${esc(a.status)}${a.gap != null ? ` (${a.gap >= 0 ? "+" : ""}${a.gap.toFixed(1)})` : ""}</td>
      <td class="num"><input class="in w5" type="number" min="1" max="5" step="0.1" value="${a.target}" data-target="${a.key}" aria-label="${esc(a.name)} target"></td></tr>`).join("");
    const top = r.models.slice(0, 5).map((m) => `<tr><td>${m.rank}</td><td>${esc(m.model)}</td><td>${esc(m.category)}</td><td class="num">${r1(m.attrPct)}%</td><td class="num">${Math.round(m.layupPct)}%</td><td class="num"><b>${r1(m.overallPct)}%</b></td><td class="wrap">${esc(m.diffs.join(", ") || "Same layup flags")}</td></tr>`).join("");
    const auto = r.autoFilled.length ? `<ul class="flags">${r.autoFilled.map((m) => `<li><b>${esc(m.category)}:</b> auto-filled with ${esc(m.name)} (easiest option you haven't marked No).</li>`).join("")}</ul>`
      : `<p class="sub2">No auto-fill needed: every required layer has your own Yes pick.</p>`;
    el.innerHTML = head("Build rating", "Your planning sheet's rating, computed from your material picks the same way the sheet does. The Design tab rates the actual layup with physics.",
        `${pressSel}${designButtons}`) +
      `<div class="card"><div class="scores">
          <div class="score main"><span class="k">Overall build rating</span><span class="v">${r1(r.overall)}<small> /10</small></span><span class="d">${esc(r.word)}: the average of Synergy and Performance</span></div>
          <div class="score"><span class="k">Synergy</span><span class="v">${r1(r.synergy)}<small> /10</small></span><span class="d">How well your picks work together. Weakest: ${esc(r.weakest.name)} (${r1(r.weakest.score)})</span></div>
          <div class="score"><span class="k">Performance</span><span class="v">${r1(r.performance)}<small> /10</small></span><span class="d">Best: ${esc(r.bestFit.name)} (${r1(r.bestFit.fit)}). Weakest: ${esc(r.worstFit.name)} (${r1(r.worstFit.fit)})</span></div>
        </div><p class="sub2" style="margin-top:10px">${esc(r.status)}</p></div>
      <div class="card"><header><h2>Issues to fix</h2><span class="sub">most serious first</span></header>
        ${issues ? `<div class="tbl-wrap"><table class="data"><thead><tr><th>Severity</th><th>Area</th><th>Issue</th><th>What to do</th></tr></thead><tbody>${issues}</tbody></table></div>` : `<p class="ok">Nothing to fix.</p>`}
        ${bon ? `<h3 style="margin-top:14px">Bonuses</h3><ul class="flags">${bon}</ul>` : ""}</div>
      <div class="card"><header><h2>Auto-filled layers &amp; suggestions</h2></header>${auto}</div>
      <div class="card"><header><h2>Synergy breakdown</h2><span class="sub">weights are editable</span></header>
        <div class="tbl-wrap"><table class="data"><thead><tr><th>Sub-score</th><th>Score</th><th></th><th>Right now</th><th>Weight</th></tr></thead><tbody>${subRows}
        <tr class="total"><td>Synergy</td><td class="num">${r1(r.synergy)}</td><td>${bar(r.synergy)}</td><td>Weighted average of the five sub-scores.</td><td></td></tr></tbody></table></div></div>
      <div class="cols2">
        <div class="card"><header><h2>Performance by use case</h2><span class="sub">all six count equally</span></header>
          <div class="tbl-wrap"><table class="data"><thead><tr><th>Use case</th><th>Fit</th><th></th><th>Verdict</th></tr></thead><tbody>${fitRows}
          <tr class="total"><td>Performance</td><td class="num">${r1(r.performance)}</td><td>${bar(r.performance ?? 0)}</td><td>Average of the six. ${rated.length ? `Spread ${(hi - lo).toFixed(1)} between strongest and weakest.` : ""}</td></tr></tbody></table></div></div>
        <div class="card"><header><h2>Attribute profile vs target</h2><span class="sub">targets are editable</span></header>
          <div class="tbl-wrap"><table class="data"><thead><tr><th>Attribute</th><th>Build</th><th></th><th>Status</th><th>Target</th></tr></thead><tbody>${attrRows}</tbody></table></div></div>
      </div>
      <div class="cols2">
        <div class="card"><header><h2>Highlights</h2></header><dl class="hl">${r.highlights.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div>
        <div class="card"><header><h2>How the score works</h2></header><dl class="hl">${Object.values(r.sub).map((s) => `<dt>${esc(s.name)}</dt><dd>${esc(s.how)}</dd>`).join("")}</dl></div>
      </div>
      <div class="card"><header><h2>Closest production skis</h2><a class="sub" href="#models">all 13 on Ski models →</a></header>
        <div class="tbl-wrap"><table class="data"><thead><tr><th>#</th><th>Model</th><th>Category</th><th>Attributes</th><th>Layup</th><th>Overall</th><th>Layup differences</th></tr></thead><tbody>${top}</tbody></table></div>
        <p class="why">Similarity = ${pct(S.similarity.attributeWeight)} attribute match + ${pct(S.similarity.layupWeight)} layup match, as in the sheet.</p></div>
      <p class="sub2"><button class="linkbtn" data-wb="reset-settings">Reset synergy weights and targets to the sheet's defaults</button></p>`;
  }

  // ---------------------------------------------------------------- ski models
  const modelView = { origin: "all", cat: "All" };
  const MODEL_CATS = ["All", ...new Set(R.ALL_MODELS.map((m) => m.category))];
  const AWARD = (k) => M.SOURCES_2027[k] ? `<a class="chip award" href="${esc(M.SOURCES_2027[k].url)}" target="_blank" rel="noopener" title="${esc(M.SOURCES_2027[k].title)}">${esc(M.SOURCES_2027[k].title.split(":")[0])}</a>` : "";
  const testsOf = (m) => (m.origin === "2027" ? m : m.y2027) || null;
  const testLine = (m) => {
    const t = testsOf(m);
    if (!t) return "";
    return t.tests ? `<div class="sub">2026/27 test: overall ${r1(t.tests.overall)}/10 (${t.n} tester${t.n === 1 ? "" : "s"})</div>` : `<div class="sub">2026/27: editor pick, no tester scores</div>`;
  };
  function renderModels() {
    const el = pane("models");
    const r = R.rate(state);
    const all = r.empty ? R.compareModels(R.attributesOf([], state), ["N", "N", "N", "N", "N"], state.settings).map((m) => ({ ...m, attrPct: null, layupPct: null, overallPct: null })) : r.models;
    const models = all.filter((m) => (modelView.origin === "all" || m.origin === modelView.origin) && (modelView.cat === "All" || m.category === modelView.cat));
    const n27 = R.ALL_MODELS.filter((m) => m.origin === "2027").length, nSheet = R.ALL_MODELS.length - n27;
    const fl = (f) => `<td class="flag f-${f === "Y" ? "y" : f === "N" ? "n" : "q"}">${f}</td>`;
    const mine = r.empty ? "" : `<tr class="mine"><td>—</td><td><b>★ My picks (live)</b></td><td>DIY build</td><td>—</td><td class="wrap">${esc(r.all.map((m) => m.name).join(", "))}</td>
      ${D.ATTRIBUTES.map((a) => `<td class="num">${r1(r.attrs[a.key])}</td>`).join("")}${r.flags.map(fl).join("")}<td>—</td><td>—</td><td>—</td>
      ${r.fits.map((f) => `<td class="num">${r1(f.fit)}</td>`).join("")}<td class="num"><b>${r1(r.performance)}</b></td><td>—</td><td>—</td></tr>`;
    const rows = models.map((m) => `<tr><td class="num">${r.empty ? "—" : m.rank}</td><td><b>${esc(m.model)}</b>${m.origin === "2027" ? ` <span class="chip yr">26/27</span>` : ""}${m.estimated ? ` <span class="chip est" title="No tester scores: ratings estimated from construction and reviews">est.</span>` : ""}${testLine(m)}</td><td>${esc(m.category)}</td><td class="num">${esc(m.waist)}</td><td class="wrap small">${esc(m.construction)}</td>
      ${m.ratings.map((v) => `<td class="num">${v.toFixed(1)}</td>`).join("")}${m.flags.map(fl).join("")}
      <td class="num">${m.attrPct == null ? "—" : r1(m.attrPct) + "%"}</td><td class="num">${m.layupPct == null ? "—" : Math.round(m.layupPct) + "%"}</td><td class="num"><b>${m.overallPct == null ? "—" : r1(m.overallPct) + "%"}</b></td>
      ${m.fits.map((f) => `<td class="num">${r1(f.fit)}</td>`).join("")}<td class="num"><b>${r1(m.performance)}</b></td>
      <td class="wrap small">${esc((m.diffs || []).join(", ") || "—")}</td><td><a href="${esc(m.source)}" target="_blank" rel="noopener">source ↗</a></td></tr>`).join("");
    const chip = (k, label) => `<button class="chipbtn" data-mview="${k}" aria-pressed="${modelView.origin === k}">${label}</button>`;
    el.innerHTML = head("Ski models", `${R.ALL_MODELS.length} production skis: ${nSheet} from your planning sheet and ${n27} from this season's tests and reviews. Each has construction, 1–5 ratings, similarity to your picks and use-case fits. Sheet ratings are the sheet's estimates; 2026/27 ratings come from Ski Essentials tester scores (est. = estimated from construction and reviews where there are no scores). Layup flags: Y has it, N doesn't, ? not published.`, `<a class="btn" href="#top">Top skis by category →</a>`) +
      `<div class="card"><div class="chips" style="margin-bottom:8px">${chip("all", `All (${R.ALL_MODELS.length})`)}${chip("2027", `2026/27 tests (${n27})`)}${chip("sheet", `Planning sheet (${nSheet})`)}
        <label class="sub" style="margin-left:auto">Category <select class="sel" data-mcat style="width:auto;margin-left:4px">${MODEL_CATS.map((c) => `<option${c === modelView.cat ? " selected" : ""}>${esc(c)}</option>`).join("")}</select></label></div>
      <div class="tbl-wrap"><table class="data models"><thead>
        <tr><th rowspan="2">Rank</th><th rowspan="2">Model</th><th rowspan="2">Category</th><th rowspan="2">Waist (mm)</th><th rowspan="2">Construction (as published)</th><th colspan="6" class="grp">Attribute ratings (1–5)</th><th colspan="5" class="grp">Layup flags</th><th colspan="3" class="grp">Similarity to my picks</th><th colspan="7" class="grp">Use-case fit (0–10)</th><th rowspan="2">Layup differences</th><th rowspan="2">Source</th></tr>
        <tr>${["Edge", "Damp", "Pop", "Glide", "Light", "Dur"].map((h) => `<th>${h}</th>`).join("")}${["Metal", "Glass", "Carbon", "Flax/ basalt", "Hard-wood"].map((h) => `<th>${h}</th>`).join("")}<th>Attr.</th><th>Layup</th><th>Overall</th>${["Race", "Park", "Hard-pack", "Soft", "Mixed", "All-day", "Perf."].map((h) => `<th>${h}</th>`).join("")}</tr>
      </thead><tbody>${mine}${rows || `<tr><td colspan="28" class="empty">No skis match this filter.</td></tr>`}</tbody></table></div>
      <p class="why">Ranks compare against all ${R.ALL_MODELS.length} skis, so filtering doesn't change them. The Design tab also compares your physical layup against six skis modeled from their published weight and construction.</p></div>`;
  }

  // ---------------------------------------------------------------- top skis 2026/27
  const byModel = Object.fromEntries(R.ALL_MODELS.map((m) => [m.model, m]));
  const mix = Object.fromEntries(M.RECIPE_AREAS.map(([k]) => [k, ""]));
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  function withPatch(build, patch) {
    const out = JSON.parse(JSON.stringify(build));
    for (const [k, v] of Object.entries(patch)) out[k] = isObj(v) && isObj(out[k]) ? { ...out[k], ...JSON.parse(JSON.stringify(v)) } : JSON.parse(JSON.stringify(v));
    return out;
  }
  const recipePatch = (cat, areas = M.RECIPE_AREAS.map(([k]) => k)) => Object.assign({}, ...areas.map((a) => cat.recipe[a].patch));
  const mixPatch = () => Object.assign({}, ...M.RECIPE_AREAS.filter(([a]) => mix[a]).map(([a]) => M.TOP_CATEGORIES.find((c) => c.key === mix[a]).recipe[a].patch));
  // Similarity of the current physical design (engine attributes and layup flags) to a ski.
  function designSimilarity() {
    const res = ctx.getResult?.(), b = ctx.getBuild();
    if (!res || !res.attributes) return null;
    const attrs = Object.fromEntries(D.ATTRIBUTES.map((a) => [a.key, res.attributes[a.key]]));
    return Object.fromEntries(R.compareModels(attrs, R.flagsOfBuild(b), state.settings).map((m) => [m.model, m]));
  }
  function predict(build) {
    if (!ctx.analyze) return null;
    try { return ctx.analyze(build); } catch { return null; }
  }
  const predLine = (r, cat) => {
    if (!r) return "";
    const ATTR_SHORT = { edge: "Edge", damping: "Damp", pop: "Pop", glide: "Glide", lightness: "Light", durability: "Dur" };
    const target = cat?.useCase ? r.fits.find((f) => f.key === cat.useCase) : null;
    const flags = r.issues.filter((i) => i.severity !== "Info");
    return `<div class="pred"><span><b>${esc(ctx.fmtMass ? ctx.fmtMass(r.weightG) : Math.round(r.weightG) + " g")}</b> per ski</span><span>radius <b>${ctx.fmtLen ? ctx.fmtLen(r.geometry.sidecutR) : r.geometry.sidecutR.toFixed(1) + " m"}</b></span>
      ${D.ATTRIBUTES.map((a) => `<span>${ATTR_SHORT[a.key]} <b>${r1(r.attributes[a.key])}</b></span>`).join("")}
      ${target ? `<span>${esc(target.name.split(" (")[0])} fit <b>${r1(target.fit)}</b></span>` : ""}
      <span class="${flags.length ? "warnc" : ""}">${flags.length ? `${flags.length} flag${flags.length === 1 ? "" : "s"}: ${esc(flags.map((i) => i.plain?.title || i.title).join("; "))}` : "no flags"}</span></div>`;
  };
  function pickCard(name, cat, i, sim, editor = false) {
    const m = byModel[name]; if (!m) return "";
    const t = testsOf(m) || {}, tests = t.tests;
    const score = tests && cat.score ? cat.score.f(tests, m) : null;
    const keys = m.keys || t.keys || [];
    const praise = (m.praise || t.praise || []).slice(0, 2), crit = (m.crit || t.crit || []);
    const awards = [...new Set([...(m.awards || []), ...(t.awards || [])])];
    const spec = [m.dimsText || (m.dims ? `${m.dims.join("/")}` : `${m.waist} mm waist`), m.radius ? `${m.radius} radius` : "", (m.weight || t.weight) ? `${((m.weight || t.weight)[0]).toLocaleString("en-US")} g @${(m.weight || t.weight)[1]} cm` : "", m.profile || t.profile || ""].filter(Boolean).join(" · ");
    const s = sim?.[name];
    return `<article class="pick">
      <div class="pick-h"><span class="rk">${editor ? "★" : i + 1}</span><div style="min-width:0"><h3>${esc(name)}</h3><div class="sub">${esc(m.category)}${m.origin === "sheet" ? " · in your planning sheet" : ""}</div></div>
        <div class="pick-score">${score != null ? `<b class="num">${score.toFixed(1)}</b><span class="sub">${t.n} tester${t.n === 1 ? "" : "s"}</span>` : `<span class="chip est">editor pick</span>`}</div></div>
      ${awards.length ? `<div class="chips">${awards.map(AWARD).join("")}</div>` : ""}
      <p class="spec">${esc(spec)}</p>
      <p class="cons">${esc(m.construction)}</p>
      ${keys.length ? `<h4>What makes it good</h4><ul class="keys">${keys.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>` : praise.length ? `<h4>What testers said</h4><ul class="keys">${praise.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>` : ""}
      ${crit.length ? `<p class="trade"><b>Trade-off:</b> ${esc(crit.join("; "))}</p>` : ""}
      <div class="pick-f"><span class="sub">Ratings ${m.ratings.map((v, j) => `${["Edge", "Damp", "Pop", "Glide", "Light", "Dur"][j]} ${v.toFixed(1)}`).join(" · ")}${m.estimated ? " (est.)" : ""}</span>
        ${s ? `<span class="sub">Similarity to your design <b>${r1(s.overallPct)}%</b></span>` : ""}<a href="${esc(m.source)}" target="_blank" rel="noopener">source ↗</a></div>
    </article>`;
  }
  function renderTop() {
    const el = pane("top");
    const sim = designSimilarity(), build = ctx.getBuild();
    const picksOf = (c) => {
      const scored = c.picks.map((n) => [n, testsOf(byModel[n])?.tests ? c.score.f(testsOf(byModel[n]).tests, byModel[n]) : -1]).sort((a, b) => b[1] - a[1]).map(([n]) => n);
      return { scored, editor: c.editor || [] };
    };
    const allPicks = [...new Set(M.TOP_CATEGORIES.flatMap((c) => [...c.picks, ...(c.editor || [])]))];
    const closest = sim ? allPicks.map((n) => sim[n]).filter((m) => m && !m.estimated).sort((a, b) => b.overallPct - a.overallPct)[0] : null;
    const nav = M.TOP_CATEGORIES.map((c) => `<a class="chipbtn" href="#top" data-topjump="${c.key}">${esc(c.name)}</a>`).join("") + `<a class="chipbtn" href="#top" data-topjump="mix">Mix &amp; match</a>`;
    const cats = M.TOP_CATEGORIES.map((c) => {
      const { scored, editor } = picksOf(c);
      const rows = M.RECIPE_AREAS.map(([a, label]) => `<tr><td><b>${esc(label)}</b></td><td>${esc(c.recipe[a].text)}</td><td class="sub wrap">${esc(c.recipe[a].why)}</td></tr>`).join("");
      return `<section class="card topcat" id="top-${c.key}">
        <header><h2>${esc(c.name)}</h2><span class="sub">${esc(c.blurb)}</span></header>
        <div class="shared"><h4>What the top picks share</h4><ul>${c.shared.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <p class="sub2">Ranked by Ski Essentials 2027 tester averages: ${esc(c.score.label)}${c.minTesters === 2 ? " (few park skis were tested, so two-tester scores are included)" : ""}.${editor.length ? " ★ = on this season's editors' lists without tester scores." : ""}</p>
        <div class="picks">${scored.map((n, i) => pickCard(n, c, i, sim)).join("")}${editor.map((n) => pickCard(n, c, 0, sim, true)).join("")}</div>
        <div class="recipe"><h3>DIY recipe: ${esc(c.name.toLowerCase())}</h3>
          <div class="tbl-wrap"><table class="data rec"><tbody>${rows}</tbody></table></div>
          <p class="sub2">In the engine on your ski's length and press:</p>${predLine(predict(withPatch(build, recipePatch(c))), c)}
          <div class="wb-actions"><button class="btn primary" data-recipe="${c.key}">Apply this recipe to my design</button><button class="btn" data-mixall="${c.key}">Use it in Mix &amp; match</button></div>
        </div>
      </section>`;
    }).join("");
    const mixRows = M.RECIPE_AREAS.map(([a, label]) => {
      const chosen = M.TOP_CATEGORIES.find((c) => c.key === mix[a]);
      return `<tr><td><b>${esc(label)}</b></td><td><select class="sel" data-mix="${a}" aria-label="${esc(label)} from"><option value="">Keep mine</option>${M.TOP_CATEGORIES.map((c) => `<option value="${c.key}"${mix[a] === c.key ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></td>
        <td class="wrap">${chosen ? esc(chosen.recipe[a].text) : `<span class="sub">your current design</span>`}</td></tr>`;
    }).join("");
    const anyMix = Object.values(mix).some(Boolean);
    const now = ctx.getResult?.();
    const mixed = anyMix ? predict(withPatch(build, mixPatch())) : null;
    const delta = (a, b, k) => { const d = r1(b) - r1(a); return d ? ` <span class="${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)}</span>` : ""; };
    const cmp = mixed && now ? `<div class="tbl-wrap"><table class="data mixcmp"><thead><tr><th></th>${D.ATTRIBUTES.map((a) => `<th>${esc(a.name.split(" /")[0])}</th>`).join("")}${now.fits.map((f) => `<th>${esc(f.name.split(" (")[0])}</th>`).join("")}<th>Overall</th></tr></thead><tbody>
        <tr><td>Your design now</td>${D.ATTRIBUTES.map((a) => `<td class="num">${r1(now.attributes[a.key])}</td>`).join("")}${now.fits.map((f) => `<td class="num">${r1(f.fit)}</td>`).join("")}<td class="num"><b>${r1(now.scores.overall)}</b></td></tr>
        <tr><td><b>With this mix</b></td>${D.ATTRIBUTES.map((a) => `<td class="num">${r1(mixed.attributes[a.key])}${delta(now.attributes[a.key], mixed.attributes[a.key])}</td>`).join("")}${mixed.fits.map((f, i) => `<td class="num">${r1(f.fit)}${delta(now.fits[i].fit, f.fit)}</td>`).join("")}<td class="num"><b>${r1(mixed.scores.overall)}</b>${delta(now.scores.overall, mixed.scores.overall)}</td></tr>
      </tbody></table></div>${predLine(mixed, null)}` : `<p class="empty" style="margin:6px 0 0">Pick a group for one or more areas to preview the mix against your current design.</p>`;
    el.innerHTML = head("Top skis 2026/27", "This season's review favorites, grouped by what they're best at, with what makes each one good. Every group ends with a DIY recipe built from what its top picks share, using materials you can buy. Mix recipes from different groups at the bottom to build your own ski.",
      `<a class="btn" href="#models">All ${R.ALL_MODELS.length} skis →</a>`) +
      `<div class="card topintro"><div class="chips">${nav}</div>
        ${closest ? `<p style="margin:10px 0 0">Your current design is closest to the <b>${esc(closest.model)}</b> (${r1(closest.overallPct)}% similar). <span class="sub">Similarity uses the engine's ratings for your design and the same 70% ratings / 30% layup formula as the sheet; the two scales are close but not identical, so treat it as a rough match.</span></p>` : ""}
        <p class="sub2" style="margin:8px 0 0">The engine rates edge grip, damping, pop, glide, lightness and durability. It doesn't model flotation, butters or switch riding, so width and rocker show up below in the radius and weight more than in the scores.</p></div>
      ${cats}
      <section class="card mixcard" id="top-mix"><header><h2>Mix &amp; match</h2><span class="sub">take each part from whichever group you want</span></header>
        <div class="tbl-wrap"><table class="data mix"><thead><tr><th>Part</th><th>Take it from</th><th>Which means</th></tr></thead><tbody>${mixRows}</tbody></table></div>
        ${cmp}
        <div class="wb-actions" style="margin-top:10px"><button class="btn primary" data-mixapply${anyMix ? "" : " disabled"}>Apply the mix to my design</button><button class="btn" data-mixclear${anyMix ? "" : " disabled"}>Clear</button></div>
        <p class="why" style="margin:8px 0 0">Applying changes your current design (length, contact points and press stay as they are). It shows as unsaved, so save it as the next iteration of your project, or as a new project.</p>
      </section>
      <p class="sub2">Sources: ${Object.values(M.SOURCES_2027).map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>`).join(" · ")}</p>`;
  }

  // ---------------------------------------------------------------- profiles
  function renderProfiles() {
    const el = pane("profiles");
    const b = ctx.getBuild();
    const cards = D.PROFILES.map((p, i) => {
      const using = p.design && b.camberMm === p.design.camberMm && b.tipRockerCm === p.design.tipRockerCm && b.tailRockerCm === p.design.tailRockerCm;
      return `<article class="card prof${/Best single-pair|Strong pick/.test(p.fit) ? " rec" : ""}">
        <header><h2>${esc(p.name)}</h2>${using ? `<span class="chip Info">in your design</span>` : ""}</header>
        <p class="role">${esc(p.shape)}</p>
        <dl class="mdl">
          <dt>Hard snow / ice</dt><dd>${esc(p.hard)}</dd><dt>Soft snow / powder</dt><dd>${esc(p.soft)}</dd>
          <dt>Park &amp; switch</dt><dd>${esc(p.park)}</dd><dt>Racing</dt><dd>${esc(p.racing)}</dd>
          <dt>Advantages</dt><dd>${esc(p.pros)}</dd><dt>Disadvantages</dt><dd>${esc(p.cons)}</dd>
          <dt>Typical skis</dt><dd>${esc(p.typical)}</dd><dt>Mold notes</dt><dd>${esc(p.mold)}</dd>
          <dt>Sources</dt><dd>${src(p.sources)}</dd>
        </dl>
        <p class="fit"><b>Fit for my goals:</b> ${esc(p.fit)}</p>
        ${p.design ? `<button class="btn small" data-profile="${i}"${using ? " disabled" : ""}>${using ? "Already in my design" : "Use in my design"}</button>` : `<p class="sub2">A tail shape: pair it with any profile above.</p>`}
      </article>`;
    }).join("");
    el.innerHTML = head("Ski profiles", "How each shape performs. The profile is set by the mold you press in, so pick it before building the mold. \"Fit for my goals\" assumes club racing (USCSA), park comps, hardpack and ice, soft snow and mixed terrain.") +
      `<div class="prof-grid">${cards}</div>`;
  }

  // ---------------------------------------------------------------- press
  function renderPress() {
    const el = pane("press");
    const b = ctx.getBuild(), planned = state.settings.press;
    const cards = D.PRESS_OPTIONS.map((p) => `<article class="card press${planned === p.key ? " sel" : ""}">
        <header><h2>${esc(p.name)}</h2>${planned === p.key ? `<span class="chip Info">my plan</span>` : ""}</header>
        <div class="meters">${meter("Build / obtain", p.easeBuild)}${meter("Use", p.easeUse)}</div>
        <dl class="mdl"><dt>How it works</dt><dd>${esc(p.how)}</dd><dt>Pressure</dt><dd>${esc(p.pressure)}</dd><dt>Heat / cure</dt><dd>${esc(p.cure)}</dd>
          <dt>Approx. cost</dt><dd>${esc(p.cost)}</dd><dt>Pros</dt><dd>${esc(p.pros)}</dd><dt>Cons</dt><dd>${esc(p.cons)}</dd><dt>Best for</dt><dd>${esc(p.best)}</dd><dt>Sources</dt><dd>${src(p.sources)}</dd></dl>
        <button class="btn small" data-press="${p.key}"${planned === p.key ? " disabled" : ""}>${planned === p.key ? "Planned" : "Plan to use this"}</button>
      </article>`).join("");
    const parts = D.PRESS_PARTS.map((p) => `<tr><td><b>${esc(p.part)}</b></td><td class="wrap">${esc(p.purpose)}</td><td class="wrap">${esc(p.cost)}</td><td class="wrap small">${esc(p.notes)}</td><td>${src(p.sources)}</td></tr>`).join("");
    const metal = b.metalBottom?.material !== "none" || b.metalTop?.material !== "none";
    el.innerHTML = head("Ski press", "The press bonds every layer and sets the profile. More pressure gives better bonds, and is needed for metal (titanal / 7075) layers. Costs marked (est.) are ballparks.") +
      (metal ? `<div class="notice" style="margin:0 0 12px">Your design has a metal layer, so plan on a pneumatic press; a vacuum bag can't press metal well enough to bond it.</div>` : "") +
      `<div class="press-grid">${cards}</div>
      <div class="card"><header><h2>Press parts</h2></header><div class="tbl-wrap"><table class="data"><thead><tr><th>Part</th><th>Purpose</th><th>Approx. cost</th><th>Notes</th><th>Sources</th></tr></thead><tbody>${parts}</tbody></table></div></div>
      <div class="cols2">
        <div class="card"><header><h2>Cure guide</h2></header><ul class="flags">${D.CURE_GUIDE.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
        <div class="card"><header><h2>Presses and shops near you</h2><span class="sub">Mount Laurel / Philadelphia</span></header>
          <ul class="flags">${D.PRESS_NEARBY.map((n) => `<li><a href="${esc(n.link)}" target="_blank" rel="noopener"><b>${esc(n.name)}</b></a>: ${esc(n.what)}</li>`).join("")}</ul>
          <p class="sub2">Building your own pneumatic press: <a href="${amz("4 inch lay flat fire hose")}" target="_blank" rel="noopener">lay-flat hose</a>, <a href="${amz("air compressor pressure regulator gauge")}" target="_blank" rel="noopener">regulator + gauge</a>, <a href="${amz("silicone heating blanket pad")}" target="_blank" rel="noopener">heat blanket</a> (Amazon).</p></div>
      </div>`;
  }

  // ---------------------------------------------------------------- edge tuning
  function renderTuning() {
    const el = pane("tuning");
    const b = ctx.getBuild();
    const relevant = { "Sidewall material": ["phenolic", "uhmw", "abs"].includes(b.sidewall?.material), "Base type": true, "Race (graphite) base": b.base?.material === "graphite", "Edge thickness": true };
    const bev = D.BEVELS.map((x) => `<tr><td><b>${esc(x.use)}</b></td><td class="num">${esc(x.base)}</td><td class="num">${esc(x.side)}</td><td class="wrap">${esc(x.feel)}</td><td class="wrap small">${esc(x.note)}</td></tr>`).join("");
    const eff = D.TUNING_EFFECTS.map((x) => `<tr class="${relevant[x.choice] ? "" : "dim"}"><td><b>${esc(x.choice)}</b></td><td class="wrap">${esc(x.effect)}</td><td>${src(x.sources)}</td></tr>`).join("");
    const total = D.TUNING_TOOLS.reduce((a, t) => a + t.price, 0);
    const tools = D.TUNING_TOOLS.map((t) => `<tr><td><b>${esc(t.tool)}</b></td><td class="wrap">${esc(t.does)}</td><td class="num">$${t.price.toFixed(2)}</td><td class="wrap small">${esc(t.range)}</td><td>${src(t.sources)}</td><td><a href="${amz("ski tuning " + t.tool.replace(/,.*$/, ""))}" target="_blank" rel="noopener">Amazon ↗</a></td></tr>`).join("");
    el.innerHTML = head("Edge tuning", esc(D.BEVEL_NOTE).replace("(S42)", "(" + src(["S42"]) + ")")) +
      `<div class="card"><header><h2>Bevel settings by use</h2></header><div class="tbl-wrap"><table class="data"><thead><tr><th>Use</th><th>Base bevel</th><th>Side bevel</th><th>What it feels like</th><th>Source / note</th></tr></thead><tbody>${bev}</tbody></table></div></div>
      <div class="card"><header><h2>How my material choices affect tuning</h2><span class="sub">rows that don't apply to your design are dimmed</span></header><div class="tbl-wrap"><table class="data"><thead><tr><th>Choice</th><th>Effect on tuning</th><th>Source</th></tr></thead><tbody>${eff}</tbody></table></div></div>
      <div class="card"><header><h2>Tools and approximate cost</h2><span class="sub">total $${total.toFixed(2)}</span></header>
        <div class="tbl-wrap"><table class="data"><thead><tr><th>Tool</th><th>What it does</th><th>Price used</th><th>Price range / example</th><th>Source</th><th>Buy</th></tr></thead><tbody>${tools}
        <tr class="total"><td>Total for the tool set</td><td></td><td class="num">$${total.toFixed(2)}</td><td></td><td></td><td></td></tr></tbody></table></div>
        <p class="why">${esc(D.TUNING_SHORTCUT).replace("(S43)", "(" + src(["S43"]) + ")")}</p></div>
      <div class="card"><header><h2>First tune on a freshly pressed pair</h2><span class="sub">general practice (est.)</span></header><ol class="steps">${D.FIRST_TUNE.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`;
  }

  // ---------------------------------------------------------------- sources & guide
  function renderSources() {
    pane("sources").innerHTML = head("Sources", "Every source referenced by an S-number in the other tabs.") +
      `<div class="card"><ol class="srcs">${Object.values(D.SOURCES).map((s) => `<li id="src-${s.id}"><span class="sid">${s.id}</span><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join("")}</ol></div>`;
  }
  function renderGuide() {
    const tabs = [
      ["Design", "The physics lab: shape, core, layup and process, with stiffness, weight, damping, issues, the optimizer, materials and cost, saved builds and comparisons."],
      ["Materials & picks", "Every layer of a ski with properties, pros and cons, feel, cost and ease ratings. Mark Yes / Maybe / No, add notes, and edit each material's 1–5 performance ratings."],
      ["Build rating", "The sheet's analysis of your picks: Overall, Synergy and Performance, issues, auto-filled layers, synergy and use-case breakdowns, attributes vs target and the closest production skis. All six use cases count equally; synergy weights and targets are editable."],
      ["Ski models", `${R.ALL_MODELS.length} production skis (your sheet's 13 plus this season's tests) with construction, ratings, layup flags, similarity to your picks and use-case fits.`],
      ["Top skis 26/27", "This season's review favorites by category (pop, park, carving, mixed terrain, soft snow, all-day), what makes each good, a DIY recipe per category, and Mix & match to combine them into your own ski."],
      ["Profiles", "Camber, rocker, hybrid, flat and twin tip, with a button to use one in your design."],
      ["Press", "Press options from vacuum bag to heated pneumatic press, press parts, cure times and places near you."],
      ["Edge tuning", "Bevel angles by use, how your materials affect tuning, tools and costs, and the first tune on a new pair."],
      ["Sources", "Every S-number reference."],
    ];
    pane("guide").innerHTML = head("Guide", esc(D.GUIDE.purpose)) +
      `<div class="card"><header><h2>What's in each tab</h2></header><dl class="hl wide">${tabs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div>
      <div class="cols2">
        <div class="card"><header><h2>Rating scales</h2><span class="sub">5 = easiest</span></header><div class="tbl-wrap"><table class="data"><thead><tr><th>Rating</th><th>5 means</th><th>1 means</th></tr></thead><tbody>${D.GUIDE.scales.map(([a, b, c]) => `<tr><td><b>${esc(a)}</b></td><td class="wrap">${esc(b)}</td><td class="wrap">${esc(c)}</td></tr>`).join("")}</tbody></table></div></div>
        <div class="card"><header><h2>Cost tiers</h2><span class="sub">enough material for one pair</span></header><div class="tbl-wrap"><table class="data"><thead><tr><th>Tier</th><th>Approx. per pair</th></tr></thead><tbody>${D.GUIDE.tiers.map(([a, b]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div>
          <ul class="flags" style="margin-top:10px">${D.GUIDE.notes.map((n) => `<li>${esc(n).replace("(S3)", "(" + src(["S3"]) + ")")}</li>`).join("")}</ul></div>
      </div>`;
  }

  // ---------------------------------------------------------------- events
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-src]");
    if (s) { e.preventDefault(); go("sources", "src-" + s.dataset.src); return; }
    const tt = e.target.closest("[data-mview],[data-topjump],[data-recipe],[data-mixall],[data-mixapply],[data-mixclear]");
    if (tt && tt.closest("[data-pane]")) {
      if (tt.dataset.mview) { modelView.origin = tt.dataset.mview; return renderModels(); }
      if (tt.dataset.topjump) { e.preventDefault(); document.getElementById("top-" + tt.dataset.topjump)?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      if (tt.dataset.recipe) {
        const c = M.TOP_CATEGORIES.find((x) => x.key === tt.dataset.recipe);
        ctx.patchDesign(withPatch(ctx.getBuild(), recipePatch(c)));
        ctx.notice(`Applied the ${c.name.toLowerCase()} recipe to your design. Save it to keep it.`);
        return go("design");
      }
      if (tt.dataset.mixall) { for (const [a] of M.RECIPE_AREAS) mix[a] = tt.dataset.mixall; renderTop(); document.getElementById("top-mix")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      if (tt.hasAttribute("data-mixclear")) { for (const [a] of M.RECIPE_AREAS) mix[a] = ""; return renderTop(); }
      if (tt.hasAttribute("data-mixapply")) {
        ctx.patchDesign(withPatch(ctx.getBuild(), mixPatch()));
        ctx.notice("Applied your mix to the design. Save it to keep it.");
        return go("design");
      }
    }
    const t = e.target.closest("[data-wb],[data-pick],[data-cat],[data-unrate],[data-profile],[data-press]");
    if (!t || !t.closest("[data-pane]")) return;
    if (t.dataset.pick) {
      const id = t.dataset.pick, v = t.dataset.v;
      state.picks[id] = state.picks[id] === v ? "" : v;
      return change();
    }
    if (t.dataset.cat) { view.cat = t.dataset.cat; return renderMaterials(); }
    if (t.dataset.unrate) { delete state.ratings[t.dataset.unrate]; return change(); }
    if (t.dataset.profile) { ctx.patchDesign(D.PROFILES[+t.dataset.profile].design); return renderProfiles(); }
    if (t.dataset.press) {
      state.settings.press = t.dataset.press;
      if (t.dataset.press !== "someone-else") ctx.patchDesign({ press: t.dataset.press });
      return change();
    }
    const act = t.dataset.wb;
    if (act === "to-design") {
      const r = R.rate(state);
      if (r.empty) return ctx.notice("Mark at least one material as Yes first.");
      ctx.applyDesign(R.designFromPicks(state, ctx.getBuild()));
      return go("design");
    }
    if (act === "reset-picks") { state.picks = { ...D.SHEET_PICKS }; state.notes = { ...D.SHEET_NOTES }; return change(); }
    if (act === "clear-picks") {
      if (t.dataset.armed !== "1") { t.dataset.armed = "1"; t.textContent = "Clear picks and notes?"; t.classList.add("danger"); setTimeout(() => { if (t.isConnected) { t.dataset.armed = ""; t.textContent = "Clear all picks"; t.classList.remove("danger"); } }, 4000); return; }
      state.picks = {}; state.notes = {}; return change();
    }
    if (act === "reset-settings") { const p = state.settings.press; state.settings = R.defaultState().settings; state.settings.press = p; return change(); }
  });
  document.addEventListener("toggle", (e) => {
    const d = e.target.closest?.("[data-more]"); if (!d) return;
    if (d.open) view.open.add(d.dataset.more); else view.open.delete(d.dataset.more);
  }, true);
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.closest("[data-pane]")) return;
    if (el.dataset.note) { const v = el.value.slice(0, 300); if (v) state.notes[el.dataset.note] = v; else delete state.notes[el.dataset.note]; persist(); return; }
    if (el.dataset.view === "q") { view.q = el.value; const pos = el.selectionStart; renderMaterials(); const n = document.querySelector('[data-view="q"]'); n.focus(); n.setSelectionRange(pos, pos); }
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (!el.closest("[data-pane]")) return;
    const num = parseFloat(el.value);
    if (el.dataset.view === "pick" || el.dataset.view === "sort") { view[el.dataset.view] = el.value; return renderMaterials(); }
    if (el.hasAttribute("data-mcat")) { modelView.cat = el.value; return renderModels(); }
    if (el.dataset.mix) { const y = window.scrollY; mix[el.dataset.mix] = el.value; renderTop(); window.scrollTo({ top: y }); return; }
    if (el.dataset.rate) {
      const m = D.MATERIALS.find((x) => x.id === el.dataset.rate);
      const arr = [...(state.ratings[m.id] || m.ratings)];
      arr[+el.dataset.i] = Number.isFinite(num) ? Math.min(5, Math.max(1, num)) : m.ratings[+el.dataset.i];
      state.ratings[m.id] = arr;
      if (JSON.stringify(arr) === JSON.stringify(m.ratings)) delete state.ratings[m.id];
      return change();
    }
    if (el.dataset.set === "press") { state.settings.press = el.value; if (el.value !== "someone-else") ctx.patchDesign({ press: el.value }); return change(); }
    if (el.dataset.sw && Number.isFinite(num)) { state.settings.synergyWeights[el.dataset.sw] = Math.max(0, Math.min(100, num)) / 100; return change(); }
    if (el.dataset.target && Number.isFinite(num)) { state.settings.targets[el.dataset.target] = Math.max(1, Math.min(5, num)); return change(); }
  });

  show(location.hash.slice(1) || "design");
  return {
    setKV,
    rerender: renderCurrent,
    getState: () => state,
    onDesignChange: () => { if (["profiles", "press", "tuning", "projects", "top"].includes(current)) renderCurrent(); },
  };
}
