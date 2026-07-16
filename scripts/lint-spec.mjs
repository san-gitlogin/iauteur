#!/usr/bin/env node
// SPEC LINTER — the automated critic. Rejects a spec BEFORE rendering,
// the way a tester rejects a build before production.
// Usage: node scripts/lint-spec.mjs topics/<slug>/long.json

import fs from 'node:fs';
import {SCREENPLAY_NAMES, SCREENPLAYS} from './screenplays.mjs';
import {resolveSi} from './lib/si-resolve.mjs';

import {DARK_THEMES, LIGHT_THEMES, THEMES, TYPES, SEM, ZONES, TRANSITIONS, ANIMS, BUDGET, BACKGROUNDS, HOOK_MAX_FRAMES, FAMILY, CONSOLIDATED} from './lib/constants.mjs';

// TEXT BUDGETS + all enums now live in scripts/lib/constants.mjs (imported above,
// shared with scripts/gen-prompt.mjs so the linter and the prompt can never disagree).

const IMG_DIR = 'public/assets';
const errors = [];
const warns = [];
const E = (m) => errors.push(m);
const W = (m) => warns.push(m);

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/lint-spec.mjs <spec.json>');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(file, 'utf8'));

const words = (s) => (s ?? '').trim().split(/\s+/).filter(Boolean).length;
const len = (s) => (s ?? '').length;

// ---- global checks ----
const theme = spec.brand?.theme;
if (theme && !THEMES.includes(theme)) E(`brand.theme "${theme}" unknown. Known: ${THEMES.join(', ')}`);
if (theme && LIGHT_THEMES.includes(theme))
  E(`brand.theme "${theme}" is a LIGHT theme — brand.theme is BY LAW the DARK skin (${DARK_THEMES.join('/')}); light variants render automatically. Use brand.themeLight to pick the light twin.`);
if (spec.brand?.themeLight && !LIGHT_THEMES.includes(spec.brand.themeLight))
  E(`brand.themeLight "${spec.brand.themeLight}" must be one of: ${LIGHT_THEMES.join(', ')}`);
if (spec.meta?.screenplay && !SCREENPLAY_NAMES.includes(spec.meta.screenplay))
  W(`meta.screenplay "${spec.meta.screenplay}" unknown. Known: ${SCREENPLAY_NAMES.join(', ')}`);
const bgv = spec.brand?.background;
if (bgv && !BACKGROUNDS.includes(bgv))
  E(`brand.background "${bgv}" unknown. Known: aurora, grid, aurora-grid, plain, bokeh, starfield, grid-pulse, wave, ripple, gradient, geo, matrix-rain, noise, ember (omit for theme default)`);
if (!spec.scenes?.length) E('no scenes');
const n = spec.scenes?.length ?? 0;
// Scene-count expectations are screenplay-aware: long-form presets (documentary)
// legitimately run to ~60 scenes; short formats still warn past their range.
const _sp = spec.meta?.screenplay ? SCREENPLAYS[spec.meta.screenplay] : null;
const _maxScenes = _sp?.scenes?.[1] ?? 14;
if (n < 3) W(`only ${n} scenes — thin video`);
if (n > _maxScenes)
  W(`${n} scenes — likely too long for ${spec.meta?.screenplay ?? 'this format'} (expected ≤${_maxScenes}); split into parts or set meta.screenplay:"documentary" for long-form`);
if (spec.scenes?.[0]?.type !== 'HOOK') E('scene 1 must be HOOK — first 5 seconds decide retention');
const last = spec.scenes?.[n - 1]?.type;
if (last && !['OUTRO_CTA', 'RECAP'].includes(last)) W(`last scene is ${last}; expected OUTRO_CTA (or RECAP)`);

// GATE 2 — variant-aware anti-monotony. Consolidated families (types that host
// many discoverable variants) count as ONE shape-family: two adjacent scenes of
// the same family are rejected even if their variants differ, and the whole
// family is capped so a video can't visually repeat one skeleton behind different
// chips. A TYPE+VARIANT pair is a distinct SUB-TYPE for the count/cap below.
// FAMILY + CONSOLIDATED are the SINGLE SOURCE in scripts/lib/constants.mjs (Phase 3
// unification — the linter no longer keeps a private copy that could drift).
// family membership is by TYPE (C1): a VARIANT is the same scene type with a
// different data.variant, so it inherits its type's family automatically and can
// never silently escape it (SPLIT_IDE is CODE_EDITOR → code-surface). ONE
// exception, ruled 2026-07-08: plain multi-layout DIAGRAM is a 5-layout ENGINE
// (flow/sequence/block/tree/hub), NOT one skeleton, and ships adjacently in
// documentaries — so only its node-graph VARIANTS (mesh/agentMesh/auth) join the
// node-graph family; plain DIAGRAM stays a free type (shipped-spec immutability >
// blanket family membership).
const familyOf = (s) => {
  if (s.type === 'DIAGRAM') {
    const v = s.data?.diagram?.variant;
    return v === 'mesh' || v === 'agentMesh' || v === 'auth' ? 'node-graph' : 'DIAGRAM';
  }
  return FAMILY[s.type] || s.type;
};
const subTypeOf = (s) => {
  if (s.type === 'PIPELINE' && s.data?.pipeline?.variant) return `PIPELINE:${s.data.pipeline.variant}`;
  if (s.type === 'CODE_EDITOR' && s.data?.editor?.variant) return `CODE_EDITOR:${s.data.editor.variant}`;
  if (s.type === 'WINDOW_FRAME' && s.data?.window?.variant) return `WINDOW_FRAME:${s.data.window.variant}`;
  if (s.type === 'DIAGRAM' && s.data?.diagram?.variant && s.data.diagram.variant !== 'plain') return `DIAGRAM:${s.data.diagram.variant}`;
  if (s.type === 'LAYERED_STACK' && s.data?.stack?.variant === 'imageLayers') return 'LAYERED_STACK:imageLayers';
  if (s.type === 'PACKET' && s.data?.packet?.variant === 'container') return 'PACKET:container';
  if (s.type === 'K8S_CLUSTER' && s.data?.k8s?.mode) return `K8S_CLUSTER:${s.data.k8s.mode}`;
  if (s.type === 'BITS' && s.data?.bits?.variant === 'permissions') return 'BITS:permissions';
  if (s.type === 'CACHE_PYRAMID' && s.data?.pyramid?.variant === 'pyramid') return `CACHE_PYRAMID:pyramid${s.data.pyramid.mode === 'antipattern' ? '-anti' : ''}`;
  if (s.type === 'STATE_MACHINE' && s.data?.stateMachine?.variant === 'lifecycle') return 'STATE_MACHINE:lifecycle';
  if (s.type === 'LINE_CHART' && s.data?.lineChart?.variant) return `LINE_CHART:${s.data.lineChart.variant}`;
  if (s.type === 'BAR_COMPARE' && s.data?.barsVariant === 'race') return 'BAR_COMPARE:race';
  return s.type;
};
for (let i = 1; i < (spec.scenes?.length ?? 0); i++) {
  const fa = familyOf(spec.scenes[i]);
  if (fa === familyOf(spec.scenes[i - 1]) && CONSOLIDATED.has(fa))
    E(`SAME-FAMILY ADJACENCY: scenes ${i} and ${i + 1} are both ${fa}-family — vary the skeleton (a different component), not just the variant.`);
}
{
  const nn = spec.scenes?.length ?? 0;
  const pipeFam = (spec.scenes ?? []).filter((s) => familyOf(s) === 'PIPELINE').length;
  const pipeCap = Math.max(2, Math.ceil(nn * 0.25));
  if (nn >= 6 && pipeFam > pipeCap)
    E(`PIPELINE-FAMILY OVER-USE: ${pipeFam} staged-flow scenes (>~${pipeCap} for ${nn}) — reach for DIAGRAM/DRILL_IN/sequence to vary the skeleton, not just the chips.`);
}

// PALETTE DIVERSITY (hard gate) — stops the director taking the easy path of
// reusing the same handful of components. The library has ~40 scene types; a
// real video must draw broadly from them. Applies to non-trivial videos.
if (n >= 8) {
  const types = spec.scenes.map((s) => s.type);
  const subTypes = spec.scenes.map(subTypeOf);
  const distinct = new Set(subTypes).size;
  const need = Math.min(8, Math.round(n * 0.5));
  if (distinct < need)
    E(`PALETTE TOO NARROW: only ${distinct} distinct sub-types across ${n} scenes (need ≥${need}). Vary components — see references/scene_library.md; don't reuse the same few.`);
  const counts = {};
  for (const st of subTypes) counts[st] = (counts[st] || 0) + 1;
  const cap = Math.max(4, Math.ceil(n * 0.35));
  for (const [st, c] of Object.entries(counts))
    if (c > cap) E(`OVER-RELIANCE: sub-type ${st} used ${c}× (>~${cap} for ${n} scenes) — swap some for other component types.`);
  const DYNAMIC = ['DIAGRAM', 'KINETIC_TEXT', 'PHOTO', 'REVEAL', 'SOUND_WAVE', 'LOGO_REVEAL', 'CAROUSEL', 'ACTIVITY_CARD', 'LOCATION_MAP', 'FLIP_CARD', 'GALLERY', 'COMPARISON_SLIDER', 'QUOTE_SPOTLIGHT', 'IMAGE_SCENE', 'FUNNEL', 'WATERFALL', 'PICTOGRAM', 'RADAR', 'CANDLESTICK', 'BOX_PLOT', 'TREEMAP', 'SANKEY', 'ICON_GRID', 'ICON_CALLOUT', 'ICON_BURST', 'LOGO_WALL', 'LOGO_VERSUS', 'LOGO_TIMELINE', 'FORMULA', 'MOLECULE', 'DNA_HELIX', 'LABELED_FIGURE', 'VECTOR_FIELD', 'CIRCUIT_FLOW', 'TICKER_TAPE', 'MAP_RADAR', 'BITS', 'MEMORY', 'PACKET', 'PIPELINE', 'LAYERED_STACK', 'GRID_ARRAY', 'SPEC_COMPARE', 'DIE_SHOT', 'NEURAL_NET', 'DATACENTER', 'TRANSFORMER_BLOCK', 'CACHE_PYRAMID', 'CALL_STACK', 'TOKENIZER', 'FILE_TREE', 'DATABASE_TABLE', 'GIT_BRANCH', 'STATE_MACHINE', 'EMBEDDING_SPACE', 'QUEUE', 'API_REQUEST_RESPONSE', 'BOOLEAN_LOGIC_GATES', 'HASH_FUNCTION', 'SORTING_VISUAL', 'CLOCK_SIGNAL', 'GPU_CLUSTER', 'ZOOM_SCALE', 'ENCRYPTION', 'POINTER_DIAGRAM', 'NUMBER_BASE', 'CODE_EDITOR', 'TERMINAL_SESSION', 'LOG_STREAM', 'CODE_DIFF', 'ERROR_TRACE', 'WINDOW_FRAME', 'AUTOMATION_RUN', 'DOM_INSPECT', 'NETWORK_WATERFALL', 'DEVICE_FRAME', 'CLOUD_ARCH', 'K8S_CLUSTER', 'COST_METER', 'SLO_GAUGE', 'IAC_PLAN', 'ERD', 'PROCESS_TABLE', 'KERNEL_BOUNDARY', 'TEST_RUNNER', 'TEST_MATRIX', 'CONTEXT_METER', 'AGENT_HARNESS', 'KNOWLEDGE_GRAPH', 'RETRIEVAL_RANK', 'MODEL_STAGES', 'CONFIDENCE_GATE', 'SANDBOX_BOX', 'DRILL_IN', 'EVAL_DASHBOARD', 'VIDEO_HERO', 'VIDEO_SPOTLIGHT', 'MEDIA_CALLOUT', 'MEDIA_COMPARE', 'MEDIA_STAT_OVERLAY', 'SCREENSHOT_CASCADE', 'FLOATING_QUOTE_PILL', 'OVERLAY_SPLIT_DEFINITIONS', 'CYCLE_LOOP', 'STEP_STACK_OVERLAY', 'TITLE_BANNER_FOCUS', 'TALKING_POINTS', 'SLIDE_BULLETS_PIP', 'CAPTION_KINETIC_OVERLAY', 'PHOTO_TIMELINE', 'TRADEOFF_SCALE'];
  if (!types.some((t) => DYNAMIC.includes(t)))
    E(`NO DYNAMIC MOMENT: add at least one of DIAGRAM/KINETIC_TEXT/REVEAL/PHOTO/CAROUSEL/… so the video isn't all boxes, lists and numbers.`);
  const distinctTrans = new Set(spec.scenes.map((s) => s.transition).filter(Boolean)).size;
  if (distinctTrans < 3)
    W(`only ${distinctTrans} transition kind(s) used — vary scene.transition (16 available) so the cutting has rhythm.`);
}

const ids = new Set();
if (spec.meta?.format === 'long' && (!Array.isArray(spec.meta?.topicAxes) || spec.meta.topicAxes.length < 2))
  W('meta.topicAxes has <2 strategy axes (entity-novelty/economic-pain/sovereignty/tribal-conflict) — historically this profile lands ~50-300 views; see channel_playbook.md §1');
if (spec.meta?.format === 'long' && !spec.thumbnail)
  E('long spec missing "thumbnail": {title, badge, asset} — thumbnails must derive from the topic, never go stale');
if (spec.thumbnail && len(spec.thumbnail.title) > BUDGET.coverTitle)
  E(`thumbnail.title "${spec.thumbnail.title}" > ${BUDGET.coverTitle} chars`);
if (spec.cover && len(spec.cover.title) > BUDGET.coverTitle)
  E(`cover.title "${spec.cover.title}" > ${BUDGET.coverTitle} chars — thumbnails are fragments, not sentences`);

// deep-scan helpers
const collectAnchors = (obj, out = []) => {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'atWord' && typeof v === 'number') out.push(v);
      else collectAnchors(v, out);
    }
  }
  return out;
};
const collectImgAssets = (obj, out = []) => {
  if (typeof obj === 'string') {
    if (obj.startsWith('img:')) out.push(obj.slice(4));
  } else if (obj && typeof obj === 'object') {
    for (const v of Object.values(obj)) collectImgAssets(v, out);
  }
  return out;
};
for (const img of collectImgAssets(spec)) {
  if (!fs.existsSync(`${IMG_DIR}/${img}`))
    E(`asset "img:${img}" not found in ${IMG_DIR}/ — drop the file there first (see PROJECT_RULES.md §Assets)`);
}

// ── ASSET-REQUEST PROTOCOL (Phase 5, mechanism 1) ─────────────────────────
// A spec may DECLARE an asset it needs instead of inventing a URL (R3/truth):
//   "assetsNeeded": [{key, kind:'image'|'video'|'logo', query, sources?, mustShow?}]
// and a media field then references it as "needed:<key>". The console/resolver
// fetches candidates (Wikimedia/press-kit/CC0/si:), a human picks one, and the
// "needed:<key>" is swapped for the resolved "img:<file>". Until then the scene
// degrades to a component-icon monogram (AssetIcon fallback), never a blank.
const collectNeeded = (obj, out = []) => {
  if (typeof obj === 'string') {
    // an asset reference is EXACTLY `needed:<identifier>` — anchor the match so
    // prose that merely contains the English word "needed:" (e.g. a topic or
    // narration line) is never mistaken for an asset request.
    const m = /^needed:([A-Za-z0-9_-]+)$/.exec(obj.trim());
    if (m) out.push(m[1]);
  } else if (obj && typeof obj === 'object') {
    for (const v of Object.values(obj)) collectNeeded(v, out);
  }
  return out;
};
const ASSET_KINDS = ['image', 'video', 'logo'];
const declaredNeeds = new Map();
if (spec.assetsNeeded != null) {
  if (!Array.isArray(spec.assetsNeeded)) E('assetsNeeded must be an array of {key, kind, query, sources?, mustShow?}');
  else for (const a of spec.assetsNeeded) {
    if (!a || typeof a !== 'object') { E('assetsNeeded entry must be an object'); continue; }
    if (!a.key || typeof a.key !== 'string') E(`assetsNeeded entry needs a string "key" (got ${JSON.stringify(a.key)})`);
    if (declaredNeeds.has(a.key)) E(`assetsNeeded duplicate key "${a.key}"`);
    if (!ASSET_KINDS.includes(a.kind)) E(`assetsNeeded "${a.key}" kind must be ${ASSET_KINDS.join('/')} (got "${a.kind}")`);
    if (!a.query || typeof a.query !== 'string') E(`assetsNeeded "${a.key}" needs a string "query" (what to search for — never a URL)`);
    if (a.sources != null && !Array.isArray(a.sources)) E(`assetsNeeded "${a.key}" sources must be an array of source names`);
    if (a.key) declaredNeeds.set(a.key, {used: false});
  }
}
for (const key of collectNeeded(spec)) {
  const d = declaredNeeds.get(key);
  if (!d) E(`asset "needed:${key}" has no matching assetsNeeded[] entry — declare {key:"${key}", kind, query} at the spec top level (never invent a URL)`);
  else d.used = true;
}
for (const [key, d] of declaredNeeds) if (!d.used) W(`assetsNeeded "${key}" is declared but never referenced as "needed:${key}" — remove it or wire it into a scene`);

