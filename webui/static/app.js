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
  busy: false,              // a render/preview/save/voiceover job is in flight
  aiMode: "two",            // AI automation: two-paste (default) | single
};

// Every button that kicks off a backend job. While one job runs, ALL of these are
// hard-disabled (setBusy) so a stray click can't start a second job and clobber
// shared state or preview files.
const JOB_BTN_SEL = [
  '[data-action]', '#stage1Btn', '#validateBtn', '#stage2Btn', '#assembleBtn',
  '#assembleSingleBtn', '#promptBtn', '#applyfixBtn', '#saveTwoBtn', '#intakeBtn',
  '#compStage1Btn', '#compValidateBtn', '#compStage2Btn', '#compAssembleBtn',
  '#compProofBtn', '#compRemoveBtn', '#voBtn', '#voSetup', '#refreshOut',
  '#autoRunBtn', '#aiSaveBtn', '#aiTestBtn',
  '.beatbtns button',
].join(', ');

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
  initAiPanel();
  if (restored) restoreViews();
  render();
  measureTopbar();
  try { new ResizeObserver(measureTopbar).observe(document.querySelector(".topbar")); } catch (e) { /* older browser */ }
  initOnboarding();
  checkSlugStatus();
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

// ---- global job lock (hard-disable other actions while one job runs) -------
function setBusy(on, label) {
  S.busy = !!on;
  document.body.classList.toggle("busy", S.busy);
  $$(JOB_BTN_SEL).forEach((b) => {
    if (on) { if (!b.disabled) b.dataset.wasEnabled = "1"; b.disabled = true; }
    else if (b.dataset.wasEnabled) { delete b.dataset.wasEnabled; b.disabled = false; }
  });
  setLive(!!on, label);
  if (!on) render(); // re-apply state-based gating (some buttons stay disabled by rules)
}
function guardBusy() {
  if (S.busy) { toast("A job is already running — wait for it to finish.", "warn"); return true; }
  return false;
}

// Keep --topbar-h in sync with the real (wrap-aware) topbar height so the sticky
// step rail pins flush beneath it — no gap, no overlap — at any window width.
function measureTopbar() {
  const tb = document.querySelector(".topbar");
  if (!tb) return;
  const h = Math.round(tb.getBoundingClientRect().height);
  if (h > 0) document.documentElement.style.setProperty("--topbar-h", h + "px");
}

// First-run orientation card (dismissal remembered). A 'Reset' clears it too.
const ONBOARD_KEY = "iauteur_onboard_seen_v1";
function initOnboarding() {
  const card = $("onboard"); if (!card) return;
  let seen = false; try { seen = localStorage.getItem(ONBOARD_KEY) === "1"; } catch (e) {}
  card.classList.toggle("hidden", seen);
  const x = $("onboardClose");
  if (x) x.onclick = () => { card.classList.add("hidden"); try { localStorage.setItem(ONBOARD_KEY, "1"); } catch (e) {} };
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
  if (guardBusy()) return;
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
  if (guardBusy()) return;
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
  if (guardBusy()) return;
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
  if (guardBusy()) return;
  const btn = $("compAssembleBtn"); btn.textContent = "Wiring & verifying…";
  log(`▶ assemble ${S.compConfig.type}`, "cmd"); openConsole();
  setBusy(true, "wiring & verifying…");
  let res;
  try { res = await jpost("/api/component/assemble", { brief: compBrief(), config: S.compConfig, tsx }); }
  catch (e) { res = { error: e.message }; }
  setBusy(false); btn.textContent = "Assemble → auto-wire → verify";
  const box = $("compAssembleResult");
  if (!res || res.error) { toast((res && res.error) || "assemble failed", "err"); if (res && res.error) log(res.error, "err"); return; }
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
  if (guardBusy()) return;
  const cfg = S.compConfig;
  const ex = (cfg.example && cfg.example[cfg.dataKey]) ? cfg.example : { [cfg.dataKey]: cfg.example || {} };
  const vertical = $("format").value === "shorts";
  const ab = (S.activeBeatIndex != null && S.beats) ? S.beats[S.activeBeatIndex] : null;
  const durationFrames = (ab && ab.durationFrames) || 150;
  const btn = $("compProofBtn"); btn.textContent = "Rendering…";
  const prog = $("compPreviewProgress"), bar = $("compPreviewBar"), pct = $("compPreviewPct");
  prog.classList.remove("hidden"); bar.style.width = "0%"; pct.textContent = "starting…";
  const box = $("compProof"); box.innerHTML = "";
  setBusy(true, "rendering preview…");
  let done = null;
  try {
    const r = await fetch("/api/component/preview-stream", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: {
        type: cfg.type, sceneData: ex[cfg.dataKey], design: S.design, theme: S.design,
        format: vertical ? "short" : "long", durationFrames } }),
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
        + `<div class="cap"><b>${escapeHtml(cfg.type)}</b> · ${escapeHtml(S.design)} · <span class="untimed">visual check — untimed</span>. `
        + `The final video re-renders this scene timed to your voiceover &amp; segment length.</div>`;
      if (ab) { ab.preview = { status: "done", url: done.url, ts: Date.now(), design: S.design }; saveState(); }
      toast("Preview rendered ✓", "ok");
    } else {
      prog.classList.add("hidden");
      const msg = (done && (done.output || done.error)) || "Preview render failed — see console.";
      toast(msg, "err"); if (done && (done.output || done.error)) log(done.output || done.error, "err");
    }
  } catch (e) {
    prog.classList.add("hidden"); toast("Preview stream failed: " + e.message, "err");
  } finally {
    setBusy(false); btn.textContent = "▶ Render preview";
  }
}

