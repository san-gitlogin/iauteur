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
  previewVoice: null,       // remembered per-beat preview choice: null=ask, true=voiced, false=silent
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
  fillSelect($("logo"), CONFIG.logos || ["channel_logo.png"], "channel_logo.png");
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
    // brand.logo — the watermark. Sent as an img: reference so the assembler can
    // put it in the spec; without it a console-authored video renders unbranded.
    logo: $("logo").value ? "img:" + $("logo").value : "",
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
      // The beat now draws a DIFFERENT component, so any preview on it shows the old
      // one. Drop it rather than leave a video that no longer matches the beat.
      delete bd.preview;
      // Teach the shape map the new type so beatCanDraw judges it by its real field
      // contract, exactly like a manifest type — otherwise a brand-new component is
      // the one case the console has to guess about.
      registerCustomShape(res.type, S.compConfig);
      renderBeatReview(S.beats);
      toast(`Bound ${res.type} to beat ${bd.id || (S.activeBeatIndex + 1)} — preview it on that beat in the Author list.`, "ok");
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
  // The renderer wants the whole scene `data` — the component reads
  // scene.data.<dataKey>, so passing the UNWRAPPED inner object renders an empty
  // scene. `example` may arrive either already wrapped ({donut:{…}}) or bare
  // ({segments:[…]}); normalise to wrapped, and leave data_root types alone.
  const sceneData = !cfg.dataKey ? (cfg.example || {})
    : (cfg.example && cfg.example[cfg.dataKey]) ? cfg.example
    : { [cfg.dataKey]: cfg.example || {} };
  const vertical = $("format").value === "shorts";
  const ab = (S.activeBeatIndex != null && S.beats) ? S.beats[S.activeBeatIndex] : null;
  // Run the length the beat will actually run, so the build-in isn't cut off.
  const durationFrames = ab ? estimateBeatFrames(ab) : 150;
  const btn = $("compProofBtn"); btn.textContent = "Rendering…";
  const prog = $("compPreviewProgress"), bar = $("compPreviewBar"), pct = $("compPreviewPct");
  prog.classList.remove("hidden"); bar.style.width = "0%"; pct.textContent = "starting…";
  const box = $("compProof"); box.innerHTML = "";
  setBusy(true, "rendering preview…");
  let done = null;
  try {
    // Same streaming reader the per-beat previews use, so progress reporting and
    // bundler-noise filtering behave identically in both places.
    done = await streamPreview("/api/component/preview-stream", {
      type: cfg.type, sceneData, design: S.design, theme: S.design,
      format: vertical ? "short" : "long", durationFrames,
    }, (stage) => {
      pct.textContent = stage;
      bar.style.width = stagePct(stage) + "%";
    });
  } catch (e) { done = { ok: false, output: e.message }; }
  setBusy(false); btn.textContent = "▶ Render preview";

  if (!done || !done.ok || !done.url) {
    prog.classList.add("hidden");
    const msg = (done && (done.output || done.error)) || "Preview render failed — see console.";
    toast(msg, "err"); if (done && (done.output || done.error)) log(done.output || done.error, "err");
    return;
  }
  bar.style.width = "100%"; pct.textContent = "done ✓";
  box.innerHTML = `<video src="${done.url}?t=${Date.now()}" controls autoplay loop muted playsinline></video>`
    + `<div class="cap"><b>${escapeHtml(cfg.type)}</b> · ${escapeHtml(S.design)} · <span class="untimed">untimed</span> · `
    + `the final video re-times this scene to your voiceover.</div>`;
  // Give the BEAT the same result, so the drawer and the beat row never disagree
  // about what the newly built component looks like.
  if (ab) {
    ab.preview = { status: "done", url: done.url, ts: Date.now(), design: S.design,
                   voiced: false, sample: false, frames: durationFrames };
    saveState(); rerenderRows();
  }
  toast("Preview rendered ✓", "ok");
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
// How long this beat will actually run. Same formula normalize-spec.mjs applies
// (max(60, words*FPW+30), HOOK capped at 8s) so a preview lasts what the real
// render will — a flat guess truncates the scene's build-in and reads as broken.
function estimateBeatFrames(item) {
  if (item.durationFrames) return Math.max(30, Math.min(600, item.durationFrames));
  const fpw = (BUDGETS && BUDGETS.fpw) || 12;
  const hookMax = (BUDGETS && BUDGETS.hookMaxFrames) || 240;
  const words = ((item.narration || "").trim().match(/\S+/g) || []).length;
  let d = words * fpw + 30;
  if (item.type === "HOOK") d = Math.min(d, hookMax);
  return Math.max(60, Math.min(600, d));
}