const checkAccent = (sceneId, field, text) => {
  if (!text) return;
  const opens = (text.match(/\[/g) ?? []).length;
  const closes = (text.match(/\]/g) ?? []).length;
  if (opens !== closes) E(`${sceneId}: ${field} has unbalanced [accent] brackets`);
  if (opens > 1) E(`${sceneId}: ${field} has ${opens} accent phrases — the eye gets exactly ONE landing point`);
};

const checkColor = (sceneId, field, c) => {
  if (c && !SEM.includes(c)) E(`${sceneId}: ${field} color "${c}" not semantic (${SEM.join('/')})`);
};

for (const s of spec.scenes ?? []) {
  const id = s.id ?? '(no id)';
  if (ids.has(s.id)) E(`duplicate scene id ${id}`);
  ids.add(s.id);
  if (!TYPES.includes(s.type)) E(`${id}: unknown type ${s.type}`);
  if (!ZONES.includes(s.background)) E(`${id}: background "${s.background}" invalid`);
  if (s.transition && !TRANSITIONS.includes(s.transition))
    E(`${id}: transition "${s.transition}" unknown. Known: ${TRANSITIONS.join(', ')}`);
  if (s.fx && !['letterbox', 'vignette', 'shake', 'burst'].includes(s.fx))
    E(`${id}: fx "${s.fx}" unknown. Known: letterbox, vignette, shake, burst`);
  if (!s.narration) E(`${id}: missing narration`);
  const wc = words(s.narration);

  // timing sanity: duration should track narration length (150wpm = 12 f/word)
  const expected = wc * 12 + 30;
  if (s.timingSource !== 'tts' && s.durationFrames && Math.abs(s.durationFrames - expected) > Math.max(60, expected * 0.4))
    W(`${id}: durationFrames=${s.durationFrames} vs ~${expected} expected for ${wc} words — check pacing`);
  if (s.type === 'HOOK' && s.durationFrames > HOOK_MAX_FRAMES)
    E(`${id}: HOOK is ${(s.durationFrames / 30).toFixed(1)}s — must be ≤8s`);

  // anchors within narration (skipped after TTS sync: anchors become fractional frames)
  if (s.timingSource !== 'tts') {
    for (const a of collectAnchors(s.data)) {
      if (a < 1) E(`${id}: atWord ${a} < 1 (anchors are 1-indexed)`);
      if (a > wc) E(`${id}: atWord ${a} exceeds narration word count (${wc}) — element would never appear`);
    }
  }

  const d = s.data ?? {};
  if (d.anim && !ANIMS.includes(d.anim)) E(`${id}: data.anim "${d.anim}" unknown. Known: ${ANIMS.join(', ')}`);
  // text budgets per field
  if (s.type === 'HOOK' && len(d.headline) > BUDGET.hookHeadline)
    E(`${id}: hook headline ${len(d.headline)} chars > ${BUDGET.hookHeadline}`);
  if (s.type !== 'HOOK' && d.headline) {
    if (len(d.headline.replace(/[\[\]]/g, '')) > BUDGET.headline)
      E(`${id}: headline ${len(d.headline)} chars > ${BUDGET.headline}`);
    checkAccent(id, 'headline', d.headline);
  }
  checkColor(id, 'headlineColor', d.headlineColor);
  if (d.source && len(d.source) > BUDGET.source) E(`${id}: source ${len(d.source)} > ${BUDGET.source} chars`);
  // STAT_CALLOUT big-number guard (defect A-1, conservative default): the 30 pack
  // renderers draw the hero number at a FIXED font size (no fit-to-width), so a raw
  // ≥8-digit value overflows the frame — badly on vertical. Steer the director to a
  // compact value + unit suffix (value:1.5, suffix:"B"), which every pack fits.
  // Pack fit-to-width is a Program-4 proposal (would be 30-file pack surgery).
  if (s.type === 'STAT_CALLOUT' && typeof d.value === 'number' && Math.abs(d.value) >= 1e7)
    W(`${id}: STAT_CALLOUT value ${d.value} is a ${String(Math.round(Math.abs(d.value))).length}-digit number — pack renderers use a fixed font size and it can overflow on vertical (A-1). Use a compact value + suffix, e.g. value:${Math.round(d.value / 1e8) / 10}, suffix:"B".`);
  if (['CHAT_MOCKUP', 'STEP_FLOW', 'STAT_PANELS', 'QUOTE_SPOTLIGHT', 'SPLIT_PATHS'].includes(s.type) && !d.source)
    W(`${id}: studio scene without a "source" footer — the credibility strip is part of the look`);

  for (const st of d.steps ?? []) {
    if (len(st.title) > BUDGET.stepTitle) E(`${id}: step title "${st.title}" > ${BUDGET.stepTitle} chars`);
    if (len(st.sub) > BUDGET.stepSub) E(`${id}: step sub "${st.sub}" > ${BUDGET.stepSub} chars`);
    if (len(st.kicker) > BUDGET.kicker) E(`${id}: kicker "${st.kicker}" > ${BUDGET.kicker} chars`);
    checkColor(id, 'step.color', st.color);
  }
  if ((d.steps ?? []).length > 5) E(`${id}: ${d.steps.length} steps — max 5 fit a frame`);
  if (d.caption && len(d.caption.text) > BUDGET.pill) E(`${id}: caption "${d.caption.text}" > ${BUDGET.pill} chars`);

  for (const m of d.messages ?? []) {
    if (len(m.text.replace(/[\[\]]/g, '')) > BUDGET.message) E(`${id}: message "${m.text.slice(0, 30)}…" > ${BUDGET.message} chars`);
    checkAccent(id, 'message', m.text);
    checkColor(id, 'message.color', m.color);
  }
  if ((d.messages ?? []).length > 4) E(`${id}: ${d.messages.length} chat messages — max 4`);
  for (const l of d.sideCard?.lines ?? []) {
    if (len(l.text) > BUDGET.monoLine) E(`${id}: sideCard line "${l.text}" > ${BUDGET.monoLine} chars`);
  }

  for (const stat of d.stats ?? []) {
    if (len(stat.kicker) > BUDGET.kicker) E(`${id}: stat kicker > ${BUDGET.kicker} chars`);
    if (len(stat.value) > BUDGET.statValue) E(`${id}: stat value "${stat.value}" > ${BUDGET.statValue} chars — values are numbers, notes carry words`);
    checkColor(id, 'stat.color', stat.color);
  }
  if (d.verdict && len(d.verdict.text) > BUDGET.pill) E(`${id}: verdict > ${BUDGET.pill} chars`);

  if (d.quote) {
    if (len(d.quote.replace(/[\[\]]/g, '')) > BUDGET.quote) E(`${id}: quote > ${BUDGET.quote} chars — trim to the essential clause`);
    checkAccent(id, 'quote', d.quote);
  }
  if (d.transformation && len(d.transformation.to) > BUDGET.pill) E(`${id}: transformation.to > ${BUDGET.pill} chars`);

  for (const side of ['left', 'right']) {
    const card = d[side];
    if (!card) continue;
    if (len(card.title) > BUDGET.panelTitle) E(`${id}: ${side}.title > ${BUDGET.panelTitle} chars`);
    if (card.badge && len(card.badge.text) > BUDGET.badgeInCard) E(`${id}: ${side}.badge "${card.badge.text}" > ${BUDGET.badgeInCard} chars — badges live inside cards, not full frames`);
    for (const l of card.lines ?? []) {
      if (len(l.text) > BUDGET.monoLine) E(`${id}: ${side} line "${l.text}" > ${BUDGET.monoLine} chars`);
      checkColor(id, `${side}.line.color`, l.color);
    }
  }

  for (const it of d.items ?? []) {
    if (len(it.text) > BUDGET.listItem) E(`${id}: list item "${it.text}" > ${BUDGET.listItem} chars`);
    if (len(it.detail) > 44) E(`${id}: item detail "${it.detail}" > 44 chars`);
  }
  for (const pt of d.points ?? []) if (len(pt.text) > BUDGET.recapPoint) E(`${id}: recap point "${pt.text}" > ${BUDGET.recapPoint} chars`);
  for (const b of d.bars ?? []) {
    if (len(b.label) > 16) E(`${id}: bar label "${b.label}" > 16 chars`);
    if (len(b.sub) > 16) E(`${id}: bar sub > 16 chars`);
    if (len(b.display) > 8) E(`${id}: bar display > 8 chars`);
    checkColor(id, 'bar.color', b.color);
  }
  if ((d.bars ?? []).length > 4) E(`${id}: max 4 bars per frame`);
  if (d.barsVariant && d.barsVariant !== 'race') E(`${id}: BAR_COMPARE variant must be race`);
  if ((d.logos ?? []).length > 8) E(`${id}: max 8 logos in a strip`);
  if (d.handle && len(d.handle) > 22) E(`${id}: handle > 22 chars`);
  if (d.tagline && len(d.tagline) > BUDGET.pill) E(`${id}: tagline > ${BUDGET.pill} chars`);

  // ---- data-viz + code-window budgets ----
  if (d.lineChart) {
    const series = d.lineChart.series ?? [];
    if (series.length > 3) E(`${id}: LINE_CHART max 3 series`);
    for (const s of series) {
      if (len(s.label) > 14) E(`${id}: series label "${s.label}" > 14 chars`);
      if ((s.values ?? []).length > 8) E(`${id}: series "${s.label}" has >8 points`);
      checkColor(id, 'series.color', s.color);
    }
    for (const x of d.lineChart.xAxis ?? []) if (len(x) > 6) E(`${id}: x-axis label "${x}" > 6 chars`);
    if (d.lineChart.variant && !['sparkline', 'dualaxis', 'compound'].includes(d.lineChart.variant)) E(`${id}: LINE_CHART variant must be sparkline/dualaxis/compound`);
    if (d.lineChart.variant === 'dualaxis' && (d.lineChart.series ?? []).length < 2) E(`${id}: LINE_CHART dualaxis needs 2 series`);
    if (len(d.lineChart.y2Unit) > 6) E(`${id}: LINE_CHART y2Unit > 6 chars`);
  }
  if (d.donut) {
    const segs = d.donut.segments ?? [];
    if (d.donut.variant && !['donut', 'pie'].includes(d.donut.variant)) E(`${id}: donut.variant must be donut|pie`);
    if (segs.length > 6) E(`${id}: DONUT max 6 segments`);
    if (segs.length < 2) E(`${id}: DONUT needs ≥2 segments`);
    for (const s of segs) {
      if (len(s.label) > 16) E(`${id}: donut segment "${s.label}" > 16 chars`);
      checkColor(id, 'donut.color', s.color);
    }
    if (len(d.donut.centerValue) > 6) E(`${id}: donut centerValue > 6 chars`);
    if (len(d.donut.centerLabel) > 14) E(`${id}: donut centerLabel > 14 chars`);
  }
  if (d.funnel) {
    const fst = d.funnel.stages ?? [];
    if (fst.length < 2) E(`${id}: FUNNEL needs ≥2 stages`);
    if (fst.length > 6) E(`${id}: FUNNEL max 6 stages`);
    if (len(d.funnel.unit) > 6) E(`${id}: FUNNEL unit > 6 chars`);
    for (const st of fst) {
      if (len(st.label) > 20) E(`${id}: FUNNEL stage label "${st.label}" > 20 chars`);
      if (typeof st.value !== 'number') E(`${id}: FUNNEL stage "${st.label}" needs a numeric value`);
      checkColor(id, 'funnel.stage.color', st.color);
    }
    checkColor(id, 'funnel.color', d.funnel.color);
  }
  if (d.waterfallChart) {
    const wb = d.waterfallChart.bars ?? [];
    if (wb.length < 2) E(`${id}: WATERFALL needs ≥2 bars`);
    if (wb.length > 7) E(`${id}: WATERFALL max 7 bars`);
    if (len(d.waterfallChart.unit) > 6) E(`${id}: WATERFALL unit > 6 chars`);
    for (const b of wb) {
      if (len(b.label) > 18) E(`${id}: WATERFALL bar label "${b.label}" > 18 chars`);
      if (typeof b.value !== 'number') E(`${id}: WATERFALL bar "${b.label}" needs a numeric value`);
      checkColor(id, 'waterfall.bar.color', b.color);
    }
    checkColor(id, 'waterfall.color', d.waterfallChart.color);
  }
  if (d.pictogram) {
    const pr = d.pictogram.rows ?? [];
    if (pr.length < 2) E(`${id}: PICTOGRAM needs ≥2 rows`);
    if (pr.length > 6) E(`${id}: PICTOGRAM max 6 rows`);
    if (len(d.pictogram.unit) > 6) E(`${id}: PICTOGRAM unit > 6 chars`);
    if (d.pictogram.perIcon != null && (typeof d.pictogram.perIcon !== 'number' || d.pictogram.perIcon <= 0)) E(`${id}: PICTOGRAM perIcon must be a positive number`);
    for (const r of pr) {
      if (len(r.label) > 20) E(`${id}: PICTOGRAM row label "${r.label}" > 20 chars`);
      if (typeof r.value !== 'number' || r.value < 0) E(`${id}: PICTOGRAM row "${r.label}" needs a value ≥ 0`);
      checkColor(id, 'pictogram.row.color', r.color);
    }
    checkColor(id, 'pictogram.color', d.pictogram.color);
  }
  if (d.radar) {
    const ax = d.radar.axes ?? [];
    const ser = d.radar.series ?? [];
    if (ax.length < 3) E(`${id}: RADAR needs ≥3 axes`);
    if (ax.length > 8) E(`${id}: RADAR max 8 axes`);
    if (ser.length < 1) E(`${id}: RADAR needs ≥1 series`);
    if (ser.length > 3) E(`${id}: RADAR max 3 series`);
    if (len(d.radar.unit) > 6) E(`${id}: RADAR unit > 6 chars`);
    for (const a of ax) if (len(a) > 14) E(`${id}: RADAR axis label "${a}" > 14 chars`);
    for (const s of ser) {
      if (len(s.name) > 18) E(`${id}: RADAR series name "${s.name}" > 18 chars`);
      if (!Array.isArray(s.values) || s.values.length !== ax.length) E(`${id}: RADAR series "${s.name}" needs one value per axis (${ax.length})`);
      else for (const v of s.values) if (typeof v !== 'number') E(`${id}: RADAR series "${s.name}" values must be numeric`);
      checkColor(id, 'radar.series.color', s.color);
    }
    checkColor(id, 'radar.color', d.radar.color);
  }
  if (d.candlestick) {
    const cs = d.candlestick.candles ?? [];
    if (cs.length < 2) E(`${id}: CANDLESTICK needs ≥2 candles`);
    if (cs.length > 30) E(`${id}: CANDLESTICK max 30 candles`);
    if (len(d.candlestick.unit) > 6) E(`${id}: CANDLESTICK unit > 6 chars`);
    if (len(d.candlestick.prefix) > 3) E(`${id}: CANDLESTICK prefix > 3 chars`);
    for (const c of cs) {
      for (const k of ['open', 'high', 'low', 'close']) if (typeof c[k] !== 'number') E(`${id}: CANDLESTICK candle needs numeric ${k}`);
      if (typeof c.high === 'number' && typeof c.low === 'number' && c.high < c.low) E(`${id}: CANDLESTICK candle high < low`);
      if (len(c.label) > 8) E(`${id}: CANDLESTICK candle label "${c.label}" > 8 chars`);
    }
    if (d.candlestick.ma && d.candlestick.ma.length !== cs.length) E(`${id}: CANDLESTICK ma must have one value per candle (${cs.length})`);
    checkColor(id, 'candlestick.color', d.candlestick.color);
    checkColor(id, 'candlestick.upColor', d.candlestick.upColor);
    checkColor(id, 'candlestick.downColor', d.candlestick.downColor);
  }
  if (d.iconGrid) {
    const its = d.iconGrid.items ?? [];
    if (its.length < 3) E(`${id}: ICON_GRID needs ≥3 items`);
    if (its.length > 12) E(`${id}: ICON_GRID max 12 items`);
    if (d.iconGrid.cols != null && (typeof d.iconGrid.cols !== 'number' || d.iconGrid.cols < 1 || d.iconGrid.cols > 6)) E(`${id}: ICON_GRID cols must be 1–6`);
    for (const it of its) {
      if (len(it.label) > 18) E(`${id}: ICON_GRID label "${it.label}" > 18 chars`);
      if (!it.icon || !/^(lucide:|si:)/.test(it.icon)) E(`${id}: ICON_GRID item needs an icon (lucide:… or si:…) — IP rule`);
      checkColor(id, 'iconGrid.item.color', it.color);
    }
    checkColor(id, 'iconGrid.color', d.iconGrid.color);
  }
  if (d.iconCallout) {
    const ic = d.iconCallout;
    if (!ic.icon || !/^(lucide:|si:)/.test(ic.icon)) E(`${id}: ICON_CALLOUT needs an icon (lucide:… or si:…) — IP rule`);
    if (len(ic.heading) > 48) E(`${id}: ICON_CALLOUT heading > 48 chars`);
    if (!ic.heading) E(`${id}: ICON_CALLOUT needs a heading`);
    if (len(ic.sub) > 90) E(`${id}: ICON_CALLOUT sub > 90 chars`);
    if ((ic.points ?? []).length > 4) E(`${id}: ICON_CALLOUT max 4 points`);
    for (const p of ic.points ?? []) if (len(p) > 40) E(`${id}: ICON_CALLOUT point "${p}" > 40 chars`);
    checkColor(id, 'iconCallout.color', ic.color);
  }
  if (d.iconBurst) {
    const ib = d.iconBurst;
    if (!ib.center || !ib.center.icon || !/^(lucide:|si:)/.test(ib.center.icon)) E(`${id}: ICON_BURST center needs an icon (lucide:… or si:…) — IP rule`);
    if (len(ib.center?.label) > 16) E(`${id}: ICON_BURST center label > 16 chars`);
    const sp = ib.spokes ?? [];
    if (sp.length < 3) E(`${id}: ICON_BURST needs ≥3 spokes`);
    if (sp.length > 10) E(`${id}: ICON_BURST max 10 spokes`);
    for (const s of sp) {
      if (!s.icon || !/^(lucide:|si:)/.test(s.icon)) E(`${id}: ICON_BURST spoke needs an icon (lucide:… or si:…) — IP rule`);
      if (len(s.label) > 16) E(`${id}: ICON_BURST spoke label "${s.label}" > 16 chars`);
      checkColor(id, 'iconBurst.spoke.color', s.color);
    }
    checkColor(id, 'iconBurst.color', ib.color);
  }
  if (d.logoWall) {
    const lg = d.logoWall.logos ?? [];
    if (lg.length < 3) E(`${id}: LOGO_WALL needs ≥3 logos`);
    if (lg.length > 15) E(`${id}: LOGO_WALL max 15 logos`);
    if (d.logoWall.cols != null && (typeof d.logoWall.cols !== 'number' || d.logoWall.cols < 1 || d.logoWall.cols > 6)) E(`${id}: LOGO_WALL cols must be 1–6`);
    for (const l of lg) {
      // IP rule: brand logos come from simple-icons (si:) — never redrawn. lucide: allowed as a generic fallback.
      if (!l.icon || !/^(si:|lucide:)/.test(l.icon)) E(`${id}: LOGO_WALL logo needs si:… (brand logo) or lucide:… — IP rule, never redrawn`);
      if (len(l.label) > 16) E(`${id}: LOGO_WALL label "${l.label}" > 16 chars`);
    }
    checkColor(id, 'logoWall.color', d.logoWall.color);
  }
  if (d.logoVersus) {
    const lv = d.logoVersus;
    for (const [k, s] of [['left', lv.left], ['right', lv.right]]) {
      if (!s) { E(`${id}: LOGO_VERSUS needs ${k}`); continue; }
      if (!s.icon || !/^(si:|lucide:)/.test(s.icon)) E(`${id}: LOGO_VERSUS ${k} needs si:… (brand logo) or lucide:… — IP rule`);
      if (!s.name) E(`${id}: LOGO_VERSUS ${k} needs a name`);
      if (len(s.name) > 20) E(`${id}: LOGO_VERSUS ${k} name "${s.name}" > 20 chars`);
      if (len(s.tagline) > 40) E(`${id}: LOGO_VERSUS ${k} tagline > 40 chars`);
      checkColor(id, `logoVersus.${k}.color`, s.color);
    }
    if (lv.winner && !['left', 'right'].includes(lv.winner)) E(`${id}: LOGO_VERSUS winner must be left/right`);
    checkColor(id, 'logoVersus.color', lv.color);
  }
  if (d.logoTimeline) {
    const en = d.logoTimeline.entries ?? [];
    if (en.length < 2) E(`${id}: LOGO_TIMELINE needs ≥2 entries`);
    if (en.length > 6) E(`${id}: LOGO_TIMELINE max 6 entries`);
    for (const e of en) {
      if (!e.icon || !/^(si:|lucide:)/.test(e.icon)) E(`${id}: LOGO_TIMELINE entry needs si:… (brand logo) or lucide:… — IP rule`);
      if (len(e.label) > 16) E(`${id}: LOGO_TIMELINE label "${e.label}" > 16 chars`);
      if (len(e.date) > 10) E(`${id}: LOGO_TIMELINE date "${e.date}" > 10 chars`);
      checkColor(id, 'logoTimeline.entry.color', e.color);
    }
    checkColor(id, 'logoTimeline.color', d.logoTimeline.color);
  }
  if (d.formula) {
    const ps = d.formula.parts ?? [];
    if (ps.length < 1) E(`${id}: FORMULA needs ≥1 part`);
    if (ps.length > 16) E(`${id}: FORMULA max 16 parts`);
    if (len(d.formula.label) > 60) E(`${id}: FORMULA label > 60 chars`);
    for (const p of ps) {
      if (!p.text && p.text !== '0') E(`${id}: FORMULA part needs text`);
      if (len(p.text) > 14) E(`${id}: FORMULA part "${p.text}" > 14 chars`);
      if (p.kind && !['var', 'op', 'num', 'fn'].includes(p.kind)) E(`${id}: FORMULA part kind must be var/op/num/fn`);
    }
    checkColor(id, 'formula.color', d.formula.color);
  }
  if (d.molecule) {
    const at = d.molecule.atoms ?? [];
    const bo = d.molecule.bonds ?? [];
    if (at.length < 2) E(`${id}: MOLECULE needs ≥2 atoms`);
    if (at.length > 12) E(`${id}: MOLECULE max 12 atoms`);
    if (bo.length > 16) E(`${id}: MOLECULE max 16 bonds`);
    if (len(d.molecule.name) > 40) E(`${id}: MOLECULE name > 40 chars`);
    for (const a of at) {
      if (!a.label || len(a.label) > 3) E(`${id}: MOLECULE atom label "${a.label}" must be 1–3 chars`);
      if (typeof a.x !== 'number' || typeof a.y !== 'number' || a.x < 0 || a.x > 1 || a.y < 0 || a.y > 1) E(`${id}: MOLECULE atom "${a.label}" needs x,y in 0..1`);
      checkColor(id, 'molecule.atom.color', a.color);
    }
    for (const b of bo) {
      if (typeof b.from !== 'number' || typeof b.to !== 'number' || b.from < 0 || b.to < 0 || b.from >= at.length || b.to >= at.length) E(`${id}: MOLECULE bond indexes out of range`);
      if (b.order != null && ![1, 2, 3].includes(b.order)) E(`${id}: MOLECULE bond order must be 1/2/3`);
    }
    checkColor(id, 'molecule.color', d.molecule.color);
  }
  if (d.dnaHelix) {
    const pr = d.dnaHelix.pairs ?? [];
    if (pr.length < 3) E(`${id}: DNA_HELIX needs ≥3 pairs`);
    if (pr.length > 14) E(`${id}: DNA_HELIX max 14 pairs`);
    for (const p of pr) {
      if (!p.left || len(p.left) > 2) E(`${id}: DNA_HELIX pair left "${p.left}" must be 1–2 chars`);
      if (!p.right || len(p.right) > 2) E(`${id}: DNA_HELIX pair right "${p.right}" must be 1–2 chars`);
      checkColor(id, 'dnaHelix.pair.color', p.color);
    }
    checkColor(id, 'dnaHelix.color', d.dnaHelix.color);
  }
  if (d.labeledFigure) {
    const lf = d.labeledFigure;
    if (!lf.subject || !/^(lucide:|si:|img:)/.test(lf.subject)) E(`${id}: LABELED_FIGURE subject needs lucide:… / si:… / img:… — IP rule (never redrawn)`);
    const co = lf.callouts ?? [];
    if (co.length < 2) E(`${id}: LABELED_FIGURE needs ≥2 callouts`);
    if (co.length > 8) E(`${id}: LABELED_FIGURE max 8 callouts`);
    for (const c of co) {
      if (!c.label) E(`${id}: LABELED_FIGURE callout needs a label`);
      if (len(c.label) > 22) E(`${id}: LABELED_FIGURE label "${c.label}" > 22 chars`);
      if (typeof c.x !== 'number' || typeof c.y !== 'number' || c.x < 0 || c.x > 1 || c.y < 0 || c.y > 1) E(`${id}: LABELED_FIGURE callout "${c.label}" needs x,y in 0..1`);
      checkColor(id, 'labeledFigure.callout.color', c.color);
    }
    checkColor(id, 'labeledFigure.color', lf.color);
  }
  if (d.vectorField) {
    const vf = d.vectorField;
    const mode = vf.mode ?? 'field';
    if (!['field', 'freebody'].includes(mode)) E(`${id}: VECTOR_FIELD mode must be field/freebody`);
    if (mode === 'freebody') {
      if (vf.body != null && !/^(lucide:|si:|img:)/.test(vf.body)) E(`${id}: VECTOR_FIELD body needs lucide:… / si:… / img:… — IP rule (never redrawn)`);
      if (len(vf.bodyLabel) > 24) E(`${id}: VECTOR_FIELD bodyLabel > 24 chars`);
      const fo = vf.forces ?? [];
      if (fo.length < 2) E(`${id}: VECTOR_FIELD (freebody) needs ≥2 forces`);
      if (fo.length > 6) E(`${id}: VECTOR_FIELD (freebody) max 6 forces`);
      for (const f of fo) {
        if (!f.label || len(f.label) > 20) E(`${id}: VECTOR_FIELD force label "${f.label}" must be 1–20 chars`);
        if (typeof f.angle !== 'number') E(`${id}: VECTOR_FIELD force "${f.label}" needs a numeric angle`);
        if (f.magnitude != null && (f.magnitude < 0 || f.magnitude > 1)) E(`${id}: VECTOR_FIELD force "${f.label}" magnitude must be 0..1`);
        checkColor(id, 'vectorField.force.color', f.color);
      }
    } else {
      if (vf.cols != null && (vf.cols < 3 || vf.cols > 12)) E(`${id}: VECTOR_FIELD cols must be 3–12`);
      if (vf.rows != null && (vf.rows < 3 || vf.rows > 8)) E(`${id}: VECTOR_FIELD rows must be 3–8`);
      if (vf.pattern != null && !['flow', 'radial', 'converge', 'rotational', 'diagonal', 'shear'].includes(vf.pattern)) E(`${id}: VECTOR_FIELD pattern must be flow/radial/converge/rotational/diagonal/shear`);
      if (len(vf.legend) > 40) E(`${id}: VECTOR_FIELD legend > 40 chars`);
    }
    checkColor(id, 'vectorField.color', vf.color);
  }
  if (d.circuitFlow) {
    const cf = d.circuitFlow;
    const co = cf.components ?? [];
    if (co.length < 2) E(`${id}: CIRCUIT_FLOW needs ≥2 components`);
    if (co.length > 8) E(`${id}: CIRCUIT_FLOW max 8 components`);
    const KINDS = ['battery', 'resistor', 'led', 'capacitor', 'bulb', 'switch', 'node'];
    for (const comp of co) {
      if (!KINDS.includes(comp.kind)) E(`${id}: CIRCUIT_FLOW component kind "${comp.kind}" must be battery/resistor/led/capacitor/bulb/switch/node`);
      if (len(comp.label) > 8) E(`${id}: CIRCUIT_FLOW component label "${comp.label}" > 8 chars`);
      checkColor(id, 'circuitFlow.component.color', comp.color);
    }
    if (len(cf.currentLabel) > 30) E(`${id}: CIRCUIT_FLOW currentLabel > 30 chars`);
    checkColor(id, 'circuitFlow.color', cf.color);
  }
  if (d.ticker) {
    const tk = d.ticker;
    const en = tk.entries ?? [];
    if (en.length < 3) E(`${id}: TICKER_TAPE needs ≥3 entries`);
    if (en.length > 16) E(`${id}: TICKER_TAPE max 16 entries`);
    for (const e of en) {
      if (!e.symbol || len(e.symbol) > 6) E(`${id}: TICKER_TAPE symbol "${e.symbol}" must be 1–6 chars`);
      if (len(e.price) > 12) E(`${id}: TICKER_TAPE price "${e.price}" > 12 chars`);
      if (typeof e.change !== 'number') E(`${id}: TICKER_TAPE entry "${e.symbol}" needs a numeric change`);
    }
    if (tk.featured != null && !en.some((e) => e.symbol === tk.featured)) E(`${id}: TICKER_TAPE featured "${tk.featured}" must match an entry symbol`);
    if (tk.rows != null && (tk.rows < 1 || tk.rows > 3)) E(`${id}: TICKER_TAPE rows must be 1–3`);
    checkColor(id, 'ticker.color', tk.color);
  }
  if (d.mapRadar) {
    const mr = d.mapRadar;
    const bl = mr.blips ?? [];
    if (bl.length < 1) E(`${id}: MAP_RADAR needs ≥1 blip`);
    if (bl.length > 10) E(`${id}: MAP_RADAR max 10 blips`);
    for (const b of bl) {
      if (typeof b.angle !== 'number') E(`${id}: MAP_RADAR blip needs a numeric angle`);
      if (typeof b.range !== 'number' || b.range < 0 || b.range > 1) E(`${id}: MAP_RADAR blip range must be 0..1`);
      if (len(b.label) > 16) E(`${id}: MAP_RADAR blip label "${b.label}" > 16 chars`);
      checkColor(id, 'mapRadar.blip.color', b.color);
    }
    if (mr.rings != null && (mr.rings < 2 || mr.rings > 5)) E(`${id}: MAP_RADAR rings must be 2–5`);
    if (len(mr.sweepLabel) > 24) E(`${id}: MAP_RADAR sweepLabel > 24 chars`);
    checkColor(id, 'mapRadar.color', mr.color);
  }
  if (d.boxPlot) {
    const bx = d.boxPlot.boxes ?? [];
    if (bx.length < 2) E(`${id}: BOX_PLOT needs ≥2 boxes`);
    if (bx.length > 8) E(`${id}: BOX_PLOT max 8 boxes`);
    if (len(d.boxPlot.unit) > 6) E(`${id}: BOX_PLOT unit > 6 chars`);
    if (len(d.boxPlot.prefix) > 3) E(`${id}: BOX_PLOT prefix > 3 chars`);
    for (const b of bx) {
      if (len(b.label) > 14) E(`${id}: BOX_PLOT box label "${b.label}" > 14 chars`);
      for (const k of ['min', 'q1', 'median', 'q3', 'max']) if (typeof b[k] !== 'number') E(`${id}: BOX_PLOT box "${b.label}" needs numeric ${k}`);
      if ([b.min, b.q1, b.median, b.q3, b.max].every((v) => typeof v === 'number') && !(b.min <= b.q1 && b.q1 <= b.median && b.median <= b.q3 && b.q3 <= b.max))
        E(`${id}: BOX_PLOT box "${b.label}" must satisfy min≤q1≤median≤q3≤max`);
      if (b.outliers && !Array.isArray(b.outliers)) E(`${id}: BOX_PLOT box "${b.label}" outliers must be an array`);
      checkColor(id, 'boxPlot.box.color', b.color);
    }
    checkColor(id, 'boxPlot.color', d.boxPlot.color);
  }
  if (d.treemap) {
    const its = d.treemap.items ?? [];
    if (its.length < 2) E(`${id}: TREEMAP needs ≥2 items`);
    if (its.length > 12) E(`${id}: TREEMAP max 12 items`);
    if (len(d.treemap.unit) > 6) E(`${id}: TREEMAP unit > 6 chars`);
    for (const it of its) {
      if (len(it.label) > 18) E(`${id}: TREEMAP item label "${it.label}" > 18 chars`);
      if (typeof it.value !== 'number' || it.value < 0) E(`${id}: TREEMAP item "${it.label}" needs a value ≥ 0`);
      checkColor(id, 'treemap.item.color', it.color);
    }
    checkColor(id, 'treemap.color', d.treemap.color);
  }
  if (d.sankey) {
    const nds = d.sankey.nodes ?? [];
    const lks = d.sankey.links ?? [];
    if (nds.length < 2) E(`${id}: SANKEY needs ≥2 nodes`);
    if (nds.length > 10) E(`${id}: SANKEY max 10 nodes`);
    if (lks.length < 1) E(`${id}: SANKEY needs ≥1 link`);
    if (lks.length > 16) E(`${id}: SANKEY max 16 links`);
    if (len(d.sankey.unit) > 6) E(`${id}: SANKEY unit > 6 chars`);
    const ids = new Set(nds.map((n) => n.id));
    for (const n of nds) {
      if (!n.id) E(`${id}: SANKEY node needs an id`);
      if (len(n.label) > 16) E(`${id}: SANKEY node label "${n.label}" > 16 chars`);
      if (typeof n.col !== 'number') E(`${id}: SANKEY node "${n.label}" needs a numeric col`);
      checkColor(id, 'sankey.node.color', n.color);
    }
    for (const l of lks) {
      if (!ids.has(l.source)) E(`${id}: SANKEY link source "${l.source}" is not a node id`);
      if (!ids.has(l.target)) E(`${id}: SANKEY link target "${l.target}" is not a node id`);
      if (typeof l.value !== 'number' || l.value < 0) E(`${id}: SANKEY link needs a value ≥ 0`);
      checkColor(id, 'sankey.link.color', l.color);
    }
    checkColor(id, 'sankey.color', d.sankey.color);
  }
  if (d.progress) {
    const items = d.progress.items ?? [];
    if (items.length > 4) E(`${id}: PROGRESS max 4 items`);
    if (d.progress.variant && !['ring', 'bar'].includes(d.progress.variant)) E(`${id}: progress.variant must be ring|bar`);
    for (const it of items) {
      if (len(it.label) > 18) E(`${id}: progress label "${it.label}" > 18 chars`);
      if (len(it.display) > 6) E(`${id}: progress display "${it.display}" > 6 chars`);
      checkColor(id, 'progress.color', it.color);
    }
  }
  if (d.timeline) {
    const mns = d.timeline.milestones ?? [];
    if (mns.length > 5) E(`${id}: TIMELINE max 5 milestones`);
    for (const m of mns) {
      if (len(m.date) > 10) E(`${id}: milestone date "${m.date}" > 10 chars`);
      if (len(m.title) > 18) E(`${id}: milestone title "${m.title}" > 18 chars`);
      if (len(m.sub) > 30) E(`${id}: milestone sub > 30 chars`);
      checkColor(id, 'milestone.color', m.color);
    }
  }
  if (d.quadrant) {
    const q = d.quadrant;
    if (!q.xAxis || !q.yAxis) E(`${id}: QUADRANT needs xAxis{left,right} and yAxis{top,bottom}`);
    for (const cap of [q.xAxis?.left, q.xAxis?.right, q.yAxis?.top, q.yAxis?.bottom])
      if (len(cap) > 14) E(`${id}: quadrant axis caption "${cap}" > 14 chars`);
    if ((q.points ?? []).length > 6) E(`${id}: QUADRANT max 6 points`);
    for (const pt of q.points ?? []) {
      if (len(pt.label) > 16) E(`${id}: quadrant point "${pt.label}" > 16 chars`);
      if (pt.x < 0 || pt.x > 1 || pt.y < 0 || pt.y > 1) E(`${id}: quadrant point "${pt.label}" x/y must be 0..1`);
      checkColor(id, 'quadrant.color', pt.color);
    }
  }
  if (d.code) {
    const cl = d.code.lines ?? [];
    if (!cl.length) E(`${id}: CODE_WINDOW needs at least one line`);
    if (cl.length > 12) E(`${id}: CODE_WINDOW max 12 lines`);
    for (const l of cl) {
      if (len(l.text) > 52) E(`${id}: code line "${(l.text ?? '').slice(0, 24)}…" > 52 chars`);
      checkColor(id, 'code.line.color', l.color);
    }
    if ((d.code.output ?? []).length > 6) E(`${id}: CODE_WINDOW max 6 output lines`);
    for (const o of d.code.output ?? []) {
      if (len(o.text) > 52) E(`${id}: code output "${(o.text ?? '').slice(0, 24)}…" > 52 chars`);
      checkColor(id, 'code.output.color', o.color);
    }
    if (len(d.code.filename) > 28) E(`${id}: code filename > 28 chars`);
    if (len(d.code.runLabel) > 36) E(`${id}: code runLabel > 36 chars`);
  }
  if (d.diagram) {
    const LAYOUTS = ['flow', 'sequence', 'block', 'tree', 'hub'];
    if (!LAYOUTS.includes(d.diagram.layout)) E(`${id}: DIAGRAM layout "${d.diagram.layout}" must be one of ${LAYOUTS.join('/')}`);
    if (!(d.diagram.nodes ?? []).length) E(`${id}: DIAGRAM needs nodes`);
    if ((d.diagram.nodes ?? []).length > 8) W(`${id}: ${d.diagram.nodes.length} diagram nodes — may crowd (esp. vertical)`);
    for (const nn of d.diagram.nodes ?? []) {
      if (len(nn.label) > 18) E(`${id}: diagram node "${nn.label}" > 18 chars`);
      if (len(nn.sub) > 22) E(`${id}: diagram node sub "${nn.sub}" > 22 chars`);
      checkColor(id, 'diagram.node.color', nn.color);
    }
    for (const ee of d.diagram.edges ?? []) {
      if (len(ee.label) > 16) E(`${id}: diagram edge label "${ee.label}" > 16 chars`);
      if (ee.kind && !['curve', 'ortho', 'straight'].includes(ee.kind)) E(`${id}: diagram edge kind "${ee.kind}" invalid`);
      checkColor(id, 'diagram.edge.color', ee.color);
    }
  }
  if (d.kinetic) {
    const FX = ['typewriter', 'glitch', 'split', 'char-spin', 'highlight', 'bounce', 'wave', 'outline', 'pop', 'pulse', 'slide'];
    if (d.kinetic.fx && !FX.includes(d.kinetic.fx)) E(`${id}: KINETIC_TEXT fx "${d.kinetic.fx}" invalid (${FX.join('/')})`);
    if (len(d.kinetic.text) > 48) E(`${id}: KINETIC_TEXT text > 48 chars`);
    if (len(d.kinetic.sub) > 40) E(`${id}: KINETIC_TEXT sub > 40 chars`);
    checkColor(id, 'kinetic.color', d.kinetic.color);
  }
  if (d.reveal) {
    if (len(d.reveal.kicker) > 24) E(`${id}: REVEAL kicker > 24 chars`);
    if (len(d.reveal.sub) > 60) E(`${id}: REVEAL sub > 60 chars`);
    checkColor(id, 'reveal.color', d.reveal.color);
  }
  if (d.tradeoff) {
    const to = d.tradeoff;
    if (len(to.headline) > 48) E(`${id}: TRADEOFF_SCALE headline > 48 chars`);
    if (len(to.caption) > 48) E(`${id}: TRADEOFF_SCALE caption > 48 chars`);
    if (len(to.source) > 64) E(`${id}: TRADEOFF_SCALE source > 64 chars`);
    for (const k of ['left', 'right']) {
      const s = to[k];
      if (!s || !s.label) E(`${id}: TRADEOFF_SCALE ${k}.label is required`);
      if (s) {
        if (len(s.label) > 20) E(`${id}: TRADEOFF_SCALE ${k}.label > 20 chars`);
        if (len(s.sub) > 30) E(`${id}: TRADEOFF_SCALE ${k}.sub > 30 chars`);
        checkColor(id, `tradeoff.${k}.color`, s.color);
      }
    }
    if (to.lean != null && (typeof to.lean !== 'number' || to.lean < -1 || to.lean > 1)) E(`${id}: TRADEOFF_SCALE lean must be a number in -1..1`);
  }
  if (d.photo) {
    if (!String(d.photo.asset ?? '').startsWith('img:')) E(`${id}: PHOTO asset must be an img: reference`);
    if (len(d.photo.caption) > 60) E(`${id}: PHOTO caption > 60 chars`);
    if (len(d.photo.kicker) > 24) E(`${id}: PHOTO kicker > 24 chars`);
    if (d.photo.pan && !['in', 'out', 'left', 'right', 'up', 'down'].includes(d.photo.pan)) E(`${id}: PHOTO pan "${d.photo.pan}" invalid`);
  }
  if (d.wave) {
    if (len(d.wave.label) > 24) E(`${id}: SOUND_WAVE label > 24 chars`);
    checkColor(id, 'wave.color', d.wave.color);
  }
  if (d.logo) {
    if (len(d.logo.name) > 24) E(`${id}: LOGO_REVEAL name > 24 chars`);
    if (len(d.logo.tagline) > 40) E(`${id}: LOGO_REVEAL tagline > 40 chars`);
    checkColor(id, 'logo.color', d.logo.color);
  }
  if (d.carousel) {
    if (!(d.carousel.items ?? []).length) E(`${id}: CAROUSEL needs items`);
    if ((d.carousel.items ?? []).length > 8) W(`${id}: ${d.carousel.items.length} carousel items — may crowd`);
    for (const it of d.carousel.items ?? []) {
      if (len(it.label) > 18) E(`${id}: carousel item "${it.label}" > 18 chars`);
      if (len(it.sub) > 22) E(`${id}: carousel item sub "${it.sub}" > 22 chars`);
      checkColor(id, 'carousel.color', it.color);
    }
  }
  if (d.credits) {
    if (len(d.credits.title) > 40) E(`${id}: CREDITS_ROLL title > 40 chars`);
    if (!(d.credits.rows ?? []).length) E(`${id}: CREDITS_ROLL needs rows`);
    for (const r of d.credits.rows ?? []) {
      if (len(r.role) > 24) E(`${id}: credits role "${r.role}" > 24 chars`);
      if (len(r.name) > 40) E(`${id}: credits name "${r.name}" > 40 chars`);
    }
    checkColor(id, 'credits.color', d.credits.color);
  }
  if (d.subscribe) {
    if (len(d.subscribe.text) > 40) E(`${id}: SUBSCRIBE_REMINDER text > 40 chars`);
    if (len(d.subscribe.sub) > 48) E(`${id}: SUBSCRIBE_REMINDER sub > 48 chars`);
    if (len(d.subscribe.handle) > 24) E(`${id}: SUBSCRIBE_REMINDER handle > 24 chars`);
    checkColor(id, 'subscribe.color', d.subscribe.color);
  }
  if (d.lowerThird) {
    if (len(d.lowerThird.kicker) > 18) E(`${id}: lowerThird kicker > 18 chars`);
    if (len(d.lowerThird.title) > 28) E(`${id}: lowerThird title "${d.lowerThird.title}" > 28 chars`);
    if (len(d.lowerThird.subtitle) > 34) E(`${id}: lowerThird subtitle > 34 chars`);
    checkColor(id, 'lowerThird.color', d.lowerThird.color);
  }
  if (d.chapter) {
    if (len(d.chapter.number) > 4) E(`${id}: chapter number "${d.chapter.number}" > 4 chars`);
    if (len(d.chapter.title) > 28) E(`${id}: chapter title "${d.chapter.title}" > 28 chars`);
    if (len(d.chapter.subtitle) > 40) E(`${id}: chapter subtitle > 40 chars`);
    checkColor(id, 'chapter.color', d.chapter.color);
  }
  if (d.notifications) {
    if (d.notifications.length > 4) E(`${id}: NOTIFICATION max 4 toasts`);
    for (const nfn of d.notifications) {
      if (len(nfn.app) > 18) E(`${id}: notification app "${nfn.app}" > 18 chars`);
      if (len(nfn.title) > 40) E(`${id}: notification title "${nfn.title}" > 40 chars`);
      if (len(nfn.body) > 60) E(`${id}: notification body > 60 chars`);
      checkColor(id, 'notification.color', nfn.color);
    }
  }
  if (d.countdown) {
    if (typeof d.countdown.from !== 'number' || d.countdown.from < 1 || d.countdown.from > 10)
      E(`${id}: countdown.from must be 1..10`);
    if (len(d.countdown.label) > 30) E(`${id}: countdown label > 30 chars`);
    if (len(d.countdown.go) > 10) E(`${id}: countdown go > 10 chars`);
    checkColor(id, 'countdown.color', d.countdown.color);
  }
  if (d.flip) {
    for (const side of ['front', 'back']) {
      const f = d.flip[side];
      if (!f) { E(`${id}: FLIP_CARD needs ${side}{label,text}`); continue; }
      if (len(f.label) > 20) E(`${id}: flip ${side}.label > 20 chars`);
      if (len(f.text) > 80) E(`${id}: flip ${side}.text > 80 chars`);
      checkColor(id, `flip.${side}.color`, f.color);
    }
  }
  if (d.gallery) {
    const tiles = d.gallery.tiles ?? [];
    const clips = d.gallery.variant === 'clips' || tiles.some((tl) => tl.src);
    if (d.gallery.variant && !['grid', 'clips'].includes(d.gallery.variant)) E(`${id}: GALLERY variant must be grid|clips`);
    if (tiles.length > (clips ? 4 : 6)) E(`${id}: ${clips ? 'CLIP_GRID max 4 clips' : 'GALLERY max 6 tiles'}`);
    if (tiles.length < 2) E(`${id}: GALLERY needs ≥2 tiles`);
    for (const tl of tiles) {
      if (!tl.asset && !tl.src) E(`${id}: gallery tile needs an asset (or a src for CLIP_GRID)`);
      if (tl.kind && !['video', 'image'].includes(tl.kind)) E(`${id}: gallery tile kind must be video|image`);
      if (len(tl.label) > 18) E(`${id}: gallery tile label "${tl.label}" > 18 chars`);
      checkColor(id, 'gallery.tile.color', tl.color);
    }
  }
  if (d.comparison) {
    for (const side of ['before', 'after']) {
      const c = d.comparison[side];
      if (!c) { E(`${id}: COMPARISON_SLIDER needs ${side}{label}`); continue; }
      if (len(c.label) > 18) E(`${id}: comparison ${side}.label "${c.label}" > 18 chars`);
      if (len(c.caption) > 30) E(`${id}: comparison ${side}.caption > 30 chars`);
      checkColor(id, `comparison.${side}.color`, c.color);
    }
  }
  if (d.photoStack) {
    const cards = d.photoStack.cards ?? [];
    if (cards.length > 5) E(`${id}: PHOTO_STACK max 5 cards`);
    if (cards.length < 2) E(`${id}: PHOTO_STACK needs ≥2 cards`);
    for (const cd of cards) {
      if (len(cd.label) > 30) E(`${id}: photo card label "${cd.label}" > 30 chars`);
      checkColor(id, 'photoStack.card.color', cd.color);
    }
  }
  if (d.image) {
    if (d.image.variant && !['polaroid', 'pip'].includes(d.image.variant)) E(`${id}: image.variant must be polaroid|pip`);
    if (!d.image.asset) E(`${id}: IMAGE_SCENE needs an asset`);
    if (len(d.image.caption) > 40) E(`${id}: image caption > 40 chars`);
    if (d.image.pip && len(d.image.pip.label) > 18) E(`${id}: image.pip.label > 18 chars`);
    checkColor(id, 'image.color', d.image.color);
  }
  if (d.activity) {
    const abars = d.activity.data ?? [];
    if (!d.activity.value) E(`${id}: ACTIVITY_CARD needs a value`);
    if (abars.length < 3) E(`${id}: ACTIVITY_CARD needs ≥3 bars`);
    if (abars.length > 9) E(`${id}: ACTIVITY_CARD max 9 bars`);
    if (len(d.activity.title) > 22) E(`${id}: ACTIVITY_CARD title > 22 chars`);
    if (len(d.activity.value) > 8) E(`${id}: ACTIVITY_CARD value > 8 chars`);
    if (len(d.activity.trend) > 32) E(`${id}: ACTIVITY_CARD trend > 32 chars`);
    if (len(d.activity.range) > 12) E(`${id}: ACTIVITY_CARD range > 12 chars`);
    for (const ab of abars) {
      if (len(ab.day) > 4) E(`${id}: activity bar day "${ab.day}" > 4 chars`);
      if (typeof ab.value !== 'number') E(`${id}: activity bar value must be a number`);
    }
    checkColor(id, 'activity.color', d.activity.color);
    checkColor(id, 'activity.trendColor', d.activity.trendColor);
  }
  if (d.locationMap) {
    if (len(d.locationMap.location) > 28) E(`${id}: LOCATION_MAP location > 28 chars`);
    if (len(d.locationMap.coordinates) > 32) E(`${id}: LOCATION_MAP coordinates > 32 chars`);
    if (len(d.locationMap.status) > 10) E(`${id}: LOCATION_MAP status > 10 chars`);
    checkColor(id, 'locationMap.color', d.locationMap.color);
  }
  if (d.bits) {
    if (d.bits.variant !== 'permissions' && typeof d.bits.value !== 'number') E(`${id}: BITS needs a numeric value`);
    if (d.bits.bits != null && (d.bits.bits < 4 || d.bits.bits > 16)) E(`${id}: BITS bits must be 4–16`);
    if (len(d.bits.label) > 32) E(`${id}: BITS label > 32 chars`);
    checkColor(id, 'bits.color', d.bits.color);
  }
  if (d.memory) {
    const mc = d.memory.cells ?? [];
    if (mc.length < 2) E(`${id}: MEMORY needs ≥2 cells`);
    if (mc.length > 12) E(`${id}: MEMORY max 12 cells`);
    if (len(d.memory.label) > 40) E(`${id}: MEMORY label > 40 chars`);
    if (len(d.memory.pointerLabel) > 10) E(`${id}: MEMORY pointerLabel > 10 chars`);
    for (const c of mc) {
      if (len(c.value) > 8) E(`${id}: MEMORY cell value "${c.value}" > 8 chars`);
      if (len(c.addr) > 8) E(`${id}: MEMORY cell addr "${c.addr}" > 8 chars`);
      checkColor(id, 'memory.cell.color', c.color);
    }
    checkColor(id, 'memory.color', d.memory.color);
  }
  if (d.packet) {
    const hp = d.packet.hops ?? [];
    if (hp.length < 2) E(`${id}: PACKET needs ≥2 hops`);
    if (hp.length > 5) E(`${id}: PACKET max 5 hops`);
    if (len(d.packet.packetLabel) > 24) E(`${id}: PACKET packetLabel > 24 chars`);
    for (const h of hp) {
      if (len(h.label) > 18) E(`${id}: PACKET hop label "${h.label}" > 18 chars`);
      checkColor(id, 'packet.hop.color', h.color);
    }
    checkColor(id, 'packet.color', d.packet.color);
  }
  if (d.pipeline) {
    const st = d.pipeline.stages ?? [];
    if (st.length < 2) E(`${id}: PIPELINE needs ≥2 stages`);
    if (st.length > 6) E(`${id}: PIPELINE max 6 stages`);
    if (len(d.pipeline.tokenLabel) > 22) E(`${id}: PIPELINE tokenLabel > 22 chars`);
    if (d.pipeline.variant && !['flow', 'ci', 'boot', 'serverless', 'journey'].includes(d.pipeline.variant))
      E(`${id}: PIPELINE bad variant "${d.pipeline.variant}" (flow/ci/boot/serverless/journey)`);
    for (const s of st) {
      if (len(s.label) > 18) E(`${id}: PIPELINE stage label "${s.label}" > 18 chars`);
      if (len(s.sub) > 28) E(`${id}: PIPELINE stage sub "${s.sub}" > 28 chars`);
      if (len(s.badge) > 14) E(`${id}: PIPELINE stage badge "${s.badge}" > 14 chars`);
      if (len(s.ms) > 8) E(`${id}: PIPELINE stage ms "${s.ms}" > 8 chars`);
      if (len(s.reason) > 40) E(`${id}: PIPELINE stage reason "${s.reason}" > 40 chars`);
      if (len(s.status) > 12) E(`${id}: PIPELINE stage status "${s.status}" > 12 chars`);
      checkColor(id, 'pipeline.stage.color', s.color);
    }
    checkColor(id, 'pipeline.color', d.pipeline.color);
  }
  if (d.stack) {
    const ly = d.stack.layers ?? [];
    if (ly.length < 2) E(`${id}: LAYERED_STACK needs ≥2 layers`);
    if (ly.length > 7) E(`${id}: LAYERED_STACK max 7 layers`);
    for (const l of ly) {
      if (len(l.label) > 26) E(`${id}: LAYERED_STACK layer label "${l.label}" > 26 chars`);
      if (len(l.sub) > 30) E(`${id}: LAYERED_STACK layer sub "${l.sub}" > 30 chars`);
      checkColor(id, 'stack.layer.color', l.color);
    }
    checkColor(id, 'stack.color', d.stack.color);
  }
  if (d.grid) {
    if (typeof d.grid.rows !== 'number' || typeof d.grid.cols !== 'number') E(`${id}: GRID_ARRAY needs numeric rows and cols`);
    if (d.grid.rows < 2 || d.grid.rows > 16) E(`${id}: GRID_ARRAY rows must be 2–16`);
    if (d.grid.cols < 2 || d.grid.cols > 16) E(`${id}: GRID_ARRAY cols must be 2–16`);
    if (len(d.grid.label) > 40) E(`${id}: GRID_ARRAY label > 40 chars`);
    if (len(d.grid.legendA) > 20) E(`${id}: GRID_ARRAY legendA > 20 chars`);
    if (len(d.grid.legendB) > 20) E(`${id}: GRID_ARRAY legendB > 20 chars`);
    checkColor(id, 'grid.color', d.grid.color);
  }
  if (d.compare) {
    const rw = d.compare.rows ?? [];
    if (!d.compare.a || !d.compare.b) E(`${id}: SPEC_COMPARE needs both a and b sides`);
    if (len(d.compare.a?.name) > 16) E(`${id}: SPEC_COMPARE a.name > 16 chars`);
    if (len(d.compare.b?.name) > 16) E(`${id}: SPEC_COMPARE b.name > 16 chars`);
    if (rw.length < 2) E(`${id}: SPEC_COMPARE needs ≥2 rows`);
    if (rw.length > 6) E(`${id}: SPEC_COMPARE max 6 rows`);
    for (const r of rw) {
      if (len(r.label) > 22) E(`${id}: SPEC_COMPARE row label "${r.label}" > 22 chars`);
      if (len(r.a) > 14) E(`${id}: SPEC_COMPARE row a value "${r.a}" > 14 chars`);
      if (len(r.b) > 14) E(`${id}: SPEC_COMPARE row b value "${r.b}" > 14 chars`);
    }
    checkColor(id, 'compare.a.color', d.compare.a?.color);
    checkColor(id, 'compare.b.color', d.compare.b?.color);
  }
  if (d.die) {
    const bl = d.die.blocks ?? [];
    if (typeof d.die.cols !== 'number' || typeof d.die.rows !== 'number') E(`${id}: DIE_SHOT needs numeric cols and rows`);
    if (bl.length < 2) E(`${id}: DIE_SHOT needs ≥2 blocks`);
    if (bl.length > 12) E(`${id}: DIE_SHOT max 12 blocks`);
    if (len(d.die.chipLabel) > 26) E(`${id}: DIE_SHOT chipLabel > 26 chars`);
    for (const b of bl) {
      if (len(b.label) > 18) E(`${id}: DIE_SHOT block label "${b.label}" > 18 chars`);
      if (len(b.sub) > 14) E(`${id}: DIE_SHOT block sub "${b.sub}" > 14 chars`);
      if (b.x == null || b.y == null || b.w == null || b.h == null) E(`${id}: DIE_SHOT block "${b.label}" needs x, y, w, h`);
      if (b.x + b.w - 1 > d.die.cols) E(`${id}: DIE_SHOT block "${b.label}" overflows cols`);
      if (b.y + b.h - 1 > d.die.rows) E(`${id}: DIE_SHOT block "${b.label}" overflows rows`);
      checkColor(id, 'die.block.color', b.color);
    }
    checkColor(id, 'die.color', d.die.color);
  }
  if (d.net) {
    const ls = d.net.layers ?? [];
    if (ls.length < 2) E(`${id}: NEURAL_NET needs ≥2 layers`);
    if (ls.length > 5) E(`${id}: NEURAL_NET max 5 layers`);
    for (const c of ls) {
      if (typeof c !== 'number' || c < 1 || c > 6) E(`${id}: NEURAL_NET each layer must be 1–6 nodes`);
    }
    if (d.net.labels) {
      for (const lb of d.net.labels) if (len(lb) > 16) E(`${id}: NEURAL_NET label "${lb}" > 16 chars`);
    }
    checkColor(id, 'net.color', d.net.color);
  }
  if (d.datacenter) {
    const dc = d.datacenter;
    const variant = dc.variant ?? 'hall';
    if (len(dc.spineLabel) > 26) E(`${id}: DATACENTER spineLabel > 26 chars`);
    if (len(dc.rackLabel) > 26) E(`${id}: DATACENTER rackLabel > 26 chars`);
    if (variant === 'hall') {
      const rk = dc.racks ?? [];
      if (rk.length < 2) E(`${id}: DATACENTER hall needs ≥2 racks`);
      if (rk.length > 6) E(`${id}: DATACENTER hall max 6 racks`);
      for (const r of rk) {
        if (len(r.label) > 16) E(`${id}: DATACENTER rack label "${r.label}" > 16 chars`);
        checkColor(id, 'datacenter.rack.color', r.color);
      }
    } else {
      const un = dc.units ?? [];
      if (un.length < 2) E(`${id}: DATACENTER rack needs ≥2 units`);
      if (un.length > 7) E(`${id}: DATACENTER rack max 7 units`);
      for (const u of un) {
        if (len(u.label) > 20) E(`${id}: DATACENTER unit label "${u.label}" > 20 chars`);
        if (len(u.sub) > 20) E(`${id}: DATACENTER unit sub "${u.sub}" > 20 chars`);
        checkColor(id, 'datacenter.unit.color', u.color);
      }
    }
    checkColor(id, 'datacenter.color', dc.color);
  }
  if (d.transformer) {
    const bl = d.transformer.blocks ?? [];
    if (bl.length < 3) E(`${id}: TRANSFORMER_BLOCK needs ≥3 blocks`);
    if (bl.length > 7) E(`${id}: TRANSFORMER_BLOCK max 7 blocks`);
    if (len(d.transformer.repeatLabel) > 10) E(`${id}: TRANSFORMER_BLOCK repeatLabel > 10 chars`);
    for (const b of bl) {
      if (len(b.label) > 22) E(`${id}: TRANSFORMER_BLOCK block label "${b.label}" > 22 chars`);
      if (len(b.sub) > 22) E(`${id}: TRANSFORMER_BLOCK block sub "${b.sub}" > 22 chars`);
      if (b.kind && !['io', 'attn', 'norm', 'ffn'].includes(b.kind)) E(`${id}: TRANSFORMER_BLOCK bad kind "${b.kind}"`);
      checkColor(id, 'transformer.block.color', b.color);
    }
    checkColor(id, 'transformer.color', d.transformer.color);
  }
  if (d.pyramid) {
    const tr = d.pyramid.tiers ?? [];
    if (tr.length < 2) E(`${id}: CACHE_PYRAMID needs ≥2 tiers`);
    if (tr.length > 7) E(`${id}: CACHE_PYRAMID max 7 tiers`);
    if (len(d.pyramid.axisTop) > 24) E(`${id}: CACHE_PYRAMID axisTop > 24 chars`);
    if (len(d.pyramid.axisBottom) > 24) E(`${id}: CACHE_PYRAMID axisBottom > 24 chars`);
    for (const ti of tr) {
      if (len(ti.label) > 20) E(`${id}: CACHE_PYRAMID tier label "${ti.label}" > 20 chars`);
      if (len(ti.speed) > 12) E(`${id}: CACHE_PYRAMID tier speed "${ti.speed}" > 12 chars`);
      if (len(ti.size) > 12) E(`${id}: CACHE_PYRAMID tier size "${ti.size}" > 12 chars`);
      checkColor(id, 'pyramid.tier.color', ti.color);
    }
    checkColor(id, 'pyramid.color', d.pyramid.color);
  }
  if (d.callStack) {
    const fr = d.callStack.frames ?? [];
    if (fr.length < 2) E(`${id}: CALL_STACK needs ≥2 frames`);
    if (fr.length > 6) E(`${id}: CALL_STACK max 6 frames`);
    if (d.callStack.mode && !['stack', 'trace'].includes(d.callStack.mode)) E(`${id}: CALL_STACK mode must be stack/trace`);
    if (len(d.callStack.exception) > 48) E(`${id}: ERROR_TRACE exception > 48 chars`);
    for (const f of fr) {
      if (len(f.fn) > 26) E(`${id}: CALL_STACK frame fn "${f.fn}" > 26 chars`);
      if (len(f.sub) > 30) E(`${id}: CALL_STACK frame sub "${f.sub}" > 30 chars`);
      if (len(f.file) > 22) E(`${id}: ERROR_TRACE frame file "${f.file}" > 22 chars`);
      checkColor(id, 'callStack.frame.color', f.color);
    }
    checkColor(id, 'callStack.color', d.callStack.color);
  }
  if (d.tokenizer) {
    const tks = d.tokenizer.tokens ?? [];
    if (tks.length < 2) E(`${id}: TOKENIZER needs ≥2 tokens`);
    if (tks.length > 10) E(`${id}: TOKENIZER max 10 tokens`);
    if (len(d.tokenizer.text) > 90) E(`${id}: TOKENIZER text > 90 chars`);
    for (const tk of tks) {
      if (len(tk.text) > 12) E(`${id}: TOKENIZER token "${tk.text}" > 12 chars`);
      checkColor(id, 'tokenizer.token.color', tk.color);
    }
    checkColor(id, 'tokenizer.color', d.tokenizer.color);
  }
  if (d.fileTree) {
    const nds = d.fileTree.nodes ?? [];
    if (nds.length < 2) E(`${id}: FILE_TREE needs ≥2 nodes`);
    if (nds.length > 12) E(`${id}: FILE_TREE max 12 nodes`);
    for (const nd of nds) {
      if (len(nd.name) > 28) E(`${id}: FILE_TREE node name "${nd.name}" > 28 chars`);
      if (nd.depth == null || nd.depth < 0 || nd.depth > 4) E(`${id}: FILE_TREE node "${nd.name}" depth must be 0–4`);
      if (nd.kind && !['folder', 'file'].includes(nd.kind)) E(`${id}: FILE_TREE bad kind "${nd.kind}"`);
      checkColor(id, 'fileTree.node.color', nd.color);
    }
    checkColor(id, 'fileTree.color', d.fileTree.color);
  }
  if (d.database) {
    const cols = d.database.columns ?? [];
    const rws = d.database.rows ?? [];
    if (cols.length < 2) E(`${id}: DATABASE_TABLE needs ≥2 columns`);
    if (cols.length > 4) E(`${id}: DATABASE_TABLE max 4 columns`);
    if (rws.length < 2) E(`${id}: DATABASE_TABLE needs ≥2 rows`);
    if (rws.length > 6) E(`${id}: DATABASE_TABLE max 6 rows`);
    if (len(d.database.tableName) > 20) E(`${id}: DATABASE_TABLE tableName > 20 chars`);
    if (len(d.database.query) > 40) E(`${id}: DATABASE_TABLE query > 40 chars`);
    for (const col of cols) if (len(col) > 14) E(`${id}: DATABASE_TABLE column "${col}" > 14 chars`);
    for (const rw of rws) for (const cell of rw) if (len(cell) > 16) E(`${id}: DATABASE_TABLE cell "${cell}" > 16 chars`);
    checkColor(id, 'database.color', d.database.color);
  }
  if (d.git) {
    const ln = d.git.lanes ?? [];
    const cm = d.git.commits ?? [];
    if (ln.length < 2) E(`${id}: GIT_BRANCH needs ≥2 lanes`);
    if (ln.length > 3) E(`${id}: GIT_BRANCH max 3 lanes`);
    if (cm.length < 2) E(`${id}: GIT_BRANCH needs ≥2 commits`);
    if (cm.length > 8) E(`${id}: GIT_BRANCH max 8 commits`);
    for (const l of ln) if (len(l) > 14) E(`${id}: GIT_BRANCH lane name "${l}" > 14 chars`);
    for (const c of cm) {
      if (c.lane == null || c.lane < 0 || c.lane >= ln.length) E(`${id}: GIT_BRANCH commit lane out of range`);
      if (len(c.label) > 14) E(`${id}: GIT_BRANCH commit label "${c.label}" > 14 chars`);
      checkColor(id, 'git.commit.color', c.color);
    }
    for (const lk of (d.git.links ?? [])) {
      if (lk.from >= cm.length || lk.to >= cm.length || lk.from < 0 || lk.to < 0) E(`${id}: GIT_BRANCH link index out of range`);
    }
    checkColor(id, 'git.color', d.git.color);
  }
  if (d.stateMachine) {
    const sts = d.stateMachine.states ?? [];
    const trs = d.stateMachine.transitions ?? [];
    if (sts.length < 2) E(`${id}: STATE_MACHINE needs ≥2 states`);
    if (sts.length > (d.stateMachine.variant === 'lifecycle' ? 6 : 5)) E(`${id}: STATE_MACHINE max ${d.stateMachine.variant === 'lifecycle' ? 6 : 5} states`);
    if (trs.length < 1) E(`${id}: STATE_MACHINE needs ≥1 transition`);
    if (trs.length > 7) E(`${id}: STATE_MACHINE max 7 transitions`);
    for (const s of sts) if (len(s.label) > 12) E(`${id}: STATE_MACHINE state label "${s.label}" > 12 chars`);
    for (const tr of trs) {
      if (tr.from == null || tr.to == null || tr.from < 0 || tr.to < 0 || tr.from >= sts.length || tr.to >= sts.length) E(`${id}: STATE_MACHINE transition index out of range`);
      if (len(tr.label) > 14) E(`${id}: STATE_MACHINE transition label "${tr.label}" > 14 chars`);
    }
    checkColor(id, 'stateMachine.color', d.stateMachine.color);
  }
  if (d.embedding) {
    const pts = d.embedding.points ?? [];
    if (pts.length < 2) E(`${id}: EMBEDDING_SPACE needs ≥2 points`);
    if (pts.length > 16) E(`${id}: EMBEDDING_SPACE max 16 points`);
    if ((d.embedding.clusters ?? []).length > 4) E(`${id}: EMBEDDING_SPACE max 4 clusters`);
    if (len(d.embedding.axisX) > 20) E(`${id}: EMBEDDING_SPACE axisX > 20 chars`);
    if (len(d.embedding.axisY) > 20) E(`${id}: EMBEDDING_SPACE axisY > 20 chars`);
    for (const p of pts) {
      if (typeof p.x !== 'number' || typeof p.y !== 'number') E(`${id}: EMBEDDING_SPACE point needs numeric x and y`);
      if (len(p.label) > 16) E(`${id}: EMBEDDING_SPACE point label "${p.label}" > 16 chars`);
    }
    for (const cl of (d.embedding.clusters ?? [])) if (len(cl) > 18) E(`${id}: EMBEDDING_SPACE cluster "${cl}" > 18 chars`);
    checkColor(id, 'embedding.color', d.embedding.color);
  }
  if (d.queue) {
    const its = d.queue.items ?? [];
    if (its.length < 2) E(`${id}: QUEUE needs ≥2 items`);
    if (its.length > 7) E(`${id}: QUEUE max 7 items`);
    if (len(d.queue.frontLabel) > 16) E(`${id}: QUEUE frontLabel > 16 chars`);
    if (len(d.queue.backLabel) > 16) E(`${id}: QUEUE backLabel > 16 chars`);
    for (const it of its) {
      if (len(it.label) > 8) E(`${id}: QUEUE item "${it.label}" > 8 chars`);
      checkColor(id, 'queue.item.color', it.color);
    }
    checkColor(id, 'queue.color', d.queue.color);
  }
  if (d.api) {
    if (len(d.api.method) > 7) E(`${id}: API method > 7 chars`);
    if (len(d.api.path) > 28) E(`${id}: API path > 28 chars`);
    if (len(d.api.status) > 4) E(`${id}: API status > 4 chars`);
    if (len(d.api.statusText) > 16) E(`${id}: API statusText > 16 chars`);
    if (len(d.api.clientLabel) > 16) E(`${id}: API clientLabel > 16 chars`);
    if (len(d.api.serverLabel) > 16) E(`${id}: API serverLabel > 16 chars`);
    for (const ln of (d.api.requestLines ?? [])) if (len(ln) > 26) E(`${id}: API request line "${ln}" > 26 chars`);
    for (const ln of (d.api.responseLines ?? [])) if (len(ln) > 26) E(`${id}: API response line "${ln}" > 26 chars`);
    if ((d.api.requestLines ?? []).length > 3) E(`${id}: API max 3 request lines`);
    if ((d.api.responseLines ?? []).length > 3) E(`${id}: API max 3 response lines`);
    checkColor(id, 'api.color', d.api.color);
  }
  if (d.logic) {
    const gs = d.logic.gates ?? [];
    if (gs.length < 1) E(`${id}: BOOLEAN_LOGIC_GATES needs ≥1 gate`);
    if (gs.length > 4) E(`${id}: BOOLEAN_LOGIC_GATES max 4 gates`);
    const GT = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'];
    for (const g of gs) {
      if (!GT.includes(g.type)) E(`${id}: BOOLEAN_LOGIC_GATES bad gate type "${g.type}"`);
      if (g.a != null && g.a !== 0 && g.a !== 1) E(`${id}: BOOLEAN_LOGIC_GATES input a must be 0 or 1`);
      if (g.b != null && g.b !== 0 && g.b !== 1) E(`${id}: BOOLEAN_LOGIC_GATES input b must be 0 or 1`);
      if (len(g.label) > 12) E(`${id}: BOOLEAN_LOGIC_GATES label "${g.label}" > 12 chars`);
    }
    checkColor(id, 'logic.color', d.logic.color);
  }
  if (d.hash) {
    if (len(d.hash.input) > 24) E(`${id}: HASH_FUNCTION input > 24 chars`);
    if (len(d.hash.algo) > 12) E(`${id}: HASH_FUNCTION algo > 12 chars`);
    if (len(d.hash.digest) > 72) E(`${id}: HASH_FUNCTION digest > 72 chars`);
    checkColor(id, 'hash.color', d.hash.color);
  }
  if (d.sort) {
    const vs = d.sort.values ?? [];
    if (vs.length < 3) E(`${id}: SORTING_VISUAL needs ≥3 values`);
    if (vs.length > 12) E(`${id}: SORTING_VISUAL max 12 values`);
    for (const v of vs) if (typeof v !== 'number') E(`${id}: SORTING_VISUAL values must be numbers`);
    if (len(d.sort.label) > 20) E(`${id}: SORTING_VISUAL label > 20 chars`);
    checkColor(id, 'sort.color', d.sort.color);
  }
  if (d.clock) {
    if (d.clock.cycles != null && (d.clock.cycles < 3 || d.clock.cycles > 8)) E(`${id}: CLOCK_SIGNAL cycles must be 3–8`);
    if (len(d.clock.label) > 20) E(`${id}: CLOCK_SIGNAL label > 20 chars`);
    checkColor(id, 'clock.color', d.clock.color);
  }
  if (d.gpuCluster) {
    const g = d.gpuCluster;
    if (g.nodes != null && (g.nodes < 2 || g.nodes > 8)) E(`${id}: GPU_CLUSTER nodes must be 2–8`);
    if (g.gpusPerNode != null && (g.gpusPerNode < 2 || g.gpusPerNode > 8)) E(`${id}: GPU_CLUSTER gpusPerNode must be 2–8`);
    if (len(g.interconnect) > 24) E(`${id}: GPU_CLUSTER interconnect > 24 chars`);
    if (len(g.totalLabel) > 28) E(`${id}: GPU_CLUSTER totalLabel > 28 chars`);
    checkColor(id, 'gpuCluster.color', g.color);
  }
  if (d.zoomScale) {
    const lv = d.zoomScale.levels ?? [];
    if (lv.length < 3) E(`${id}: ZOOM_SCALE needs ≥3 levels`);
    if (lv.length > 6) E(`${id}: ZOOM_SCALE max 6 levels`);
    for (const l of lv) {
      if (len(l.label) > 16) E(`${id}: ZOOM_SCALE level label "${l.label}" > 16 chars`);
      if (len(l.sub) > 18) E(`${id}: ZOOM_SCALE level sub "${l.sub}" > 18 chars`);
      if (len(l.scale) > 10) E(`${id}: ZOOM_SCALE level scale "${l.scale}" > 10 chars`);
      checkColor(id, 'zoomScale.level.color', l.color);
    }
    checkColor(id, 'zoomScale.color', d.zoomScale.color);
  }
  if (d.encryption) {
    if (len(d.encryption.plaintext) > 24) E(`${id}: ENCRYPTION plaintext > 24 chars`);
    if (len(d.encryption.ciphertext) > 40) E(`${id}: ENCRYPTION ciphertext > 40 chars`);
    if (len(d.encryption.keyLabel) > 20) E(`${id}: ENCRYPTION keyLabel > 20 chars`);
    if (d.encryption.mode && !['encrypt', 'decrypt'].includes(d.encryption.mode)) E(`${id}: ENCRYPTION mode must be encrypt/decrypt`);
    checkColor(id, 'encryption.color', d.encryption.color);
  }
  if (d.pointers) {
    const nds = d.pointers.nodes ?? [];
    if (nds.length < 2) E(`${id}: POINTER_DIAGRAM needs ≥2 nodes`);
    if (nds.length > 6) E(`${id}: POINTER_DIAGRAM max 6 nodes`);
    if (len(d.pointers.headLabel) > 12) E(`${id}: POINTER_DIAGRAM headLabel > 12 chars`);
    for (const nd of nds) {
      if (len(nd.value) > 8) E(`${id}: POINTER_DIAGRAM node value "${nd.value}" > 8 chars`);
      if (len(nd.label) > 10) E(`${id}: POINTER_DIAGRAM node label "${nd.label}" > 10 chars`);
      if (nd.next != null && (nd.next < 0 || nd.next >= nds.length)) E(`${id}: POINTER_DIAGRAM next index out of range`);
      checkColor(id, 'pointers.node.color', nd.color);
    }
    checkColor(id, 'pointers.color', d.pointers.color);
  }
  if (d.numberBase) {
    if (typeof d.numberBase.value !== 'number') E(`${id}: NUMBER_BASE needs a numeric value`);
    if (d.numberBase.value < 0 || d.numberBase.value > 65535) E(`${id}: NUMBER_BASE value must be 0–65535`);
    if (len(d.numberBase.label) > 24) E(`${id}: NUMBER_BASE label > 24 chars`);
    checkColor(id, 'numberBase.color', d.numberBase.color);
  }
  if (d.editor) {
    const norm = (s) => String(s ?? '').replace(/\t/g, '  ');
    const ls = d.editor.lines ?? [];
    if (ls.length < 1) E(`${id}: CODE_EDITOR needs ≥1 line`);
    if (ls.length > 10) E(`${id}: CODE_EDITOR max 10 lines (vertical budget)`);
    ls.forEach((l, i) => {
      if (norm(l).length > 38) E(`${id}: CODE_EDITOR line ${i + 1} > 38 chars (vertical budget, tabs=2sp)`);
    });
    if ((d.editor.tabs ?? []).length > 3) E(`${id}: CODE_EDITOR max 3 tabs`);
    for (const tb of (d.editor.tabs ?? [])) if (len(tb.name) > 22) E(`${id}: CODE_EDITOR tab "${tb.name}" > 22 chars`);
    if (len(d.editor.lang) > 12) E(`${id}: CODE_EDITOR lang > 12 chars`);
    if (d.editor.variant && !['editor', 'split'].includes(d.editor.variant)) E(`${id}: CODE_EDITOR variant must be editor/split`);
    if (d.editor.squiggle && len(d.editor.squiggle.message) > 44) E(`${id}: CODE_EDITOR squiggle message > 44 chars`);
    if (d.editor.highlight) {
      const {from, to} = d.editor.highlight;
      if (from < 1 || to < 1 || from > ls.length || to > ls.length) E(`${id}: CODE_EDITOR highlight out of line range`);
      checkColor(id, 'editor.highlight.color', d.editor.highlight.color);
    }
    if (d.editor.terminal) {
      if (len(d.editor.terminal.cmd) > 48) E(`${id}: CODE_EDITOR terminal cmd > 48 chars`);
      for (const o of (d.editor.terminal.output ?? [])) if (len(o) > 44) E(`${id}: CODE_EDITOR terminal output line > 44 chars`);
      if ((d.editor.terminal.output ?? []).length > 4) E(`${id}: CODE_EDITOR terminal max 4 output lines`);
    }
    checkColor(id, 'editor.color', d.editor.color);
  }
  if (d.terminal) {
    const cs = d.terminal.commands ?? [];
    if (cs.length < 1) E(`${id}: TERMINAL_SESSION needs ≥1 command`);
    if (cs.length > 3) E(`${id}: TERMINAL_SESSION max 3 commands`);
    if (len(d.terminal.promptLabel) > 20) E(`${id}: TERMINAL_SESSION promptLabel > 20 chars`);
    if (len(d.terminal.cwd) > 24) E(`${id}: TERMINAL_SESSION cwd > 24 chars`);
    for (const c of cs) {
      if (len(c.cmd) > 48) E(`${id}: TERMINAL_SESSION cmd "${c.cmd}" > 48 chars`);
      if ((c.output ?? []).length > 4) E(`${id}: TERMINAL_SESSION command has >4 output lines`);
      for (const o of (c.output ?? [])) if (len(o) > 52) E(`${id}: TERMINAL_SESSION output line > 52 chars`);
    }
    checkColor(id, 'terminal.color', d.terminal.color);
  }
  if (d.logs) {
    const ls = d.logs.lines ?? [];
    if (ls.length < 2) E(`${id}: LOG_STREAM needs ≥2 lines`);
    if (ls.length > 10) E(`${id}: LOG_STREAM max 10 lines`);
    if (len(d.logs.rate) > 12) E(`${id}: LOG_STREAM rate > 12 chars`);
    for (const l of ls) {
      if (l.level && !['debug', 'info', 'warn', 'error'].includes(l.level)) E(`${id}: LOG_STREAM bad level "${l.level}"`);
      if (len(l.tag) > 14) E(`${id}: LOG_STREAM tag "${l.tag}" > 14 chars`);
      if (len(l.text) > 44) E(`${id}: LOG_STREAM line text > 44 chars`);
    }
    checkColor(id, 'logs.color', d.logs.color);
  }
  if (d.diff) {
    const rs = d.diff.rows ?? [];
    if (rs.length < 2) E(`${id}: CODE_DIFF needs ≥2 rows`);
    if (rs.length > 12) E(`${id}: CODE_DIFF max 12 rows`);
    if (len(d.diff.fileName) > 28) E(`${id}: CODE_DIFF fileName > 28 chars`);
    for (const r of rs) {
      if (!['add', 'del', 'ctx'].includes(r.kind)) E(`${id}: CODE_DIFF bad row kind "${r.kind}"`);
      if (len(r.text) > 52) E(`${id}: CODE_DIFF row text > 52 chars`);
    }
    checkColor(id, 'diff.color', d.diff.color);
  }
  // ContentSlot per-kind budgets (shared by WINDOW_FRAME / AUTOMATION_RUN / DEVICE_FRAME)
  const checkSlot = (s) => {
    if (!s) return;
    if (!['text', 'form', 'cardGrid', 'skeleton', 'metric', 'empty', 'notification', 'clip'].includes(s.kind)) E(`${id}: ContentSlot bad kind "${s.kind}"`);
    if (s.kind === 'clip' && s.mediaKind && !['video', 'image'].includes(s.mediaKind)) E(`${id}: ContentSlot clip mediaKind must be video|image`);
    if (len(s.title) > 40) E(`${id}: slot title > 40 chars`);
    if (len(s.body) > 120) E(`${id}: slot body > 120 chars`);
    if (len(s.message) > 40) E(`${id}: slot empty message > 40 chars`);
    if (len(s.value) > 8) E(`${id}: slot metric value > 8 chars`);
    if (len(s.label) > 18) E(`${id}: slot metric label > 18 chars`);
    if (len(s.app) > 14) E(`${id}: slot notification app > 14 chars`);
    if (len(s.text) > 40) E(`${id}: slot notification text > 40 chars`);
    if ((s.fields ?? []).length > 4) E(`${id}: slot max 4 form fields`);
    for (const f of (s.fields ?? [])) if (len(f.label) > 14) E(`${id}: slot form field label "${f.label}" > 14 chars`);
    if ((s.cards ?? []).length > 6) E(`${id}: slot max 6 cards`);
    for (const c of (s.cards ?? [])) {
      if (len(c.title) > 16) E(`${id}: slot card title "${c.title}" > 16 chars`);
      if (len(c.sub) > 22) E(`${id}: slot card sub > 22 chars`);
    }
  };
  if (d.window) {
    if (d.window.variant && !['browser', 'mac', 'windows', 'linux'].includes(d.window.variant)) E(`${id}: WINDOW_FRAME variant must be browser/mac/windows/linux`);
    if (!d.window.content) E(`${id}: WINDOW_FRAME needs content (a ContentSlot)`);
    if (len(d.window.title) > 30) E(`${id}: WINDOW_FRAME title > 30 chars`);
    checkSlot(d.window.content);
    const dt = d.window.devtools;
    if (dt) {
      if (dt.panel && !['console', 'network'].includes(dt.panel)) E(`${id}: WINDOW_FRAME devtools panel must be console/network`);
      if ((dt.logs ?? []).length > 5) E(`${id}: WINDOW_FRAME devtools max 5 log lines`);
      for (const l of (dt.logs ?? [])) if (len(l.text) > 44) E(`${id}: devtools log line > 44 chars`);
      if ((dt.requests ?? []).length > 4) E(`${id}: WINDOW_FRAME devtools max 4 requests`);
    }
    checkColor(id, 'window.color', d.window.color);
  }
  if (d.auto) {
    const st = d.auto.steps ?? [];
    if (st.length < 1) E(`${id}: AUTOMATION_RUN needs ≥1 step`);
    if (st.length > 5) E(`${id}: AUTOMATION_RUN max 5 steps`);
    if (!d.auto.content) E(`${id}: AUTOMATION_RUN needs content (a ContentSlot)`);
    if (len(d.auto.runner) > 14) E(`${id}: AUTOMATION_RUN runner > 14 chars`);
    checkSlot(d.auto.content);
    for (const s of st) {
      if (!['click', 'type', 'hover', 'assert', 'goto'].includes(s.action)) E(`${id}: AUTOMATION_RUN bad action "${s.action}"`);
      if (len(s.target) > 22) E(`${id}: AUTOMATION_RUN step target "${s.target}" > 22 chars`);
      if (len(s.value) > 20) E(`${id}: AUTOMATION_RUN step value > 20 chars`);
      if (len(s.reason) > 40) E(`${id}: AUTOMATION_RUN step reason > 40 chars`);
    }
    checkColor(id, 'auto.color', d.auto.color);
  }
  if (d.dom) {
    const nds = d.dom.nodes ?? [];
    if (nds.length < 2) E(`${id}: DOM_INSPECT needs ≥2 nodes`);
    if (nds.length > 8) E(`${id}: DOM_INSPECT max 8 nodes`);
    if (len(d.dom.selector) > 40) E(`${id}: DOM_INSPECT selector > 40 chars`);
    for (const nd of nds) {
      if (len(nd.tag) > 12) E(`${id}: DOM_INSPECT tag "${nd.tag}" > 12 chars`);
      if (len(nd.attr) > 20) E(`${id}: DOM_INSPECT attr > 20 chars`);
      if (nd.depth == null || nd.depth < 0 || nd.depth > 5) E(`${id}: DOM_INSPECT node depth must be 0–5`);
    }
    checkColor(id, 'dom.color', d.dom.color);
  }
  if (d.waterfall) {
    const rq = d.waterfall.requests ?? [];
    if (rq.length < 2) E(`${id}: NETWORK_WATERFALL needs ≥2 requests`);
    if (rq.length > 6) E(`${id}: NETWORK_WATERFALL max 6 requests (4 render on vertical)`);
    for (const r of rq) {
      if (len(r.name) > 22) E(`${id}: NETWORK_WATERFALL request name "${r.name}" > 22 chars`);
      for (const p of (r.phases ?? [])) if (!['blocked', 'queue', 'dns', 'connect', 'ttfb', 'download'].includes(p.phase)) E(`${id}: NETWORK_WATERFALL bad phase "${p.phase}"`);
    }
    checkColor(id, 'waterfall.color', d.waterfall.color);
  }
  if (d.device) {
    if (d.device.os && !['ios', 'android'].includes(d.device.os)) E(`${id}: DEVICE_FRAME os must be ios/android`);
    if (!d.device.content) E(`${id}: DEVICE_FRAME needs content (a ContentSlot)`);
    checkSlot(d.device.content);
    if (d.device.notification) {
      if (len(d.device.notification.app) > 14) E(`${id}: DEVICE_FRAME notification app > 14 chars`);
      if (len(d.device.notification.text) > 40) E(`${id}: DEVICE_FRAME notification text > 40 chars`);
    }
    checkColor(id, 'device.color', d.device.color);
  }
  if (d.cloud) {
    const bs = d.cloud.boundaries ?? [];
    const ns = (d.cloud.nodes ?? []);
    if (ns.length < 1) E(`${id}: CLOUD_ARCH needs ≥1 node`);
    if (ns.length > 8) E(`${id}: CLOUD_ARCH max 8 nodes (6 render on vertical) — beyond that use DRILL_IN`);
    // nesting depth ≤3
    const depthOf = (bid, seen = new Set()) => {
      const b = bs.find((z) => z.id === bid);
      if (!b || !b.parent || seen.has(bid)) return 0;
      seen.add(bid);
      return 1 + depthOf(b.parent, seen);
    };
    for (const b of bs) {
      if (len(b.label) > 24) E(`${id}: CLOUD_ARCH boundary label "${b.label}" > 24 chars`);
      if (b.kind && !['region', 'vpc', 'subnet'].includes(b.kind)) E(`${id}: CLOUD_ARCH boundary kind must be region/vpc/subnet`);
      if (depthOf(b.id) > 2) E(`${id}: CLOUD_ARCH boundary "${b.label}" nests deeper than 3 (Region▸VPC▸Subnet)`);
    }
    for (const nd of ns) {
      if (len(nd.label) > 22) E(`${id}: CLOUD_ARCH node label "${nd.label}" > 22 chars`);
      if (len(nd.sub) > 30) E(`${id}: CLOUD_ARCH node sub > 30 chars (it middle-truncates, keep intent short)`);
    }
    for (const e of (d.cloud.edges ?? [])) { checkColor(id, 'cloud.edge', e.color); if (len(e.label) > 16) E(`${id}: CLOUD_ARCH edge label "${e.label}" > 16 chars`); }
    checkColor(id, 'cloud.color', d.cloud.color);
  }
  if (d.k8s) {
    if (d.k8s.mode && !['schedule', 'scale', 'selfheal', 'rollout'].includes(d.k8s.mode)) E(`${id}: K8S_CLUSTER mode must be schedule/scale/selfheal/rollout`);
    const nds = d.k8s.nodes ?? [];
    if (nds.length < 2) E(`${id}: K8S_CLUSTER needs ≥2 worker nodes`);
    if (nds.length > 4) E(`${id}: K8S_CLUSTER max 4 worker nodes`);
    if (len(d.k8s.controlPlane) > 22) E(`${id}: K8S_CLUSTER controlPlane > 22 chars`);
    for (const nn of nds) {
      if (len(nn.label) > 20) E(`${id}: K8S_CLUSTER node label "${nn.label}" > 20 chars`);
      if ((nn.pods ?? []).length > 6) E(`${id}: K8S_CLUSTER max 6 pods per node`);
    }
    checkColor(id, 'k8s.color', d.k8s.color);
  }
  if (d.cost) {
    if (d.cost.value == null || d.cost.budget == null) E(`${id}: COST_METER needs value and budget`);
    if (len(d.cost.unit) > 4) E(`${id}: COST_METER unit > 4 chars`);
    if (len(d.cost.period) > 18) E(`${id}: COST_METER period > 18 chars`);
    checkColor(id, 'cost.color', d.cost.color);
  }
  if (d.slo) {
    if (d.slo.availability == null) E(`${id}: SLO_GAUGE needs availability`);
    if (d.slo.availability != null && (d.slo.availability < 0 || d.slo.availability > 100)) E(`${id}: SLO_GAUGE availability must be 0–100`);
    if (d.slo.budgetSpent != null && (d.slo.budgetSpent < 0 || d.slo.budgetSpent > 1)) E(`${id}: SLO_GAUGE budgetSpent must be 0–1`);
    if (len(d.slo.period) > 20) E(`${id}: SLO_GAUGE period > 20 chars`);
    checkColor(id, 'slo.color', d.slo.color);
  }
  if (d.iac) {
    const rs = d.iac.rows ?? [];
    if (rs.length < 2) E(`${id}: IAC_PLAN needs ≥2 rows`);
    if (rs.length > 7) E(`${id}: IAC_PLAN max 7 rows (5 render on vertical)`);
    for (const r of rs) {
      if (!['add', 'change', 'destroy', 'noop'].includes(r.action)) E(`${id}: IAC_PLAN bad action "${r.action}"`);
      if (len(r.resource) > 44) E(`${id}: IAC_PLAN resource "${r.resource}" > 44 chars (it middle-truncates)`);
      if (len(r.type) > 22) E(`${id}: IAC_PLAN row type > 22 chars`);
    }
    checkColor(id, 'iac.color', d.iac.color);
  }
  if (d.erd) {
    const tbs = d.erd.tables ?? [];
    if (tbs.length < 1) E(`${id}: ERD needs ≥1 table`);
    if (tbs.length > 4) E(`${id}: ERD max 4 tables (3 render on vertical)`);
    for (const tb of tbs) {
      if (len(tb.name) > 18) E(`${id}: ERD table name "${tb.name}" > 18 chars`);
      if ((tb.columns ?? []).length > 6) E(`${id}: ERD table "${tb.name}" max 6 columns`);
      for (const col of (tb.columns ?? [])) {
        if (len(col.name) > 18) E(`${id}: ERD column "${col.name}" > 18 chars`);
        if (len(col.type) > 12) E(`${id}: ERD column type > 12 chars`);
        if (col.key && !['pk', 'fk'].includes(col.key)) E(`${id}: ERD column key must be pk/fk`);
      }
    }
    for (const rel of (d.erd.relations ?? [])) {
      if (len(rel.label) > 16) E(`${id}: ERD relation label "${rel.label}" > 16 chars`);
      if (rel.fromCard && !['1', 'N'].includes(rel.fromCard)) E(`${id}: ERD relation fromCard must be 1/N`);
      if (rel.toCard && !['1', 'N'].includes(rel.toCard)) E(`${id}: ERD relation toCard must be 1/N`);
    }
    checkColor(id, 'erd.color', d.erd.color);
  }
  if (d.proc) {
    const rs = d.proc.rows ?? [];
    if (rs.length < 2) E(`${id}: PROCESS_TABLE needs ≥2 rows`);
    if (rs.length > 7) E(`${id}: PROCESS_TABLE max 7 rows (5 render on vertical)`);
    if (d.proc.sortBy && !['cpu', 'mem', 'pid'].includes(d.proc.sortBy)) E(`${id}: PROCESS_TABLE sortBy must be cpu/mem/pid`);
    for (const r of rs) {
      if (len(r.pid) > 8) E(`${id}: PROCESS_TABLE pid > 8 chars`);
      if (len(r.name) > 28) E(`${id}: PROCESS_TABLE process name "${r.name}" > 28 chars`);
      if (r.cpu == null || r.cpu < 0 || r.cpu > 100) E(`${id}: PROCESS_TABLE cpu must be 0–100`);
      if (r.mem == null || r.mem < 0 || r.mem > 100) E(`${id}: PROCESS_TABLE mem must be 0–100`);
    }
    checkColor(id, 'proc.color', d.proc.color);
  }
  if (d.kernel) {
    if (len(d.kernel.userLabel) > 20) E(`${id}: KERNEL_BOUNDARY userLabel > 20 chars`);
    if (len(d.kernel.kernelLabel) > 20) E(`${id}: KERNEL_BOUNDARY kernelLabel > 20 chars`);
    if (len(d.kernel.syscall) > 18) E(`${id}: KERNEL_BOUNDARY syscall > 18 chars`);
    if (len(d.kernel.result) > 18) E(`${id}: KERNEL_BOUNDARY result > 18 chars`);
    if ((d.kernel.steps ?? []).length > 4) E(`${id}: KERNEL_BOUNDARY max 4 kernel steps`);
    for (const s2 of (d.kernel.steps ?? [])) if (len(s2.label) > 20) E(`${id}: KERNEL_BOUNDARY step label "${s2.label}" > 20 chars`);
    if ((d.kernel.userChips ?? []).length > 3) E(`${id}: KERNEL_BOUNDARY max 3 user chips`);
    for (const uc of (d.kernel.userChips ?? [])) if (len(uc) > 20) E(`${id}: KERNEL_BOUNDARY user chip "${uc}" > 20 chars`);
    checkColor(id, 'kernel.color', d.kernel.color);
  }
  if (d.bits && d.bits.variant === 'permissions') {
    if (d.bits.perms && !/^[rwx-]{9}$/.test(d.bits.perms)) E(`${id}: PERMISSION_BITS perms must be 9 chars of r/w/x/-`);
    if (len(d.bits.path) > 60) E(`${id}: PERMISSION_BITS path > 60 chars (it middle-truncates)`);
  }
  if (d.testRunner) {
    const nds = d.testRunner.nodes ?? [];
    if (nds.length < 2) E(`${id}: TEST_RUNNER needs ≥2 nodes`);
    if (nds.length > 8) E(`${id}: TEST_RUNNER max 8 nodes`);
    for (const nd of nds) {
      if (len(nd.name) > 40) E(`${id}: TEST_RUNNER node name "${nd.name}" > 40 chars`);
      if (nd.status && !['pass', 'fail', 'skip', 'run'].includes(nd.status)) E(`${id}: TEST_RUNNER bad status "${nd.status}"`);
      if (nd.depth == null || nd.depth < 0 || nd.depth > 3) E(`${id}: TEST_RUNNER node depth must be 0–3`);
    }
    if (len(d.testRunner.expected) > 44) E(`${id}: TEST_RUNNER expected > 44 chars`);
    if (len(d.testRunner.actual) > 44) E(`${id}: TEST_RUNNER actual > 44 chars`);
    checkColor(id, 'testRunner.color', d.testRunner.color);
  }
  if (d.testMatrix) {
    const rr = d.testMatrix.rows ?? [];
    const cc = d.testMatrix.cols ?? [];
    if (rr.length < 2 || cc.length < 2) E(`${id}: TEST_MATRIX needs ≥2 rows and ≥2 cols`);
    if (rr.length > 5 || cc.length > 5) E(`${id}: TEST_MATRIX max 5×5`);
    for (const r of rr) if (len(r) > 14) E(`${id}: TEST_MATRIX row label "${r}" > 14 chars`);
    for (const c of cc) if (len(c) > 10) E(`${id}: TEST_MATRIX col label "${c}" > 10 chars`);
    for (const cell of (d.testMatrix.cells ?? [])) if (!['pass', 'fail', 'skip', 'flaky'].includes(cell.status)) E(`${id}: TEST_MATRIX bad cell status "${cell.status}"`);
    checkColor(id, 'testMatrix.color', d.testMatrix.color);
  }
  if (d.context) {
    const sg = d.context.segments ?? [];
    if (sg.length < 2) E(`${id}: CONTEXT_METER needs ≥2 segments`);
    if (sg.length > 5) E(`${id}: CONTEXT_METER max 5 segments`);
    for (const s of sg) {
      if (!['system', 'tools', 'history', 'free'].includes(s.kind)) E(`${id}: CONTEXT_METER segment kind must be system/tools/history/free`);
      if (len(s.label) > 16) E(`${id}: CONTEXT_METER segment label "${s.label}" > 16 chars`);
      if (typeof s.tokens !== 'number') E(`${id}: CONTEXT_METER segment needs numeric tokens`);
    }
    if (len(d.context.verdict) > 44) E(`${id}: CONTEXT_METER verdict > 44 chars`);
  }
  if (d.harness) {
    const rg = d.harness.rings ?? [];
    if (rg.length < 2) E(`${id}: AGENT_HARNESS needs ≥2 rings`);
    if (rg.length > 3) E(`${id}: AGENT_HARNESS max 3 rings`);
    if (len(d.harness.agent) > 16) E(`${id}: AGENT_HARNESS agent label > 16 chars`);
    for (const r of rg) {
      if (len(r.label) > 16) E(`${id}: AGENT_HARNESS ring label "${r.label}" > 16 chars`);
      if ((r.chips ?? []).length > 2) E(`${id}: AGENT_HARNESS max 2 chips per ring (3 concentric rings × 3 chips over-packs the lower arc — proven in the Program-3 matrix; ships as a legend-ladder enhancement, Program 4)`);
      for (const ch of (r.chips ?? [])) if (len(ch) > 16) E(`${id}: AGENT_HARNESS chip "${ch}" > 16 chars`);
    }
    if (d.harness.guardrail && len(d.harness.guardrail.label) > 18) E(`${id}: AGENT_HARNESS guardrail label > 18 chars`);
    if (d.harness.guardrail && len(d.harness.guardrail.reason) > 24) E(`${id}: AGENT_HARNESS guardrail reason > 24 chars`);
    checkColor(id, 'harness.color', d.harness.color);
  }
  if (d.kg) {
    const nn = d.kg.nodes ?? [];
    if (nn.length < 2) E(`${id}: KNOWLEDGE_GRAPH needs ≥2 nodes`);
    if (nn.length > 10) E(`${id}: KNOWLEDGE_GRAPH max 10 nodes (7 render on vertical)`);
    if ((d.kg.edges ?? []).length > 12) E(`${id}: KNOWLEDGE_GRAPH max 12 edges`);
    for (const nd of nn) {
      if (len(nd.label) > 18) E(`${id}: KNOWLEDGE_GRAPH node label "${nd.label}" > 18 chars`);
      if (nd.kind && !['entity', 'class', 'literal'].includes(nd.kind)) E(`${id}: KNOWLEDGE_GRAPH node kind must be entity/class/literal`);
    }
    for (const e of (d.kg.edges ?? [])) if (len(e.label) > 16) E(`${id}: KNOWLEDGE_GRAPH edge label "${e.label}" > 16 chars`);
    checkColor(id, 'kg.color', d.kg.color);
  }
  if (d.retrieval) {
    const ck = d.retrieval.chunks ?? [];
    if (ck.length < 2) E(`${id}: RETRIEVAL_RANK needs ≥2 chunks`);
    if (ck.length > 6) E(`${id}: RETRIEVAL_RANK max 6 chunks`);
    for (const c of ck) {
      if (len(c.label) > 40) E(`${id}: RETRIEVAL_RANK chunk label "${c.label}" > 40 chars`);
      if (c.scoreA == null || c.scoreFinal == null) E(`${id}: RETRIEVAL_RANK chunk needs scoreA and scoreFinal`);
    }
    checkColor(id, 'retrieval.color', d.retrieval.color);
  }
  if (d.modelStages) {
    const sg = d.modelStages.stages ?? [];
    if (sg.length < 2) E(`${id}: MODEL_STAGES needs ≥2 stages`);
    if (sg.length > 4) E(`${id}: MODEL_STAGES max 4 stages`);
    if (len(d.modelStages.prompt) > 60) E(`${id}: MODEL_STAGES prompt > 60 chars`);
    for (const s of sg) {
      if (len(s.label) > 16) E(`${id}: MODEL_STAGES stage label "${s.label}" > 16 chars`);
      if (len(s.method) > 12) E(`${id}: MODEL_STAGES method > 12 chars`);
      if (len(s.reply) > 40) E(`${id}: MODEL_STAGES reply "${s.reply}" > 40 chars (keep replies short + contrasting)`);
    }
    checkColor(id, 'modelStages.color', d.modelStages.color);
  }
  if (d.confidence) {
    if (d.confidence.value == null || d.confidence.threshold == null) E(`${id}: CONFIDENCE_GATE needs value and threshold`);
    if (d.confidence.mode && !['pass', 'block'].includes(d.confidence.mode)) E(`${id}: CONFIDENCE_GATE mode must be pass/block`);
    if (d.confidence.style && !['gauge', 'linear'].includes(d.confidence.style)) E(`${id}: CONFIDENCE_GATE style must be gauge/linear`);
    if (len(d.confidence.reason) > 30) E(`${id}: CONFIDENCE_GATE reason > 30 chars`);
    checkColor(id, 'confidence.color', d.confidence.color);
  }
  if (d.sandbox) {
    if (len(d.sandbox.label) > 20) E(`${id}: SANDBOX_BOX label > 20 chars`);
    const total = (d.sandbox.allowed ?? []).length + (d.sandbox.blocked ?? []).length;
    if (total < 2) E(`${id}: SANDBOX_BOX needs ≥2 chips`);
    if (total > 6) E(`${id}: SANDBOX_BOX max 6 chips`);
    for (const c of [...(d.sandbox.allowed ?? []), ...(d.sandbox.blocked ?? [])]) if (len(c) > 18) E(`${id}: SANDBOX_BOX chip "${c}" > 18 chars`);
    checkColor(id, 'sandbox.color', d.sandbox.color);
  }
  if (d.drillIn) {
    if (!d.drillIn.overview || !d.drillIn.detail) E(`${id}: DRILL_IN needs overview and detail diagrams`);
    if ((d.drillIn.overview?.nodes ?? []).length > 8) E(`${id}: DRILL_IN overview must be ≤8 nodes (a legal diagram in its own right)`);
    if (!d.drillIn.focusId) E(`${id}: DRILL_IN needs a focusId`);
  }
  if (d.evalDash) {
    const ms = d.evalDash.metrics ?? [];
    if (ms.length < 2) E(`${id}: EVAL_DASHBOARD needs ≥2 metrics`);
    if (ms.length > 4) E(`${id}: EVAL_DASHBOARD max 4 metrics`);
    let deg = 0;
    for (const m of ms) {
      if (len(m.label) > 18) E(`${id}: EVAL_DASHBOARD metric label "${m.label}" > 18 chars`);
      if (m.value == null) E(`${id}: EVAL_DASHBOARD metric needs a value`);
      if (m.degrading) deg++;
    }
    if (deg > 1) E(`${id}: EVAL_DASHBOARD — only ONE metric may be degrading (the single pulse)`);
  }
  if (d.videoHero) {
    const v = d.videoHero;
    if (v.headline && len(v.headline) > 60) E(`${id}: VIDEO_HERO headline "${v.headline}" > 60 chars (band discipline)`);
    if (v.kicker && len(v.kicker) > 20) E(`${id}: VIDEO_HERO kicker "${v.kicker}" > 20 chars`);
    if (v.sub && len(v.sub) > 90) E(`${id}: VIDEO_HERO sub "${v.sub}" > 90 chars`);
    if (v.treatment && !['clean', 'scrim', 'focus'].includes(v.treatment)) E(`${id}: VIDEO_HERO treatment must be clean|scrim|focus`);
  }
  if (d.videoSpotlight) {
    const v = d.videoSpotlight;
    if (v.name && len(v.name) > 40) E(`${id}: VIDEO_SPOTLIGHT name "${v.name}" > 40 chars`);
    if (v.role && len(v.role) > 60) E(`${id}: VIDEO_SPOTLIGHT role "${v.role}" > 60 chars`);
    if (v.kicker && len(v.kicker) > 20) E(`${id}: VIDEO_SPOTLIGHT kicker "${v.kicker}" > 20 chars`);
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: VIDEO_SPOTLIGHT kind must be video|image`);
  }
  if (d.mediaCallout) {
    const v = d.mediaCallout;
    const cs = v.callouts ?? [];
    if (cs.length < 1) E(`${id}: MEDIA_CALLOUT needs ≥1 callout`);
    if (cs.length > 5) E(`${id}: MEDIA_CALLOUT max 5 callouts`);
    if (v.headline && len(v.headline) > 48) E(`${id}: MEDIA_CALLOUT headline "${v.headline}" > 48 chars`);
    for (const c of cs) {
      if (len(c.label) > 32) E(`${id}: MEDIA_CALLOUT label "${c.label}" > 32 chars`);
      if (c.x == null || c.y == null) E(`${id}: MEDIA_CALLOUT callout needs x and y (0..1)`);
      if (c.x < 0 || c.x > 1 || c.y < 0 || c.y > 1) E(`${id}: MEDIA_CALLOUT x/y must be 0..1`);
      if (c.side && !['left', 'right', 'up', 'down'].includes(c.side)) E(`${id}: MEDIA_CALLOUT side must be left|right|up|down`);
    }
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: MEDIA_CALLOUT kind must be video|image`);
  }
  if (d.mediaCompare) {
    const v = d.mediaCompare;
    if (!v.a || !v.b) E(`${id}: MEDIA_COMPARE needs both a and b sides`);
    if (v.mode && !['split', 'wipe'].includes(v.mode)) E(`${id}: MEDIA_COMPARE mode must be split|wipe`);
    if (v.headline && len(v.headline) > 48) E(`${id}: MEDIA_COMPARE headline "${v.headline}" > 48 chars`);
    for (const side of [v.a, v.b]) {
      if (!side) continue;
      if (!side.label) E(`${id}: MEDIA_COMPARE side needs a label`);
      if (len(side.label) > 22) E(`${id}: MEDIA_COMPARE label "${side.label}" > 22 chars`);
      if (side.caption && len(side.caption) > 60) E(`${id}: MEDIA_COMPARE caption "${side.caption}" > 60 chars`);
      if (side.kind && !['video', 'image'].includes(side.kind)) E(`${id}: MEDIA_COMPARE side kind must be video|image`);
    }
  }
  if (d.mediaStat) {
    const v = d.mediaStat;
    const ss = v.stats ?? [];
    if (ss.length < 1) E(`${id}: MEDIA_STAT_OVERLAY needs ≥1 stat`);
    if (ss.length > 3) E(`${id}: MEDIA_STAT_OVERLAY max 3 stats`);
    if (v.headline && len(v.headline) > 48) E(`${id}: MEDIA_STAT_OVERLAY headline "${v.headline}" > 48 chars`);
    for (const s of ss) {
      if (s.value == null) E(`${id}: MEDIA_STAT_OVERLAY stat needs a value`);
      if (!s.label) E(`${id}: MEDIA_STAT_OVERLAY stat needs a label`);
      if (len(s.label) > 20) E(`${id}: MEDIA_STAT_OVERLAY label "${s.label}" > 20 chars`);
      if (s.suffix && len(s.suffix) > 6) E(`${id}: MEDIA_STAT_OVERLAY suffix "${s.suffix}" > 6 chars`);
      if (s.prefix && len(s.prefix) > 3) E(`${id}: MEDIA_STAT_OVERLAY prefix "${s.prefix}" > 3 chars`);
    }
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: MEDIA_STAT_OVERLAY kind must be video|image`);
  }
  if (d.screenshotCascade) {
    const v = d.screenshotCascade;
    const ss = v.shots ?? [];
    if (ss.length < 2) E(`${id}: SCREENSHOT_CASCADE needs ≥2 shots`);
    if (ss.length > 4) E(`${id}: SCREENSHOT_CASCADE max 4 shots`);
    if (v.headline && len(v.headline) > 48) E(`${id}: SCREENSHOT_CASCADE headline "${v.headline}" > 48 chars`);
    for (const s of ss) {
      if (s.label && len(s.label) > 40) E(`${id}: SCREENSHOT_CASCADE label "${s.label}" > 40 chars`);
      if (s.kind && !['video', 'image'].includes(s.kind)) E(`${id}: SCREENSHOT_CASCADE shot kind must be video|image`);
    }
  }
  if (d.floatingQuote) {
    const v = d.floatingQuote;
    if (!v.quote) E(`${id}: FLOATING_QUOTE_PILL needs a quote`);
    if (len(v.quote) > 140) E(`${id}: FLOATING_QUOTE_PILL quote "${v.quote}" > 140 chars`);
    if (v.attribution && len(v.attribution) > 40) E(`${id}: FLOATING_QUOTE_PILL attribution > 40 chars`);
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: FLOATING_QUOTE_PILL kind must be video|image`);
  }
  if (d.splitDefs) {
    const v = d.splitDefs;
    if (!v.left || !v.right) E(`${id}: OVERLAY_SPLIT_DEFINITIONS needs both left and right`);
    for (const col of [v.left, v.right]) {
      if (!col) continue;
      if (!col.header) E(`${id}: OVERLAY_SPLIT_DEFINITIONS column needs a header`);
      if (len(col.header) > 24) E(`${id}: OVERLAY_SPLIT_DEFINITIONS header "${col.header}" > 24 chars`);
      if (len(col.body) > 90) E(`${id}: OVERLAY_SPLIT_DEFINITIONS body "${col.body}" > 90 chars`);
    }
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: OVERLAY_SPLIT_DEFINITIONS kind must be video|image`);
  }
  if (d.cycleLoop) {
    const v = d.cycleLoop;
    const ns = v.nodes ?? [];
    if (ns.length < 3) E(`${id}: CYCLE_LOOP needs ≥3 nodes`);
    if (ns.length > 5) E(`${id}: CYCLE_LOOP max 5 nodes`);
    if (v.headline && len(v.headline) > 44) E(`${id}: CYCLE_LOOP headline "${v.headline}" > 44 chars`);
    for (const nd of ns) {
      if (!nd.label) E(`${id}: CYCLE_LOOP node needs a label`);
      if (len(nd.label) > 20) E(`${id}: CYCLE_LOOP label "${nd.label}" > 20 chars`);
      if (nd.sub && len(nd.sub) > 18) E(`${id}: CYCLE_LOOP sub "${nd.sub}" > 18 chars`);
    }
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: CYCLE_LOOP kind must be video|image`);
  }
  if (d.stepStack) {
    const v = d.stepStack;
    const ss = v.steps ?? [];
    if (ss.length < 3) E(`${id}: STEP_STACK_OVERLAY needs ≥3 steps`);
    if (ss.length > 5) E(`${id}: STEP_STACK_OVERLAY max 5 steps`);
    if (v.headline && len(v.headline) > 40) E(`${id}: STEP_STACK_OVERLAY headline "${v.headline}" > 40 chars`);
    if (v.chip && !['filled', 'ring'].includes(v.chip)) E(`${id}: STEP_STACK_OVERLAY chip must be filled|ring`);
    if (v.dock && !['left', 'right'].includes(v.dock)) E(`${id}: STEP_STACK_OVERLAY dock must be left|right`);
    for (const s of ss) {
      if (!s.label) E(`${id}: STEP_STACK_OVERLAY step needs a label`);
      if (len(s.label) > 28) E(`${id}: STEP_STACK_OVERLAY label "${s.label}" > 28 chars`);
      if (s.sub && len(s.sub) > 20) E(`${id}: STEP_STACK_OVERLAY sub "${s.sub}" > 20 chars`);
    }
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: STEP_STACK_OVERLAY kind must be video|image`);
  }
  if (d.titleBanner) {
    const v = d.titleBanner;
    if (!v.title) E(`${id}: TITLE_BANNER_FOCUS needs a title`);
    if (len(v.title) > 48) E(`${id}: TITLE_BANNER_FOCUS title "${v.title}" > 48 chars`);
    if (v.subtitle && len(v.subtitle) > 70) E(`${id}: TITLE_BANNER_FOCUS subtitle "${v.subtitle}" > 70 chars`);
    if (v.kicker && len(v.kicker) > 20) E(`${id}: TITLE_BANNER_FOCUS kicker "${v.kicker}" > 20 chars`);
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: TITLE_BANNER_FOCUS kind must be video|image`);
  }
  if (d.subChip) {
    const c = d.subChip;
    // census tracks CHANNEL_CARD's chip variant via this canonical message:
    if (c.variant && !['card', 'chip'].includes(c.variant)) E(`${id}: CHANNEL_CARD variant must be card/chip`);
    if (c.name && len(c.name) > 30) E(`${id}: SUBSCRIBE_CHIP name "${c.name}" > 30 chars`);
    if (c.handle && len(c.handle) > 24) E(`${id}: SUBSCRIBE_CHIP handle "${c.handle}" > 24 chars`);
    if (c.buttonLabel && len(c.buttonLabel) > 16) E(`${id}: SUBSCRIBE_CHIP buttonLabel "${c.buttonLabel}" > 16 chars`);
    if (c.kind && !['video', 'image'].includes(c.kind)) E(`${id}: SUBSCRIBE_CHIP kind must be video|image`);
  }
  if (d.talkingPoints) {
    const v = d.talkingPoints;
    const ps = v.points ?? [];
    if (ps.length < 2) E(`${id}: TALKING_POINTS needs ≥2 points`);
    if (ps.length > 5) E(`${id}: TALKING_POINTS max 5 points`);
    if (v.headline && len(v.headline) > 44) E(`${id}: TALKING_POINTS headline "${v.headline}" > 44 chars`);
    if (v.lead && len(v.lead) > 70) E(`${id}: TALKING_POINTS lead "${v.lead}" > 70 chars`);
    if (v.media && !['left', 'right'].includes(v.media)) E(`${id}: TALKING_POINTS media must be left|right`);
    for (const p of ps) {
      if (!p.text) E(`${id}: TALKING_POINTS point needs text`);
      if (len(p.text) > 56) E(`${id}: TALKING_POINTS point "${p.text}" > 56 chars`);
    }
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: TALKING_POINTS kind must be video|image`);
  }
  if (d.slideBullets) {
    const v = d.slideBullets;
    const bs = v.bullets ?? [];
    if (!v.heading) E(`${id}: SLIDE_BULLETS_PIP needs a heading`);
    if (len(v.heading) > 44) E(`${id}: SLIDE_BULLETS_PIP heading "${v.heading}" > 44 chars`);
    if (bs.length < 2) E(`${id}: SLIDE_BULLETS_PIP needs ≥2 bullets`);
    if (bs.length > 6) E(`${id}: SLIDE_BULLETS_PIP max 6 bullets`);
    for (const b of bs) {
      if (!b.text) E(`${id}: SLIDE_BULLETS_PIP bullet needs text`);
      if (len(b.text) > 64) E(`${id}: SLIDE_BULLETS_PIP bullet "${b.text}" > 64 chars`);
      if (b.level != null && (b.level < 0 || b.level > 1)) E(`${id}: SLIDE_BULLETS_PIP level must be 0 or 1`);
    }
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: SLIDE_BULLETS_PIP kind must be video|image`);
  }
  if (d.captionKinetic) {
    const v = d.captionKinetic;
    if (!v.caption) E(`${id}: CAPTION_KINETIC_OVERLAY needs a caption`);
    if (len((v.caption || '').replace(/[[\]]/g, '')) > 90) E(`${id}: CAPTION_KINETIC_OVERLAY caption > 90 chars`);
    if (v.position && !['bottom', 'center'].includes(v.position)) E(`${id}: CAPTION_KINETIC_OVERLAY position must be bottom|center`);
    if (v.kind && !['video', 'image'].includes(v.kind)) E(`${id}: CAPTION_KINETIC_OVERLAY kind must be video|image`);
  }
  if (d.photoTimeline) {
    const v = d.photoTimeline;
    const es = v.entries ?? [];
    if (es.length < 2) E(`${id}: PHOTO_TIMELINE needs ≥2 entries`);
    if (es.length > 5) E(`${id}: PHOTO_TIMELINE max 5 entries`);
    if (v.headline && len(v.headline) > 44) E(`${id}: PHOTO_TIMELINE headline "${v.headline}" > 44 chars`);
    for (const e of es) {
      if (!e.label) E(`${id}: PHOTO_TIMELINE entry needs a label`);
      if (len(e.label) > 24) E(`${id}: PHOTO_TIMELINE label "${e.label}" > 24 chars`);
      if (e.date && len(e.date) > 16) E(`${id}: PHOTO_TIMELINE date "${e.date}" > 16 chars`);
      if (e.kind && !['video', 'image'].includes(e.kind)) E(`${id}: PHOTO_TIMELINE entry kind must be video|image`);
    }
  }
}