async function onCompRemove() {
  const type = $("compRemoveType").value.trim();
  if (!type) { toast("Enter the TYPE to remove.", "warn"); return; }
  if (!confirm(`Remove component ${type}? This un-wires it from every file.`)) return;
  if (guardBusy()) return;
  const btn = $("compRemoveBtn"); btn.textContent = "Removing…";
  log(`▶ remove ${type}`, "cmd"); openConsole();
  setBusy(true, "removing component…");
  let res;
  try { res = await jpost("/api/component/remove", { type }); }
  catch (e) { res = { error: e.message }; }
  setBusy(false); btn.textContent = "Remove";
  const box = $("compRemoveResult");
  if (!res || res.error) { toast((res && res.error) || "remove failed", "err"); return; }
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
  if (guardBusy()) return;
  const orig = btn.textContent; btn.textContent = "rendering…";
  item.preview = { status: "rendering" }; paintBeatPreview(prevBox, item);
  setBusy(true, "rendering preview…");
  const vertical = $("format").value === "shorts";
  let res;
  try {
    res = await jpost("/api/component/preview", { brief: {
      type: item.type, sceneData: item.data, design: S.design, theme: S.design,
      format: vertical ? "short" : "long", durationFrames: item.durationFrames || 150 } });
  } catch (e) { res = { error: e.message }; }
  setBusy(false); btn.textContent = orig;
  if (!res || res.error || !res.ok) {
    item.preview = { status: "error" }; paintBeatPreview(prevBox, item);
    toast((res && res.error) || "Preview render failed.", "err"); if (res && res.output) log(res.output, "err");
    saveState(); return;
  }
  item.preview = { status: "done", url: "/proof-img/" + res.file, ts: Date.now(), design: S.design };
  paintBeatPreview(prevBox, item); btn.textContent = "↺ re-preview"; saveState();
}

// Paint a beat's preview box from its persisted preview state (idle/rendering/error/done).
// Called both after a fresh render AND when rebuilding rows on reload, so previews survive.
function paintBeatPreview(prevBox, item) {
  const p = item.preview;
  if (!p || p.status === "idle") { prevBox.innerHTML = ""; return; }
  if (p.status === "rendering") { prevBox.innerHTML = `<div class="prevpending"><span class="spin"></span> ${escapeHtml(p.stage || "rendering preview…")}</div>`; return; }
  if (p.status === "error") { prevBox.innerHTML = `<div class="prevpending err">preview failed — click preview to retry</div>`; return; }
  if (p.voiced) {
    prevBox.innerHTML =
      `<video src="${p.url}?t=${p.ts}" controls loop playsinline></video>`
      + `<div class="cap"><b>${escapeHtml(item.type)}</b> · ${escapeHtml(p.design || S.design)} · <span class="voiced">with voiceover</span> · timed to the narration. Press play to hear it; the final render keeps this timing.</div>`;
    return;
  }
  prevBox.innerHTML =
    `<video src="${p.url}?t=${p.ts}" controls loop muted playsinline></video>`
    + `<div class="cap"><b>${escapeHtml(item.type)}</b> · ${escapeHtml(p.design || S.design)} · <span class="untimed">visual check — untimed</span>. `
    + `The final video re-renders this scene timed to your voiceover &amp; segment length.</div>`;
}

