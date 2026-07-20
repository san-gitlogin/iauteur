/* ============================================================================
   iAuteur Studio Console — front-end state machine + guided wizard.
   One source of truth (S). Every input change flows through setS()/render(),
   which recomputes the rail, the status pill, gating and loss-prevention.
   ========================================================================== */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

let CONFIG = null, BUDGETS = null, VOICES_ALL = [];

const STEPS = [
  { n: 1, lbl: "Topic", sub: "what it's about" },
  { n: 2, lbl: "Design", sub: "look & format" },
  { n: 3, lbl: "Author", sub: "write the spec" },
  { n: 4, lbl: "Voiceover", sub: "optional narration" },
  { n: 5, lbl: "Render", sub: "make the video" },
];

// ---- single source of truth -----------------------------------------------
const S = {
  step: 1,
  design: "moderndark",
  mode: "two",
  slugAuto: true,           // slug follows the topic until the user edits it
  beats: null, spec: null,  // in-progress authoring artifacts
  saved: false,             // a spec is written to disk for the current slug
  voiced: false, rendered: false,
  dirty: false,             // topic/design changed after a draft was started
  snapshot: null,           // {topic,design,format} captured when authoring began
  compConfig: null,         // Component Lab: the validated new-component config
  componentCreated: false,  // Component Lab: a component was wired successfully
  activeBeatIndex: null,    // which beat the creator drawer is bound to (per-beat)
  customComponents: {},     // type -> config for components created this session
};

// ==== boot ==================================================================
async function boot() {
  CONFIG = await (await fetch("/api/config")).json();
  try { BUDGETS = await (await fetch("/api/flow/budgets")).json(); } catch { BUDGETS = null; }

  fillSelect($("format"), CONFIG.formats, "both");
  fillSelect($("preset"), CONFIG.presets, "explainer");
  fillSelect($("audience"), CONFIG.audiences, "general");
  fillSelect($("themeLight"), CONFIG.themeLights, "daylight");
  fillSelect($("background"), CONFIG.backgrounds, "(theme default)");
  $("channel").value = CONFIG.channelDefault || "";
  await populateVoices();
  const restored = loadState();
  buildDesignGrid();
  buildTopicPicker();
  buildRail();
  wireEvents();
  if (restored) restoreViews();
  render();
  log(restored ? "Restored your previous session." : "Console ready. Start at Step 1.", "muted");
}

function fillSelect(sel, values, current) {
  sel.innerHTML = "";
  for (const v of values) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v; if (v === current) o.selected = true;
    sel.appendChild(o);
  }
}