// ── si: BRAND-SLUG VALIDATION (Phase 5, mechanism 2) ──────────────────────
// Validate every si:<slug> against the LOCAL simple-icons catalog. A typo gets
// a fuzzy correction; a slug with no brand at all is told to use a lucide glyph
// or a real logo. No network — the catalog ships in node_modules.
const collectSiAssets = (obj, out = []) => {
  if (typeof obj === 'string') {
    if (obj.startsWith('si:')) out.push(obj.slice(3));
  } else if (obj && typeof obj === 'object') {
    for (const v of Object.values(obj)) collectSiAssets(v, out);
  }
  return out;
};
const _siSlugs = [...new Set(collectSiAssets(spec))];
if (_siSlugs.length) {
  for (const slug of _siSlugs) {
    const r = await resolveSi('si:' + slug);
    if (r.ok) continue;
    if (r.kind === 'corrected')
      E(`asset "si:${slug}" is not a simple-icons slug — did you mean "si:${r.suggestion}"?`);
    else
      E(`asset "si:${slug}" is not a known brand in simple-icons — use a valid si: slug, a lucide: glyph, or a real logo (img:/needed:)`);
  }
}

// ---- report ----
const rel = file;
if (warns.length) {
  console.log(`\n⚠ WARNINGS (${warns.length}) — ${rel}`);
  for (const w of warns) console.log('  • ' + w);
}
if (errors.length) {
  console.log(`\n✗ REJECTED (${errors.length} errors) — ${rel}`);
  for (const e of errors) console.log('  • ' + e);
  console.log('\nFix the spec and lint again. Nothing renders until this passes.\n');
  process.exit(1);
}
console.log(`\n✓ PASSED — ${rel} (${spec.scenes.length} scenes${warns.length ? `, ${warns.length} warnings` : ''})\n`);