// The `data` a preview should render. Real authored data when the beat has it;
// otherwise the manifest's own sample for that type — "what this component is
// MEANT to show" — so every beat is previewable at the Author step, where beats
// carry narration but no data yet (real data only arrives at Stage 2).
//
// The sample is returned for LOOKING ONLY and is deliberately NOT written onto
// the beat: persisting it would let placeholder numbers ride into Stage 2 and the
// saved spec disguised as authored facts (LAW 3 — TRUTH).
// Can this beat's own data actually DRAW its component? "Has data" is not the same
// as "can draw": beat sheets often carry a stub like {"source":"illustrative"} —
// non-empty, but with none of the fields the component reads, so rendering it gives
// an EMPTY scene. Mirrors the rule component-flow applies, off the shape map the
// manifest exports (CONFIG.sceneShapes), so row labels and renders never disagree.
// A component built this session isn't in the manifest yet (its shape map was sent
// at page load), so add its contract from the config the Component Lab validated.
// Restored on reload too — S.customComponents persists.
function registerCustomShape(type, config) {
  if (!type || !config || !CONFIG) return;
  CONFIG.sceneShapes = CONFIG.sceneShapes || {};
  const fields = Array.isArray(config.fields) ? config.fields : [];
  CONFIG.sceneShapes[type] = {
    dataKey: config.dataKey || null,
    req: fields.filter((f) => f && f.req).map((f) => f.name),
    fields: fields.map((f) => f && f.name).filter(Boolean),
  };
}

function beatCanDraw(item) {
  const shape = CONFIG && CONFIG.sceneShapes && CONFIG.sceneShapes[item.type];
  const d = item.data;
  if (!d || typeof d !== "object" || !Object.keys(d).length) return false;
  if (!shape) return Object.keys(d).length > 0;   // shape map unavailable — trust it, server re-checks
  const root = shape.dataKey ? d[shape.dataKey] : d;
  if (!root || typeof root !== "object") return false;
  const keys = Object.keys(root);
  if (!keys.length) return false;
  if (shape.req && shape.req.length) return shape.req.every((k) => root[k] != null);
  return keys.some((k) => (shape.fields || []).includes(k));
}

// The server decides, because "has data" is not the same as "can draw": beat sheets
// often carry a stub like {"source":"illustrative"} — non-empty, but with none of
// the fields the component reads, so rendering it produces an EMPTY scene. Only the
// manifest knows which fields matter, so it makes the call and returns whichever
// data will actually draw, plus whether that was the sample.
async function resolvePreviewData(item) {
  const res = await jpost("/api/scene-example", { type: item.type, data: item.data || null });
  if (!res || res.error || !res.ok) throw new Error(res && res.error ? res.error : `No sample content for ${item.type}.`);
  if (res.rejected) log(`preview: ${item.id || item.type} — ${res.rejected}; using sample content`, "out");
  return { data: res.data, sample: !!res.sample, purpose: res.purpose || "" };
}

// Set when a session-wide preview choice changes mid-render; consumed once the
// render completes (see the note at its assignment).
let pendingRowRefresh = false;