// Preview a single beat WITH voiceover (edge-TTS + word-sync + audio), streamed.
async function previewBeatVoice(item, prevBox, btn) {
  if (!item.type || !item.data) { toast("This beat has no component data to preview yet.", "warn"); return; }
  const narration = (item.narration || "").trim();
  if (!narration) { toast("Add narration to this beat first — there's nothing to voice.", "warn"); return; }
  if (guardBusy()) return;
  const orig = btn.textContent; btn.textContent = "voicing…";
  item.preview = { status: "rendering", stage: "generating voiceover…" }; paintBeatPreview(prevBox, item);
  setBusy(true, "voiceover preview…");
  const vertical = $("format").value === "shorts";
  const voice = ($("voVoice") && $("voVoice").value || "").trim();
  let done = null;
  try {
    const r = await fetch("/api/component/preview-voiceover", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: {
        type: item.type, sceneData: item.data, narration, voice,
        design: S.design, theme: S.design, format: vertical ? "short" : "long" } }),
    });
    const reader = r.body.getReader(), dec = new TextDecoder(); let buf = "";
    for (;;) {
      const { value, done: fin } = await reader.read(); if (fin) break;
      buf += dec.decode(value, { stream: true }); let idx;
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
          item.preview = { status: "rendering", stage: m ? `${m[1].toLowerCase()} ${m[2]}%` : data.replace(/^\u25b6\s*/, "") };
          paintBeatPreview(prevBox, item);
          log(data, "out");
        }
      }
    }
  } catch (e) { done = { ok: false, output: e.message }; }
  setBusy(false); btn.textContent = orig;
  if (!done || !done.ok || !done.url) {
    item.preview = { status: "error" }; paintBeatPreview(prevBox, item);
    toast((done && (done.output || done.error)) || "Voiceover preview failed.", "err");
    if (done && (done.output || done.error)) log(done.output || done.error, "err");
    saveState(); return;
  }
  item.preview = { status: "done", url: done.url, ts: Date.now(), design: S.design, voiced: true };
  paintBeatPreview(prevBox, item); saveState();
  toast("Voiceover preview ready — press play.", "ok");
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
    // A preview that was mid-render when the tab closed can't be trusted — drop it
    // so the beat just offers its preview button again.
    if (Array.isArray(S.beats)) for (const b of S.beats) if (b && b.preview && b.preview.status !== "done") delete b.preview;
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