// ==== derived config sent to the backend ====================================
function cfg() {
  return {
    topic: $("topic").value.trim(), source: $("source").value,
    format: $("format").value, preset: $("preset").value,
    audience: $("audience").value, minutes: $("minutes").value,
    themeLight: $("themeLight").value, background: $("background").value,
    channel: $("channel").value, notes: $("notes").value,
    design: S.design, theme: S.design,
  };
}
function slugify(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

// ==== central re-render =====================================================
function render() {
  const topic = $("topic").value.trim();
  // slug follows the topic until the user edits the slug field
  if (S.slugAuto) $("slug").value = slugify(topic);
  const slug = $("slug").value.trim();

  // topbar context
  $("ctxTopic").textContent = topic || "—";
  $("ctxSlug").textContent = slug || "—";

  // status pill
  const pill = $("statusPill"), st = $("statusText");
  pill.className = "statuspill";
  if (S.rendered) { pill.classList.add("rendered"); st.textContent = "Rendered ✓"; }
  else if (S.saved) { pill.classList.add("saved"); st.textContent = "Spec saved"; }
  else if (S.spec) { pill.classList.add("draft"); st.textContent = "Draft (unsaved)"; }
  else if (topic) { pill.classList.add("draft"); st.textContent = "Draft"; }
  else { st.textContent = "Empty"; }

  // rail states
  $$(".stepitem").forEach((el) => {
    const n = +el.dataset.step;
    el.classList.toggle("active", n === S.step);
    const done = (n === 1 && !!topic) || (n === 2 && S.step > 2) ||
      (n === 3 && S.saved) || (n === 4 && S.voiced) || (n === 5 && S.rendered) ||
      (n === 6 && S.componentCreated);
    el.classList.toggle("done", done);
    const locked = (n === 4 || n === 5) && !S.saved;
    el.classList.toggle("locked", locked);
    el.querySelector(".tick").textContent = done ? "✓" : "";
  });

  // show only the active panel
  $$(".step-panel").forEach((p) => p.classList.toggle("hidden", +p.dataset.step !== S.step));

  // gating
  $("saveTwoBtn").disabled = !S.spec || !S.lintOk;
  const needSpec = !S.saved;
  $("voGate").classList.toggle("hidden", !needSpec);
  $("renderGate").classList.toggle("hidden", !needSpec);
  ["voBtn", "voSetup"].forEach((id) => $(id).disabled = needSpec && id === "voBtn");
  $$('[data-action]').forEach((b) => { if (b.dataset.action.startsWith("render") || ["lint", "critique"].includes(b.dataset.action)) b.disabled = needSpec; });

  // dirty / loss-prevention banner
  $("dirtyBanner").classList.toggle("hidden", !(S.dirty && (S.beats || S.spec)));
  saveState();
}
function stepReached(n) { return true; } // step 2 "done" once a design is chosen (always defaulted)

function setStep(n) {
  if ((n === 4 || n === 5) && !S.saved) { toast("Save a spec first (Step 3).", "warn"); return; }
  S.step = n; render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==== Component Lab =========================================================
function compBrief() {
  return {
    need: $("compNeed").value.trim(),
    segment: $("compSegment").value.trim(),
    example: $("compExample").value.trim(),
    dynamic: $("compDynamic").checked,
    typeName: $("compType").value.trim(),
    name: $("compName").value.trim(),
    dataKey: $("compDataKey").value.trim(),
    categoryHint: $("compCategory").value.trim(),
    familyHint: $("compFamily").value.trim(),
    design: S.design, theme: S.design,
  };
}

async function onCompStage1() {
  if (!$("compNeed").value.trim()) { toast("Describe what the component must show.", "warn"); return; }
  const btn = $("compStage1Btn"); btn.disabled = true; btn.textContent = "Generating…";
  const res = await jpost("/api/component/stage1", compBrief());
  btn.disabled = false; btn.textContent = "Generate contract prompt";
  if (res.error || !res.ok) { toast(res.error || "Failed to generate.", "err"); return; }
  $("compStage1Text").textContent = res.prompt;
  $("compStage1Box").classList.remove("hidden");
  toast("Stage 1 prompt ready — paste it into your LLM.", "ok");
}

async function onCompValidate() {
  let config;
  try { config = JSON.parse($("compConfigJson").value); }
  catch (e) { toast("Config JSON is invalid: " + e.message, "err"); return; }
  const res = await jpost("/api/component/validate", { brief: compBrief(), config });
  const box = $("compValidateVerdict");
  if (res.error) { toast(res.error, "err"); return; }
  if (res.ok) {
    S.compConfig = res.config;
    box.innerHTML = `<div class="banner ok"><span class="bico">✓</span><div class="bbody">Config is valid — <b>${res.config.type}</b> (${res.config.name}). Continue to Stage 2.</div></div>`;
    $("compStage2Card").classList.remove("hidden");
    toast("Config validated.", "ok");
  } else {
    S.compConfig = null;
    box.innerHTML = `<div class="banner warn"><span class="bico">!</span><div class="bbody">Fix these, then re-validate:<ul>${(res.errors || []).map((e) => `<li>${e}</li>`).join("")}</ul></div></div>`;
  }
}

async function onCompStage2() {
  if (!S.compConfig) { toast("Validate the config first.", "warn"); return; }
  const btn = $("compStage2Btn"); btn.disabled = true; btn.textContent = "Generating…";
  const res = await jpost("/api/component/stage2", { brief: compBrief(), config: S.compConfig });
  btn.disabled = false; btn.textContent = "Generate component prompt";
  if (res.error || !res.ok) { toast(res.error || "Failed to generate.", "err"); return; }
  $("compStage2Text").textContent = res.prompt;
  $("compStage2Box").classList.remove("hidden");
  toast("Stage 2 prompt ready — paste it into your LLM.", "ok");
}

async function onCompAssemble() {
  if (!S.compConfig) { toast("Validate the config first.", "warn"); return; }
  const tsx = $("compTsx").value;
  if (!tsx.trim()) { toast("Paste the component .tsx from Stage 2.", "warn"); return; }
  const btn = $("compAssembleBtn"); btn.disabled = true; btn.textContent = "Wiring & verifying…";
  log(`▶ assemble ${S.compConfig.type}`, "cmd"); openConsole();
  const res = await jpost("/api/component/assemble", { brief: compBrief(), config: S.compConfig, tsx });
  btn.disabled = false; btn.textContent = "Assemble → auto-wire → verify";
  const box = $("compAssembleResult");
  if (res.error) { toast(res.error, "err"); log(res.error, "err"); return; }
  log(res.output || "", res.ok ? "ok" : "err");
  if (res.ok) {
    S.componentCreated = true;
    if (S.activeBeatIndex != null && S.beats && S.beats[S.activeBeatIndex]) {
      const bd = S.beats[S.activeBeatIndex]; const ex = (S.compConfig && S.compConfig.example) || {};
      bd.type = res.type; bd.custom = true; bd.dataKey = S.compConfig.dataKey;
      bd.data = (ex && ex[S.compConfig.dataKey]) ? ex : { [S.compConfig.dataKey]: ex };
      S.customComponents[res.type] = S.compConfig;
      renderBeatReview(S.beats);
      toast(`Bound ${res.type} to beat ${bd.id || (S.activeBeatIndex + 1)} — preview it in the Author list.`, "ok");
    }
    box.innerHTML = `<div class="banner ok"><span class="bico">✓</span><div class="bbody"><b>${res.type}</b> wired into the library and type-checked. Render a preview below, or use it in a video spec.</div></div>`;
    $("compProofCard").classList.remove("hidden");
    toast(`${res.type} created ✓`, "ok"); render();
  } else {
    box.innerHTML = `<div class="banner warn"><span class="bico">!</span><div class="bbody">Assembly failed — <b>all changes were rolled back</b>. See the console. Fix the component and paste again.</div></div>`;
    toast("Assembly failed — rolled back.", "err");
  }
}

async function onCompPreview() {
  if (!S.compConfig) { toast("Create the component first.", "warn"); return; }
  const cfg = S.compConfig;
  const ex = (cfg.example && cfg.example[cfg.dataKey]) ? cfg.example : { [cfg.dataKey]: cfg.example || {} };
  const vertical = $("format").value === "shorts";
  const btn = $("compProofBtn"); btn.disabled = true; btn.textContent = "Rendering…"; setLive(true, "rendering preview…");
  const prog = $("compPreviewProgress"), bar = $("compPreviewBar"), pct = $("compPreviewPct");
  prog.classList.remove("hidden"); bar.style.width = "0%"; pct.textContent = "starting…";
  const box = $("compProof"); box.innerHTML = "";
  let done = null;
  try {
    const r = await fetch("/api/component/preview-stream", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: {
        type: cfg.type, sceneData: ex[cfg.dataKey], design: S.design, theme: S.design,
        format: vertical ? "short" : "long", durationFrames: 150 } }),
    });
    const reader = r.body.getReader(), dec = new TextDecoder(); let buf = "";
    for (;;) {
      const { value, done: fin } = await reader.read(); if (fin) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n\n")) >= 0) {
        const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
        let ev = null, data = "";
        for (const line of frame.split("\n")) {
          if (line.startsWith("event:")) ev = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (ev === "done") { try { done = JSON.parse(data); } catch (e) { done = { ok: false }; } }
        else if (data) {
          const m = data.match(/(bundling|rendering)\s+(\d+)%/i);
          if (m) { const p = +m[2]; bar.style.width = p + "%"; pct.textContent = `${m[1].toLowerCase()} ${p}%`; }
          log(data, "out");
        }
      }
    }
    if (done && done.ok && done.url) {
      bar.style.width = "100%"; pct.textContent = "done ✓";
      box.innerHTML = `<video src="${done.url}?t=${Date.now()}" controls autoplay loop muted playsinline></video>`
        + `<div class="cap">${escapeHtml(cfg.type)} · ${escapeHtml(S.design)} · rendered preview</div>`;
      toast("Preview rendered ✓", "ok");
    } else {
      prog.classList.add("hidden");
      const msg = (done && (done.output || done.error)) || "Preview render failed — see console.";
      toast(msg, "err"); if (done && (done.output || done.error)) log(done.output || done.error, "err");
    }
  } catch (e) {
    prog.classList.add("hidden"); toast("Preview stream failed: " + e.message, "err");
  } finally {
    btn.disabled = false; btn.textContent = "▶ Render preview"; setLive(false);
  }
}