// ONE preview entry point for every beat/scene row. `voiced` decides which backend
// it streams; both report progress inline under the beat and end in a player.
async function runBeatPreview(item, prevBox, btn, voiced) {
  if (!item.type) { toast("This beat has no scene type yet.", "warn"); return; }
  if (voiced && !(item.narration || "").trim()) {
    toast("Add narration to this beat first — there's nothing to voice.", "warn"); return;
  }
  if (guardBusy()) return;
  const orig = btn.textContent;
  btn.textContent = voiced ? "voicing…" : "rendering…";
  item.preview = { status: "rendering", stage: "resolving scene content…" };
  paintBeatPreview(prevBox, item);
  setBusy(true, voiced ? "voiceover preview…" : "rendering preview…");

  // Every exit path below must restore the button, clear busy, persist, and settle
  // any deferred row refresh — a preview that dies without doing so leaves the whole
  // console hard-disabled (setBusy locks every job button).
  const finish = (msg, kind) => {
    setBusy(false); btn.textContent = orig;
    paintBeatPreview(prevBox, item); saveState();
    if (msg) toast(msg, kind || "ok");
    if (pendingRowRefresh) { pendingRowRefresh = false; rerenderRows(); }
  };

  let resolved;
  try { resolved = await resolvePreviewData(item); }
  catch (e) {
    item.preview = { status: "error", msg: e.message };
    finish(e.message, "err"); return;
  }

  const vertical = $("format").value === "shorts";
  const durationFrames = estimateBeatFrames(item);
  const url = voiced ? "/api/component/preview-voiceover" : "/api/component/preview-stream";
  const brief = voiced
    ? { type: item.type, sceneData: resolved.data, narration: (item.narration || "").trim(),
        voice: ($("voVoice") && $("voVoice").value || "").trim(),
        design: S.design, theme: S.design, format: vertical ? "short" : "long" }
    : { type: item.type, sceneData: resolved.data, design: S.design, theme: S.design,
        format: vertical ? "short" : "long", durationFrames };

  let done = null;
  try {
    done = await streamPreview(url, brief, (stage) => {
      item.preview = { status: "rendering", stage }; paintBeatProgress(prevBox, item);
    });
  } catch (e) { done = { ok: false, output: e.message }; }

  if (!done || !done.ok || !done.url) {
    const msg = (done && (done.output || done.error)) || "Preview render failed.";
    item.preview = { status: "error", msg };
    if (done && (done.output || done.error)) log(done.output || done.error, "err");
    finish(msg, "err"); return;
  }
  item.preview = { status: "done", url: done.url, ts: Date.now(), design: S.design,
                   voiced: !!voiced, sample: resolved.sample, purpose: resolved.purpose || "",
                   frames: durationFrames };
  finish(voiced ? "Voiceover preview ready — press play." : "Preview ready.", "ok");
}

// Read one SSE preview stream, forwarding human-readable progress to `onStage`
// and resolving with the final 'done' payload.
async function streamPreview(url, brief, onStage) {
  const r = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief }),
  });
  if (!r.ok || !r.body) {
    let msg = `preview request failed (${r.status})`;
    try { const j = await r.json(); if (j && j.error) msg = j.error; } catch { /* not json */ }
    return { ok: false, output: msg };
  }
  const reader = r.body.getReader(), dec = new TextDecoder();
  let buf = "", done = null;
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
      if (ev === "done") { try { done = JSON.parse(data); } catch { done = { ok: false }; } }
      else if (data) {
        log(data, "out");                       // console gets everything, verbatim
        // The beat's one-line status gets only real progress. The bundler also emits
        // ANSI-coloured font warnings and other long noise; showing those where the
        // user expects "rendering 42%" reads like a failure.
        const m = data.match(/(bundling|rendering)\s+(\d+)%/i);
        if (m) { onStage(`${m[1].toLowerCase()} ${m[2]}%`); continue; }
        const clean = data.replace(/\[[0-9;]*m/g, "").replace(/^▶\s*/, "").trim();
        if (clean && clean.length <= 60 && !/^Tab \d|network requests|Consider loading/i.test(clean)) onStage(clean);
      }
    }
  }
  return done;
}

// Paint a beat's preview box from its persisted preview state
// (idle / choosing / rendering / error / done). Called after a fresh render AND when
// rebuilding rows on reload, so previews survive a refresh.
function paintBeatPreview(prevBox, item) {
  const p = item.preview;
  if (!p || p.status === "idle") { prevBox.innerHTML = ""; return; }
  if (p.status === "rendering") {
    const pct = stagePct(p.stage);
    prevBox.innerHTML =
      `<div class="prevrender">`
      + `<div class="prevstage"><span class="spin"></span><span class="stagetxt">${escapeHtml(p.stage || "starting…")}</span></div>`
      + `<div class="previewProgress"><div class="pbar"><div class="pfill" style="width:${pct}%"></div></div></div>`
      + `</div>`;
    return;
  }
  if (p.status === "error") {
    prevBox.innerHTML = `<div class="prevpending err">preview failed — ${escapeHtml(p.msg || "click preview to retry")}</div>`;
    return;
  }
  // done → player + a caption that states exactly what is being shown, so sample
  // content can never be mistaken for the beat's real content.
  const secs = p.frames ? ` · ${(p.frames / ((BUDGETS && BUDGETS.fps) || 30)).toFixed(1)}s` : "";
  const what = p.sample
    ? `<span class="samplebadge">sample content</span> — this is what <b>${escapeHtml(item.type)}</b> shows; your numbers land after the fill prompt`
    : `<span class="realbadge">your content</span>`;
  const timing = p.voiced
    ? `<span class="voiced">with voiceover</span> · timed to the narration — the final render keeps this timing`
    : `<span class="untimed">untimed</span> · the final video re-times this scene to your voiceover`;
  prevBox.innerHTML =
    `<video src="${p.url}?t=${p.ts}" controls loop playsinline ${p.voiced ? "" : "muted"}></video>`
    + `<div class="cap"><b>${escapeHtml(item.type)}</b> · ${escapeHtml(p.design || S.design)}${secs} · ${what}<br>${timing}.</div>`;
}