// ---- early immutability guard: warn (with a free-slug suggestion) the moment the
// chosen slug is an already-rendered topic, instead of failing only at save. ------
let _slugTimer = null;
function scheduleSlugCheck() { clearTimeout(_slugTimer); _slugTimer = setTimeout(checkSlugStatus, 300); }
async function checkSlugStatus() {
  const warn = $("slugWarn"); if (!warn) return;
  const slug = $("slug").value.trim();
  if (!slug) { warn.classList.add("hidden"); warn.innerHTML = ""; return; }
  let st;
  try { st = await (await fetch("/api/slug-status?slug=" + encodeURIComponent(slug))).json(); }
  catch (e) { warn.classList.add("hidden"); return; }
  if ($("slug").value.trim() !== slug) return; // slug changed while awaiting
  if (st && st.rendered) {
    warn.classList.remove("hidden");
    warn.innerHTML = `<span class="bico">⚠</span><div class="bbody"><b>${escapeHtml(slug)}</b> is already a rendered video — topics are immutable, so saving here will be refused. `
      + (st.suggestion ? `<button type="button" class="btn sm" id="useSuggestSlug">Use ${escapeHtml(st.suggestion)}</button>` : "Pick a new slug.")
      + `</div>`;
    const b = $("useSuggestSlug");
    if (b) b.onclick = () => { $("slug").value = st.suggestion; S.slugAuto = false; render(); checkSlugStatus(); };
  } else { warn.classList.add("hidden"); warn.innerHTML = ""; }
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
  window.addEventListener("resize", measureTopbar);

  // config change tracking (loss prevention + slug sync)
  $("topic").addEventListener("input", () => { checkDirty(); render(); scheduleSlugCheck(); });
  ["format", "preset", "audience", "minutes", "themeLight", "background", "channel"].forEach((id) =>
    $(id).addEventListener("change", () => { checkDirty(); render(); }));
  $("slug").addEventListener("input", () => { S.slugAuto = false; render(); scheduleSlugCheck(); });

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
  if (guardBusy()) return { error: "busy" };
  const orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span>${label}`;
  setBusy(true, label);
  try { return await fn(); } finally { setBusy(false); btn.disabled = false; btn.innerHTML = orig; }
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
      const pv = document.createElement("button"); pv.className = "btn sm";
      pv.textContent = (b.preview && b.preview.status === "done") ? "↺ re-preview" : "▶ preview";
      pv.onclick = () => previewBeat(b, prevBox, pv);
      btns.appendChild(pv);
      if (kind === "beat") {
        const pvv = document.createElement("button"); pvv.className = "btn sm ghost";
        pvv.textContent = "▶ +voice";
        pvv.title = "Render this beat WITH voiceover (uses the voice from the Voiceover step) and time it to the narration.";
        pvv.onclick = () => previewBeatVoice(b, prevBox, pvv);
        btns.appendChild(pvv);
      }
    }
    row.appendChild(btype); row.appendChild(ta); row.appendChild(m); row.appendChild(btns);
    box.appendChild(row); box.appendChild(prevBox);
    paintBeatPreview(prevBox, b);
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
  if (guardBusy()) return;

  openConsole(); setBusy(true, `${action} running…`);
  log(`▶ ${action} ${slug}`, "cmd");
  const es = new EventSource(`/api/run-stream?action=${encodeURIComponent(action)}&slug=${encodeURIComponent(slug)}`);
  es.onmessage = (e) => log(e.data);
  es.addEventListener("done", (e) => {
    es.close(); setBusy(false);
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
  es.onerror = () => { es.close(); setBusy(false); log("✗ stream ended unexpectedly.", "err"); };
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
function openConsole() { toggleConsole(false); }function setLive(on, msg) {
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

// ==== AI automation panel ===================================================
let AI_PROVIDERS = [];

async function initAiPanel() {
  const sel = $("aiProvider");
  if (!sel) return;                          // template without the panel — skip
  try { AI_PROVIDERS = ((await (await fetch("/api/ai/providers")).json()).providers) || []; }
  catch { AI_PROVIDERS = []; }
  sel.innerHTML = "";
  for (const p of AI_PROVIDERS) {
    const o = document.createElement("option");
    o.value = p.id; o.textContent = p.label || p.id; sel.appendChild(o);
  }
  sel.onchange = renderAiFields;
  $("aiSaveBtn").onclick = saveAi;
  $("aiTestBtn").onclick = testAi;
  $("autoRunBtn").onclick = autoRun;
  $$("#aiModeSeg button").forEach((b) => b.onclick = () => {
    S.aiMode = b.dataset.aimode; $$("#aiModeSeg button").forEach((x) => x.classList.toggle("on", x === b));
  });
  await refreshAiStatus();      // preselects the saved provider + shows key state
  renderAiFields();
}

function renderAiFields() {
  const p = AI_PROVIDERS.find((x) => x.id === $("aiProvider").value);
  const box = $("aiFields"); box.innerHTML = "";
  if (!p) return;
  for (const f of (p.fields || [])) {
    const lab = document.createElement("label"); lab.className = "field";
    lab.textContent = f.label + (f.required ? " *" : "");
    const inp = document.createElement("input");
    inp.type = f.secret ? "password" : "text";
    inp.placeholder = f.placeholder || "";
    inp.dataset.env = f.env; inp.autocomplete = "off"; inp.spellcheck = false;
    lab.appendChild(inp); box.appendChild(lab);
  }
}

async function refreshAiStatus() {
  let st = {};
  try { st = await (await fetch("/api/ai/status")).json(); } catch { return; }
  applyAiStatus(st);
  if (st.provider && AI_PROVIDERS.some((p) => p.id === st.provider)) {
    $("aiProvider").value = st.provider;
  }
}

function applyAiStatus(st) {
  const chip = $("aiStatusChip"); if (!chip || !st) return;
  if (st.key_present) {
    chip.textContent = `${st.provider || "?"} · ${st.model || "?"} ✓`;
    chip.className = "chip ok";
  } else {
    chip.textContent = "not connected";
    chip.className = "chip";
  }
}

async function saveAi() {
  const provider = $("aiProvider").value;
  const env = { IAUTEUR_AI_PROVIDER: provider };
  for (const inp of $$("#aiFields input")) {
    if (inp.value.trim()) env[inp.dataset.env] = inp.value.trim();
  }
  const r = await jpost("/api/ai/save", { env });
  if (r.ok) {
    toast("AI settings saved to .env.", "ok");
    log("AI provider saved: " + provider, "ok");
    applyAiStatus(r.status);
  } else {
    toast(r.error || "Could not save settings.", "err");
  }
}

async function testAi() {
  const box = $("aiTestResult"); box.textContent = "Testing connection…";
  const r = await jpost("/api/ai/test", {});
  if (r.ok) {
    box.innerHTML = `<span class="okc">✓ connected</span> — ${escapeHtml(r.model || "")} · ${r.latency_ms || "?"} ms · reply “${escapeHtml((r.reply || "").slice(0, 30))}”`;
    $("aiStatusChip").className = "chip ok";
    toast("AI connection OK.", "ok");
  } else {
    const msg = r.error || (r.errors || []).join("; ") || "connection failed";
    box.innerHTML = `<span class="errc">✗ ${escapeHtml(msg)}</span>`;
    toast("AI connection failed.", "err");
  }
}

function logAutoEvent(data) {
  let o; try { o = JSON.parse(data); } catch { log(data); return; }
  const e = o.event;
  const M = {
    starting: `⚡ Starting “${o.topic}” (${o.mode})`,
    run_start: `▶ Plan: ${(o.formats || []).join(", ")} · mode ${o.mode} · ${o.intake ? "will save" : "no save"}`,
    format_start: `— ${o.format}: authoring (${o.mode})`,
    ai_call: `  ↑ asking your AI (${o.tag}, ${o.prompt_chars} chars)`,
    ai_reply: `  ↓ AI replied (${o.tag})`,
    reask: `  ↻ beats rejected — re-asking (attempt ${o.attempt})`,
    components_start: `  ✚ inventing up to ${o.cap} bespoke component(s) for ${o.format}…`,
    component_try: `    · beat ${o.beat}: trying (${o.currentType})`,
    component_built: `    ✚ beat ${o.beat}: built new ${o.type} (was ${o.oldType})`,
    component_reused: `    ↺ beat ${o.beat}: reused ${o.type} (honest fit)`,
    component_fix: `    ⟳ beat ${o.beat}: component didn't compile — fixing (round ${o.round})`,
    component_skip: `    ⊘ beat ${o.beat}: kept original — ${(o.reason || "").slice(0, 120)}`,
    fix: `  ✎ lint fix round ${o.attempt}${o.contractMiss ? " (contract reminder)" : ""}`,
    assembled: `  ▣ ${o.format}: ${o.ok ? "lint OK" : "lint issues"} · ${o.changes} auto-fixes · ${o.warnings} warnings`,
    intake: `  💾 saved topics/${o.slug}/${o.kind}.json — lint ${o.ok ? "PASS" : "FAIL"}`,
    intake_refused: `  ⚠ ${o.reason}`,
    format_blocked: `  ✗ ${o.format} stopped at ${o.stage}: ${(o.detail || "").slice(0, 200)}`,
    run_done: `■ Finished — ${JSON.stringify(o.formats || {})}. ${o.next || ""}`,
  };
  const kind = /block|refused/.test(e || "") ? "err"
    : (e === "intake" || e === "assembled" || e === "run_done") ? "ok" : undefined;
  log(M[e] || data, kind);
}