async function onCompRemove() {
  const type = $("compRemoveType").value.trim();
  if (!type) { toast("Enter the TYPE to remove.", "warn"); return; }
  if (!confirm(`Remove component ${type}? This un-wires it from every file.`)) return;
  const btn = $("compRemoveBtn"); btn.disabled = true; btn.textContent = "Removing…";
  log(`▶ remove ${type}`, "cmd"); openConsole();
  const res = await jpost("/api/component/remove", { type });
  btn.disabled = false; btn.textContent = "Remove";
  const box = $("compRemoveResult");
  if (res.error) { toast(res.error, "err"); return; }
  log(res.output || "", res.ok ? "ok" : "err");
  if (res.ok) {
    box.innerHTML = `<div class="banner ok"><span class="bico">✓</span><div class="bbody"><b>${res.type}</b> removed and type-checked clean.</div></div>`;
    toast(`${res.type} removed.`, "ok");
  } else {
    box.innerHTML = `<div class="banner warn"><span class="bico">!</span><div class="bbody">Remove failed — <b>rolled back</b>. See the console.</div></div>`;
    toast("Remove failed — rolled back.", "err");
  }
}

// ==== per-beat creation drawer + preview + persistence ======================
function openCreatorForBeat(i) {
  S.activeBeatIndex = i;
  const b = (S.beats && S.beats[i]) || {};
  $("creatorTitle").textContent = `New component · beat ${b.id || "s" + (i + 1)}`;
  const note = $("creatorBeatNote"); note.classList.remove("hidden");
  note.textContent = `Beat ${b.id || ""} (${b.type || ""}): “${b.narration || b.intent || ""}”`;
  if (!$("compNeed").value.trim()) $("compNeed").value = b.intent || b.narration || "";
  $("compSegment").value = b.narration || "";
  const drawer = $("componentCreator"); drawer.classList.remove("hidden"); drawer.setAttribute("aria-hidden", "false");
  drawer.scrollTop = 0; saveState();
}
function closeCreator() {
  const drawer = $("componentCreator"); drawer.classList.add("hidden"); drawer.setAttribute("aria-hidden", "true");
  S.activeBeatIndex = null; saveState();
}
async function previewBeat(item, prevBox, btn) {
  if (!item.type || !item.data) { toast("This beat has no component data to preview yet.", "warn"); return; }
  const orig = btn.textContent; btn.disabled = true; btn.textContent = "rendering…"; setLive(true, "rendering preview…");
  const vertical = $("format").value === "shorts";
  const res = await jpost("/api/component/preview", { brief: {
    type: item.type, sceneData: item.data, design: S.design, theme: S.design,
    format: vertical ? "short" : "long", durationFrames: item.durationFrames || 150 } });
  btn.disabled = false; btn.textContent = orig; setLive(false);
  if (res.error || !res.ok) { toast(res.error || "Preview render failed.", "err"); if (res.output) log(res.output, "err"); return; }
  prevBox.innerHTML = `<video src="/proof-img/${res.file}?t=${Date.now()}" controls autoplay loop muted playsinline></video>`
    + `<div class="cap">${escapeHtml(item.type)} · ${escapeHtml(S.design)} · scrub the timeline to see the animation</div>`;
}
function overlayCustomBeats() {
  if (!S.spec || !S.beats) return;
  for (const b of S.beats) if (b.custom && b.type && b.data) {
    const sc = (S.spec.scenes || []).find((s) => s.id === b.id);
    if (sc) { sc.type = b.type; sc.data = b.data; }
  }
}
const LS_KEY = "iauteur_console_v1";
function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      step: S.step, design: S.design, mode: S.mode,
      beats: S.beats, spec: S.spec, saved: S.saved, voiced: S.voiced, rendered: S.rendered, lintOk: S.lintOk,
      customComponents: S.customComponents,
      form: {
        topic: $("topic").value, source: $("source").value, notes: $("notes").value,
        format: $("format").value, preset: $("preset").value, audience: $("audience").value, minutes: $("minutes").value,
        themeLight: $("themeLight").value, background: $("background").value, channel: $("channel").value,
        slug: $("slug").value, beatsJson: $("beatsJson").value, replyJson: $("replyJson").value,
      },
    }));
  } catch (e) { /* localStorage full / disabled — non-fatal */ }
}
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY); if (!raw) return false;
    const s = JSON.parse(raw);
    S.step = s.step || 1; S.design = s.design || S.design; S.mode = s.mode || "two";
    S.beats = s.beats || null; S.spec = s.spec || null;
    S.saved = !!s.saved; S.voiced = !!s.voiced; S.rendered = !!s.rendered; S.lintOk = !!s.lintOk;
    S.customComponents = s.customComponents || {};
    const f = s.form || {};
    for (const k of Object.keys(f)) { const el = $(k); if (el != null && f[k] != null) el.value = f[k]; }
    return true;
  } catch (e) { return false; }
}
function restoreViews() {
  $$("#modeSeg button").forEach((x) => x.classList.toggle("on", x.dataset.mode === S.mode));
  $("twoFlow").classList.toggle("hidden", S.mode !== "two");
  $("singleFlow").classList.toggle("hidden", S.mode !== "single");
  if (S.beats) { renderBeatReview(S.beats); $("beatReview").classList.remove("hidden"); $("ss-a4").classList.remove("hidden"); }
  if (S.spec && S.spec.scenes) { renderMeterRows($("sceneMeters"), S.spec.scenes, { kind: "scene" }); $("sceneEditor").classList.remove("hidden"); }
  if (!S.snapshot && (S.beats || S.spec)) snapshotAuthoring();
}