// Pull a percentage out of a "bundling 42%" / "rendering 88%" stage line. Bundling
// and rendering are two sequential passes, so map them onto one 0-100 bar
// (bundle = first 30%) instead of letting it rewind at the handover.
function stagePct(stage) {
  const m = (stage || "").match(/(bundling|rendering)\s+(\d+)%/i);
  if (!m) return 4;
  const p = Math.max(0, Math.min(100, +m[2]));
  return /bundling/i.test(m[1]) ? Math.round(p * 0.3) : 30 + Math.round(p * 0.7);
}

// Update the bar/label in place while streaming. Rewriting innerHTML every tick
// would restart the CSS width transition and make the bar stutter.
function paintBeatProgress(prevBox, item) {
  const bar = prevBox.querySelector(".pfill"), txt = prevBox.querySelector(".stagetxt");
  if (!bar || !txt) { paintBeatPreview(prevBox, item); return; }
  const p = item.preview || {};
  bar.style.width = stagePct(p.stage) + "%";
  txt.textContent = p.stage || "working…";
}

// Clicking preview asks ONE question — does this beat need narration? — right where
// the beat is, then renders below it. Voiced costs a TTS round-trip and needs
// narration, so it is never assumed; the answer is remembered for the session so a
// 10-beat pass is not 10 identical questions.
// "en-US-ChristopherNeural" → "Christopher (en-US)" — the voice has to be readable
// in the choice row, not just in a tooltip, since it is what you will hear.
function voiceLabel(name) {
  const m = (name || "").match(/^([a-z]{2}-[A-Z]{2})-(.+?)(Neural)?$/);
  return m ? `${m[2]} (${m[1]})` : (name || "the chosen voice");
}