function autoRun() {
  const c = cfg();
  if (!c.topic) { toast("Enter a topic in Step 1 first.", "warn"); return; }
  if (guardBusy()) return;
  const mode = S.aiMode === "single" ? "single" : "two-paste";
  const intake = $("aiIntake").checked ? "1" : "0";
  const build = ($("aiBuildComponents") && $("aiBuildComponents").checked && mode === "two-paste") ? "2" : "0";
  const params = new URLSearchParams({
    topic: c.topic, design: S.design, theme: S.design,
    themeLight: c.themeLight || "daylight", format: c.format || "long",
    preset: c.preset || "explainer", audience: c.audience || "general",
    channel: c.channel || "", mode, intake, build,
  });
  if (c.notes) params.set("notes", c.notes);
  if (c.source) params.set("source", c.source);

  openConsole(); setBusy(true, "AI authoring…"); setLive(true, "AI authoring…");
  log(`⚡ Auto-run “${c.topic}” (${mode}, ${intake === "1" ? "save" : "no-save"}${build !== "0" ? ", +build" : ""})`, "cmd");
  const es = new EventSource("/api/auto/run?" + params.toString());
  es.onmessage = (ev) => logAutoEvent(ev.data);
  es.addEventListener("done", (ev) => {
    es.close(); setBusy(false); setLive(false);
    let r = {}; try { r = JSON.parse(ev.data); } catch {}
    logAutoEvent(ev.data);
    if (r.ok) {
      toast("AI authored your video. Review it, then render.", "ok");
      S.saved = true;
      if (r.slug) { S.slugAuto = false; $("slug").value = r.slug; }
      render(); refreshOutputs();
    } else {
      toast("Auto-run stopped for your review — see the console.", "warn");
    }
  });
  es.onerror = () => { es.close(); setBusy(false); setLive(false); log("✗ auto-run stream ended.", "err"); };
}

boot();