// ==== rail ==================================================================
function buildRail() {
  const rail = $("rail");
  STEPS.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "stepitem"; el.dataset.step = s.n;
    el.innerHTML = `<span class="num">${s.n}</span>
      <span><span class="lbl">${s.lbl}</span><span class="sub">${s.sub}</span></span>
      <span class="tick"></span>`;
    el.onclick = () => setStep(s.n);
    rail.appendChild(el);
  });
}

// ==== design gallery ========================================================
function buildDesignGrid() {
  const grid = $("designGrid"); grid.innerHTML = "";
  for (const d of CONFIG.designs) {
    const card = document.createElement("div");
    card.className = "gcard"; card.dataset.key = d.key;
    const thumb = d.preview ? `<span class="thumb" style="background-image:url('${d.preview}')"></span>`
      : `<span class="noimg">no preview</span>`;
    card.innerHTML = `${thumb}<div class="gname">${d.label}<small>${d.theme}</small></div>`;
    card.onclick = () => selectDesign(d.key);
    grid.appendChild(card);
  }
  selectDesign(S.design);
}
function selectDesign(key) {
  const changed = S.design !== key;
  S.design = key;
  $$(".gcard").forEach((c) => c.classList.toggle("sel", c.dataset.key === key));
  const d = CONFIG.designs.find((x) => x.key === key);
  $("pickedLabel").textContent = d ? `→ ${d.label}` : "";
  if (changed) checkDirty();
  render();
}

// ==== topic picker ==========================================================
function buildTopicPicker() {
  const tp = $("topicPick");
  tp.innerHTML = `<option value="">— existing topics —</option>`;
  for (const t of CONFIG.topics) {
    const o = document.createElement("option");
    o.value = t.slug; o.textContent = `${t.slug}${t.theme ? " · " + t.theme : ""}`;
    tp.appendChild(o);
  }
  tp.onchange = () => {
    if (!tp.value) return;
    S.slugAuto = false; $("slug").value = tp.value;
    S.saved = true; S.spec = S.spec || { loaded: true }; // an existing topic already has a spec on disk
    toast(`Loaded topic “${tp.value}”. Voiceover & Render are unlocked.`, "info");
    refreshOutputs(); render();
  };
}