function askPreviewChoice(item, prevBox, btn) {
  if (S.previewVoice !== null && S.previewVoice !== undefined) {
    runBeatPreview(item, prevBox, btn, S.previewVoice); return;
  }
  const hasNarration = !!(item.narration || "").trim();
  const voice = ($("voVoice") && $("voVoice").value || "").trim() || "the chosen voice";
  prevBox.innerHTML =
    `<div class="prevask">`
    + `<div class="askq">Preview this beat with narration?</div>`
    + `<div class="askbtns">`
    +   `<button class="btn sm" data-pick="silent">▶ silent — faster</button>`
    +   `<button class="btn sm accent" data-pick="voiced" ${hasNarration ? "" : "disabled"} `
    +     `title="${hasNarration ? `Speaks the narration with ${escapeHtml(voice)} and times the scene to the real audio.` : "This beat has no narration yet."}">`
    +     `♪ with voiceover</button>`
    +   `<button class="btn sm ghost" data-pick="cancel">cancel</button>`
    + `</div>`
    + `<label class="askremember"><input type="checkbox" id="askRemember" /> remember for this session</label>`
    + `<div class="askhint">${hasNarration
        ? `Voiced speaks with <b>${escapeHtml(voiceLabel(voice))}</b> and re-times the scene to the real audio, so you hear and see the final pacing.`
        : "Voiceover needs narration — add some above to enable it."}</div>`
    + `</div>`;
  prevBox.querySelectorAll("[data-pick]").forEach((b) => {
    b.onclick = () => {
      const pick = b.getAttribute("data-pick");
      if (pick === "cancel") { prevBox.innerHTML = ""; return; }
      const voiced = pick === "voiced";
      const remember = prevBox.querySelector("#askRemember");
      // Rebuild the rows only AFTER this render finishes — rerenderRows() replaces
      // the DOM, and prevBox is where the render is currently painting. The finished
      // video survives the rebuild because paintBeatPreview restores it from state.
      if (remember && remember.checked) { S.previewVoice = voiced; saveState(); pendingRowRefresh = true; }
      runBeatPreview(item, prevBox, btn, voiced);
    };
  });
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
      customComponents: S.customComponents, previewVoice: S.previewVoice,
      form: {
        topic: $("topic").value, source: $("source").value, notes: $("notes").value,
        format: $("format").value, preset: $("preset").value, audience: $("audience").value, minutes: $("minutes").value,
        themeLight: $("themeLight").value, background: $("background").value, channel: $("channel").value,
        logo: $("logo").value, slug: $("slug").value, beatsJson: $("beatsJson").value, replyJson: $("replyJson").value,
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
    // so the row just offers its preview button again. Applies to BOTH lists, since
    // assembled scenes are previewable too.
    const dropPending = (arr) => {
      if (Array.isArray(arr)) for (const b of arr) if (b && b.preview && b.preview.status !== "done") delete b.preview;
    };
    dropPending(S.beats);
    dropPending(S.spec && S.spec.scenes);
    S.saved = !!s.saved; S.voiced = !!s.voiced; S.rendered = !!s.rendered; S.lintOk = !!s.lintOk;
    S.customComponents = s.customComponents || {};
    // Components built in an earlier session are wired into the library but absent
    // from the shape map the server just sent, so re-teach their contracts.
    for (const [type, cfg] of Object.entries(S.customComponents)) registerCustomShape(type, cfg);
    S.previewVoice = (s.previewVoice === true || s.previewVoice === false) ? s.previewVoice : null;
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
  ["format", "preset", "audience", "minutes", "themeLight", "background", "channel", "logo"].forEach((id) =>
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

// Rebuild whichever meter lists are on screen, keeping each row's persisted preview
// (paintBeatPreview restores it from state). Used when a session-wide preview
// setting changes, so every row's buttons agree.
function rerenderRows() {
  if (S.beats) renderBeatReview(S.beats);
  if (S.spec && S.spec.scenes) renderMeterRows($("sceneMeters"), S.spec.scenes, { kind: "scene" });
}
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
    // EVERY row gets a preview. A beat with authored `data` previews its real
    // content; one without (Stage-1 beats carry narration only) previews the
    // manifest's sample for its type — the component IS already decided, so its
    // look, motion, theme and framing are all checkable now. The caption states
    // which of the two you are looking at.
    const hasData = beatCanDraw(b);
    const pv = document.createElement("button"); pv.className = "btn sm";
    pv.textContent = (b.preview && b.preview.status === "done") ? "↺ re-preview" : "▶ preview";
    pv.title = hasData
      ? "Render just this beat so you can see it before committing to a full video."
      : `Render this beat using what ${b.type} is designed to show (sample content — your data arrives at Stage 2).`;
    pv.onclick = () => askPreviewChoice(b, prevBox, pv);
    btns.appendChild(pv);
    if (!hasData) { const s = document.createElement("span"); s.className = "samplehint"; s.textContent = "sample"; s.title = "No authored data yet — preview uses this component's sample content."; btns.appendChild(s); }
    // Once a choice is remembered, show it here so the mode is never invisible —
    // and let it be flipped back to asking without hunting through settings.
    if (S.previewVoice !== null && S.previewVoice !== undefined) {
      const vt = document.createElement("button"); vt.className = "btn sm ghost voicetog";
      vt.textContent = S.previewVoice ? "♪ voice on" : "voice off";
      vt.title = "Preview mode for this session — click to be asked again.";
      vt.onclick = () => { S.previewVoice = null; saveState(); rerenderRows(); };
      btns.appendChild(vt);
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
  // send the accepted beat sheet too when we have one — it holds the Stage-1 story
  // fields (onePayoff/openLoop/analogy/topicAxes) that the fill reply never carries
  const body = { cfg: cfg(), reply };
  // read it from the paste box, which still holds the Stage-1 `meta` block that
  // S.beats (a bare array of beats) does not
  const pasted = (() => { try { return JSON.parse($("beatsJson").value); } catch { return null; } })();
  if (pasted && (pasted.meta || pasted.beats)) body.beats = pasted;
  else if (S.beats) body.beats = { beats: S.beats };
  const res = await withBtn(btn, "Assembling…", () => jpost("/api/flow/assemble", body));
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
    voices = (CONFIG.voices || ["en-US-AvaMultilingualNeural"]).map((n) => ({ name: n, locale: n.split("-").slice(0, 2).join("-"), gender: "" }));
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
  // Select the channel's configured voice (CONFIG.voices[0]) rather than whichever
  // name sorts first. The full edge-tts list is alphabetical, so the default was
  // landing on en-US-AnaNeural — and a voiced beat preview speaks through THIS
  // control, so a wrong default is heard, not just displayed.
  const preferred = (CONFIG && CONFIG.voices && CONFIG.voices[0]) || "en-US-AvaMultilingualNeural";
  if ([...sel.options].some((o) => o.value === preferred)) sel.value = preferred;
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
  // Lazy per-event builders: only the matching event's template runs, so one
  // event's field shape can't break another's (e.g. run_done.formats is an object
  // while run_start.formats is an array).
  const M = {
    starting: () => `⚡ Starting “${o.topic}” (${o.mode})`,
    run_start: () => `▶ Plan: ${(Array.isArray(o.formats) ? o.formats : Object.keys(o.formats || {})).join(", ")} · mode ${o.mode} · ${o.intake ? "will save" : "no save"}${o.model ? ` · model: ${o.model}` : ""}${o.buildComponents ? ` · up to ${o.buildComponents} component build(s), ${o.componentFixCap} fix round(s) each` : ""}`,
    format_start: () => `— ${o.format}: authoring (${o.mode})`,
    ai_call: () => `  ↑ asking your AI (${o.tag}, ${o.prompt_chars} chars)`,
    ai_reply: () => `  ↓ AI replied (${o.tag})`,
    reask: () => `  ↻ beats rejected — re-asking (attempt ${o.attempt})`,
    components_start: () => `  ✚ inventing up to ${o.cap} bespoke component(s) for ${o.format}…`,
    component_try: () => `    · beat ${o.beat}: trying (${o.currentType})`,
    component_built: () => `    ✚ beat ${o.beat}: built new ${o.type} (was ${o.oldType})${o.fixRounds ? ` — after ${o.fixRounds} compiler-fix round(s)` : " — first try"}`,
    component_reused: () => `    ↺ beat ${o.beat}: reused ${o.type} (honest fit)`,
    component_fix: () => `    ⟳ beat ${o.beat}: component didn't compile — fixing (round ${o.round})`,
    component_skip: () => `    ⊘ beat ${o.beat}: kept original — ${(o.reason || "").slice(0, 120)}`,
    fix: () => `  ✎ lint fix round ${o.attempt}${o.contractMiss ? " (contract reminder)" : ""}`,
    assembled: () => `  ▣ ${o.format}: ${o.ok ? "lint OK" : "lint issues"} · ${o.changes} auto-fixes · ${o.warnings} warnings`,
    intake: () => `  💾 saved topics/${o.slug}/${o.kind}.json — lint ${o.ok ? "PASS" : "FAIL"}`,
    intake_refused: () => `  ⚠ ${o.reason}`,
    format_blocked: () => `  ✗ ${o.format} stopped at ${o.stage}: ${(o.detail || "").slice(0, 200)}`,
    run_done: () => {
      const f = o.formats || {};
      const per = Object.keys(f).map((k) => `${k}:${f[k] ? "ok" : "stopped"}`).join(", ");
      const rep = Array.isArray(o.componentReport) ? o.componentReport : [];
      const built = rep.filter((r) => r.outcome === "built");
      const kept = rep.filter((r) => r.outcome === "kept-existing");
      const reused = rep.filter((r) => r.outcome === "reused");
      const parts = [`■ Finished — ${per || "no formats"}${o.model ? ` · model: ${o.model}` : ""}.`];
      if (built.length) parts.push(`Built ${built.length} new component(s): ${built.map((r) => `${r.type}${r.fixRounds ? ` (${r.fixRounds} fix round${r.fixRounds > 1 ? "s" : ""})` : " (first try)"}`).join(", ")}.`);
      if (kept.length) parts.push(`Kept an existing component on ${kept.length} beat(s) after ${kept.map((r) => r.attempts).join("/")} build attempt(s) didn't compile — the video still ships correctly, nothing broken is ever wired.`);
      if (reused.length) parts.push(`Reused a fitting existing component on ${reused.length} beat(s).`);
      parts.push(o.next || "");
      return parts.filter(Boolean).join(" ");
    },
  };
  const kind = /block|refused/.test(e || "") ? "err"
    : (e === "intake" || e === "assembled" || e === "run_done") ? "ok" : undefined;
  let line = data;
  try { if (M[e]) line = M[e](); } catch (err) { line = data; }
  log(line, kind);
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
    channel: c.channel || "", logo: c.logo || "", mode, intake, build,
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