// ==== loss prevention: detect topic/design drift after a draft ==============
function snapshotAuthoring() { S.snapshot = { topic: $("topic").value.trim(), design: S.design, format: $("format").value }; }
function checkDirty() {
  if (!(S.beats || S.spec) || !S.snapshot) return;
  const now = { topic: $("topic").value.trim(), design: S.design, format: $("format").value };
  S.dirty = now.topic !== S.snapshot.topic || now.design !== S.snapshot.design || now.format !== S.snapshot.format;
}
function resetAuthoring() {
  S.beats = null; S.spec = null; S.saved = false; S.lintOk = false; S.dirty = false; S.snapshot = null;
  ["stage1Box", "stage2Box", "beatReview", "ss-a4", "fixWrap", "sceneEditor", "promptBox"].forEach((id) => $(id) && $(id).classList.add("hidden"));
  $("beatsJson").value = ""; $("replyJson").value = ""; $("replyJsonSingle") && ($("replyJsonSingle").value = "");
  $("beatVerdict").innerHTML = ""; $("assembleResult").innerHTML = "";
  render();
}

// ==== events ================================================================
function wireEvents() {
  // step nav buttons
  $$("[data-next]").forEach((b) => b.onclick = () => setStep(Math.min(5, S.step + 1)));
  $$("[data-back]").forEach((b) => b.onclick = () => setStep(Math.max(1, S.step - 1)));

  // config change tracking (loss prevention + slug sync)
  $("topic").addEventListener("input", () => { checkDirty(); render(); });
  ["format", "preset", "audience", "minutes", "themeLight", "background", "channel"].forEach((id) =>
    $(id).addEventListener("change", () => { checkDirty(); render(); }));
  $("slug").addEventListener("input", () => { S.slugAuto = false; render(); });

  // mode toggle
  $$("#modeSeg button").forEach((b) => b.onclick = () => {
    S.mode = b.dataset.mode;
    $$("#modeSeg button").forEach((x) => x.classList.toggle("on", x === b));
    $("twoFlow").classList.toggle("hidden", S.mode !== "two");
    $("singleFlow").classList.toggle("hidden", S.mode !== "single");
  });

  // dirty banner actions
  $("discardDraft").onclick = () => { resetAuthoring(); toast("Draft cleared. Regenerate the prompt for your new settings.", "info"); };
  $("keepDraft").onclick = () => { S.dirty = false; render(); };

  // copy buttons
  $$("[data-copy]").forEach((b) => b.onclick = () => {
    const el = $(b.dataset.copy); if (!el) return;
    navigator.clipboard.writeText(el.textContent);
    toast("Copied to clipboard.", "ok");
  });

  // authoring handlers
  $("stage1Btn").onclick = onStage1;
  $("validateBtn").onclick = onValidate;
  $("stage2Btn").onclick = onStage2;
  $("assembleBtn").onclick = () => doAssemble("replyJson");
  $("assembleSingleBtn").onclick = () => doAssemble("replyJsonSingle");
  $("promptBtn").onclick = onSinglePrompt;
  $("applyfixBtn").onclick = onApplyFix;
  $("saveTwoBtn").onclick = onSave;
  $("intakeBtn").onclick = onIntake;

  // Component Lab handlers
  $("compStage1Btn").onclick = onCompStage1;
  $("compValidateBtn").onclick = onCompValidate;
  $("compStage2Btn").onclick = onCompStage2;
  $("compAssembleBtn").onclick = onCompAssemble;
  $("compProofBtn").onclick = onCompPreview;
  $("compRemoveBtn").onclick = onCompRemove;
  $("creatorClose").onclick = closeCreator;

  // voiceover
  $("voBtn").onclick = onVoiceover;
  $("voSetup").onclick = onVoiceSetup;

  // render / checks
  $$('[data-action]').forEach((b) => b.onclick = () => runAction(b.dataset.action));
  $("refreshOut").onclick = refreshOutputs;

  // reset (two-click confirm — no modal)
  let armed = false, t;
  $("resetBtn").onclick = () => {
    if (!armed) { armed = true; $("resetBtn").textContent = "Click to confirm"; $("resetBtn").classList.add("danger");
      t = setTimeout(() => { armed = false; $("resetBtn").textContent = "Reset"; $("resetBtn").classList.remove("danger"); }, 2500); return; }
    clearTimeout(t); try { localStorage.removeItem("iauteur_console_v1"); } catch (e) {} location.reload();
  };

  // console drawer
  $("consoleHead").onclick = (e) => { if (e.target.id === "clearLog") return; toggleConsole(); };
  $("clearLog").onclick = (e) => { e.stopPropagation(); $("consoleBody").innerHTML = ""; };
  $("toggleLog").onclick = (e) => { e.stopPropagation(); toggleConsole(); };
}
function toggleConsole(force) {
  const c = $("console");
  const collapsed = force === undefined ? !c.classList.contains("collapsed") : force;
  c.classList.toggle("collapsed", collapsed);
  $("toggleLog").textContent = collapsed ? "▲ show" : "▼ hide";
}

// ==== authoring: two-paste ==================================================
async function withBtn(btn, label, fn) {
  const orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span>${label}`;
  try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = orig; }
}
async function jpost(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
function requireTopic() { if (!$("topic").value.trim()) { toast("Enter a topic first (Step 1).", "warn"); return false; } return true; }

async function onStage1() {
  if (!requireTopic()) return;
  const res = await withBtn($("stage1Btn"), "Generating…", () => jpost("/api/flow/stage1", cfg()));
  if (res.error) { toast(res.error, "err"); return; }
  $("stage1Box").classList.remove("hidden"); $("stage1Text").textContent = res.prompt;
  snapshotAuthoring(); S.dirty = false;
  toast("Beat-sheet prompt ready — paste it to your LLM.", "ok"); render();
}

async function onValidate() {
  let beats;
  try { beats = JSON.parse($("beatsJson").value); }
  catch (e) { toast("Beat-sheet JSON is invalid: " + e.message, "err"); return; }
  const res = await withBtn($("validateBtn"), "Validating…", () => jpost("/api/flow/validate", { cfg: cfg(), beats }));
  if (res.error) { toast(res.error, "err"); return; }
  const vb = $("beatVerdict");
  vb.innerHTML = `<div class="banner ${res.ok ? "ok" : "err"}"><span class="bico">${res.ok ? "✓" : "✗"}</span>
    <div class="bbody"><b>${res.ok ? "Beat sheet valid" : "Beat sheet rejected"}</b>
    <pre>${escapeHtml(res.ok ? res.verdict : res.reask)}</pre></div></div>`;
  if (res.ok) {
    S.beats = res.beats; renderBeatReview(res.beats);
    $("beatReview").classList.remove("hidden"); $("ss-a4").classList.remove("hidden");
    snapshotAuthoring();
    toast("Beats valid — review narration, then generate the fill prompt.", "ok");
  } else {
    $("beatReview").classList.add("hidden"); $("ss-a4").classList.add("hidden");
    toast("Beat sheet needs changes — see the note.", "warn");
  }
  render();
}

function renderBeatReview(beats) { renderMeterRows($("beatRows"), beats, { kind: "beat" }); }
function renderMeterRows(box, items, opts = {}) {
  const kind = opts.kind || "scene";
  box.innerHTML = "";
  items.forEach((b, i) => {
    const row = document.createElement("div"); row.className = "beatrow";
    const id = b.id || "s" + (i + 1);
    const typeLabel = b.custom ? `<span class="beat-custom">★ ${escapeHtml(b.type)}</span>` : escapeHtml(b.type);
    const btype = document.createElement("span"); btype.className = "btype"; btype.title = `${id} · ${b.type}`;
    btype.innerHTML = `${escapeHtml(id)} · ${typeLabel}`;
    const ta = document.createElement("textarea"); ta.rows = 1; ta.value = b.narration || "";
    const m = document.createElement("span"); m.className = "meter";
    ta.oninput = () => { b.narration = ta.value; meter(ta, m, b.type === "HOOK"); saveState(); };
    const prevBox = document.createElement("div"); prevBox.className = "beatprev";
    const btns = document.createElement("div"); btns.className = "beatbtns";
    if (kind === "beat") {
      const nc = document.createElement("button"); nc.className = "btn sm ghost";
      nc.textContent = b.custom ? "↺ recreate" : "＋ component";
      nc.onclick = () => openCreatorForBeat(i);
      btns.appendChild(nc);
    }
    if (b.data && Object.keys(b.data).length) {
      const pv = document.createElement("button"); pv.className = "btn sm"; pv.textContent = "▶ preview";
      pv.onclick = () => previewBeat(b, prevBox, pv);
      btns.appendChild(pv);
    }
    row.appendChild(btype); row.appendChild(ta); row.appendChild(m); row.appendChild(btns);
    box.appendChild(row); box.appendChild(prevBox);
    meter(ta, m, b.type === "HOOK");
  });
}
function meter(ta, m, isHook) {
  const words = (ta.value.trim().match(/\S+/g) || []).length;
  const cap = isHook ? (BUDGETS?.hookMaxWords || 17) : (BUDGETS?.sentenceMaxWords || 20);
  m.textContent = `${words}/${cap}w`; m.className = "meter " + (words > cap ? "over" : "okm");
}

async function onStage2() {
  const beats = S.beats || (() => { try { return JSON.parse($("beatsJson").value); } catch { return null; } })();
  if (!beats) { toast("Validate a beat sheet first.", "warn"); return; }
  const res = await withBtn($("stage2Btn"), "Generating…", () => jpost("/api/flow/stage2", { cfg: cfg(), beats: { beats } }));
  if (res.error) { toast(res.error, "err"); return; }
  $("stage2Box").classList.remove("hidden"); $("stage2Text").textContent = res.prompt;
  toast("Fill prompt ready — paste it to your LLM.", "ok");
}

async function onSinglePrompt() {
  if (!requireTopic()) return;
  const res = await withBtn($("promptBtn"), "Generating…", () => jpost("/api/prompt", cfg()));
  if (res.error) { toast(res.error, "err"); return; }
  $("promptBox").classList.remove("hidden"); $("promptText").textContent = res.prompt;
  if (res.slug && S.slugAuto) { $("slug").value = res.slug; $("slug").dataset.auto = res.slug; }
  snapshotAuthoring(); S.dirty = false;
  toast("Single-paste prompt ready.", "ok"); render();
}

async function doAssemble(replyId) {
  let reply;
  try { reply = JSON.parse($(replyId).value); }
  catch (e) { toast("Reply JSON is invalid: " + e.message, "err"); return; }
  const btn = replyId === "replyJson" ? $("assembleBtn") : $("assembleSingleBtn");
  const res = await withBtn(btn, "Assembling…", () => jpost("/api/flow/assemble", { cfg: cfg(), reply }));
  if (res.error) { toast(res.error, "err"); return; }
  S.spec = res.spec; S.lintOk = res.ok; S.dirty = false; snapshotAuthoring();
  overlayCustomBeats();
  renderAssemble(res); render();
}

function renderAssemble(res) {
  const box = $("assembleResult");
  box.innerHTML = `<div class="banner ${res.ok ? "ok" : "err"}"><span class="bico">${res.ok ? "✓" : "✗"}</span>
    <div class="bbody"><b>${res.ok ? "Lint PASS" : "Needs a fix"}</b>
    <span class="muted small">— first-try ${res.firstTry ? "yes" : "no"} · errors ${res.errBefore}→${res.errAfter}
    · ${(res.changes || []).length} auto-fixes${(res.warnings || []).length ? " · " + res.warnings.length + " advisories" : ""}</span>
    <pre>${escapeHtml(res.lint || "")}</pre></div></div>`;
  if (res.ok) {
    $("fixWrap").classList.add("hidden");
    renderMeterRows($("sceneMeters"), res.spec.scenes || [], { kind: "scene" }); $("sceneEditor").classList.remove("hidden");
    toast("Spec assembled and lints clean. Save it to continue.", "ok");
  } else {
    $("fixWrap").classList.remove("hidden"); $("fixText").textContent = res.fixPrompt || ""; $("patchJson").value = "";
    $("sceneEditor").classList.add("hidden");
    toast("Residual lint errors — one fix round below.", "warn");
  }
}

async function onApplyFix() {
  if (!S.spec) { toast("Assemble first.", "warn"); return; }
  let patch;
  try { patch = JSON.parse($("patchJson").value); }
  catch (e) { toast("Patch JSON is invalid: " + e.message, "err"); return; }
  const res = await withBtn($("applyfixBtn"), "Applying…", () => jpost("/api/flow/applyfix", { cfg: cfg(), spec: S.spec, patch }));
  if (res.error) { toast(res.error, "err"); return; }
  S.spec = res.spec; S.lintOk = res.ok;
  renderAssemble({ ok: res.ok, firstTry: false, errBefore: "-", errAfter: res.ok ? 0 : "?", changes: [], warnings: [], lint: res.lint, fixPrompt: res.fixPrompt, spec: res.spec });
  render();
}

async function onSave() {
  if (!S.spec) { toast("Nothing to save yet.", "warn"); return; }
  const slug = $("slug").value.trim() || slugify($("topic").value) || "topic";
  $("slug").value = slug; S.slugAuto = false;
  const key = (S.spec.meta && S.spec.meta.format === "short") ? "shortsJson" : "longJson";
  const res = await withBtn($("saveTwoBtn"), "Saving…", () => jpost("/api/intake", { slug, [key]: JSON.stringify(S.spec) }));
  log(res.output || "(no output)", res.ok ? "ok" : "err");
  if (res.ok) { S.saved = true; toast("Spec saved. Voiceover & Render are unlocked.", "ok"); setStep(4); }
  else toast("Save failed — see console.", "err");
  render();
}

async function onIntake() {
  const slug = $("slug").value.trim();
  if (!slug) { toast("Enter a topic slug.", "warn"); return; }
  if (!$("longJson").value.trim() && !$("shortsJson").value.trim()) { toast("Paste at least long.json.", "warn"); return; }
  log("▶ validating & saving JSON …", "cmd"); openConsole();
  const res = await jpost("/api/intake", { slug, longJson: $("longJson").value, shortsJson: $("shortsJson").value });
  log(res.output || "(no output)", res.ok ? "ok" : "err");
  if (res.ok) { S.saved = true; S.spec = S.spec || { loaded: true }; toast("Saved.", "ok"); render(); }
  else toast("Save failed — see console.", "err");
}

// ==== voiceover =============================================================
async function populateVoices() {
  let voices = null;
  try { voices = (await (await fetch("/api/voices")).json()).voices; } catch { voices = null; }
  if (!voices || !voices.length)
    voices = (CONFIG.voices || ["en-US-ChristopherNeural"]).map((n) => ({ name: n, locale: n.split("-").slice(0, 2).join("-"), gender: "" }));
  VOICES_ALL = voices;
  const langs = [...new Set(voices.map((v) => v.locale))].sort();
  const ordered = [...langs.filter((l) => l.startsWith("en")), ...langs.filter((l) => !l.startsWith("en"))];
  const langSel = $("voLang"); langSel.innerHTML = "";
  for (const l of ordered) { const o = document.createElement("option"); o.value = l; o.textContent = l; langSel.appendChild(o); }
  langSel.value = ordered.includes("en-US") ? "en-US" : ordered[0];
  langSel.onchange = renderVoiceOptions; renderVoiceOptions();
}
function renderVoiceOptions() {
  const lang = $("voLang").value, sel = $("voVoice"); sel.innerHTML = "";
  for (const v of VOICES_ALL.filter((x) => x.locale === lang)) {
    const o = document.createElement("option");
    o.value = v.name; o.textContent = v.name.replace(lang + "-", "").replace("Neural", "") + (v.gender ? ` · ${v.gender}` : "");
    sel.appendChild(o);
  }
}
async function onVoiceover() {
  const slug = $("slug").value.trim(); if (!slug) { toast("Save a spec first.", "warn"); return; }
  const kind = $("voKind").value, voice = $("voVoice").value;
  log(`▶ voiceover ${slug} (${kind}, ${voice}) … can take a minute`, "cmd"); openConsole();
  const res = await withBtn($("voBtn"), "Generating…", () => jpost("/api/voiceover", { slug, kind, voice }));
  log(res.output || "(no output)", res.ok ? "ok" : "err");
  if (res.ok) { S.voiced = true; toast("Voiceover synced into the spec.", "ok"); render(); }
  else toast("Voiceover failed — see console.", "err");
}
async function onVoiceSetup() {
  log("▶ installing / upgrading Edge-TTS …", "cmd"); openConsole();
  const res = await withBtn($("voSetup"), "Installing…", () => jpost("/api/voiceover-setup", {}));
  log(res.output || "(no output)", res.ok ? "ok" : "err");
  toast(res.ok ? "Edge-TTS ready." : "Install failed — see console.", res.ok ? "ok" : "err");
}

// ==== run actions (lint / critique / render, streamed) ======================
async function runAction(action) {
  const slug = $("slug").value.trim();
  if (action !== "studio" && !slug) { toast("Save a spec first.", "warn"); return; }

  if (action === "studio") {
    const res = await jpost("/api/run", { action, slug });
    log(res.output || "(no output)", res.ok ? "ok" : "err");
    if (res.url) { log("↗ " + res.url, "ok"); toast("Remotion Studio launching at " + res.url, "info"); }
    return;
  }

  const actionBtns = $$('[data-action]');
  actionBtns.forEach((b) => b.disabled = true);
  openConsole(); setLive(true, `${action} running…`);
  log(`▶ ${action} ${slug}`, "cmd");
  const es = new EventSource(`/api/run-stream?action=${encodeURIComponent(action)}&slug=${encodeURIComponent(slug)}`);
  es.onmessage = (e) => log(e.data);
  es.addEventListener("done", (e) => {
    es.close(); actionBtns.forEach((b) => b.disabled = false); setLive(false);
    render(); // re-applies gating (buttons re-enabled per state)
    let r = {}; try { r = JSON.parse(e.data); } catch {}
    if (r.ok) {
      log(`✓ ${action} done${r.file ? ` → ${r.file} (${(r.size / 1e6).toFixed(1)} MB)` : ""}`, "ok");
      toast(`${action} finished.`, "ok");
      if (action.startsWith("render")) { S.rendered = true; refreshOutputs(); render(); }
    } else {
      log(`✗ ${r.output || ("exit code " + r.code)}`, "err");
      toast(`${action} failed — see console.`, "err");
    }
  });
  es.onerror = () => { es.close(); actionBtns.forEach((b) => b.disabled = false); setLive(false); log("✗ stream ended unexpectedly.", "err"); };
}

async function refreshOutputs() {
  const slug = $("slug").value.trim(); if (!slug) return;
  const res = await (await fetch(`/api/outputs/${slug}`)).json();
  const box = $("outputs"); box.innerHTML = "";
  const vids = (res.files || []).filter((f) => f.name.endsWith(".mp4"));
  const others = (res.files || []).filter((f) => !f.name.endsWith(".mp4"));
  for (const f of vids) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div class="muted small" style="margin-bottom:6px">${f.name}</div>`;
    const v = document.createElement("video"); v.src = f.url; v.controls = true; v.preload = "metadata";
    wrap.appendChild(v); box.appendChild(wrap);
  }
  if (others.length) {
    const fr = document.createElement("div"); fr.className = "filerow";
    for (const f of others) { const a = document.createElement("a"); a.href = f.url; a.textContent = f.name; a.target = "_blank"; fr.appendChild(a); }
    box.appendChild(fr);
  }
  if (!(res.files || []).length) box.innerHTML = `<span class="muted small">No outputs yet for ${slug}. Render one above.</span>`;
}

// ==== console + toasts ======================================================
function openConsole() { toggleConsole(false); }
function setLive(on, msg) {
  $("liveBadge").classList.toggle("hidden", !on);
  $("consoleStat").textContent = on ? (msg || "running…") : "idle";
}
function log(text, kind) {
  const body = $("consoleBody");
  const line = document.createElement("div");
  line.className = "logline" + (kind && kind !== "muted" ? " " + kind : "");
  const now = new Date().toTimeString().slice(0, 8);
  line.innerHTML = `<span class="t">${now}</span><span>${escapeHtml(text)}</span>`;
  body.appendChild(line); body.scrollTop = body.scrollHeight;
}
let toastId = 0;
function toast(text, kind = "info") {
  const host = $("toasts"); const el = document.createElement("div");
  el.className = "toast " + kind; const id = ++toastId;
  const ico = { ok: "✓", err: "✗", warn: "⚠", info: "ℹ" }[kind] || "ℹ";
  el.innerHTML = `<span class="tico">${ico}</span><span>${escapeHtml(text)}</span>`;
  host.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(12px)"; setTimeout(() => el.remove(), 250); }, 3800);
}
function escapeHtml(s) { return (s || "").replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m])); }

boot();
