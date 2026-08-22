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
// brand.logo drives the watermark, the thumbnail/cover stamp and the OUTRO_CTA
// subscribe circle. It is silent when absent — the video simply renders unbranded —
// so nothing caught the console flow dropping it. Warn, don't error: a spec may
// legitimately be authored before the asset lands in public/assets.
if (!spec.brand?.logo) W('brand.logo missing — the video will render with NO watermark, and the thumbnail/cover get no logo stamp. Set e.g. "img:channel_logo.png".');
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
  // NARROW EXEMPTION (2026-08-19): a `dojo` episode teaches ONE thing, and its trace
  // component is a single continuous machine the viewer tracks from the first line to
  // the last — as is the six-step ladder in a framework episode, or the signal table
  // that the whole series is built around — the array, the pointers and the variables must persist or the
  // viewer is re-orienting every beat. Recurring there is the DESIGN, and it is the
  // opposite of the defect this cap was written for (a generic card standing in for
  // several different ideas). Everything else stays capped, and PALETTE TOO NARROW
  // above still applies, so an episode cannot collapse into one component.
  const traceExempt = spec.meta?.screenplay === 'dojo';
  for (const [st, c] of Object.entries(counts)) {
    if (traceExempt && /^DSA_(TRACE_|FRAMEWORK|SIGNALS)/.test(st)) continue;
    if (c > cap) E(`OVER-RELIANCE: sub-type ${st} used ${c}× (>~${cap} for ${n} scenes) — swap some for other component types.`);
  }
  const DYNAMIC = ['UV_STAGE', 'MCP_MESH', 'MCP_REACH', 'MCP_DEPRECATED', 'MCP_ELICIT', 'MCP_TERMINAL', 'MCP_FLAGS', 'MCP_TRANSPORT', 'MCP_PROGRESS', 'MCP_ROOTS', 'MCP_SAMPLING', 'MCP_MENTION', 'MCP_URI', 'MCP_LOOP', 'MCP_SCHEMA', 'MCP_WIRE', 'MCP_CONTROL', 'MCP_API_ANATOMY', 'DSA_FRAMEWORK', 'DSA_COST', 'DSA_SIGNALS', 'DSA_TRACE_LIST', 'DSA_TRACE_INTERVALS', 'DSA_TRACE_DP', 'DSA_TRACE_TREE', 'DSA_TRACE_GRID', 'DSA_TRACE_STACK', 'DSA_TRACE_HASH', 'DSA_TRACE_BSEARCH', 'DSA_TRACE_WINDOW', 'DSA_TRACE_PTRS', 'CMD_LSUSB', 'CMD_LSPCI', 'CMD_CHEAT', 'CMD_TLDR', 'CMD_APROPOS', 'CMD_MAN', 'CMD_DMESG', 'CMD_JOURNALCTL', 'CMD_SYSTEMCTL', 'CMD_TMUX', 'CMD_SCREEN', 'CMD_HISTORY', 'CMD_ENV', 'CMD_ALIAS', 'CMD_BASHSCRIPT', 'CMD_CRONTAB', 'CMD_CRON', 'CMD_ZIP', 'CMD_BZIP2', 'CMD_GZIP', 'CMD_TAR', 'CMD_CURL', 'CMD_WGET', 'CMD_NC', 'CMD_RSYNC', 'CMD_SCP', 'CMD_SSH', 'CMD_WHOIS', 'CMD_NSLOOKUP', 'CMD_HOST', 'CMD_DIG', 'CMD_NLOAD', 'CMD_NETHOGS', 'CMD_IFTOP', 'CMD_NMCLI', 'CMD_SS', 'CMD_NETSTAT', 'CMD_MTR', 'CMD_TRACEROUTE', 'CMD_PING', 'CMD_IP', 'CMD_DD', 'CMD_UMOUNT', 'CMD_MOUNT', 'CMD_FSCK', 'CMD_MKFS', 'CMD_BLKID', 'CMD_PARTED', 'CMD_FDISK', 'CMD_NCDU', 'CMD_DU', 'CMD_DF', 'CMD_WATCH', 'CMD_SAR', 'CMD_DSTAT', 'CMD_IOTOP', 'CMD_IOSTAT', 'CMD_VMSTAT', 'CMD_FREE', 'CMD_UPTIME', 'CMD_STRACE', 'CMD_LSOF', 'CMD_WAIT', 'CMD_SLEEP', 'CMD_NOHUP', 'CMD_KILLALL', 'CMD_KILL', 'CMD_NMON', 'CMD_GLANCES', 'CMD_ATOP', 'CMD_BTOP', 'CMD_HTOP', 'CMD_TOP', 'CMD_PSTREE', 'CMD_PS', 'CMD_CHROOT', 'CMD_LAST', 'CMD_W', 'CMD_CHPASSWD', 'CMD_PASSWD', 'CMD_USERDEL', 'CMD_USERMOD', 'CMD_USERADD', 'CMD_SUDO', 'CMD_UMASK', 'CMD_CHOWN', 'CMD_CHMOD', 'CMD_XARGS', 'CMD_SED', 'CMD_AWK', 'CMD_GREP', 'CMD_LOCATE', 'CMD_FIND', 'CMD_DIFF', 'CMD_VI', 'CMD_TAIL', 'CMD_LESS', 'CMD_MORE', 'CMD_TAC', 'CMD_CAT', 'CMD_TOUCH', 'CMD_CLEAR', 'CMD_LN', 'CMD_RM', 'CMD_MV', 'CMD_CP', 'CMD_MKDIR', 'CMD_PWD', 'CMD_CD', 'CMD_LS', 'COPY_FORK', 'TOOL_BENCH', 'DELETION_GUARD', 'LINK_PAIR', 'LISTING_ROW', 'PATH_WALK', 'RECORD_DRAFT', 'FROZEN_FRAME', 'ORDER_ROULETTE', 'WORKER_SPREAD', 'SEALED_BOX', 'SET_LOGIC', 'SEARCH_NARROW', 'STAGE_HANDOFF', 'BACKSTAGE_PHONE', 'SCOPE_LADDER', 'HAND_STAMP', 'SAD_PATHS', 'MAIL_ROOM', 'TRACE_SCRUB', 'FLAG_HARVEST', 'SHOT_SCOPE', 'PICKER_BYPASS', 'DIALOG_GATE', 'FRAME_BOUNDARY', 'TRAP_TRIGGER', 'INDEX_DRIFT', 'ROW_FILTER', 'CROWD_MATCH', 'RESPONSIBILITY_SPLIT', 'SAVED_SEARCH', 'RULE_TEST', 'CHANGE_RIPPLE', 'FIXTURE_CREW', 'OVERLAY_BLOCK', 'BROWSER_STEP', 'CODE_RUN', 'QUIZ_CARD', 'THEATER_STAGE', 'INTRO_CARD', 'REPO_CTA', 'AUTO_RUN', 'COMPONENT_LAB', 'BEAT_BOARD', 'PRODUCTION_GRIND', 'SCENE_FORGE', 'VIDEO_PLAYER', 'CHAT_TRIO', 'PROMPT_HANDOUT', 'APP_WINDOW', 'CHECK_SWEEP', 'PROMPT_HANDOFF', 'TOPIC_INTAKE', 'PIPELINE_GATE', 'ASPECT_TWIN', 'RESKIN_CAROUSEL', 'WORD_ANCHOR_RAIL', 'BUDGET_METER_ROW', 'LAB_ASSEMBLY', 'CAST_BOARD', 'SPEC_TO_FRAME', 'BATCH_SWEEP', 'PIPELINE_GANTT', 'DIAGRAM', 'KINETIC_TEXT', 'PHOTO', 'REVEAL', 'SOUND_WAVE', 'LOGO_REVEAL', 'CAROUSEL', 'ACTIVITY_CARD', 'LOCATION_MAP', 'FLIP_CARD', 'GALLERY', 'COMPARISON_SLIDER', 'QUOTE_SPOTLIGHT', 'STICKY_NOTE', 'IMAGE_SCENE', 'FUNNEL', 'WATERFALL', 'PICTOGRAM', 'RADAR', 'CANDLESTICK', 'BOX_PLOT', 'TREEMAP', 'SANKEY', 'ICON_GRID', 'ICON_CALLOUT', 'ICON_BURST', 'LOGO_WALL', 'LOGO_VERSUS', 'LOGO_TIMELINE', 'FORMULA', 'MOLECULE', 'DNA_HELIX', 'LABELED_FIGURE', 'VECTOR_FIELD', 'CIRCUIT_FLOW', 'TICKER_TAPE', 'MAP_RADAR', 'BITS', 'MEMORY', 'PACKET', 'PIPELINE', 'LAYERED_STACK', 'GRID_ARRAY', 'SPEC_COMPARE', 'DIE_SHOT', 'NEURAL_NET', 'DATACENTER', 'TRANSFORMER_BLOCK', 'CACHE_PYRAMID', 'CALL_STACK', 'TOKENIZER', 'FILE_TREE', 'DATABASE_TABLE', 'GIT_BRANCH', 'STATE_MACHINE', 'EMBEDDING_SPACE', 'QUEUE', 'API_REQUEST_RESPONSE', 'BOOLEAN_LOGIC_GATES', 'HASH_FUNCTION', 'SORTING_VISUAL', 'CLOCK_SIGNAL', 'GPU_CLUSTER', 'ZOOM_SCALE', 'ENCRYPTION', 'POINTER_DIAGRAM', 'NUMBER_BASE', 'CODE_EDITOR', 'TERMINAL_SESSION', 'LOG_STREAM', 'CODE_DIFF', 'ERROR_TRACE', 'WINDOW_FRAME', 'AUTOMATION_RUN', 'DOM_INSPECT', 'NETWORK_WATERFALL', 'DEVICE_FRAME', 'CLOUD_ARCH', 'K8S_CLUSTER', 'COST_METER', 'SLO_GAUGE', 'IAC_PLAN', 'ERD', 'PROCESS_TABLE', 'KERNEL_BOUNDARY', 'TEST_RUNNER', 'TEST_MATRIX', 'CONTEXT_METER', 'AGENT_HARNESS', 'KNOWLEDGE_GRAPH', 'RETRIEVAL_RANK', 'MODEL_STAGES', 'CONFIDENCE_GATE', 'SANDBOX_BOX', 'DRILL_IN', 'EVAL_DASHBOARD', 'VIDEO_HERO', 'VIDEO_SPOTLIGHT', 'MEDIA_CALLOUT', 'MEDIA_COMPARE', 'MEDIA_STAT_OVERLAY', 'SCREENSHOT_CASCADE', 'FLOATING_QUOTE_PILL', 'OVERLAY_SPLIT_DEFINITIONS', 'CYCLE_LOOP', 'STEP_STACK_OVERLAY', 'TITLE_BANNER_FOCUS', 'TALKING_POINTS', 'SLIDE_BULLETS_PIP', 'CAPTION_KINETIC_OVERLAY', 'PHOTO_TIMELINE', 'TRADEOFF_SCALE'];
  if (!types.some((t) => DYNAMIC.includes(t)))
    E(`NO DYNAMIC MOMENT: add at least one of DIAGRAM/KINETIC_TEXT/REVEAL/PHOTO/CAROUSEL/… so the video isn't all boxes, lists and numbers.`);
  const distinctTrans = new Set(spec.scenes.map((s) => s.transition).filter(Boolean)).size;
  if (distinctTrans < 5)
    W(`only ${distinctTrans} transition kind(s) used — a long video needs ≥5 distinct scene.transition kinds (16 available) so the cutting has rhythm.`);
  // SPECIALIST QUOTA (2026-07-17) — shipped videos kept passing the palette gate
  // with 15 all-distinct EDITORIAL types while NEURAL_NET/GRID_ARRAY/SANKEY/…
  // never got reached for. Distinctness is not variety: a quarter of a long
  // video must come from OUTSIDE the comfort-zone set below.
  const COMFORT = ['HOOK', 'TITLE_CARD', 'CHAPTER', 'LIST_BUILD', 'STAT_CALLOUT', 'STAT_PANELS', 'RECAP', 'OUTRO_CTA', 'KINETIC_TEXT', 'REVEAL', 'ICON_CALLOUT', 'ICON_GRID', 'SPLIT_PATHS', 'BAR_COMPARE', 'COUNTDOWN', 'NOTIFICATION', 'LOWER_THIRD', 'QUOTE_SPOTLIGHT', 'FLIP_CARD', 'SUBSCRIBE_REMINDER', 'CHANNEL_CARD', 'CONCEPT_DIAGRAM', 'STEP_FLOW', 'TALKING_POINTS', 'TITLE_BANNER_FOCUS'];
  const specialist = types.filter((t) => !COMFORT.includes(t)).length;
  const needSpec = Math.max(2, Math.round(n * 0.25));
  if (specialist < needSpec)
    W(`COMFORT-ZONE PALETTE: only ${specialist} of ${n} scenes reach beyond the core editorial set (need ≥${needSpec}). Match the SHAPE of each beat to a specialist component — an MoE model → NEURAL_NET/GRID_ARRAY, a date → TIMELINE, brand-vs-brand → LOGO_VERSUS, a flow → SANKEY/DIAGRAM, a market → TICKER_TAPE… (scene_library.md §REACH-FOR). Treat this warning as a rejection when authoring.`);
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
      // anchors are `atWord` plus the suffixed variants (heroAtWord, headlineAtWord…)
      if (/atword$/i.test(k) && typeof v === 'number') out.push(v);
      else collectAnchors(v, out);
    }
  }
  return out;
};
// Anchors live on the scene's DATA and on its scene-level layers (stepRail, pip).
// Checking only `data` let a scene-level anchor point past the narration unnoticed.
const sceneAnchorRoot = (s) => ({data: s.data, stepRail: s.stepRail, pip: s.pip});

// ─────────────────────────────────────────────────────────────────────────────
// HUMAN-VOICE GUARD (owner, 2026-08-16). Recorded complaint: *"you often use IT, and
// you speak about something that's on the screen, but you forget what the context is
// about, and you start speaking in a very AI manner. Humans are not adaptable to that."*
//
// A voiceover is SPOKEN. Flat, evenly-measured, pronoun-heavy prose reads as a machine
// reading a manual, and no amount of good visuals rescues it. These four measures are
// the ones that separate written-for-the-eye from said-out-loud, and every one of them
// is cheap to fix in the builder. They are WARNINGS (this series treats them as
// rejections) and they are measured over the WHOLE spec, never per scene — a chapter
// card is meant to be four words long.
// ─────────────────────────────────────────────────────────────────────────────
// GREETING GUARD (LAW 0g, owner 2026-08-16: *"in all videos, greeting is missing"*).
//
// The fix is a greeting, but the ORDER is the whole rule. Retention research is blunt:
// creators lose viewers in the first 30s precisely by opening with greeting + channel
// branding, and tutorials retain best when the payoff comes first and the welcome
// second. So scene 1 stays a cold open, and the greeting lands in the beats just after
// it — usually folded into TITLE_CARD, costing no extra scene.
const GREET = /\b(welcome (?:back )?(?:to|along)?|hello|hey there|good to see you|glad you(?:'re| are) here)\b/i;
const longFmt = (spec.meta?.format ?? 'long') === 'long';
const chan = String(spec.brand?.channel ?? '').trim();
if (longFmt && (spec.scenes ?? []).length >= 6) {
  const nar = (i) => String(spec.scenes[i]?.narration ?? '');
  const s1 = nar(0);
  // Leading with branding is the documented retention killer, so it is an ERROR.
  if (GREET.test(s1))
    E(`s01: the HOOK greets the viewer — a cold open must name the PAIN first. Move the welcome to scene 2-3 (LAW 0g).`);
  if (chan && s1.toLowerCase().includes(chan.toLowerCase()))
    E(`s01: the HOOK says the channel name — leading with branding is the single most-documented way to lose the first 30 seconds. Move it to scene 2-3 (LAW 0g).`);
  // ...but having NO greeting anywhere is the thing the owner actually complained about.
  const opening = [1, 2, 3].map(nar).join(' ');
  const greeted = GREET.test(opening) || (chan && opening.toLowerCase().includes(chan.toLowerCase()));
  if (!greeted)
    W(`NO GREETING: scenes 2-4 never welcome the viewer or name the channel. After the cold open, weave one in as an aside — and vary the form between episodes (LAW 0g).`);
  // A jingle repeated every episode reads as one on a binge; twice in ONE spec is worse.
  const welcomes = (spec.scenes ?? []).filter((s) => GREET.test(String(s.narration ?? ''))).length;
  if (welcomes > 1)
    W(`GREETED ${welcomes} TIMES: one welcome per episode. A second reads as a jingle.`);

  // CLICK-PROMISE CONGRUENCE. The viewer arrived carrying an expectation set by the
  // title and the thumbnail. If the opening does not obviously continue it, they cannot
  // tell this is the video they clicked, and they leave. Checked by looking for the
  // distinctive words of the title/thumbnail in the first three narrations.
  const STOP = new Set(['playwright', 'python', 'tutorial', 'the', 'and', 'for', 'with', 'your',
                        'what', 'why', 'how', 'that', 'this', 'from', 'into', 'when', 'once',
                        'every', 'you', 'not', 'but', 'all', 'its', 'a', 'an', 'of', 'in', 'on']);
  const keyWords = (str) => String(str ?? '')
    .toLowerCase().split(/[^a-z0-9_]+/).filter((w) => w.length > 3 && !STOP.has(w));
  const promise = [...new Set([...keyWords(spec.meta?.seo?.title), ...keyWords(spec.thumbnail?.title)])];
  if (promise.length) {
    const openLower = (s1 + ' ' + opening).toLowerCase();
    const hit = promise.filter((w) => openLower.includes(w));
    if (!hit.length)
      W(`CLICK PROMISE UNMET: the opening beats never mention ${promise.slice(0, 4).map((w) => `"${w}"`).join(', ')} — the words the viewer clicked. Echo the title/thumbnail promise in the first breath, or they cannot tell this is the video they picked (LAW 0g).`);
  }

  // AN OPEN LOOP IS A QUESTION. Phase 3 of the opening is an information gap the body
  // closes. A spec that opens with only statements has nothing pulling the viewer through.
  const openingAll = [0, 1, 2, 3].map(nar).join(' ');
  if (!/\?/.test(openingAll))
    W(`NO OPEN LOOP: the first four beats never ask anything. Pose a question the body answers — curiosity you then SATISFY is what separates a click promise from clickbait (LAW 0g).`);
}

// MOVING-BACKGROUND GUARD (LAW 0h, owner 2026-08-16 on a pulsing ring shipped behind
// four episodes: *"very distracting"*). A background that moves competes with the thing
// the viewer is meant to read. Variety belongs in the scene mix, not the wallpaper.
// Where the line sits, and why it is not "anything that animates": Act I shipped seven
// episodes on `aurora` (two large, very slow blobs) and the owner never once objected.
// What he DID object to was a rhythmic pulse. So the test is not "does it use frame" —
// nearly every look does — it is whether the motion is RHYTHMIC or MULTI-OBJECT enough
// to pull the eye off the teaching. `bokeh` is 14 blobs drifting on sin/cos; that is a
// different thing from two slow ones.
const MOVING_BG = ['grid-pulse', 'ripple', 'wave', 'matrix-rain', 'ember', 'bokeh', 'starfield'];
if (MOVING_BG.includes(String(spec.brand?.background ?? '')))
  W(`MOVING BACKGROUND "${spec.brand.background}": a background that animates sits BEHIND the teaching and competes with it. Use a still look (grid, aurora, plain, gradient) and get your variety from the scene mix (LAW 0h).`);

const narrations = (spec.scenes ?? []).map((s) => (s.narration ?? '').trim()).filter(Boolean);
if (narrations.length >= 6) {
  const allText = narrations.join(' ');
  const sentences = allText.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => x.split(/\s+/).length > 1);
  const lens = sentences.map((x) => x.split(/\s+/).length);
  const wordTotal = lens.reduce((a, b) => a + b, 0);

  // 1. BURSTINESS. Humans swing between three-word jabs and long winding clauses.
  //    A machine holds a steady 12-16 every time. Standard deviation catches it.
  if (lens.length >= 8) {
    const mean = wordTotal / lens.length;
    const sd = Math.sqrt(lens.reduce((a, l) => a + (l - mean) ** 2, 0) / lens.length);
    if (sd < 4.5)
      W(`FLAT NARRATION: sentence lengths vary by only ±${sd.toFixed(1)} words (mean ${mean.toFixed(1)}). Real speech swings — mix 3-5 word jabs with 25+ word runs. Read it aloud; if it sounds metered, it is.`);
  }

  // 2. NAKED PRONOUN SUBJECTS. "It does X" — WHAT does X? On a screen full of a page,
  //    a locator and a file, "it" is genuinely ambiguous, and the owner called this out
  //    by name. Naming the subject is also what makes a sentence sound spoken.
  const naked = sentences.filter((x) => /^(It|This|That|They|These|Those)\b/i.test(x)).length;
  if (sentences.length && naked / sentences.length > 0.12)
    W(`PRONOUN FOG: ${naked} of ${sentences.length} sentences open with It/This/That. Name the thing — "the locator", "that zip file", "your test" — or the listener loses the subject.`);

  // 3. REPEATED OPENERS. "So …" three scenes running is the tell of a template.
  const openers = {};
  for (const x of sentences) {
    const w0 = (x.split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z']/g, '');
    if (w0) openers[w0] = (openers[w0] ?? 0) + 1;
  }
  for (const [w0, n0] of Object.entries(openers)) {
    if (n0 >= 5 && n0 / sentences.length > 0.1)
      W(`REPEATED OPENER: ${n0} sentences begin with "${w0}". Vary the way in — an adverb, a question, a fragment, a dependent clause.`);
  }

  // 4. CONTRACTIONS. Nobody says "it is not" out loud. Zero contractions across a whole
  //    script is the single loudest AI tell, and edge-tts speaks them perfectly well.
  const contractions = (allText.match(/\b\w+['’](t|s|re|ll|ve|d|m)\b/gi) ?? []).length;
  if (wordTotal >= 250 && contractions / wordTotal < 0.012)
    W(`NO CONTRACTIONS: ${contractions} in ${wordTotal} words. Say "you'll", "it's", "don't", "here's" — written-out forms sound like a manual being read aloud.`);

  // 5. FRAGMENTS. Guard 1 (burstiness) backfired into clipping everything: measured
  //    45-57% fragments across four shipped episodes — "Three tools today." · "Six
  //    seconds each." Owner: *"that's just a blunt sentence with no grammar."* A short
  //    sentence is good; a caption read off a slide is not. Vary LENGTH, keep GRAMMAR.
  const FINITE = /\b(is|are|was|were|am|be|been|being|get|gets|got|have|has|had|do|does|did|can|could|will|would|should|must|may|might|run|runs|ran|make|makes|made|take|takes|took|see|sees|saw|say|says|said|need|needs|want|wants|know|knows|knew|go|goes|went|live|lives|open|opens|give|gives|gave|hand|hands|come|comes|came|work|works|mean|means|meant|keep|keeps|kept|stop|stops|land|lands|fail|fails|pass|passes|start|starts|write|writes|wrote|read|reads|show|shows|sit|sits|cost|costs|climb|climbs|fire|fires|hold|holds|let|lets|put|puts|turn|turns|use|uses|used|find|finds|found|call|calls|tell|tells|told|think|thinks|look|looks|wait|waits|add|adds|set|sets|pick|picks|drop|drops|walk|walks|watch|watches|spend|spends|save|saves|break|breaks|broke|build|builds|built|check|checks|happen|happens|arrive|arrives|expect|expects|welcome|remember|notice|imagine|forget|suppose|picture|listen|meet|ask|asks|try|tries|load|loads|type|types|click|clicks|fill|fills|appear|appears|close|closes|return|returns|send|sends|receive|receives|fire|fires|light|lights|move|moves|grab|grabs|catch|catches|hit|hits|point|points|name|names|queue|queues|pay|pays|walk|walks|flip|flips|steal|steals|record|records|freeze|freezes|stop|stops|answer|answers|matter|matters|help|helps)\b/i;
  // A fragment is a MISSING VERB, not brevity: "The page loads." is three words and a
  // perfectly good sentence, while "Three tools today." is four words and a caption.
  // Scoped deliberately: a verb WHITELIST can never be complete, so applying it to
  // long sentences just manufactures false positives, and a guard you learn to ignore
  // is worse than no guard. The thing being caught is the CAPTION -- short, verbless,
  // read off a slide ("Three tools today." / "In the sidebar.") -- so only short
  // sentences are judged on the verb test.
  const frags = sentences.filter((x) => {
    const w = x.split(/\s+/).length;
    return w < 3 || (w < 6 && !FINITE.test(x));
  });
  if (sentences.length >= 20 && frags.length / sentences.length > 0.22)
    W(`FRAGMENTS ${Math.round((frags.length / sentences.length) * 100)}%: ${frags.length} of ${sentences.length} "sentences" have no verb or are under four words (e.g. ${frags.slice(0, 2).map((x) => `"${x}"`).join(', ')}). Burstiness means varying LENGTH, not dropping grammar — "There are three tools I want to show you" is short AND a sentence.`);

  // 6. PRONOUN DENSITY. The opener check below catches only sentence-INITIAL pronouns
  //    and so missed almost all of them: measured ~54 bare pronouns per episode while
  //    the actual subject was named 1-5 times in 880 words. Owner: *"when you say IT,
  //    what is IT?"* Naming the subject repeatedly is clarity, not repetition.
  const bare = (allText.match(/\b(it|its|it's|this|that|they|them|those|these)\b/gi) ?? []).length;
  if (wordTotal >= 250 && bare / wordTotal > 0.045)
    W(`PRONOUN DENSITY ${(bare / wordTotal * 100).toFixed(1)}%: ${bare} bare it/this/that/they in ${wordTotal} words — roughly one every ${Math.round(wordTotal / bare)}. Name the subject instead: Playwright, the locator, your test, that trace file. Repeating a NAME is clarity.`);

  // 7. VAGUE POINTING. The other failure mode of "stop saying it" — swapping one empty
  //    reference for a wordier one. "The one you see" tells the listener nothing.
  const vague = (allText.match(/\b(the (one|thing|bit|part) (you see|that's highlighted|highlighted|here|there|on screen)|this thing here|that thing there)\b/gi) ?? []);
  if (vague.length)
    W(`VAGUE POINTING: ${vague.length}× (e.g. "${vague[0]}"). Pointing at the screen in words is not naming — say WHAT it is.`);

  // 8. REASONING CONNECTIVES. A teacher carries the WHY inside the sentence; a narrator
  //    lists true statements. This is the cheapest measurable proxy for the difference.
  const because = (allText.match(/\b(because|which means|so that|otherwise|that's why|the reason|which is why|meaning)\b/gi) ?? []).length;
  if (wordTotal >= 400 && because / wordTotal < 0.008)
    W(`FEW REASONS: only ${because} reasoning connectives (because / which means / otherwise / that's why) in ${wordTotal} words. A list of true statements is not an explanation — carry the WHY inside the sentence (LAW 0f rule 8).`);
}

// STATIC-SCENE GUARD (2026-07-17) — a 20-30s narration parked on ONE component is
// the #1 cause of "nothing is happening on screen".
//
// AMENDED 2026-08-15, owner's direction: "our hard limitation on the seconds for the
// content per beat is affecting how well we explain concepts." The flat 16s ceiling
// assumed a scene shows ONE thing and then just sits there. A STEPPING component does
// not: CODE_RUN lights a new line, a new plain-English note and a new result every few
// seconds; BROWSER_STEP moves the page per step; CHANGE_RIPPLE crawls a repair card by
// card. Combined with the >=4s-per-taught-line rule (LAW 0e), a flat 16s capped a code
// beat at FOUR lines and forced real explanation out of the episode — the exact defect
// LAW 0e exists to kill.
//
// So the ceiling is now EARNED BY MOTION. Every distinct internal anchor past the first
// buys 4 more seconds, to a hard stop of 30s. A genuinely static card still gets 16s,
// which is what the original guard was written for. Note this is a linter ceiling only:
// sync.mjs never truncates a scene below its real audio length (`base`), so a long read
// always plays in full — what this governs is whether the author gets warned.
//
// AMENDED AGAIN 2026-08-18, owner's direction: *"you are just saying shitty words...
// you are limiting your crazy ass vocabulary... you must patiently show what happens
// in the Linux OS in the background."* The 900-frame stop was the binding constraint
// on EXPLANATION, not on pacing. At 12 frames/word it capped any beat at ~75 spoken
// words, and a command beat that must set up a situation, expand the command's name,
// narrate two terminal steps and draw the consequence does not fit in 75 words. What
// came out instead was the telegraphic register the owner rejected: "The tree never
// moves. Only your position does."
//
// The earned-by-motion formula below is the real guard and it is unchanged — a static
// card still gets 16s, and a beat must anchor 14 distinct elements to reach the new
// stop. Only the arbitrary clamp moves — a command beat that wants a longer read has
// to earn it by actually depicting more, which is the outcome the owner asked for.
const STATIC_CEIL = 480;   // 16s — one thing on screen, not moving
const HARD_CEIL = 2100;    // 70s — nothing earns more than this
const sceneCeiling = (s) => {
  const steps = new Set(collectAnchors(sceneAnchorRoot(s))).size;
  if (steps < 2) return STATIC_CEIL;
  // 5s per stepped element + a 1s head + a tail proportional to the body, never
  // below the static ceiling.
  //
  // The flat 4s tail was numerically inconsistent with the PAYOFF TIMING rule below,
  // which reserves the final 15% of the narration for an anchor-free landing line
  // (and LAW 0f rule 8 requires that line: "end the beat on the sentence you'd want
  // them to repeat"). On a 55s beat, 15% is 8 seconds, so a 4s allowance meant a beat
  // was warned for having the ending both rules demand. The tail now scales with the
  // body it has to close.
  //
  // Was 4s. LAW 0e sets 4s as the MINIMUM a taught line needs to be readable; using
  // that same figure as the per-anchor ALLOWANCE meant the ceiling assumed the
  // narrator speaks at the fastest rate a viewer can still follow, for the whole
  // scene. That is the rushed register the owner rejected on 2026-08-18. Measured
  // against a patient read of the command beats, unhurried narration lands at ~12
  // spoken words per depicted beat, which is 4.8s — so the allowance is 5s and the
  // 4s minimum stays exactly where it is.
  return Math.max(STATIC_CEIL, Math.min(HARD_CEIL, 180 * steps + 120));
};
for (const s of spec.scenes ?? []) {
  const ceil = sceneCeiling(s);
  if ((s.durationFrames ?? 0) > ceil) {
    const steps = new Set(collectAnchors(sceneAnchorRoot(s))).size;
    W(`${s.id}: ${(s.durationFrames / 30).toFixed(1)}s on a single ${s.type} with ${steps} stepped element(s) — that earns ${(ceil / 30).toFixed(0)}s. Either step something more (each anchored element buys 4s) or split the narration into two beats.`);
  }
}
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

  // SCENE-LEVEL STEP RAIL — the workflow chrome the shell draws over any component.
  if (s.stepRail) {
    const sr = s.stepRail;
    const st = sr.steps ?? [];
    if (st.length < 3) E(`${id}: stepRail needs ≥3 steps — fewer does not read as progress`);
    if (st.length > 6) E(`${id}: stepRail max 6 steps (got ${st.length})`);
    for (const x of st) if (len(x) > 11) E(`${id}: stepRail step "${x}" > 11 chars`);
    if (sr.active == null) E(`${id}: stepRail needs an "active" step — a rail with no current step tells the viewer nothing`);
    else if (sr.active < 1 || sr.active > Math.max(1, st.length))
      E(`${id}: stepRail.active ${sr.active} outside steps (1-${st.length})`);
    if (len(sr.app) > 10) E(`${id}: stepRail app > 10 chars`);
    if (len(sr.note) > 34) E(`${id}: stepRail note > 34 chars`);
    checkColor(id, 'stepRail.color', sr.color);
  }

  // Remotion requires integer frame counts — a fractional duration crashes every render.
  if (s.durationFrames != null && !Number.isInteger(s.durationFrames))
    E(`${id}: durationFrames ${s.durationFrames} is not an integer — Remotion rejects fractional durations`);
  // timing sanity: duration should track narration length (150wpm = 12 f/word)
  const expected = wc * 12 + 30;
  if (s.timingSource !== 'tts' && s.durationFrames && Math.abs(s.durationFrames - expected) > Math.max(60, expected * 0.4))
    W(`${id}: durationFrames=${s.durationFrames} vs ~${expected} expected for ${wc} words — check pacing`);
  if (s.type === 'HOOK' && s.durationFrames > HOOK_MAX_FRAMES)
    E(`${id}: HOOK is ${(s.durationFrames / 30).toFixed(1)}s — must be ≤8s`);

  // HUMAN-VOICE GUARD (2026-07-17) — narration must never SPEAK structural labels;
  // chapters are visual, the voice transitions naturally ("So what did they build?").
  if (/^\s*(part|chapter|section)\s+(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/i.test(s.narration ?? '') || /^\s*(the\s+)?recap\b\s*[:,]/i.test(s.narration ?? ''))
    W(`${id}: narration speaks a structural label ("${(s.narration ?? '').slice(0, 30)}…") — sounds robotic. Chapters/recaps are VISUAL; write a natural spoken transition instead.`);

  // anchors within narration (skipped after TTS sync: anchors become fractional frames)
  if (s.timingSource !== 'tts') {
    for (const a of collectAnchors(sceneAnchorRoot(s))) {
      if (a < 1) E(`${id}: atWord ${a} < 1 (anchors are 1-indexed)`);
      if (a > wc) E(`${id}: atWord ${a} exceeds narration word count (${wc}) — element would never appear`);
    }
    // PAYOFF TIMING (2026-07-18): a payoff named in the narration's final words
    // animates into the scene tail — the viewer gets no time to process it. The
    // sync step adds a settle tail, but the real fix is naming the payoff earlier.
    if (wc >= 8) {
      const late = collectAnchors(sceneAnchorRoot(s)).filter((a) => a > Math.ceil(wc * 0.85));
      if (late.length)
        W(`${id}: anchor at word ${Math.max(...late)} of ${wc} — payoff lands in the last 15% of the narration. Restructure the line so the reveal is NAMED early and the closing words carry meaning, not the payoff.`);
    }
  } else {
    // post-sync: anchors are exact frames — verify the last payoff actually gets
    // settle time on screen before the scene ends (sync guarantees it unless the
    // scene hit its pacing cap, which means the narration names the payoff too late).
    const maxA = Math.max(0, ...collectAnchors(sceneAnchorRoot(s)).map((a) => (a - 1) * 12));
    if (maxA > 0 && s.durationFrames && s.durationFrames - maxA < 55)
      W(`${id}: last anchor fires ${((s.durationFrames - maxA) / 30).toFixed(1)}s before the scene ends — the payoff has no settle time. Name it earlier in the narration and re-run TTS + sync.`);
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

  if (d.stickyNote) {
    const sn = d.stickyNote;
    const notes = Array.isArray(sn.notes) ? sn.notes : [];
    if (notes.length < 1 || notes.length > 6) E(`${id}: STICKY_NOTE needs 1-6 notes (has ${notes.length})`);
    if (sn.headline && len(sn.headline.replace(/[\[\]]/g, '')) > BUDGET.headline) E(`${id}: sticky headline > ${BUDGET.headline} chars`);
    if (sn.source && len(sn.source) > BUDGET.source) E(`${id}: sticky source > ${BUDGET.source} chars`);
    checkColor(id, 'stickyNote.color', sn.color);
    notes.forEach((nt, k) => {
      if (!len(nt.body)) E(`${id}: sticky note ${k + 1} needs body text`);
      if (len(nt.body) > BUDGET.stickyBody) E(`${id}: sticky note ${k + 1} body ${len(nt.body)} > ${BUDGET.stickyBody} chars`);
      if (len(nt.title) > BUDGET.stickyTitle) E(`${id}: sticky note ${k + 1} title > ${BUDGET.stickyTitle} chars`);
      if (len(nt.tag) > BUDGET.stickyTag) E(`${id}: sticky note ${k + 1} tag > ${BUDGET.stickyTag} chars`);
      if (len(nt.highlight) > BUDGET.stickyHighlight) E(`${id}: sticky note ${k + 1} highlight > ${BUDGET.stickyHighlight} chars`);
      if (nt.highlight && nt.body && !String(nt.body).toLowerCase().includes(String(nt.highlight).toLowerCase()))
        E(`${id}: sticky note ${k + 1} highlight must be a verbatim phrase inside body`);
      checkColor(id, 'stickyNote.note.color', nt.color);
    });
  }

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
  if (d.sceneForge) {
    const sf = d.sceneForge;
    const rw = sf.rows ?? [];
    const st = sf.stages ?? [];
    if (len(sf.headline) > 48) E(`${id}: sceneForge headline > 48 chars`);
    if (rw.length < 3) E(`${id}: SCENE_FORGE needs ≥3 rows — the list around the target is what makes it "for THIS one"`);
    if (rw.length > 5) E(`${id}: SCENE_FORGE max 5 rows (got ${rw.length})`);
    for (const r of rw) {
      if (len(r.label) > 10) E(`${id}: sceneForge row label "${r.label}" > 10 chars`);
      if (len(r.text) > 26) E(`${id}: sceneForge row text "${r.text}" > 26 chars`);
      checkColor(id, 'sceneForge.row.color', r.color);
    }
    if (typeof sf.targetIndex !== 'number') E(`${id}: SCENE_FORGE needs targetIndex`);
    else if (sf.targetIndex < 0 || sf.targetIndex >= rw.length)
      E(`${id}: sceneForge.targetIndex ${sf.targetIndex} out of range (0-${rw.length - 1})`);
    if (len(sf.askLabel) > 34) E(`${id}: sceneForge askLabel > 34 chars`);
    if (st.length > 4) E(`${id}: SCENE_FORGE max 4 stages (got ${st.length})`);
    for (const s of st) if (len(s) > 14) E(`${id}: sceneForge stage "${s}" > 14 chars`);
    if (len(sf.doneLabel) > 20) E(`${id}: sceneForge doneLabel > 20 chars`);
    if (len(sf.footNote) > 42) E(`${id}: sceneForge footNote > 42 chars`);
    checkColor(id, 'sceneForge.color', sf.color);
  }

  if (d.videoPlayer) {
    const vp = d.videoPlayer;
    const cl = vp.clips ?? [];
    if (len(vp.headline) > 48) E(`${id}: videoPlayer headline > 48 chars`);
    if (!cl.length) E(`${id}: VIDEO_PLAYER needs ≥1 clip`);
    if (cl.length > 3) E(`${id}: VIDEO_PLAYER max 3 clips (got ${cl.length})`);
    for (const c of cl) {
      if (len(c.label) > 28) E(`${id}: videoPlayer clip label "${c.label}" > 28 chars`);
      // A clip shorter than its beat runs dry and freezes/blanks the screen mid-scene
      // — the defect that made the finished output itself look broken. `seconds` is how
      // the player knows where to loop, so a clip without it is a defect waiting to ship.
      if (c.asset && c.seconds == null)
        W(`${id}: videoPlayer clip "${c.label ?? c.asset}" has no seconds — the player cannot loop it, so it runs dry if the beat is longer than the file`);
      if (c.seconds != null && (typeof c.seconds !== 'number' || c.seconds <= 0))
        E(`${id}: videoPlayer clip seconds must be a positive number (got ${c.seconds})`);
      checkColor(id, 'videoPlayer.clip.color', c.color);
    }
    if (len(vp.runtime) > 8) E(`${id}: videoPlayer runtime > 8 chars`);
    if (vp.runtime && !/^\d{1,2}:\d{2}$/.test(String(vp.runtime)))
      E(`${id}: videoPlayer runtime "${vp.runtime}" must read as a clock, e.g. "2:14"`);
    if (vp.startAt != null && (vp.startAt < 0 || vp.startAt > 0.9))
      E(`${id}: videoPlayer.startAt must be 0-0.9 (a play head starting at the end has nowhere to travel)`);
    if (len(vp.badge) > 16) E(`${id}: videoPlayer badge > 16 chars`);
    if (len(vp.footNote) > 42) E(`${id}: videoPlayer footNote > 42 chars`);
    checkColor(id, 'videoPlayer.color', vp.color);
  }

  if (d.introCard) {
    const ic = d.introCard;
    if (len(ic.kicker) > 16) E(`${id}: introCard kicker > 16 chars`);
    if (!ic.name) E(`${id}: INTRO_CARD needs a name — saying the name IS this beat`);
    if (len(ic.name) > 20) E(`${id}: introCard name > 20 chars — it is set at 150px and must fit one line`);
    // The component draws nothing else on purpose. A spec that sets a headline or a
    // subtext is describing a scene this component will not render.
    if (d.headline) W(`${id}: INTRO_CARD ignores data.headline — the name IS the headline here`);
    // It is a punctuation beat, not an explainer. Over ~6s it stops landing.
    if (s.durationFrames > 200)
      W(`${id}: INTRO_CARD runs ${(s.durationFrames / 30).toFixed(1)}s — it holds ONE line, so over ~6s it stops being a landing and starts being a pause. Cut the narration, not the whitespace.`);
    checkColor(id, 'introCard.color', ic.color);
  }

  if (d.beatBoard) {
    const bb = d.beatBoard;
    const rw = bb.rows ?? [];
    if (len(bb.headline) > 48) E(`${id}: beatBoard headline > 48 chars`);
    if (len(bb.panelTitle) > 30) E(`${id}: beatBoard panelTitle > 30 chars`);
    if (rw.length < 3) E(`${id}: BEAT_BOARD needs ≥3 rows — fewer does not read as a list of scenes`);
    if (rw.length > 6) E(`${id}: BEAT_BOARD max 6 rows (got ${rw.length})`);
    for (const r of rw) {
      if (len(r.label) > 22) E(`${id}: beatBoard row label "${r.label}" > 22 chars`);
      if (len(r.text) > 44) E(`${id}: beatBoard row text "${r.text}" > 44 chars`);
      if (r.value != null && (typeof r.value !== 'number' || r.value < 0))
        E(`${id}: beatBoard row "${r.label}" value must be a non-negative word count`);
      checkColor(id, 'beatBoard.row.color', r.color);
    }
    if (bb.targetIndex != null && (bb.targetIndex < 0 || bb.targetIndex >= rw.length))
      E(`${id}: beatBoard.targetIndex ${bb.targetIndex} out of range (0-${rw.length - 1})`);
    if (len(bb.newLabel) > 14) E(`${id}: beatBoard newLabel > 14 chars`);
    if (len(bb.previewLabel) > 12) E(`${id}: beatBoard previewLabel > 12 chars`);
    if (len(bb.customLabel) > 20) E(`${id}: beatBoard customLabel > 20 chars`);
    if (len(bb.doneLabel) > 12) E(`${id}: beatBoard doneLabel > 12 chars`);
    // The row flips to the custom type when its button is pressed; without a label
    // for what it became, the press has no visible consequence.
    if (!bb.customLabel) W(`${id}: BEAT_BOARD has no customLabel — the pressed row never visibly becomes anything`);
    if (len(bb.footNote) > 52) E(`${id}: beatBoard footNote > 52 chars`);
    checkColor(id, 'beatBoard.color', bb.color);
  }

  if (d.componentLab) {
    const cl = d.componentLab;
    const st = cl.stages ?? [];
    if (len(cl.headline) > 48) E(`${id}: componentLab headline > 48 chars`);
    if (len(cl.drawerTitle) > 26) E(`${id}: componentLab drawerTitle > 26 chars`);
    if (len(cl.forScene) > 30) E(`${id}: componentLab forScene > 30 chars`);
    if (len(cl.askLabel) > 34) E(`${id}: componentLab askLabel > 34 chars`);
    if (!cl.ask) E(`${id}: COMPONENT_LAB needs an "ask" — the whole claim is that you say it in your own words`);
    if (len(cl.ask) > 38) E(`${id}: componentLab ask "${cl.ask}" > 38 chars`);
    if (st.length < 2) E(`${id}: COMPONENT_LAB needs ≥2 stages`);
    if (st.length > 4) E(`${id}: COMPONENT_LAB max 4 stages (got ${st.length})`);
    for (const s of st) {
      if (len(s.label) > 34) E(`${id}: componentLab stage "${s.label}" > 34 chars`);
      if (len(s.detail) > 30) E(`${id}: componentLab stage detail "${s.detail}" > 30 chars`);
      checkColor(id, 'componentLab.stage.color', s.color);
    }
    const gt = cl.gates ?? [];
    if (gt.length > 5) E(`${id}: COMPONENT_LAB max 5 gates (got ${gt.length})`);
    for (const g of gt) if (len(g) > 16) E(`${id}: componentLab gate "${g}" > 16 chars`);
    if (len(cl.doneLabel) > 30) E(`${id}: componentLab doneLabel > 30 chars`);
    if (len(cl.footNote) > 52) E(`${id}: componentLab footNote > 52 chars`);
    checkColor(id, 'componentLab.color', cl.color);
  }

  if (d.autoRun) {
    const ar = d.autoRun;
    const st = ar.steps ?? [];
    if (len(ar.headline) > 48) E(`${id}: autoRun headline > 48 chars`);
    if (len(ar.keyLabel) > 20) E(`${id}: autoRun keyLabel > 20 chars`);
    if (len(ar.keyMask) > 30) E(`${id}: autoRun keyMask > 30 chars`);
    // LAW 11 — a spec must never carry a real credential, not even to draw one.
    // A mask is bullets/asterisks; anything with a long run of key-shaped characters
    // is treated as a live secret and rejected outright.
    if (ar.keyMask && /(sk|pk|api|ghp|xox|AIza)[-_a-z]*[-_][A-Za-z0-9]{12,}/i.test(String(ar.keyMask)))
      E(`${id}: autoRun.keyMask looks like a REAL credential — LAW 11: mask it (e.g. "sk-••••••••") and rotate the key if it was ever live`);
    if (len(ar.modelLabel) > 22) E(`${id}: autoRun modelLabel > 22 chars`);
    const tg = ar.toggles ?? [];
    if (tg.length > 3) E(`${id}: AUTO_RUN max 3 toggles (got ${tg.length})`);
    for (const x of tg) if (len(x) > 26) E(`${id}: autoRun toggle "${x}" > 26 chars`);
    if (len(ar.runLabel) > 22) E(`${id}: autoRun runLabel > 22 chars`);
    if (len(ar.runningLabel) > 22) E(`${id}: autoRun runningLabel > 22 chars`);
    if (ar.runningLabel && !ar.runLabel) E(`${id}: AUTO_RUN has runningLabel but no runLabel to press`);
    if (st.length < 3) E(`${id}: AUTO_RUN needs ≥3 log steps — a shorter log does not read as work being done`);
    if (st.length > 7) E(`${id}: AUTO_RUN max 7 log steps (got ${st.length})`);
    for (const s of st) {
      if (len(s.label) > 40) E(`${id}: autoRun step "${s.label}" > 40 chars`);
      if (len(s.detail) > 16) E(`${id}: autoRun step detail "${s.detail}" > 16 chars`);
      checkColor(id, 'autoRun.step.color', s.color);
    }
    if (len(ar.doneLabel) > 34) E(`${id}: autoRun doneLabel > 34 chars`);
    if (len(ar.footNote) > 52) E(`${id}: autoRun footNote > 52 chars`);
    checkColor(id, 'autoRun.color', ar.color);
  }

  if (d.repoCta) {
    const rc = d.repoCta;
    if (len(rc.headline) > 48) E(`${id}: repoCta headline > 48 chars`);
    if (len(rc.owner) > 24) E(`${id}: repoCta owner > 24 chars`);
    if (len(rc.repo) > 22) E(`${id}: repoCta repo > 22 chars`);
    if (len(rc.description) > 110) E(`${id}: repoCta description > 110 chars`);
    if (!rc.url) E(`${id}: REPO_CTA needs a url — it is the one thing the viewer has to carry away`);
    if (len(rc.url) > 42) E(`${id}: repoCta url > 42 chars — it must stay readable at a glance`);
    // A CTA that sends people to a bad address is the worst possible defect here.
    if (rc.url && !/^[a-z0-9.-]+\.[a-z]{2,}\/[\w.\-/]+$/i.test(String(rc.url)))
      E(`${id}: repoCta url "${rc.url}" is not a bare host/path (write it the way a viewer would type it, e.g. "github.com/owner/repo" — no scheme, no trailing slash)`);
    const fx = rc.facts ?? [];
    if (fx.length > 4) E(`${id}: REPO_CTA max 4 facts (got ${fx.length})`);
    for (const f of fx) {
      if (len(f.label) > 22) E(`${id}: repoCta fact "${f.label}" > 22 chars`);
      // LAW 3 — a repo card is exactly where invented social proof gets added.
      if (/\b\d[\d.,]*\s*(k|m)?\s*(star|fork|download|contributor|user)s?\b/i.test(String(f.label ?? '')))
        W(`${id}: repoCta fact "${f.label}" states a popularity count — LAW 3: only ship it if it is verified today, otherwise cut it`);
      checkColor(id, 'repoCta.fact.color', f.color);
    }
    if (len(rc.footNote) > 52) E(`${id}: repoCta footNote > 52 chars`);
    checkColor(id, 'repoCta.color', rc.color);
  }

  if (d.productionGrind) {
    const pg = d.productionGrind;
    const ch = pg.chores ?? [];
    if (len(pg.headline) > 48) E(`${id}: productionGrind headline > 48 chars`);
    if (!pg.windowTitle) E(`${id}: PRODUCTION_GRIND needs windowTitle — the project has to be a real one`);
    if (len(pg.windowTitle) > 30) E(`${id}: productionGrind windowTitle > 30 chars`);
    if (len(pg.takeLabel) > 14) E(`${id}: productionGrind takeLabel > 14 chars`);
    if (ch.length < 3) E(`${id}: PRODUCTION_GRIND needs ≥3 chores — fewer does not read as toil`);
    if (ch.length > 6) E(`${id}: PRODUCTION_GRIND max 6 chores (got ${ch.length})`);
    for (const c of ch) {
      if (len(c.label) > 22) E(`${id}: productionGrind chore "${c.label}" > 22 chars`);
      if (len(c.detail) > 26) E(`${id}: productionGrind chore detail "${c.detail}" > 26 chars`);
      // The bar length and the running total are both read off `value`. A chore
      // without one draws a zero-length bar and adds nothing to the punchline.
      if (c.value == null) E(`${id}: productionGrind chore "${c.label}" has no value (hours) — its bar would be empty`);
      else if (typeof c.value !== 'number' || c.value <= 0)
        E(`${id}: productionGrind chore "${c.label}" value must be a positive number (got ${c.value})`);
      checkColor(id, 'productionGrind.chore.color', c.color);
    }
    const tr = pg.tracks ?? [];
    if (tr.length > 5) E(`${id}: PRODUCTION_GRIND max 5 tracks (got ${tr.length})`);
    for (const t of tr) if (len(t) > 14) E(`${id}: productionGrind track "${t}" > 14 chars`);
    if (len(pg.totalLabel) > 26) E(`${id}: productionGrind totalLabel > 26 chars`);
    if (len(pg.footNote) > 60) E(`${id}: productionGrind footNote > 60 chars`);
    checkColor(id, 'productionGrind.color', pg.color);
  }

  if (d.chatTrio) {
    const ct = d.chatTrio;
    const as = ct.assistants ?? [];
    if (len(ct.headline) > 48) E(`${id}: chatTrio headline > 48 chars`);
    if (as.length < 2) E(`${id}: CHAT_TRIO needs ≥2 assistants — one window does not show portability`);
    if (as.length > 3) E(`${id}: CHAT_TRIO max 3 assistants (got ${as.length})`);
    for (const a of as) {
      if (len(a.label) > 14) E(`${id}: chatTrio assistant "${a.label}" > 14 chars`);
      checkColor(id, 'chatTrio.assistant.color', a.color);
    }
    if (!ct.pasted) E(`${id}: CHAT_TRIO needs pasted (the message that lands in every window)`);
    if (len(ct.pasted) > 34) E(`${id}: chatTrio pasted "${ct.pasted}" > 34 chars`);
    if (len(ct.answerLabel) > 22) E(`${id}: chatTrio answerLabel > 22 chars`);
    if (ct.answerLines != null && (ct.answerLines < 2 || ct.answerLines > 5))
      E(`${id}: chatTrio.answerLines must be 2-5 (got ${ct.answerLines})`);
    // The ANSWER is the point of the beat: a viewer must see WHAT came back.
    // Anonymous ruled lines say "something arrived" and nothing more.
    const aj = ct.answerJson ?? [];
    if (aj.length > 7) E(`${id}: chatTrio answerJson max 7 lines (got ${aj.length})`);
    // 40 glyphs at 15px mono is ~372px — the block's width inside a 3-up wide window.
    for (const ln of aj) if (len(ln) > 40) E(`${id}: chatTrio answerJson line "${ln}" > 40 chars`);
    if (len(ct.answerFile) > 18) E(`${id}: chatTrio answerFile > 18 chars`);
    if (ct.answerFile && !aj.length)
      E(`${id}: chatTrio has answerFile but no answerJson — a filename over abstract bars names nothing`);
    if (!aj.length)
      W(`${id}: CHAT_TRIO has no answerJson — the reply renders as anonymous ruled lines, so the viewer never sees WHAT the assistants hand back`);
    if (len(ct.footNote) > 42) E(`${id}: chatTrio footNote > 42 chars`);
    checkColor(id, 'chatTrio.color', ct.color);
  }

  if (d.promptHandout) {
    const ph = d.promptHandout;
    const ls = ph.lines ?? [];
    if (len(ph.headline) > 48) E(`${id}: promptHandout headline > 48 chars`);
    if (!ph.panelTitle) E(`${id}: PROMPT_HANDOUT needs panelTitle`);
    if (len(ph.panelTitle) > 24) E(`${id}: promptHandout panelTitle > 24 chars`);
    if (ls.length < 2) E(`${id}: PROMPT_HANDOUT needs ≥2 lines (one line is not something you copy)`);
    if (ls.length > 6) E(`${id}: PROMPT_HANDOUT max 6 lines (got ${ls.length})`);
    for (const l of ls) if (len(l) > 46) E(`${id}: promptHandout line "${l}" > 46 chars`);
    if (len(ph.copyLabel) > 14) E(`${id}: promptHandout copyLabel > 14 chars`);
    if (len(ph.copiedLabel) > 16) E(`${id}: promptHandout copiedLabel > 16 chars`);
    if (ph.copiedLabel && !ph.copyLabel) E(`${id}: PROMPT_HANDOUT has copiedLabel but no copyLabel — nothing to click`);
    if (len(ph.hint) > 40) E(`${id}: promptHandout hint > 40 chars`);
    checkColor(id, 'promptHandout.color', ph.color);
  }

  if (d.appWindow) {
    const aw = d.appWindow;
    const st = aw.steps ?? [];
    const fl = aw.fields ?? [];
    if (len(aw.headline) > 48) E(`${id}: appWindow headline > 48 chars`);
    if (!aw.windowTitle) E(`${id}: APP_WINDOW needs windowTitle`);
    if (len(aw.windowTitle) > 26) E(`${id}: appWindow windowTitle > 26 chars`);
    if (st.length > 5) E(`${id}: APP_WINDOW max 5 steps (got ${st.length})`);
    for (const s of st) if (len(s) > 13) E(`${id}: appWindow step "${s}" > 13 chars`);
    if (aw.activeStep != null && (aw.activeStep < 1 || aw.activeStep > Math.max(1, st.length)))
      E(`${id}: appWindow.activeStep ${aw.activeStep} outside steps (1-${st.length})`);
    if (len(aw.screenTitle) > 26) E(`${id}: appWindow screenTitle > 26 chars`);
    if (!fl.length) E(`${id}: APP_WINDOW needs ≥1 field — an empty screen shows nothing`);
    if (fl.length > 3) E(`${id}: APP_WINDOW max 3 fields (got ${fl.length})`);
    for (const [fi, f] of fl.entries()) {
      if (len(f.label) > 16) E(`${id}: appWindow field label "${f.label}" > 16 chars`);
      if (len(f.text) > 38) E(`${id}: appWindow field text "${f.text}" > 38 chars`);
      if (f.mode && !['type', 'paste'].includes(f.mode))
        E(`${id}: appWindow field mode "${f.mode}" unknown — use "type" or "paste"`);
      const fLines = f.lines ?? [];
      if (fLines.length > 6) E(`${id}: appWindow field lines max 6 (got ${fLines.length})`);
      // 38 glyphs at 21px mono is ~490px — the field's inner width in the VERTICAL frame.
      for (const ln of fLines) if (len(ln) > 38) E(`${id}: appWindow field line "${ln}" > 38 chars`);
      if (fLines.length && f.text) E(`${id}: appWindow field ${fi} has both text and lines — pick one`);
      if (fLines.length && f.mode !== 'paste')
        W(`${id}: appWindow field ${fi} is a JSON block but not mode:"paste" — a block that types itself contradicts the gesture`);
      // The typing field cannot also be the pasted one; the component resolves this
      // in favour of paste, so a spec that says both is stating something untrue.
      if (f.mode === 'paste' && aw.typeIndex === fi)
        E(`${id}: appWindow field ${fi} is typeIndex AND mode:"paste" — it cannot be typed and pasted`);
      checkColor(id, 'appWindow.field.color', f.color);
    }
    if (aw.typeIndex != null && (aw.typeIndex < 0 || aw.typeIndex >= fl.length))
      E(`${id}: appWindow.typeIndex ${aw.typeIndex} out of range (0-${fl.length - 1})`);
    if (len(aw.button) > 18) E(`${id}: appWindow button > 18 chars`);
    if (len(aw.buttonDone) > 18) E(`${id}: appWindow buttonDone > 18 chars`);
    if (aw.buttonDone && !aw.button) E(`${id}: APP_WINDOW has buttonDone but no button to click`);
    if (len(aw.caption) > 40) E(`${id}: appWindow caption > 40 chars`);
    checkColor(id, 'appWindow.color', aw.color);
  }

  if (d.checkSweep) {
    const cs = d.checkSweep;
    const ck = cs.checks ?? [];
    if (len(cs.headline) > 48) E(`${id}: checkSweep headline > 48 chars`);
    if (!cs.subjectLabel) E(`${id}: CHECK_SWEEP needs subjectLabel`);
    if (len(cs.subjectLabel) > 22) E(`${id}: checkSweep subjectLabel > 22 chars`);
    if (ck.length < 3) E(`${id}: CHECK_SWEEP needs ≥3 checks (fewer does not read as a sweep)`);
    if (ck.length > 5) E(`${id}: CHECK_SWEEP max 5 checks (got ${ck.length})`);
    for (const c of ck) {
      if (len(c.label) > 26) E(`${id}: checkSweep check "${c.label}" > 26 chars`);
      checkColor(id, 'checkSweep.check.color', c.color);
    }
    if (cs.caughtIndex != null) {
      if (typeof cs.caughtIndex !== 'number' || cs.caughtIndex < 0 || cs.caughtIndex >= ck.length)
        E(`${id}: checkSweep.caughtIndex ${cs.caughtIndex} out of range (0-${ck.length - 1})`);
      // the repair is the whole point — a caught check with nothing said about it reads as a bug
      if (!cs.caughtNote && !cs.fixNote) E(`${id}: CHECK_SWEEP has a caughtIndex but no caughtNote/fixNote — the recovery is the content`);
    }
    if (len(cs.caughtNote) > 26) E(`${id}: checkSweep caughtNote > 26 chars`);
    if (len(cs.fixNote) > 30) E(`${id}: checkSweep fixNote > 30 chars`);
    if (len(cs.verdict) > 24) E(`${id}: checkSweep verdict > 24 chars`);
    checkColor(id, 'checkSweep.color', cs.color);
  }

  if (d.promptHandoff) {
    const ph = d.promptHandoff;
    const as = ph.assistants ?? [];
    if (len(ph.headline) > 48) E(`${id}: promptHandoff headline > 48 chars`);
    for (const k of ['outLabel', 'backLabel']) {
      if (!ph[k]) E(`${id}: PROMPT_HANDOFF needs ${k}`);
      if (len(ph[k]) > 20) E(`${id}: promptHandoff ${k} > 20 chars`);
    }
    if (as.length < 2) E(`${id}: PROMPT_HANDOFF needs ≥2 assistants — one does not read as "any of them"`);
    if (as.length > 5) E(`${id}: PROMPT_HANDOFF max 5 assistants (got ${as.length})`);
    for (const a of as) {
      if (len(a.label) > 14) E(`${id}: promptHandoff assistant "${a.label}" > 14 chars`);
      checkColor(id, 'promptHandoff.assistant.color', a.color);
    }
    if (len(ph.appLabel) > 16) E(`${id}: promptHandoff appLabel > 16 chars`);
    if (len(ph.footNote) > 40) E(`${id}: promptHandoff footNote > 40 chars`);
    checkColor(id, 'promptHandoff.color', ph.color);
  }

  if (d.topicIntake) {
    const ti = d.topicIntake;
    const ch = ti.choices ?? [];
    if (len(ti.headline) > 48) E(`${id}: topicIntake headline > 48 chars`);
    if (!ti.fieldLabel) E(`${id}: TOPIC_INTAKE needs fieldLabel`);
    if (len(ti.fieldLabel) > 20) E(`${id}: topicIntake fieldLabel > 20 chars`);
    if (!ti.typed) E(`${id}: TOPIC_INTAKE needs typed (the line that types itself in)`);
    // 44 mono glyphs is what the field fits in the NARROW vertical container at 25px
    if (len(ti.typed) > 44) E(`${id}: topicIntake typed "${ti.typed}" > 44 chars`);
    if (ch.length > 3) E(`${id}: TOPIC_INTAKE max 3 choices (got ${ch.length}) — the point is how FEW there are`);
    for (const c of ch) {
      if (len(c.label) > 12) E(`${id}: topicIntake choice label "${c.label}" > 12 chars`);
      if (len(c.detail) > 16) E(`${id}: topicIntake choice detail "${c.detail}" > 16 chars`);
      checkColor(id, 'topicIntake.choice.color', c.color);
    }
    if (len(ti.caption) > 38) E(`${id}: topicIntake caption > 38 chars`);
    checkColor(id, 'topicIntake.color', ti.color);
  }

  if (d.pipelineGate) {
    const pg = d.pipelineGate;
    if (len(pg.headline) > 48) E(`${id}: pipelineGate headline > 48 chars`);
    for (const [k, cap] of [['proposerLabel', 20], ['gateLabel', 18], ['outputLabel', 20]]) {
      if (!pg[k]) E(`${id}: PIPELINE_GATE needs ${k}`);
      if (len(pg[k]) > cap) E(`${id}: pipelineGate ${k} > ${cap} chars`);
    }
    if (len(pg.passLabel) > 12) E(`${id}: pipelineGate passLabel > 12 chars`);
    if (len(pg.rejectLabel) > 24) E(`${id}: pipelineGate rejectLabel > 24 chars`);
    if (len(pg.footNote) > 40) E(`${id}: pipelineGate footNote > 40 chars`);
    const ck = pg.checks ?? [];
    if (ck.length > 4) E(`${id}: PIPELINE_GATE max 4 checks (got ${ck.length})`);
    for (const c of ck) if (len(c) > 16) E(`${id}: pipelineGate check "${c}" > 16 chars`);
    checkColor(id, 'pipelineGate.color', pg.color);
  }

  if (d.aspectTwin) {
    const at = d.aspectTwin;
    if (len(at.headline) > 48) E(`${id}: aspectTwin headline > 48 chars`);
    if (!at.sourceLabel) E(`${id}: ASPECT_TWIN needs sourceLabel`);
    if (len(at.sourceLabel) > 22) E(`${id}: aspectTwin sourceLabel > 22 chars`);
    if (!at.wideLabel) E(`${id}: ASPECT_TWIN needs wideLabel`);
    if (len(at.wideLabel) > 20) E(`${id}: aspectTwin wideLabel > 20 chars`);
    if (!at.tallLabel) E(`${id}: ASPECT_TWIN needs tallLabel`);
    if (len(at.tallLabel) > 20) E(`${id}: aspectTwin tallLabel > 20 chars`);
    if (len(at.countLabel) > 26) E(`${id}: aspectTwin countLabel > 26 chars`);
    const vl = at.variantLabels ?? [];
    if (vl.length && vl.length !== 2) E(`${id}: aspectTwin.variantLabels must be exactly 2 (got ${vl.length})`);
    for (const v of vl) if (len(v) > 8) E(`${id}: aspectTwin variant label "${v}" > 8 chars`);
    checkColor(id, 'aspectTwin.color', at.color);
  }

  if (d.reskin) {
    const rk = d.reskin;
    const pk = rk.packs ?? [];
    if (pk.length < 3) E(`${id}: RESKIN_CAROUSEL needs ≥3 packs (fewer does not read as a range)`);
    if (pk.length > 5) E(`${id}: RESKIN_CAROUSEL max 5 packs (got ${pk.length})`);
    if (len(rk.headline) > 48) E(`${id}: reskin headline > 48 chars`);
    if (!rk.sourceLabel) E(`${id}: RESKIN_CAROUSEL needs sourceLabel`);
    if (len(rk.sourceLabel) > 24) E(`${id}: reskin sourceLabel > 24 chars`);
    if (!rk.tileTitle) E(`${id}: RESKIN_CAROUSEL needs tileTitle`);
    if (len(rk.tileTitle) > 18) E(`${id}: reskin tileTitle > 18 chars`);
    if (len(rk.footNote) > 40) E(`${id}: reskin footNote > 40 chars`);
    for (const p of pk) {
      if (len(p.label) > 14) E(`${id}: reskin pack label "${p.label}" > 14 chars`);
      checkColor(id, 'reskin.pack.color', p.color);
    }
  }

  if (d.anchorRail) {
    const ar = d.anchorRail;
    const ws = ar.words ?? [];
    const mk = ar.marks ?? [];
    if (ws.length < 4) E(`${id}: WORD_ANCHOR_RAIL needs ≥4 words`);
    if (ws.length > 8) E(`${id}: WORD_ANCHOR_RAIL max 8 words (got ${ws.length})`);
    for (const w of ws) if (len(w) > 10) E(`${id}: anchorRail word "${w}" > 10 chars`);
    if (!mk.length) E(`${id}: WORD_ANCHOR_RAIL needs ≥1 mark`);
    if (mk.length > 3) E(`${id}: WORD_ANCHOR_RAIL max 3 marks (got ${mk.length})`);
    for (const m of mk) {
      if (len(m.label) > 18) E(`${id}: anchorRail mark label "${m.label}" > 18 chars`);
      if (typeof m.atWord !== 'number' || m.atWord < 1 || m.atWord > ws.length) E(`${id}: anchorRail mark atWord ${m.atWord} outside words[] (1-${ws.length})`);
      checkColor(id, 'anchorRail.mark.color', m.color);
    }
    if (ar.playhead != null && (ar.playhead < 1 || ar.playhead > ws.length)) E(`${id}: anchorRail.playhead ${ar.playhead} outside words[] (1-${ws.length})`);
    if (len(ar.headline) > 48) E(`${id}: anchorRail headline > 48 chars`);
    if (len(ar.footNote) > 40) E(`${id}: anchorRail footNote > 40 chars`);
    checkColor(id, 'anchorRail.color', ar.color);
  }

  if (d.budgetMeter) {
    const bm = d.budgetMeter;
    const rw = bm.rows ?? [];
    const us = bm.used ?? [];
    if (rw.length < 2) E(`${id}: BUDGET_METER_ROW needs ≥2 rows`);
    if (rw.length > 4) E(`${id}: BUDGET_METER_ROW max 4 rows (got ${rw.length})`);
    if (us.length !== rw.length) E(`${id}: budgetMeter.used has ${us.length} values for ${rw.length} rows — must be parallel`);
    if (typeof bm.cap !== 'number' || bm.cap <= 0) E(`${id}: BUDGET_METER_ROW needs a positive cap`);
    for (const v of us) if (typeof v !== 'number' || v < 0) E(`${id}: budgetMeter.used values must be numbers ≥0`);
    if (len(bm.headline) > 48) E(`${id}: budgetMeter headline > 48 chars`);
    if (len(bm.capLabel) > 20) E(`${id}: budgetMeter capLabel > 20 chars`);
    if (len(bm.rejectNote) > 34) E(`${id}: budgetMeter rejectNote > 34 chars`);
    for (const r of rw) {
      if (len(r.label) > 8) E(`${id}: budgetMeter row label "${r.label}" > 8 chars`);
      if (len(r.text) > 40) E(`${id}: budgetMeter row text "${r.text}" > 40 chars`);
      checkColor(id, 'budgetMeter.row.color', r.color);
    }
    checkColor(id, 'budgetMeter.color', bm.color);
  }

  if (d.labAssembly) {
    const la = d.labAssembly;
    const st = la.stages ?? [];
    if (st.length < 3) E(`${id}: LAB_ASSEMBLY needs ≥3 stages`);
    if (st.length > 5) E(`${id}: LAB_ASSEMBLY max 5 stages (got ${st.length})`);
    if (len(la.headline) > 48) E(`${id}: labAssembly headline > 48 chars`);
    if (len(la.verdict) > 24) E(`${id}: labAssembly verdict > 24 chars`);
    if (len(la.rollbackNote) > 34) E(`${id}: labAssembly rollbackNote > 34 chars`);
    for (const s of st) {
      if (len(s.label) > 16) E(`${id}: labAssembly stage label "${s.label}" > 16 chars`);
      if (len(s.detail) > 22) E(`${id}: labAssembly stage detail "${s.detail}" > 22 chars`);
      checkColor(id, 'labAssembly.stage.color', s.color);
    }
    checkColor(id, 'labAssembly.color', la.color);
  }

  if (d.castBoard) {
    const cb = d.castBoard;
    const cands = cb.candidates ?? [];
    if (cands.length < 2) E(`${id}: CAST_BOARD needs ≥2 candidates (the rejected ones are the point)`);
    if (cands.length > 4) E(`${id}: CAST_BOARD max 4 candidates (got ${cands.length})`);
    if (typeof cb.chosenIndex !== 'number') E(`${id}: CAST_BOARD needs chosenIndex`);
    else if (cb.chosenIndex < 0 || cb.chosenIndex >= cands.length) E(`${id}: castBoard.chosenIndex ${cb.chosenIndex} out of range (0-${cands.length - 1})`);
    if (len(cb.headline) > 48) E(`${id}: castBoard headline > 48 chars`);
    if (!cb.beatLabel) E(`${id}: CAST_BOARD needs beatLabel`);
    if (len(cb.beatLabel) > 26) E(`${id}: castBoard beatLabel > 26 chars`);
    if (len(cb.verdict) > 30) E(`${id}: castBoard verdict > 30 chars`);
    for (const c of cands) {
      if (len(c.label) > 18) E(`${id}: castBoard candidate label "${c.label}" > 18 chars`);
      if (len(c.detail) > 34) E(`${id}: castBoard candidate detail "${c.detail}" > 34 chars`);
      checkColor(id, 'castBoard.candidate.color', c.color);
    }
    checkColor(id, 'castBoard.color', cb.color);
  }

  if (d.specToFrame) {
    const s2f = d.specToFrame;
    const lines = s2f.specLines ?? [];
    if (!lines.length) E(`${id}: SPEC_TO_FRAME needs ≥1 specLines entry`);
    if (lines.length > 6) E(`${id}: SPEC_TO_FRAME max 6 specLines (got ${lines.length})`);
    // budgets sized to the NARROW vertical container
    for (const l of lines) if (len(l) > 30) E(`${id}: specLines entry "${l}" > 30 chars`);
    if (len(s2f.headline) > 48) E(`${id}: specToFrame headline > 48 chars`);
    if (!s2f.frameLabel) E(`${id}: SPEC_TO_FRAME needs frameLabel`);
    if (len(s2f.frameLabel) > 22) E(`${id}: specToFrame frameLabel > 22 chars`);
    if (len(s2f.specCaption) > 18) E(`${id}: specToFrame specCaption > 18 chars`);
    if (len(s2f.frameCaption) > 18) E(`${id}: specToFrame frameCaption > 18 chars`);
    const fb = s2f.frameBars ?? [];
    if (fb.length > 5) E(`${id}: SPEC_TO_FRAME max 5 frameBars`);
    for (const v of fb) if (typeof v !== 'number' || v < 0 || v > 100) E(`${id}: frameBars values must be numbers 0-100`);
    checkColor(id, 'specToFrame.color', s2f.color);
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
  if (d.codeRun) {
    const cr = d.codeRun;
    const rl = cr.lines ?? [];
    if (rl.length < 2) E(`${id}: CODE_RUN needs >=2 lines`);
    if (rl.length > 10) E(`${id}: CODE_RUN max 10 lines (got ${rl.length}) — split the beat`);
    for (const l of rl) {
      // budgets sized to the NARROWEST container (vertical, 980px pane, mono 25px)
      if (len(l.text) > 42) E(`${id}: CODE_RUN line "${(l.text ?? '').slice(0, 24)}…" > 42 chars`);
      if (len(l.detail) > 34) E(`${id}: CODE_RUN note "${(l.detail ?? '').slice(0, 24)}…" > 34 chars`);
      if (len(l.sub) > 30) E(`${id}: CODE_RUN result "${(l.sub ?? '').slice(0, 24)}…" > 30 chars`);
      if (len(l.label) > 8) E(`${id}: CODE_RUN result tag "${l.label}" > 8 chars`);
      checkColor(id, 'codeRun.line.color', l.color);
    }
    if (len(cr.filename) > 26) E(`${id}: CODE_RUN filename > 26 chars`);
    if (len(cr.resultLabel) > 18) E(`${id}: CODE_RUN resultLabel > 18 chars`);
    if (len(cr.caption) > 40) E(`${id}: CODE_RUN caption > 40 chars`);
    checkColor(id, 'codeRun.color', cr.color);
    // The POINT of this component is stepping. Fewer than 2 distinct anchors means the
    // block just sits there — that is CODE_WINDOW, and it should say so.
    const anchors = [...new Set(rl.map((l) => l.atWord).filter((a) => a != null))];
    if (anchors.length < 2)
      E(`${id}: CODE_RUN has ${anchors.length} anchored line(s) — it is not stepping. Give each taught line its own atWord, or use CODE_WINDOW.`);
    // TEACHING PACE (owner rule 2026-08-13): a taught line needs >=4s on screen.
    // Continuation lines share their head's anchor, so measure DISTINCT anchors.
    if (anchors.length && s.durationFrames) {
      const perLine = s.durationFrames / anchors.length;
      if (perLine < 120)
        W(`${id}: CODE_RUN gives ${(perLine / 30).toFixed(1)}s per taught line (need >=4s). Explain fewer lines per beat, or say more about each.`);
    }
  }
  if (d.handStamp) {
    const hs = d.handStamp;
    const ts3 = hs.tests ?? [];
    const stamped = hs.mode === 'stamped';
    if (!hs.toll) E(`${id}: HAND_STAMP needs a toll — what each one pays at the door`);
    if (len(hs.toll) > 22) E(`${id}: HAND_STAMP toll > 22 chars`);
    if (hs.mode != null && !['everyone-pays', 'stamped'].includes(hs.mode))
      E(`${id}: HAND_STAMP mode must be 'everyone-pays' or 'stamped' (got "${hs.mode}")`);
    if (len(hs.stampLabel) > 20) E(`${id}: HAND_STAMP stampLabel > 20 chars`);
    if (len(hs.doorLabel) > 20) E(`${id}: HAND_STAMP doorLabel > 20 chars`);
    if (len(hs.totalLabel) > 24) E(`${id}: HAND_STAMP totalLabel > 24 chars`);
    if (len(hs.flakyNote) > 26) E(`${id}: HAND_STAMP flakyNote > 26 chars`);
    if (len(hs.caption) > 44) E(`${id}: HAND_STAMP caption > 44 chars`);
    checkColor(id, 'handStamp.color', hs.color);
    if (ts3.length < 3) E(`${id}: HAND_STAMP needs >=3 tests — a queue of two shows no repetition`);
    if (ts3.length > 5) E(`${id}: HAND_STAMP max 5 tests (got ${ts3.length})`);
    let flaky = 0;
    for (const tt of ts3) {
      const k = (tt.title ?? '').toLowerCase();
      if (k && k !== 'flaky') E(`${id}: HAND_STAMP test title "${tt.title}" must be 'flaky' or omitted`);
      if (k === 'flaky') flaky++;
      if (len(tt.label) > 20) E(`${id}: HAND_STAMP test "${tt.label}" > 20 chars`);
      if (tt.atWord == null) E(`${id}: HAND_STAMP test "${tt.label}" needs atWord — the queue moves one at a time`);
    }
    if (flaky > 1) E(`${id}: HAND_STAMP marks ${flaky} tests flaky — one wobbler makes the point, more reads as a broken suite`);
    // In 'stamped' mode nobody fails at the door — that IS the fix. A flaky marker there
    // would say the stamp did not help, which is the opposite of the beat.
    if (stamped && flaky) E(`${id}: HAND_STAMP 'stamped' mode cannot have a flaky test — the whole point is that nobody queues at the door`);
    if (stamped && !hs.stampLabel) W(`${id}: HAND_STAMP 'stamped' mode without a stampLabel — name the saved file, it is the thing being reused.`);
    if (hs.settleAtWord != null) {
      const last = Math.max(...ts3.map((x) => x.atWord ?? 0));
      if (hs.settleAtWord <= last)
        E(`${id}: HAND_STAMP settleAtWord (${hs.settleAtWord}) must come after the LAST test (${last})`);
    }
  }
  if (d.frozenFrame) {
    const ff = d.frozenFrame;
    const ls = ff.lines ?? [];
    const pi = ff.pageItems ?? [];
    if (len(ff.filename) > 26) E(`${id}: FROZEN_FRAME filename > 26 chars`);
    if (len(ff.screenTitle) > 22) E(`${id}: FROZEN_FRAME screenTitle > 22 chars`);
    if (len(ff.inspectorLabel) > 24) E(`${id}: FROZEN_FRAME inspectorLabel > 24 chars`);
    if (len(ff.stepLabel) > 22) E(`${id}: FROZEN_FRAME stepLabel > 22 chars`);
    if (len(ff.note) > 32) E(`${id}: FROZEN_FRAME note > 32 chars`);
    if (len(ff.caption) > 44) E(`${id}: FROZEN_FRAME caption > 44 chars`);
    checkColor(id, 'frozenFrame.color', ff.color);
    if (ls.length < 3) E(`${id}: FROZEN_FRAME needs >=3 lines — a freeze needs something running before it and something waiting after`);
    if (ls.length > 6) E(`${id}: FROZEN_FRAME max 6 lines (got ${ls.length})`);
    if (pi.length > 3) E(`${id}: FROZEN_FRAME max 3 pageItems (got ${pi.length})`);
    for (const x of pi) if (len(x) > 22) E(`${id}: FROZEN_FRAME page item "${x}" > 22 chars`);
    let freeze = -1;
    for (let i = 0; i < ls.length; i++) {
      const k = (ls[i].title ?? '').toLowerCase();
      if (k && k !== 'freeze') E(`${id}: FROZEN_FRAME line title "${ls[i].title}" must be 'freeze' or omitted`);
      if (k === 'freeze') {
        if (freeze >= 0) E(`${id}: FROZEN_FRAME marks two lines 'freeze' — the run stops once`);
        freeze = i;
      }
      if (len(ls[i].text) > 38) E(`${id}: FROZEN_FRAME line "${ls[i].text}" > 38 chars`);
      if (len(ls[i].sub) > 24) E(`${id}: FROZEN_FRAME line note "${ls[i].sub}" > 24 chars`);
      if (ls[i].atWord == null) E(`${id}: FROZEN_FRAME line "${ls[i].text}" needs atWord — the playhead has to visibly move before it stops`);
    }
    // The stillness only reads if something was moving, and only matters if something is waiting.
    if (freeze < 0) E(`${id}: FROZEN_FRAME has no 'freeze' line — without one this is just a script running, which CODE_RUN already does`);
    if (freeze === 0) E(`${id}: FROZEN_FRAME freezes on the FIRST line — nothing has moved yet, so there is no stillness to see`);
    if (freeze === ls.length - 1) E(`${id}: FROZEN_FRAME freezes on the LAST line — with nothing left waiting, stepping forward has nowhere to go`);
    if (ff.stepAtWord != null && freeze >= 0) {
      const fw = ls[freeze].atWord ?? 0;
      if (ff.stepAtWord <= fw)
        E(`${id}: FROZEN_FRAME stepAtWord (${ff.stepAtWord}) must come after the freeze line (${fw})`);
    }
  }
  if (d.recordDraft) {
    const rd = d.recordDraft;
    const ac = rd.actions ?? [];
    const ms = rd.missing ?? [];
    if (len(rd.sourceLabel) > 24) E(`${id}: RECORD_DRAFT sourceLabel > 24 chars`);
    if (len(rd.outputLabel) > 24) E(`${id}: RECORD_DRAFT outputLabel > 24 chars`);
    if (len(rd.verdict) > 36) E(`${id}: RECORD_DRAFT verdict > 36 chars`);
    if (len(rd.caption) > 44) E(`${id}: RECORD_DRAFT caption > 44 chars`);
    checkColor(id, 'recordDraft.color', rd.color);
    if (ac.length < 2) E(`${id}: RECORD_DRAFT needs >=2 actions — one action shows no recording`);
    if (ac.length > 5) E(`${id}: RECORD_DRAFT max 5 actions (got ${ac.length})`);
    if (ms.length > 3) E(`${id}: RECORD_DRAFT max 3 missing items (got ${ms.length})`);
    for (const x of ms) if (len(x) > 22) E(`${id}: RECORD_DRAFT missing item "${x}" > 22 chars`);
    let keeps = 0, drops = 0;
    for (const x of ac) {
      const k = (x.title ?? 'drop').toLowerCase();
      if (!['keep', 'drop'].includes(k)) E(`${id}: RECORD_DRAFT action title "${x.title}" must be 'keep' or 'drop'`);
      k === 'keep' ? keeps++ : drops++;
      if (len(x.label) > 24) E(`${id}: RECORD_DRAFT action "${x.label}" > 24 chars`);
      if (len(x.text) > 38) E(`${id}: RECORD_DRAFT generated line "${x.text}" > 38 chars`);
      if (len(x.sub) > 24) E(`${id}: RECORD_DRAFT reason "${x.sub}" > 24 chars`);
      if (x.atWord == null) E(`${id}: RECORD_DRAFT action "${x.label}" needs atWord — the code lands one line at a time`);
    }
    // The whole shape is "half of this is a gift, half you throw away". Either half missing
    // turns the beat into an advert for the tool or a dismissal of it, and both are wrong.
    if (!keeps) E(`${id}: RECORD_DRAFT keeps nothing — if none of the output is worth having, the tool is not worth a beat`);
    if (!drops) E(`${id}: RECORD_DRAFT drops nothing — that sells the generated output as a finished test, which is the defect this component exists to show`);
    if (rd.verdictAtWord != null) {
      const last = Math.max(...ac.map((x) => x.atWord ?? 0));
      if (rd.verdictAtWord <= last)
        E(`${id}: RECORD_DRAFT verdictAtWord (${rd.verdictAtWord}) must come after the last action (${last}) — you cannot judge a draft mid-recording`);
    }
  }
  if (d.workerSpread) {
    const ws = d.workerSpread;
    const ln = ws.lanes ?? [];
    const it = ws.items ?? [];
    if (len(ws.queueLabel) > 24) E(`${id}: WORKER_SPREAD queueLabel > 24 chars`);
    if (len(ws.beforeLabel) > 22) E(`${id}: WORKER_SPREAD beforeLabel > 22 chars`);
    if (len(ws.afterLabel) > 22) E(`${id}: WORKER_SPREAD afterLabel > 22 chars`);
    if (len(ws.note) > 34) E(`${id}: WORKER_SPREAD note > 34 chars`);
    if (len(ws.caption) > 44) E(`${id}: WORKER_SPREAD caption > 44 chars`);
    checkColor(id, 'workerSpread.color', ws.color);
    if (ln.length < 2) E(`${id}: WORKER_SPREAD needs >=2 lanes — one lane is not parallel`);
    if (ln.length > 4) E(`${id}: WORKER_SPREAD max 4 lanes (got ${ln.length}) — they share one row and the pills stop being readable`);
    for (const x of ln) {
      if (len(x.label) > 16) E(`${id}: WORKER_SPREAD lane "${x.label}" > 16 chars`);
      if (len(x.sub) > 20) E(`${id}: WORKER_SPREAD lane sub "${x.sub}" > 20 chars`);
      if (len(x.detail) > 8) E(`${id}: WORKER_SPREAD lane finish time "${x.detail}" > 8 chars`);
      if (x.atWord == null) E(`${id}: WORKER_SPREAD lane "${x.label}" needs atWord — the lanes open one at a time`);
    }
    if (it.length > 6) E(`${id}: WORKER_SPREAD max 6 items (got ${it.length}) — the queue is a sample, not the whole suite`);
    for (const x of it) if (len(x) > 18) E(`${id}: WORKER_SPREAD queue item "${x}" > 18 chars`);
    // The comparison is the beat. One number alone is a claim; two is an argument.
    if (ws.afterLabel && !ws.beforeLabel)
      E(`${id}: WORKER_SPREAD has an afterLabel with no beforeLabel — the collapse in wall time only reads against the sequential number`);
    if (ws.afterAtWord != null) {
      const last = Math.max(...ln.map((x) => x.atWord ?? 0));
      if (ws.afterAtWord <= last)
        E(`${id}: WORKER_SPREAD afterAtWord (${ws.afterAtWord}) must come after the last lane (${last}) — the total lands when the work is dealt`);
    }
    if (!ws.note)
      W(`${id}: WORKER_SPREAD without a note — parallelism is only legal because the work is independent; say so, or the beat teaches a foot-gun.`);
  }
  if (d.orderRoulette) {
    const or = d.orderRoulette;
    const rs = or.runs ?? [];
    if (!or.dependency) E(`${id}: ORDER_ROULETTE needs a dependency — the assumption being made`);
    if (len(or.dependency) > 40) E(`${id}: ORDER_ROULETTE dependency > 40 chars`);
    if (len(or.producer) > 22) E(`${id}: ORDER_ROULETTE producer > 22 chars`);
    if (len(or.consumer) > 22) E(`${id}: ORDER_ROULETTE consumer > 22 chars`);
    if (len(or.verdict) > 34) E(`${id}: ORDER_ROULETTE verdict > 34 chars`);
    if (len(or.fix) > 34) E(`${id}: ORDER_ROULETTE fix > 34 chars`);
    if (len(or.caption) > 44) E(`${id}: ORDER_ROULETTE caption > 44 chars`);
    checkColor(id, 'orderRoulette.color', or.color);
    if (rs.length < 2) E(`${id}: ORDER_ROULETTE needs >=2 runs — one run cannot show a roulette`);
    if (rs.length > 4) E(`${id}: ORDER_ROULETTE max 4 runs (got ${rs.length})`);
    let pass = 0, fail = 0;
    for (const x of rs) {
      const k = (x.title ?? 'fail').toLowerCase();
      if (!['pass', 'fail'].includes(k)) E(`${id}: ORDER_ROULETTE run title "${x.title}" must be 'pass' or 'fail'`);
      k === 'pass' ? pass++ : fail++;
      if (len(x.label) > 14) E(`${id}: ORDER_ROULETTE run label "${x.label}" > 14 chars`);
      if (len(x.text) > 26) E(`${id}: ORDER_ROULETTE run order "${x.text}" > 26 chars`);
      if (len(x.sub) > 22) E(`${id}: ORDER_ROULETTE run note "${x.sub}" > 22 chars`);
      if (x.atWord == null) E(`${id}: ORDER_ROULETTE run "${x.label}" needs atWord — the deals happen one after another`);
    }
    // A roulette that always lands the same way is not a roulette — it is a bug with a fix, which
    // is the exact misreading this component exists to prevent.
    if (!pass) E(`${id}: ORDER_ROULETTE has no passing run — all-fail reads as a broken test somebody can fix, not as a coin flip`);
    if (!fail) E(`${id}: ORDER_ROULETTE has no failing run — with nothing going wrong there is no hazard being shown`);
    if (or.verdictAtWord != null) {
      const last = Math.max(...rs.map((x) => x.atWord ?? 0));
      if (or.verdictAtWord <= last)
        E(`${id}: ORDER_ROULETTE verdictAtWord (${or.verdictAtWord}) must come after the last run (${last})`);
    }
  }
  if (d.searchNarrow) {
    const sn = d.searchNarrow;
    const lk = sn.links ?? [];
    if (!sn.rootLabel) E(`${id}: SEARCH_NARROW needs a rootLabel — the widest scope you start from`);
    if (len(sn.rootLabel) > 24) E(`${id}: SEARCH_NARROW rootLabel > 24 chars`);
    if (!sn.target) E(`${id}: SEARCH_NARROW needs a target — the thing the chain finally lands on`);
    if (len(sn.target) > 24) E(`${id}: SEARCH_NARROW target > 24 chars`);
    if (len(sn.targetAction) > 16) E(`${id}: SEARCH_NARROW targetAction > 16 chars`);
    if (len(sn.caption) > 44) E(`${id}: SEARCH_NARROW caption > 44 chars`);
    checkColor(id, 'searchNarrow.color', sn.color);
    if (lk.length < 2) E(`${id}: SEARCH_NARROW needs >=2 links — one link is not a chain`);
    if (lk.length > 4) E(`${id}: SEARCH_NARROW max 4 links (got ${lk.length}) — each one indents, and the target runs off the edge`);
    for (const x of lk) {
      if (!x.text) E(`${id}: SEARCH_NARROW link "${x.label}" needs text — the region it enters`);
      if (len(x.label) > 34) E(`${id}: SEARCH_NARROW link "${x.label}" > 34 chars`);
      if (len(x.text) > 20) E(`${id}: SEARCH_NARROW region "${x.text}" > 20 chars`);
      if (len(x.sub) > 20) E(`${id}: SEARCH_NARROW sibling "${x.sub}" > 20 chars`);
      if (len(x.detail) > 28) E(`${id}: SEARCH_NARROW direction "${x.detail}" > 28 chars`);
      if (x.atWord == null) E(`${id}: SEARCH_NARROW link "${x.label}" needs atWord — the narrowing happens one step at a time`);
    }
    // Links must fire in order or the indentation contradicts the voice: level 3 cannot open
    // before the search has entered level 2.
    for (let i = 1; i < lk.length; i++)
      if ((lk[i].atWord ?? 0) <= (lk[i - 1].atWord ?? 0))
        E(`${id}: SEARCH_NARROW link ${i + 1} fires at or before link ${i} — a chain narrows in order`);
    if (sn.targetAtWord != null) {
      const last = Math.max(...lk.map((x) => x.atWord ?? 0));
      if (sn.targetAtWord <= last)
        E(`${id}: SEARCH_NARROW targetAtWord (${sn.targetAtWord}) must come after the last link (${last})`);
    }
    if (!lk.some((x) => x.sub))
      W(`${id}: SEARCH_NARROW with no siblings on any level — with nothing to walk past, the search never visibly narrows.`);
  }
  if (d.uvStage) {
    const u = d.uvStage;
    const KINDS = ['pkg-parcel','pkg-index','dep-unfold','shelf-share','shelf-evict','shelf-split','two-projects','env-ceremony'];
    const term = u.layout === 'terminal';
    // The kind is only read in split layout; a terminal-only beat draws no depiction.
    if (!term && !u.kind) E(`${id}: UV_STAGE needs a kind (or layout:"terminal")`);
    if (!term && u.kind && !KINDS.includes(u.kind))
      E(`${id}: UV_STAGE unknown kind "${u.kind}" — must be one of ${KINDS.join(', ')}. It would render as UNKNOWN DEPICTION KIND.`);
    if (u.layout && !['split','terminal'].includes(u.layout))
      E(`${id}: UV_STAGE layout must be "split" or "terminal"`);
    if (len(u.headline) > 48) E(`${id}: UV_STAGE headline > 48 chars`);
    if (len(u.premise) > 120) E(`${id}: UV_STAGE premise > 120 chars — it must stay readable at a glance (LAW 0l)`);
    if (len(u.stageTitle) > 30) E(`${id}: UV_STAGE stageTitle > 30 chars`);
    if (len(u.verdict) > 40) E(`${id}: UV_STAGE verdict > 40 chars`);
    if (len(u.verdictSub) > 48) E(`${id}: UV_STAGE verdictSub > 48 chars`);
    if (len(u.token) > 28) E(`${id}: UV_STAGE token > 28 chars`);
    if (len(u.promptLabel) > 26) E(`${id}: UV_STAGE promptLabel > 26 chars`);
    if (len(u.cwd) > 26) E(`${id}: UV_STAGE cwd > 26 chars`);
    checkColor(id, 'uvStage.color', u.color);
    const st = u.steps ?? [];
    if (st.length > 5) E(`${id}: UV_STAGE max 5 steps (got ${st.length})`);
    if (term && !st.length) E(`${id}: UV_STAGE layout:"terminal" with no steps draws an empty screen`);
    for (const x of st) {
      if (len(x.label) > 44) E(`${id}: UV_STAGE step "${x.label}" > 44 chars`);
      if (len(x.detail) > 48) E(`${id}: UV_STAGE step detail > 48 chars`);
      for (const o of x.out ?? []) if (len(o) > 62) E(`${id}: UV_STAGE output line > 62 chars — trim the real output, never shrink the type (LAW 0m)`);
      if ((x.out ?? []).length > 9) E(`${id}: UV_STAGE step has ${x.out.length} output lines (max 9)`);
      if (x.atWord == null) W(`${id}: UV_STAGE step "${x.label}" has no atWord — it will type immediately instead of on its word (LAW 0i)`);
    }
    const sg = u.stage ?? [];
    if (sg.length > 10) E(`${id}: UV_STAGE max 10 stage items (got ${sg.length})`);
    for (const x of sg) {
      if (len(x.label) > 22) E(`${id}: UV_STAGE stage label "${x.label}" > 22 chars`);
      if (len(x.text) > 14) E(`${id}: UV_STAGE stage text "${x.text}" > 14 chars`);
      if (len(x.sub) > 54) E(`${id}: UV_STAGE stage sub > 54 chars`);
      if (len(x.detail) > 34) E(`${id}: UV_STAGE stage detail > 34 chars`);
      checkColor(id, 'uvStage.stage.color', x.color);
    }
    // Minimum items each depiction needs to say anything at all. Below these it renders
    // a half-picture that still looks deliberate, which is the worst failure mode.
    const NEED = {'pkg-parcel':1,'pkg-index':1,'dep-unfold':2,'shelf-share':3,'shelf-evict':2,'shelf-split':2,'two-projects':2,'env-ceremony':2};
    if (!term && u.kind && NEED[u.kind] && sg.length < NEED[u.kind])
      E(`${id}: UV_STAGE kind "${u.kind}" needs >= ${NEED[u.kind]} stage item(s), got ${sg.length}`);
  }
  if (d.setLogic) {
    const sl = d.setLogic;
    const cd = sl.candidates ?? [];
    if (!sl.op) E(`${id}: SET_LOGIC needs an op — the operator being applied`);
    if (len(sl.op) > 22) E(`${id}: SET_LOGIC op > 22 chars`);
    if (len(sl.opNote) > 32) E(`${id}: SET_LOGIC opNote > 32 chars`);
    if (len(sl.countLabel) > 22) E(`${id}: SET_LOGIC countLabel > 22 chars`);
    if (len(sl.verdict) > 30) E(`${id}: SET_LOGIC verdict > 30 chars`);
    if (len(sl.caption) > 44) E(`${id}: SET_LOGIC caption > 44 chars`);
    checkColor(id, 'setLogic.color', sl.color);
    const cr = sl.criteria ?? [];
    if (cr.length > 2) E(`${id}: SET_LOGIC max 2 criteria (got ${cr.length})`);
    for (const c of cr) if (len(c) > 24) E(`${id}: SET_LOGIC criterion "${c}" > 24 chars`);
    if (cd.length < 3) E(`${id}: SET_LOGIC needs >=3 candidates — a set of two shows no selection`);
    if (cd.length > 6) E(`${id}: SET_LOGIC max 6 candidates (got ${cd.length})`);
    let keeps = 0;
    for (const x of cd) {
      const k = (x.title ?? 'drop').toLowerCase();
      if (!['keep', 'drop'].includes(k)) E(`${id}: SET_LOGIC candidate title "${x.title}" must be 'keep' or 'drop'`);
      if (k === 'keep') keeps++;
      if (len(x.label) > 22) E(`${id}: SET_LOGIC candidate "${x.label}" > 22 chars`);
      if (len(x.sub) > 26) E(`${id}: SET_LOGIC candidate props "${x.sub}" > 26 chars`);
      if (x.atWord == null) E(`${id}: SET_LOGIC candidate "${x.label}" needs atWord — they resolve one at a time`);
    }
    // An operator that keeps everything, or nothing, is not a selection — it is a list.
    if (!keeps) E(`${id}: SET_LOGIC drops every candidate — nothing surviving teaches nothing about the operator`);
    if (keeps === cd.length) E(`${id}: SET_LOGIC keeps every candidate — an operator that rejects nothing is not doing any work`);
    // The count renders as a bare number followed by countLabel, so a plural label reads
    // "1 locators matched" when exactly one survives. Caught on a shipped frame.
    if (keeps === 1 && sl.countLabel) {
      const head = sl.countLabel.trim().split(/\s+/)[0].toLowerCase();
      if (/s$/.test(head) && !/(ss|is|was|has|less|this)$/.test(head))
        W(`${id}: SET_LOGIC countLabel "${sl.countLabel}" reads as "1 ${sl.countLabel}" — one candidate survives, so the label must work in the singular.`);
    }
    if (sl.verdictAtWord != null) {
      const last = Math.max(...cd.map((x) => x.atWord ?? 0));
      if (sl.verdictAtWord <= last)
        E(`${id}: SET_LOGIC verdictAtWord (${sl.verdictAtWord}) must come after the last candidate (${last})`);
    }
  }
  if (d.sealedBox) {
    const sb = d.sealedBox;
    const pb = sb.probes ?? [];
    if (!sb.boxLabel) E(`${id}: SEALED_BOX needs a boxLabel — the sealed thing`);
    if (len(sb.boxLabel) > 24) E(`${id}: SEALED_BOX boxLabel > 24 chars`);
    if (!sb.contents) E(`${id}: SEALED_BOX needs contents — what is sealed inside`);
    if (len(sb.contents) > 26) E(`${id}: SEALED_BOX contents > 26 chars`);
    if (len(sb.wallLabel) > 22) E(`${id}: SEALED_BOX wallLabel > 22 chars`);
    if (len(sb.blockedNote) > 30) E(`${id}: SEALED_BOX blockedNote > 30 chars`);
    if (len(sb.verdict) > 32) E(`${id}: SEALED_BOX verdict > 32 chars`);
    if (len(sb.caption) > 44) E(`${id}: SEALED_BOX caption > 44 chars`);
    checkColor(id, 'sealedBox.color', sb.color);
    if (pb.length < 2) E(`${id}: SEALED_BOX needs >=2 probes — one probe cannot show a rule and its exception`);
    if (pb.length > 5) E(`${id}: SEALED_BOX max 5 probes (got ${pb.length})`);
    let through = 0, blocked = 0;
    for (const x of pb) {
      const k = (x.title ?? 'through').toLowerCase();
      if (!['through', 'blocked'].includes(k)) E(`${id}: SEALED_BOX probe title "${x.title}" must be 'through' or 'blocked'`);
      k === 'blocked' ? blocked++ : through++;
      if (len(x.label) > 30) E(`${id}: SEALED_BOX probe "${x.label}" > 30 chars`);
      if (len(x.sub) > 24) E(`${id}: SEALED_BOX probe note "${x.sub}" > 24 chars`);
      if (x.atWord == null) E(`${id}: SEALED_BOX probe "${x.label}" needs atWord — they arrive one at a time`);
    }
    // The whole shape is "the rule, then the exception". Either half missing inverts the lesson:
    // all-blocked reads as a wall you cannot get through, all-through as a boundary with no catch.
    if (!through) E(`${id}: SEALED_BOX has no 'through' probe — with nothing piercing, the box reads as a wall, which is the opposite lesson`);
    if (blocked > 1) E(`${id}: SEALED_BOX marks ${blocked} probes blocked — the point is ONE exception; more and it reads as a general barrier`);
    if (!blocked) W(`${id}: SEALED_BOX with no 'blocked' probe — nothing is being excepted, so this is a beat about a boundary that does not matter.`);
    if (sb.verdictAtWord != null) {
      const last = Math.max(...pb.map((x) => x.atWord ?? 0));
      if (sb.verdictAtWord <= last)
        E(`${id}: SEALED_BOX verdictAtWord (${sb.verdictAtWord}) must come after the last probe (${last})`);
    }
  }
  if (d.backstagePhone) {
    const bp = d.backstagePhone;
    const st = bp.steps ?? [];
    if (!bp.question) E(`${id}: BACKSTAGE_PHONE needs a question — both routes must be answering the same thing`);
    if (len(bp.question) > 40) E(`${id}: BACKSTAGE_PHONE question > 40 chars`);
    if (!bp.hop) E(`${id}: BACKSTAGE_PHONE needs a hop — the one direct call`);
    if (len(bp.hop) > 34) E(`${id}: BACKSTAGE_PHONE hop > 34 chars`);
    if (len(bp.hopTime) > 8) E(`${id}: BACKSTAGE_PHONE hopTime > 8 chars`);
    if (len(bp.stageTime) > 8) E(`${id}: BACKSTAGE_PHONE stageTime > 8 chars`);
    if (len(bp.stageLabel) > 22) E(`${id}: BACKSTAGE_PHONE stageLabel > 22 chars`);
    if (len(bp.hopLabel) > 22) E(`${id}: BACKSTAGE_PHONE hopLabel > 22 chars`);
    if (len(bp.verdict) > 26) E(`${id}: BACKSTAGE_PHONE verdict > 26 chars`);
    if (len(bp.caption) > 44) E(`${id}: BACKSTAGE_PHONE caption > 44 chars`);
    checkColor(id, 'backstagePhone.color', bp.color);
    if (st.length < 2) E(`${id}: BACKSTAGE_PHONE needs >=2 steps — one step is not "the long way round"`);
    if (st.length > 5) E(`${id}: BACKSTAGE_PHONE max 5 steps (got ${st.length}) — they share one lane and get unreadable`);
    for (const x of st) {
      if (len(x.label) > 26) E(`${id}: BACKSTAGE_PHONE step "${x.label}" > 26 chars`);
      if (len(x.detail) > 8) E(`${id}: BACKSTAGE_PHONE step detail "${x.detail}" > 8 chars — it is a clock reading`);
      if (x.atWord == null) E(`${id}: BACKSTAGE_PHONE step "${x.label}" needs atWord — the queue is the point, it must move`);
    }
    // The race only reads if the hop fires while the slow lane is still going. Landing it
    // after the last step turns the whole beat into two lists that happen to be stacked.
    if (bp.hopAtWord != null) {
      const lastStep = Math.max(...st.map((x) => x.atWord ?? 0));
      if (bp.hopAtWord >= lastStep)
        E(`${id}: BACKSTAGE_PHONE hopAtWord (${bp.hopAtWord}) must land BEFORE the last step (${lastStep}) — the phone winning mid-queue IS the beat`);
    }
    if (bp.verdictAtWord != null && bp.hopAtWord != null && bp.verdictAtWord <= bp.hopAtWord)
      E(`${id}: BACKSTAGE_PHONE verdictAtWord (${bp.verdictAtWord}) must come after the hop lands (${bp.hopAtWord})`);
    if (!bp.hopTime || !bp.stageTime)
      W(`${id}: BACKSTAGE_PHONE without both hopTime and stageTime — the two clock readings are the whole argument.`);
  }
  if (d.stageHandoff) {
    const sh = d.stageHandoff;
    const st = sh.steps ?? [];
    if (!sh.testName) E(`${id}: STAGE_HANDOFF needs a testName — it is one job on two transports`);
    if (len(sh.testName) > 30) E(`${id}: STAGE_HANDOFF testName > 30 chars`);
    if (len(sh.railLabel) > 24) E(`${id}: STAGE_HANDOFF railLabel > 24 chars`);
    if (len(sh.stageLabel) > 24) E(`${id}: STAGE_HANDOFF stageLabel > 24 chars`);
    if (len(sh.handoffLabel) > 26) E(`${id}: STAGE_HANDOFF handoffLabel > 26 chars`);
    if (len(sh.verdict) > 34) E(`${id}: STAGE_HANDOFF verdict > 34 chars`);
    if (len(sh.caption) > 44) E(`${id}: STAGE_HANDOFF caption > 44 chars`);
    checkColor(id, 'stageHandoff.color', sh.color);
    if (st.length < 3) E(`${id}: STAGE_HANDOFF needs >=3 steps — a handoff needs something on each side of it`);
    if (st.length > 6) E(`${id}: STAGE_HANDOFF max 6 steps (got ${st.length})`);
    const kinds = st.map((x) => (x.title ?? 'ui').toLowerCase());
    for (let i = 0; i < st.length; i++) {
      if (!['api', 'ui'].includes(kinds[i]))
        E(`${id}: STAGE_HANDOFF step title "${st[i].title}" must be 'api' or 'ui'`);
      if (len(st[i].label) > 34) E(`${id}: STAGE_HANDOFF step "${st[i].label}" > 34 chars`);
      if (len(st[i].sub) > 24) E(`${id}: STAGE_HANDOFF step sub "${st[i].sub}" > 24 chars`);
      if (st[i].atWord == null) E(`${id}: STAGE_HANDOFF step "${st[i].label}" needs atWord`);
    }
    // The component draws ONE rail then ONE stage. Interleaving them would silently reorder
    // the steps on screen relative to the narration, which is worse than a hard failure here.
    const firstUi = kinds.indexOf('ui');
    if (firstUi >= 0 && kinds.slice(firstUi).includes('api'))
      E(`${id}: STAGE_HANDOFF has an 'api' step after the handoff — every api step must come before the first ui step`);
    if (!kinds.includes('api')) E(`${id}: STAGE_HANDOFF needs >=1 'api' step — the unlit rail is half the argument`);
    if (!kinds.includes('ui')) E(`${id}: STAGE_HANDOFF needs >=1 'ui' step — the lit stage is the other half`);
    if (sh.handoffAtWord != null && firstUi >= 0) {
      const firstUiWord = st[firstUi].atWord ?? 0;
      if (sh.handoffAtWord >= firstUiWord)
        E(`${id}: STAGE_HANDOFF handoffAtWord (${sh.handoffAtWord}) must land before the first ui step (${firstUiWord})`);
    }
    if (sh.verdictAtWord != null) {
      const last = Math.max(...st.map((x) => x.atWord ?? 0));
      if (sh.verdictAtWord <= last)
        E(`${id}: STAGE_HANDOFF verdictAtWord (${sh.verdictAtWord}) must come after the last step (${last})`);
    }
  }
  if (d.scopeLadder) {
    const sl = d.scopeLadder;
    const fx = sl.fixtures ?? [];
    const tn = sl.tests ?? [];
    const SCOPES = ['session', 'function'];
    if (tn.length < 3) E(`${id}: SCOPE_LADDER needs >=3 tests — "runs per test" needs enough tests to count`);
    if (tn.length > 5) E(`${id}: SCOPE_LADDER max 5 tests (got ${tn.length})`);
    for (const x of tn) if (len(x) > 20) E(`${id}: SCOPE_LADDER test "${x}" > 20 chars`);
    if (fx.length < 2) E(`${id}: SCOPE_LADDER needs >=2 fixtures — one rail cannot contrast two rhythms`);
    if (fx.length > 3) E(`${id}: SCOPE_LADDER max 3 fixtures (got ${fx.length})`);
    const scopes = new Set();
    for (const f of fx) {
      const k = (f.title ?? 'function').toLowerCase();
      if (!SCOPES.includes(k)) E(`${id}: SCOPE_LADDER scope "${f.title}" must be 'session' or 'function'`);
      scopes.add(k);
      if (len(f.label) > 22) E(`${id}: SCOPE_LADDER fixture "${f.label}" > 22 chars`);
      if (len(f.sub) > 26) E(`${id}: SCOPE_LADDER fixture note "${f.sub}" > 26 chars`);
      if (len(f.detail) > 18) E(`${id}: SCOPE_LADDER run count "${f.detail}" > 18 chars`);
      if (f.atWord == null) E(`${id}: SCOPE_LADDER fixture "${f.label}" needs atWord — the rails fill one at a time`);
      checkColor(id, 'scopeLadder.fixture.color', f.color);
    }
    // Two fixtures at the SAME scope draw two identical rails and teach nothing.
    if (scopes.size < 2)
      E(`${id}: SCOPE_LADDER uses only one scope — show a session AND a function fixture, or there is no contrast to see`);
    if (len(sl.runLabel) > 20) E(`${id}: SCOPE_LADDER runLabel > 20 chars`);
    if (len(sl.fileLabel) > 20) E(`${id}: SCOPE_LADDER fileLabel > 20 chars`);
    if (len(sl.caption) > 44) E(`${id}: SCOPE_LADDER caption > 44 chars`);
    checkColor(id, 'scopeLadder.color', sl.color);
  }
  if (d.mailRoom) {
    const mr = d.mailRoom;
    const rq = mr.requests ?? [];
    const FATES = ['fulfill', 'abort', 'continue', 'pass'];
    if (!mr.pattern) E(`${id}: MAIL_ROOM needs a pattern — what the desk is watching for`);
    if (len(mr.pattern) > 30) E(`${id}: MAIL_ROOM pattern > 30 chars`);
    if (len(mr.deskLabel) > 22) E(`${id}: MAIL_ROOM deskLabel > 22 chars`);
    if (len(mr.serverLabel) > 20) E(`${id}: MAIL_ROOM serverLabel > 20 chars`);
    if (len(mr.browserLabel) > 20) E(`${id}: MAIL_ROOM browserLabel > 20 chars`);
    if (len(mr.caption) > 44) E(`${id}: MAIL_ROOM caption > 44 chars`);
    checkColor(id, 'mailRoom.color', mr.color);
    if (rq.length < 2) E(`${id}: MAIL_ROOM needs >=2 requests — one letter cannot show a choice of fates`);
    if (rq.length > 4) E(`${id}: MAIL_ROOM max 4 requests (got ${rq.length})`);
    const fates = new Set();
    for (const r of rq) {
      const f = (r.title ?? 'continue').toLowerCase();
      if (!FATES.includes(f)) E(`${id}: MAIL_ROOM fate "${r.title}" must be one of ${FATES.join('/')}`);
      fates.add(f);
      if (len(r.label) > 24) E(`${id}: MAIL_ROOM request "${r.label}" > 24 chars`);
      if (len(r.sub) > 22) E(`${id}: MAIL_ROOM result "${r.sub}" > 22 chars`);
      if (r.atWord == null) E(`${id}: MAIL_ROOM request "${r.label}" needs atWord — letters reach the desk one at a time`);
      checkColor(id, 'mailRoom.request.color', r.color);
    }
    // Every letter meeting the same fate makes the desk look like a pipe, not a choice.
    if (fates.size < 2)
      E(`${id}: MAIL_ROOM gives every request the same fate — show at least TWO different outcomes or the desk has no decision to make`);
  }
  if (d.sadPaths) {
    const sp = d.sadPaths;
    const stt = sp.states ?? [];
    const KINDS = ['ok', 'empty', 'error'];
    if (stt.length < 2) E(`${id}: SAD_PATHS needs >=2 states — one screen is not a contrast`);
    if (stt.length > 3) E(`${id}: SAD_PATHS max 3 states (got ${stt.length})`);
    const kinds = new Set();
    let sad = 0;
    for (const st of stt) {
      const k = (st.title ?? 'ok').toLowerCase();
      if (!KINDS.includes(k)) E(`${id}: SAD_PATHS kind "${st.title}" must be one of ${KINDS.join('/')}`);
      kinds.add(k);
      if (k !== 'ok') sad++;
      if (len(st.label) > 18) E(`${id}: SAD_PATHS state "${st.label}" > 18 chars`);
      if (len(st.text) > 32) E(`${id}: SAD_PATHS mock line "${st.text}" > 32 chars`);
      if (len(st.sub) > 22) E(`${id}: SAD_PATHS note "${st.sub}" > 22 chars`);
      if (!st.text) E(`${id}: SAD_PATHS state "${st.label}" needs text — the one line that caused it`);
      if (st.atWord == null) E(`${id}: SAD_PATHS state "${st.label}" needs atWord — the screens light one at a time`);
      checkColor(id, 'sadPaths.state.color', st.color);
    }
    // The component is named for the SAD paths; three happy screens teach nothing.
    if (!sad) E(`${id}: SAD_PATHS has no 'empty' or 'error' state — the sad path IS the lesson`);
    if (kinds.size < 2) E(`${id}: SAD_PATHS repeats one kind — each screen must show a DIFFERENT server reality`);
    if (kinds.has('ok') && !(sp.rows ?? []).length)
      E(`${id}: SAD_PATHS has an 'ok' state but no rows — the happy screen would render empty and look like the empty state`);
    for (const r of (sp.rows ?? [])) if (len(r) > 18) E(`${id}: SAD_PATHS row "${r}" > 18 chars`);
    if ((sp.rows ?? []).length > 3) E(`${id}: SAD_PATHS max 3 rows`);
    if (len(sp.emptyText) > 22) E(`${id}: SAD_PATHS emptyText > 22 chars`);
    if (len(sp.errorText) > 22) E(`${id}: SAD_PATHS errorText > 22 chars`);
    if (len(sp.screenTitle) > 18) E(`${id}: SAD_PATHS screenTitle > 18 chars`);
    if (len(sp.caption) > 44) E(`${id}: SAD_PATHS caption > 44 chars`);
    checkColor(id, 'sadPaths.color', sp.color);
    // TEACHING PACE: each screen is a state the viewer has to read.
    if (stt.length && s.durationFrames) {
      const per = s.durationFrames / stt.length;
      if (per < 120)
        W(`${id}: SAD_PATHS gives ${(per / 30).toFixed(1)}s per screen (need >=4s). Show fewer states, or say more about each.`);
    }
  }
  if (d.shotScope) {
    const ss = d.shotScope;
    const sh = ss.shots ?? [];
    const bl = ss.blocks ?? [];
    const SCOPES = ['viewport', 'full', 'element'];
    if (bl.length < 3) E(`${id}: SHOT_SCOPE needs >=3 blocks — a page with a fold has to look like one`);
    if (bl.length > 6) E(`${id}: SHOT_SCOPE max 6 blocks (got ${bl.length})`);
    for (const b of bl) if (len(b) > 18) E(`${id}: SHOT_SCOPE block "${b}" > 18 chars`);
    if (sh.length < 2) E(`${id}: SHOT_SCOPE needs >=2 shots — one scope alone shows no contrast`);
    if (sh.length > 3) E(`${id}: SHOT_SCOPE max 3 shots (got ${sh.length})`);
    const seen = new Set();
    for (const s2 of sh) {
      const k = (s2.title ?? 'viewport').toLowerCase();
      if (!SCOPES.includes(k)) E(`${id}: SHOT_SCOPE scope "${s2.title}" must be one of ${SCOPES.join('/')}`);
      seen.add(k);
      if (len(s2.label) > 30) E(`${id}: SHOT_SCOPE call "${s2.label}" > 30 chars`);
      if (len(s2.sub) > 18) E(`${id}: SHOT_SCOPE file "${s2.sub}" > 18 chars`);
      if (len(s2.detail) > 26) E(`${id}: SHOT_SCOPE note "${s2.detail}" > 26 chars`);
      if (s2.atWord == null) E(`${id}: SHOT_SCOPE shot "${(s2.label ?? '').slice(0, 20)}…" needs atWord — they frame one at a time`);
      checkColor(id, 'shotScope.shot.color', s2.color);
    }
    // two shots with the SAME scope draw the identical rectangle twice, which teaches
    // the opposite of "these calls capture different things"
    if (seen.size !== sh.length)
      E(`${id}: SHOT_SCOPE repeats a scope — each shot must frame a DIFFERENT region or the contrast vanishes`);
    if (ss.foldAfter != null && (ss.foldAfter < 0 || ss.foldAfter >= bl.length))
      E(`${id}: SHOT_SCOPE foldAfter ${ss.foldAfter} is outside 0..${bl.length - 1}`);
    if (ss.elementIndex != null && (ss.elementIndex < 0 || ss.elementIndex >= bl.length))
      E(`${id}: SHOT_SCOPE elementIndex ${ss.elementIndex} is outside 0..${bl.length - 1}`);
    // a 'full' shot only differs from 'viewport' if something is actually below the fold
    if (seen.has('full') && seen.has('viewport') && (ss.foldAfter ?? 2) >= bl.length - 1)
      E(`${id}: SHOT_SCOPE has nothing below the fold — full_page and viewport would frame the same rectangle`);
    if (len(ss.pageTitle) > 20) E(`${id}: SHOT_SCOPE pageTitle > 20 chars`);
    if (len(ss.foldLabel) > 20) E(`${id}: SHOT_SCOPE foldLabel > 20 chars`);
    if (len(ss.caption) > 44) E(`${id}: SHOT_SCOPE caption > 44 chars`);
    checkColor(id, 'shotScope.color', ss.color);
  }
  if (d.flagHarvest) {
    const fh = d.flagHarvest;
    const ts2 = fh.tests ?? [];
    const ar = fh.artifacts ?? [];
    if (!fh.flag) E(`${id}: FLAG_HARVEST needs a flag — the switch doing the work`);
    if (len(fh.flag) > 34) E(`${id}: FLAG_HARVEST flag > 34 chars`);
    if (len(fh.command) > 20) E(`${id}: FLAG_HARVEST command > 20 chars`);
    if (len(fh.folder) > 26) E(`${id}: FLAG_HARVEST folder > 26 chars`);
    if (len(fh.quietNote) > 28) E(`${id}: FLAG_HARVEST quietNote > 28 chars`);
    if (len(fh.caption) > 44) E(`${id}: FLAG_HARVEST caption > 44 chars`);
    checkColor(id, 'flagHarvest.color', fh.color);
    if (ts2.length < 3) E(`${id}: FLAG_HARVEST needs >=3 tests — a run of two cannot show selectivity`);
    // 4 not 5: at 3 artifacts per failure a 5-row run is taller than the frame and the
    // block climbs under the headline (caught by the MAX fixture).
    if (ts2.length > 4) E(`${id}: FLAG_HARVEST max 4 tests (got ${ts2.length}) — more overflows the frame once failures carry artifacts`);
    let pass = 0, fail = 0;
    for (const tt of ts2) {
      const v = (tt.title ?? 'pass').toLowerCase();
      if (!['pass', 'fail'].includes(v)) E(`${id}: FLAG_HARVEST verdict "${tt.title}" must be 'pass' or 'fail'`);
      v === 'fail' ? fail++ : pass++;
      if (len(tt.label) > 24) E(`${id}: FLAG_HARVEST test "${tt.label}" > 24 chars`);
      if (tt.atWord == null) E(`${id}: FLAG_HARVEST test "${tt.label}" needs atWord — verdicts land one at a time`);
    }
    // the ASYMMETRY is the lesson: all-pass produces nothing, all-fail hides the point
    if (!fail) E(`${id}: FLAG_HARVEST has no failing test — nothing would be harvested and the scene proves nothing`);
    if (!pass) E(`${id}: FLAG_HARVEST has no passing test — without a quiet row the selectivity is invisible`);
    if (ar.length < 1) E(`${id}: FLAG_HARVEST needs >=1 artifact`);
    if (ar.length > 3) E(`${id}: FLAG_HARVEST max 3 artifacts (got ${ar.length})`);
    for (const a of ar) if (len(a) > 26) E(`${id}: FLAG_HARVEST artifact "${a}" > 26 chars`);
    // the verdicts must all have landed before anything is harvested
    if (fh.harvestAtWord != null) {
      const last = Math.max(...ts2.map((x) => x.atWord ?? 0));
      if (fh.harvestAtWord <= last)
        E(`${id}: FLAG_HARVEST harvestAtWord (${fh.harvestAtWord}) must come after the LAST verdict (${last})`);
    }
  }
  if (d.traceScrub) {
    const tr = d.traceScrub;
    const st2 = tr.steps ?? [];
    const snap = tr.snapshot ?? [];
    if (st2.length < 3) E(`${id}: TRACE_SCRUB needs >=3 steps — a timeline of two is not a recording`);
    if (st2.length > 6) E(`${id}: TRACE_SCRUB max 6 steps (got ${st2.length})`);
    let fails = 0;
    for (const s3 of st2) {
      const k = (s3.title ?? '').toLowerCase();
      if (k && k !== 'fail') E(`${id}: TRACE_SCRUB step title "${s3.title}" must be 'fail' or omitted`);
      if (k === 'fail') fails++;
      if (len(s3.label) > 22) E(`${id}: TRACE_SCRUB step "${s3.label}" > 22 chars`);
      if (len(s3.sub) > 30) E(`${id}: TRACE_SCRUB console line "${s3.sub}" > 30 chars`);
      if (len(s3.detail) > 26) E(`${id}: TRACE_SCRUB network line "${s3.detail}" > 26 chars`);
      if (s3.atWord == null) E(`${id}: TRACE_SCRUB step "${s3.label}" needs atWord — the playhead lands on each in turn`);
      checkColor(id, 'traceScrub.step.color', s3.color);
    }
    // scrubbing BACK to the failure is the payoff; with no failing step there is
    // nowhere to rewind to and the component is just a list of actions
    if (fails !== 1) E(`${id}: TRACE_SCRUB has ${fails} steps marked 'fail' — mark EXACTLY one, it is what the rewind lands on`);
    if (snap.length < 2) E(`${id}: TRACE_SCRUB needs >=2 snapshot elements — the last one is what the failing step never found`);
    if (snap.length > 4) E(`${id}: TRACE_SCRUB max 4 snapshot elements (got ${snap.length})`);
    for (const sn of snap) if (len(sn) > 20) E(`${id}: TRACE_SCRUB snapshot element "${sn}" > 20 chars`);
    if (len(tr.traceFile) > 26) E(`${id}: TRACE_SCRUB traceFile > 26 chars`);
    if (len(tr.openWith) > 34) E(`${id}: TRACE_SCRUB openWith > 34 chars`);
    if (len(tr.consoleLabel) > 16) E(`${id}: TRACE_SCRUB consoleLabel > 16 chars`);
    if (len(tr.networkLabel) > 16) E(`${id}: TRACE_SCRUB networkLabel > 16 chars`);
    if (len(tr.caption) > 44) E(`${id}: TRACE_SCRUB caption > 44 chars`);
    checkColor(id, 'traceScrub.color', tr.color);
    if (tr.rewindAtWord != null) {
      const last = Math.max(...st2.map((x) => x.atWord ?? 0));
      if (tr.rewindAtWord <= last)
        E(`${id}: TRACE_SCRUB rewindAtWord (${tr.rewindAtWord}) must come after the LAST step (${last}) — you cannot rewind before you have played`);
    }
  }
  if (d.dialogGate) {
    const dg = d.dialogGate;
    const rw = dg.rows ?? [];
    const KINDS = ['confirm', 'alert', 'prompt'];
    const HANDLERS = ['none', 'accept', 'dismiss'];
    if (!dg.message) E(`${id}: DIALOG_GATE needs message — what the dialog says`);
    if (len(dg.message) > 44) E(`${id}: DIALOG_GATE message > 44 chars`);
    if (dg.kind != null && !KINDS.includes(dg.kind))
      E(`${id}: DIALOG_GATE kind must be one of ${KINDS.join('/')} (got "${dg.kind}")`);
    if (dg.handler != null && !HANDLERS.includes(dg.handler))
      E(`${id}: DIALOG_GATE handler must be one of ${HANDLERS.join('/')} (got "${dg.handler}")`);
    if (len(dg.handlerLine) > 36) E(`${id}: DIALOG_GATE handlerLine > 36 chars`);
    if (len(dg.trigger) > 32) E(`${id}: DIALOG_GATE trigger > 32 chars`);
    if (len(dg.pageTitle) > 20) E(`${id}: DIALOG_GATE pageTitle > 20 chars`);
    if (len(dg.outcome) > 30) E(`${id}: DIALOG_GATE outcome > 30 chars`);
    if (len(dg.caption) > 44) E(`${id}: DIALOG_GATE caption > 44 chars`);
    checkColor(id, 'dialogGate.color', dg.color);
    if (rw.length < 2) E(`${id}: DIALOG_GATE needs >=2 rows — the page behind has to look like a page`);
    if (rw.length > 4) E(`${id}: DIALOG_GATE max 4 rows (got ${rw.length})`);
    let targets = 0;
    for (const r of rw) {
      const k = (r.title ?? '').toLowerCase();
      if (k && k !== 'target') E(`${id}: DIALOG_GATE row title "${r.title}" must be 'target' or omitted`);
      if (k === 'target') targets++;
      if (len(r.label) > 20) E(`${id}: DIALOG_GATE row "${r.label}" > 20 chars`);
      checkColor(id, 'dialogGate.row.color', r.color);
    }
    // The target row is the EVIDENCE of which answer was given — without it the scene
    // shows a dialog being answered and proves nothing about the consequence.
    if (targets !== 1) E(`${id}: DIALOG_GATE has ${targets} rows marked 'target' — mark EXACTLY one, it is the proof of what the answer did`);
    // A registered handler is what the whole lesson is about; declaring one and then
    // leaving the handler at the auto-dismiss default says the opposite of the beat.
    if (dg.handlerLine && (dg.handler ?? 'none') === 'none')
      W(`${id}: DIALOG_GATE shows a handlerLine but handler is 'none' — the scene registers a handler and then ignores it.`);
    if (dg.knockAtWord != null && dg.answerAtWord != null && dg.answerAtWord <= dg.knockAtWord)
      E(`${id}: DIALOG_GATE answerAtWord (${dg.answerAtWord}) must come AFTER knockAtWord (${dg.knockAtWord})`);
    // the frozen page has to be SEEN frozen before it is answered
    if (dg.knockAtWord != null && dg.answerAtWord != null) {
      const gap = (dg.answerAtWord - dg.knockAtWord) * 12;
      if (gap < 75)
        W(`${id}: DIALOG_GATE answers ${(gap / 30).toFixed(1)}s after the knock — hold the frozen page >=2.5s or "no locator can reach this" never registers.`);
    }
  }
  if (d.pickerBypass) {
    const pb = d.pickerBypass;
    const fs2 = pb.files ?? [];
    const pi = pb.pickerItems ?? [];
    if (!pb.inputLabel) E(`${id}: PICKER_BYPASS needs inputLabel`);
    if (!pb.call) E(`${id}: PICKER_BYPASS needs call — the line that hands the file over`);
    if (len(pb.inputLabel) > 22) E(`${id}: PICKER_BYPASS inputLabel > 22 chars`);
    if (len(pb.call) > 34) E(`${id}: PICKER_BYPASS call > 34 chars`);
    if (len(pb.pickerTitle) > 22) E(`${id}: PICKER_BYPASS pickerTitle > 22 chars`);
    if (len(pb.blockedNote) > 28) E(`${id}: PICKER_BYPASS blockedNote > 28 chars`);
    if (len(pb.landedNote) > 26) E(`${id}: PICKER_BYPASS landedNote > 26 chars`);
    if (len(pb.pageTitle) > 20) E(`${id}: PICKER_BYPASS pageTitle > 20 chars`);
    if (len(pb.caption) > 44) E(`${id}: PICKER_BYPASS caption > 44 chars`);
    checkColor(id, 'pickerBypass.color', pb.color);
    if (pi.length > 3) E(`${id}: PICKER_BYPASS max 3 pickerItems (got ${pi.length})`);
    for (const p of pi) if (len(p) > 18) E(`${id}: PICKER_BYPASS pickerItem "${p}" > 18 chars`);
    if (fs2.length < 1) E(`${id}: PICKER_BYPASS needs >=1 file — something has to arrive in the input`);
    if (fs2.length > 3) E(`${id}: PICKER_BYPASS max 3 files (got ${fs2.length})`);
    for (const f of fs2) if (len(f) > 18) E(`${id}: PICKER_BYPASS file "${f}" > 18 chars`);
    // The un-openable picker must be on screen before the bypass, or the scene shows a
    // file arriving somewhere and never says what was avoided.
    if (pb.handAtWord != null && pb.atWord != null) {
      const gap = (pb.handAtWord - pb.atWord) * 12;
      if (gap < 75)
        W(`${id}: PICKER_BYPASS hands the file ${(gap / 30).toFixed(1)}s in — show the blocked picker for >=2.5s first, or the bypass has nothing to bypass.`);
    }
  }
  if (d.frameBoundary) {
    const fb = d.frameBoundary;
    const inner = fb.innerItems ?? [];
    const outer = fb.outerItems ?? [];
    if (!fb.attempt) E(`${id}: FRAME_BOUNDARY needs attempt — the locator that FAILS`);
    if (!fb.crossing) E(`${id}: FRAME_BOUNDARY needs crossing — the call that steps inside`);
    if (!fb.innerTitle) E(`${id}: FRAME_BOUNDARY needs innerTitle — name the embedded document`);
    if (len(fb.attempt) > 34) E(`${id}: FRAME_BOUNDARY attempt > 34 chars`);
    if (len(fb.crossing) > 34) E(`${id}: FRAME_BOUNDARY crossing > 34 chars`);
    if (len(fb.innerTitle) > 22) E(`${id}: FRAME_BOUNDARY innerTitle > 22 chars`);
    if (len(fb.outerTitle) > 20) E(`${id}: FRAME_BOUNDARY outerTitle > 20 chars`);
    if (len(fb.failNote) > 26) E(`${id}: FRAME_BOUNDARY failNote > 26 chars`);
    if (len(fb.okNote) > 26) E(`${id}: FRAME_BOUNDARY okNote > 26 chars`);
    if (len(fb.caption) > 44) E(`${id}: FRAME_BOUNDARY caption > 44 chars`);
    checkColor(id, 'frameBoundary.color', fb.color);
    if (outer.length > 3) E(`${id}: FRAME_BOUNDARY max 3 outerItems (got ${outer.length})`);
    for (const o of outer) if (len(o) > 18) E(`${id}: FRAME_BOUNDARY outer item "${o}" > 18 chars`);
    if (inner.length < 1) E(`${id}: FRAME_BOUNDARY needs >=1 innerItem — the frame has to contain the thing you cannot reach`);
    if (inner.length > 3) E(`${id}: FRAME_BOUNDARY max 3 innerItems (got ${inner.length})`);
    let targets = 0;
    for (const el of inner) {
      const k = (el.title ?? '').toLowerCase();
      if (k && k !== 'target') E(`${id}: FRAME_BOUNDARY innerItem title "${el.title}" must be 'target' or omitted`);
      if (k === 'target') targets++;
      if (len(el.label) > 18) E(`${id}: FRAME_BOUNDARY innerItem "${el.label}" > 18 chars`);
      checkColor(id, 'frameBoundary.innerItem.color', el.color);
    }
    // Without a marked target the crossing lands on nothing and the payoff is invisible.
    if (targets !== 1) E(`${id}: FRAME_BOUNDARY has ${targets} innerItems marked 'target' — mark EXACTLY one, it is what the crossing finds`);
    // The failed sweep has to be watched dying before the fix arrives, or the whole
    // "I can see it but it times out" symptom never registers.
    if (fb.crossAtWord != null && fb.atWord != null) {
      const gap = (fb.crossAtWord - fb.atWord) * 12;
      if (gap < 90)
        W(`${id}: FRAME_BOUNDARY crosses ${(gap / 30).toFixed(1)}s after the base — let the failing attempt sit for >=3s or the symptom never lands.`);
    }
  }
  if (d.trapTrigger) {
    const tt = d.trapTrigger;
    const missed = tt.mode === 'missed';
    if (!tt.listener) E(`${id}: TRAP_TRIGGER needs listener — the arming call`);
    if (!tt.trigger) E(`${id}: TRAP_TRIGGER needs trigger — the action that causes the event`);
    if (tt.mode != null && !['trap', 'missed'].includes(tt.mode))
      E(`${id}: TRAP_TRIGGER mode must be 'trap' or 'missed' (got "${tt.mode}")`);
    if (len(tt.listener) > 32) E(`${id}: TRAP_TRIGGER listener > 32 chars`);
    if (len(tt.trigger) > 34) E(`${id}: TRAP_TRIGGER trigger > 34 chars`);
    if (len(tt.catcher) > 30) E(`${id}: TRAP_TRIGGER catcher > 30 chars`);
    if (len(tt.caught) > 22) E(`${id}: TRAP_TRIGGER caught > 22 chars`);
    if (len(tt.originLabel) > 20) E(`${id}: TRAP_TRIGGER originLabel > 20 chars`);
    if (len(tt.missNote) > 28) E(`${id}: TRAP_TRIGGER missNote > 28 chars`);
    if (len(tt.caption) > 44) E(`${id}: TRAP_TRIGGER caption > 44 chars`);
    checkColor(id, 'trapTrigger.color', tt.color);
    const ci = tt.caughtItems ?? [];
    if (ci.length > 3) E(`${id}: TRAP_TRIGGER max 3 caughtItems (got ${ci.length})`);
    for (const c of ci) if (len(c) > 20) E(`${id}: TRAP_TRIGGER caughtItem "${c}" > 20 chars`);
    // caughtItems only ever render inside a caught thing — in 'missed' mode nothing is
    // caught, so declaring them means the author expected a payoff that cannot appear.
    if (missed && ci.length)
      E(`${id}: TRAP_TRIGGER 'missed' mode cannot show caughtItems — nothing is caught`);
    if (missed && tt.originLabel)
      W(`${id}: TRAP_TRIGGER 'missed' mode ignores originLabel (it only renders beside a caught object).`);
    if (tt.armAtWord != null && tt.fireAtWord != null && tt.fireAtWord <= tt.armAtWord)
      E(`${id}: TRAP_TRIGGER fireAtWord (${tt.fireAtWord}) must come AFTER armAtWord (${tt.armAtWord}) — the ORDER is the lesson`);
    // the two events must be far enough apart to read as a sequence, not a coincidence
    if (tt.armAtWord != null && tt.fireAtWord != null) {
      const gap = (tt.fireAtWord - tt.armAtWord) * 12;
      if (gap < 75)
        W(`${id}: TRAP_TRIGGER fires ${(gap / 30).toFixed(1)}s after arming — leave >=2.5s or the two steps read as one moment.`);
    }
  }
  if (d.crowdMatch) {
    const cm = d.crowdMatch;
    const mem = cm.members ?? [];
    const ro = cm.readouts ?? [];
    if (!cm.query) E(`${id}: CROWD_MATCH needs a query`);
    if (len(cm.query) > 34) E(`${id}: CROWD_MATCH query > 34 chars`);
    // fewer than 3 does not read as a crowd; more than 6 will not fit the vertical list
    if (mem.length < 3) E(`${id}: CROWD_MATCH needs >=3 members — two is a pair, not a crowd`);
    if (mem.length > 6) E(`${id}: CROWD_MATCH max 6 members (got ${mem.length})`);
    for (const m of mem) {
      if (len(m.label) > 20) E(`${id}: CROWD_MATCH member "${m.label}" > 20 chars`);
      checkColor(id, 'crowdMatch.member.color', m.color);
    }
    if (ro.length > 3) E(`${id}: CROWD_MATCH max 3 readouts (got ${ro.length})`);
    for (const r of ro) {
      if (len(r.label) > 22) E(`${id}: CROWD_MATCH readout call "${r.label}" > 22 chars`);
      if (len(r.text) > 30) E(`${id}: CROWD_MATCH readout value "${r.text}" > 30 chars`);
      if (r.atWord == null) E(`${id}: CROWD_MATCH readout "${r.label}" needs atWord — they land one at a time`);
    }
    if (len(cm.countLabel) > 18) E(`${id}: CROWD_MATCH countLabel > 18 chars`);
    if (len(cm.pickLabel) > 20) E(`${id}: CROWD_MATCH pickLabel > 20 chars`);
    if (len(cm.strictNote) > 30) E(`${id}: CROWD_MATCH strictNote > 30 chars`);
    if (len(cm.pageTitle) > 20) E(`${id}: CROWD_MATCH pageTitle > 20 chars`);
    if (len(cm.caption) > 44) E(`${id}: CROWD_MATCH caption > 44 chars`);
    checkColor(id, 'crowdMatch.color', cm.color);
    if (cm.pickIndex != null && (cm.pickIndex < 0 || cm.pickIndex >= mem.length))
      E(`${id}: CROWD_MATCH pickIndex ${cm.pickIndex} is outside 0..${mem.length - 1}`);
    if (cm.pickAtWord != null && cm.pickIndex == null)
      E(`${id}: CROWD_MATCH has pickAtWord but no pickIndex — nothing would be singled out`);
    // TEACHING PACE (owner rule 2026-08-13): each readout is a taught value.
    if (ro.length && s.durationFrames) {
      const per = s.durationFrames / ro.length;
      if (per < 105)
        W(`${id}: CROWD_MATCH gives ${(per / 30).toFixed(1)}s per readout (need >=3.5s). Show fewer group tools per beat.`);
    }
  }
  if (d.rowFilter) {
    const rf = d.rowFilter;
    const rw = rf.rows ?? [];
    if (!rf.condition) E(`${id}: ROW_FILTER needs a condition — the filter being applied`);
    if (len(rf.condition) > 34) E(`${id}: ROW_FILTER condition > 34 chars`);
    if (rw.length < 3) E(`${id}: ROW_FILTER needs >=3 rows — narrowing two rows to one is not a crowd`);
    if (rw.length > 6) E(`${id}: ROW_FILTER max 6 rows (got ${rw.length})`);
    let keeps = 0;
    for (const r of rw) {
      const k = (r.title ?? '').toLowerCase();
      if (k && k !== 'keep') E(`${id}: ROW_FILTER row title "${r.title}" must be 'keep' or omitted`);
      if (k === 'keep') keeps++;
      if (len(r.label) > 20) E(`${id}: ROW_FILTER row "${r.label}" > 20 chars`);
      if (len(r.sub) > 14) E(`${id}: ROW_FILTER row control "${r.sub}" > 14 chars`);
      checkColor(id, 'rowFilter.row.color', r.color);
    }
    // The survivor is the whole point; zero or many makes the picture a lie.
    if (keeps !== 1) E(`${id}: ROW_FILTER has ${keeps} rows marked 'keep' — a filter beat needs EXACTLY one survivor`);
    if (len(rf.control) > 14) E(`${id}: ROW_FILTER control > 14 chars`);
    if (len(rf.baseLabel) > 26) E(`${id}: ROW_FILTER baseLabel > 26 chars`);
    if (len(rf.actLabel) > 26) E(`${id}: ROW_FILTER actLabel > 26 chars`);
    if (len(rf.pageTitle) > 20) E(`${id}: ROW_FILTER pageTitle > 20 chars`);
    if (len(rf.caption) > 44) E(`${id}: ROW_FILTER caption > 44 chars`);
    checkColor(id, 'rowFilter.color', rf.color);
    if (rf.filterAtWord != null && rf.actAtWord != null && rf.actAtWord <= rf.filterAtWord)
      E(`${id}: ROW_FILTER actAtWord (${rf.actAtWord}) must come AFTER filterAtWord (${rf.filterAtWord})`);
    // the survivor has to be SEEN standing alone before anything is done to it
    if (rf.filterAtWord != null && rf.actAtWord != null) {
      const gap = (rf.actAtWord - rf.filterAtWord) * 12;
      if (gap < 75)
        W(`${id}: ROW_FILTER acts ${(gap / 30).toFixed(1)}s after the narrowing — hold the lone survivor >=2.5s or the containment does not land.`);
    }
  }
  if (d.indexDrift) {
    const ix = d.indexDrift;
    const bf = ix.before ?? [];
    const af = ix.after ?? [];
    if (bf.length < 3) E(`${id}: INDEX_DRIFT needs >=3 before rows`);
    if (bf.length > 6) E(`${id}: INDEX_DRIFT max 6 before rows (got ${bf.length})`);
    if (af.length < 3 || af.length > 6) E(`${id}: INDEX_DRIFT after must be 3-6 rows (got ${af.length})`);
    for (const b of bf) {
      if (len(b.label) > 18) E(`${id}: INDEX_DRIFT row "${b.label}" > 18 chars`);
      checkColor(id, 'indexDrift.before.color', b.color);
    }
    for (const a of af) if (len(a) > 18) E(`${id}: INDEX_DRIFT after row "${a}" > 18 chars`);
    if (!ix.target) E(`${id}: INDEX_DRIFT needs a target — the row you actually mean`);
    if (len(ix.target) > 18) E(`${id}: INDEX_DRIFT target > 18 chars`);
    // The target must survive the re-order in BOTH lists or the meaning pointer has
    // nowhere to travel to and the component silently argues the opposite point.
    const inBefore = bf.some((b) => b.label === ix.target);
    const inAfter = af.includes(ix.target);
    if (!inBefore) E(`${id}: INDEX_DRIFT target "${ix.target}" is not in before[] — the pointers start on nothing`);
    if (!inAfter) E(`${id}: INDEX_DRIFT target "${ix.target}" is not in after[] — the meaning pointer would have nowhere to go`);
    if (inBefore && inAfter) {
      const iB = bf.findIndex((b) => b.label === ix.target);
      const iA = af.indexOf(ix.target);
      if (iB === iA)
        E(`${id}: INDEX_DRIFT target stays at index ${iB} after the re-order — nothing drifts, so the scene proves the opposite of its point`);
    }
    if (len(ix.indexLabel) > 20) E(`${id}: INDEX_DRIFT indexLabel > 20 chars`);
    if (len(ix.meaningLabel) > 24) E(`${id}: INDEX_DRIFT meaningLabel > 24 chars`);
    if (len(ix.causeLabel) > 26) E(`${id}: INDEX_DRIFT causeLabel > 26 chars`);
    if (len(ix.brokenNote) > 30) E(`${id}: INDEX_DRIFT brokenNote > 30 chars`);
    if (len(ix.heldNote) > 30) E(`${id}: INDEX_DRIFT heldNote > 30 chars`);
    if (len(ix.caption) > 44) E(`${id}: INDEX_DRIFT caption > 44 chars`);
    checkColor(id, 'indexDrift.color', ix.color);
    // the BEFORE state has to be read before it is destroyed
    if (ix.shuffleAtWord != null && ix.atWord != null && ix.shuffleAtWord - ix.atWord < 8)
      W(`${id}: INDEX_DRIFT re-orders ${(ix.shuffleAtWord - ix.atWord).toFixed(1)} words in — hold the original order ~3s (≈8 words) so the viewer knows what changed.`);
  }
  if (d.ruleTest) {
    const rt = d.ruleTest;
    const cs = rt.cases ?? [];
    if (!rt.rule) E(`${id}: RULE_TEST needs a rule — the thing being applied`);
    if (len(rt.rule) > 62) E(`${id}: RULE_TEST rule > 62 chars — it is a rule, not a paragraph`);
    if (cs.length < 2) E(`${id}: RULE_TEST needs >=2 cases — one case is not a test, it is an example`);
    if (cs.length > 4) E(`${id}: RULE_TEST max 4 cases (got ${cs.length})`);
    let pass = 0, fail = 0;
    for (const c of cs) {
      const v = (c.title ?? '').toLowerCase();
      if (!['ok', 'no'].includes(v)) E(`${id}: RULE_TEST case verdict "${c.title}" must be 'ok' or 'no'`);
      v === 'no' ? fail++ : pass++;
      if (len(c.text) > 38) E(`${id}: RULE_TEST case "${(c.text ?? '').slice(0, 20)}…" > 38 chars`);
      if (len(c.sub) > 30) E(`${id}: RULE_TEST case reason "${c.sub}" > 30 chars`);
      if (c.atWord == null) E(`${id}: RULE_TEST case "${(c.text ?? '').slice(0, 20)}…" needs atWord — judging one at a time is the point`);
      checkColor(id, 'ruleTest.case.color', c.color);
    }
    // A rule that every case obeys teaches nothing — the boundary is only visible
    // when the viewer sees something fall on the WRONG side of it.
    if (cs.length >= 2 && (pass === 0 || fail === 0))
      W(`${id}: RULE_TEST has ${pass} passing / ${fail} failing case(s) — show at least one of each, or the rule has no edge.`);
    if (len(rt.kicker) > 22) E(`${id}: RULE_TEST kicker > 22 chars`);
    if (len(rt.okLabel) > 14) E(`${id}: RULE_TEST okLabel > 14 chars`);
    if (len(rt.noLabel) > 14) E(`${id}: RULE_TEST noLabel > 14 chars`);
    if (len(rt.caption) > 44) E(`${id}: RULE_TEST caption > 44 chars`);
    checkColor(id, 'ruleTest.color', rt.color);
  }
  if (d.savedSearch) {
    const ss = d.savedSearch;
    const els = ss.elements ?? [];
    const KINDS = ['field', 'button', 'text', 'link'];
    if (!ss.query) E(`${id}: SAVED_SEARCH needs a query`);
    if (len(ss.query) > 34) E(`${id}: SAVED_SEARCH query > 34 chars`);
    if (els.length < 2) E(`${id}: SAVED_SEARCH needs >=2 elements — one element cannot show a search finding the right one`);
    if (els.length > 5) E(`${id}: SAVED_SEARCH max 5 elements (got ${els.length})`);
    for (const e of els) {
      if (e.title != null && !KINDS.includes((e.title ?? '').toLowerCase()))
        E(`${id}: SAVED_SEARCH element kind "${e.title}" must be one of ${KINDS.join('/')}`);
      if (len(e.label) > 16) E(`${id}: SAVED_SEARCH element "${e.label}" > 16 chars`);
      checkColor(id, 'savedSearch.element.color', e.color);
    }
    if (ss.matchIndex == null) E(`${id}: SAVED_SEARCH needs matchIndex — which element the query eventually finds`);
    else if (ss.matchIndex < 0 || ss.matchIndex >= els.length)
      E(`${id}: SAVED_SEARCH matchIndex ${ss.matchIndex} is outside 0..${els.length - 1}`);
    if (len(ss.trigger) > 26) E(`${id}: SAVED_SEARCH trigger > 26 chars`);
    if (len(ss.savedLabel) > 20) E(`${id}: SAVED_SEARCH savedLabel > 20 chars`);
    if (len(ss.ranLabel) > 20) E(`${id}: SAVED_SEARCH ranLabel > 20 chars`);
    if (len(ss.pageTitle) > 20) E(`${id}: SAVED_SEARCH pageTitle > 20 chars`);
    if (len(ss.caption) > 44) E(`${id}: SAVED_SEARCH caption > 44 chars`);
    checkColor(id, 'savedSearch.color', ss.color);
    // The UNRUN half is the lesson. If the scan fires immediately, the viewer never
    // sees a page that nothing has touched, and the component argues the opposite.
    if (ss.runAtWord != null && ss.atWord != null && ss.runAtWord - ss.atWord < 8)
      W(`${id}: SAVED_SEARCH runs ${(ss.runAtWord - ss.atWord).toFixed(1)} words in — hold the un-run state ~3s (≈8 words) or the 'nothing happened yet' beat does not land.`);
  }
  if (d.respSplit) {
    const rs = d.respSplit;
    const ls = rs.lines ?? [];
    if (!rs.leftLabel) E(`${id}: RESPONSIBILITY_SPLIT needs leftLabel`);
    if (!rs.rightLabel) E(`${id}: RESPONSIBILITY_SPLIT needs rightLabel`);
    if (len(rs.leftLabel) > 18) E(`${id}: RESPONSIBILITY_SPLIT leftLabel > 18 chars`);
    if (len(rs.rightLabel) > 18) E(`${id}: RESPONSIBILITY_SPLIT rightLabel > 18 chars`);
    if (len(rs.leftSub) > 24) E(`${id}: RESPONSIBILITY_SPLIT leftSub > 24 chars`);
    if (len(rs.rightSub) > 24) E(`${id}: RESPONSIBILITY_SPLIT rightSub > 24 chars`);
    if (len(rs.pileLabel) > 22) E(`${id}: RESPONSIBILITY_SPLIT pileLabel > 22 chars`);
    if (len(rs.caption) > 44) E(`${id}: RESPONSIBILITY_SPLIT caption > 44 chars`);
    checkColor(id, 'respSplit.color', rs.color);
    if (ls.length < 3) E(`${id}: RESPONSIBILITY_SPLIT needs >=3 lines — two is a comparison, not a sort`);
    if (ls.length > 6) E(`${id}: RESPONSIBILITY_SPLIT max 6 lines (got ${ls.length})`);
    let left = 0, right = 0;
    for (const l of ls) {
      const side = (l.title ?? 'left').toLowerCase();
      if (!['left', 'right'].includes(side)) E(`${id}: RESPONSIBILITY_SPLIT side "${l.title}" must be 'left' or 'right'`);
      side === 'right' ? right++ : left++;
      if (len(l.text) > 32) E(`${id}: RESPONSIBILITY_SPLIT line "${(l.text ?? '').slice(0, 20)}…" > 32 chars`);
      if (len(l.sub) > 22) E(`${id}: RESPONSIBILITY_SPLIT reason "${l.sub}" > 22 chars`);
      if (l.atWord == null) E(`${id}: RESPONSIBILITY_SPLIT line "${(l.text ?? '').slice(0, 20)}…" needs atWord — filing one at a time is the point`);
      checkColor(id, 'respSplit.line.color', l.color);
    }
    // An empty bin is not a boundary, it is a list with a label next to it.
    if (!left || !right)
      E(`${id}: RESPONSIBILITY_SPLIT files every line into one bin (${left} left / ${right} right) — a split needs both sides`);
    // TEACHING PACE (owner rule 2026-08-13): each filing has to be watched.
    if (ls.length && s.durationFrames) {
      const per = s.durationFrames / ls.length;
      if (per < 90)
        W(`${id}: RESPONSIBILITY_SPLIT gives ${(per / 30).toFixed(1)}s per line (need >=3s). File fewer lines per beat.`);
    }
  }
  if (d.changeRipple) {
    const cr = d.changeRipple;
    const central = cr.mode === 'central';
    if (!cr.line) E(`${id}: CHANGE_RIPPLE needs line (what has to change)`);
    if (!cr.newLine) E(`${id}: CHANGE_RIPPLE needs newLine (what it becomes)`);
    if (cr.mode != null && !['scattered', 'central'].includes(cr.mode))
      E(`${id}: CHANGE_RIPPLE mode must be 'scattered' or 'central' (got "${cr.mode}")`);
    // Budgets are sized to the VERTICAL card, which is the narrowest place these land.
    if (len(cr.line) > 30) E(`${id}: CHANGE_RIPPLE line > 30 chars — it has to fit inside a card`);
    if (len(cr.newLine) > 30) E(`${id}: CHANGE_RIPPLE newLine > 30 chars`);
    if (len(cr.countLabel) > 20) E(`${id}: CHANGE_RIPPLE countLabel > 20 chars`);
    if (len(cr.holder) > 24) E(`${id}: CHANGE_RIPPLE holder > 24 chars`);
    if (len(cr.fixLabel) > 24) E(`${id}: CHANGE_RIPPLE fixLabel > 24 chars`);
    if (len(cr.doneLabel) > 26) E(`${id}: CHANGE_RIPPLE doneLabel > 26 chars`);
    if (len(cr.caption) > 44) E(`${id}: CHANGE_RIPPLE caption > 44 chars`);
    checkColor(id, 'changeRipple.color', cr.color);
    const n = cr.cards ?? 8;
    if (n < 4 || n > 12) E(`${id}: CHANGE_RIPPLE cards must be 4-12 (got ${n}) — fewer reads as a handful, more is unreadable`);
    if (cr.missIndex != null) {
      if (central) E(`${id}: CHANGE_RIPPLE missIndex is a 'scattered' idea — in central mode nothing is missed`);
      else if (cr.missIndex < 0 || cr.missIndex >= n) E(`${id}: CHANGE_RIPPLE missIndex ${cr.missIndex} is outside 0..${n - 1}`);
    }
    if (central && !cr.holder) W(`${id}: CHANGE_RIPPLE central mode without a holder — name the ONE file the line lives in, that is the whole point.`);
    // TEACHING PACE (owner rule 2026-08-13): the repair has to be WATCHED, not inferred.
    // scattered repairs one card every 11 frames after a 26-frame beat; central's wave
    // settles ~9 frames per rank. Both need room AFTER the anchor fires.
    if (cr.atWord != null && s.durationFrames) {
      const needed = central ? 16 + 3 * 9 + 12 : 26 + n * 11 + 12;
      const left = s.durationFrames - cr.atWord * 12;
      if (left < needed)
        W(`${id}: CHANGE_RIPPLE has ~${(left / 30).toFixed(1)}s after the rename lands but the ${cr.mode ?? 'scattered'} repair needs ${(needed / 30).toFixed(1)}s. Name the change earlier.`);
    }
  }
  if (d.fixtureCrew) {
    const fc = d.fixtureCrew;
    const sg = fc.stages ?? [];
    if (!fc.testName) E(`${id}: FIXTURE_CREW needs testName (the function that asks)`);
    if (!fc.askFor) E(`${id}: FIXTURE_CREW needs askFor (the argument that lands in the slot)`);
    if (sg.length < 2) E(`${id}: FIXTURE_CREW needs >=2 stages — one stage is not a crew`);
    if (sg.length > 4) E(`${id}: FIXTURE_CREW max 4 stages (got ${sg.length})`);
    for (const st of sg) {
      if (len(st.label) > 14) E(`${id}: FIXTURE_CREW stage "${st.label}" > 14 chars`);
      if (len(st.sub) > 18) E(`${id}: FIXTURE_CREW stage sub "${st.sub}" > 18 chars`);
      checkColor(id, 'fixtureCrew.stage.color', st.color);
    }
    if (len(fc.testName) > 26) E(`${id}: FIXTURE_CREW testName > 26 chars`);
    if (len(fc.askFor) > 10) E(`${id}: FIXTURE_CREW askFor > 10 chars`);
    if (len(fc.crewLabel) > 18) E(`${id}: FIXTURE_CREW crewLabel > 18 chars`);
    if (len(fc.bodyLabel) > 22) E(`${id}: FIXTURE_CREW bodyLabel > 22 chars`);
    if (len(fc.teardownLabel) > 22) E(`${id}: FIXTURE_CREW teardownLabel > 22 chars`);
    if (len(fc.caption) > 40) E(`${id}: FIXTURE_CREW caption > 40 chars`);
    checkColor(id, 'fixtureCrew.color', fc.color);
    // the handoff must precede the teardown or the animation plays backwards
    if (fc.handoffAtWord != null && fc.teardownAtWord != null && fc.teardownAtWord <= fc.handoffAtWord)
      E(`${id}: FIXTURE_CREW teardownAtWord (${fc.teardownAtWord}) must come AFTER handoffAtWord (${fc.handoffAtWord})`);
    // the body running between handoff and teardown IS the point — give it room
    if (fc.handoffAtWord != null && fc.teardownAtWord != null) {
      const gap = (fc.teardownAtWord - fc.handoffAtWord) * 12;
      if (gap < 90)
        W(`${id}: FIXTURE_CREW gives ${(gap / 30).toFixed(1)}s between handoff and teardown — the test body needs >=3s to read as running.`);
    }
  }
  if (d.overlayBlock) {
    const ob = d.overlayBlock;
    if (!ob.button) E(`${id}: OVERLAY_BLOCK needs a button (the target being covered)`);
    if (!ob.overlayLabel) E(`${id}: OVERLAY_BLOCK needs overlayLabel (what is covering it)`);
    if (len(ob.button) > 16) E(`${id}: OVERLAY_BLOCK button "${ob.button}" > 16 chars`);
    if (len(ob.overlayLabel) > 24) E(`${id}: OVERLAY_BLOCK overlayLabel > 24 chars`);
    if (len(ob.overlayButton) > 14) E(`${id}: OVERLAY_BLOCK overlayButton > 14 chars`);
    if (len(ob.screenTitle) > 22) E(`${id}: OVERLAY_BLOCK screenTitle > 22 chars`);
    if (len(ob.blockedNote) > 30) E(`${id}: OVERLAY_BLOCK blockedNote > 30 chars`);
    if (len(ob.clearedNote) > 30) E(`${id}: OVERLAY_BLOCK clearedNote > 30 chars`);
    if (len(ob.waitLabel) > 18) E(`${id}: OVERLAY_BLOCK waitLabel > 18 chars`);
    if (len(ob.caption) > 40) E(`${id}: OVERLAY_BLOCK caption > 40 chars`);
    checkColor(id, 'overlayBlock.color', ob.color);
    // the bounce must happen BEFORE the clear, or the animation plays backwards
    if (ob.blockedAtWord != null && ob.clearedAtWord != null && ob.clearedAtWord <= ob.blockedAtWord)
      E(`${id}: OVERLAY_BLOCK clearedAtWord (${ob.clearedAtWord}) must come AFTER blockedAtWord (${ob.blockedAtWord})`);
    // the wait between bounce and clear is the whole point — give it room to read
    if (ob.blockedAtWord != null && ob.clearedAtWord != null) {
      const gap = (ob.clearedAtWord - ob.blockedAtWord) * 12;
      if (gap < 90)
        W(`${id}: OVERLAY_BLOCK gives ${(gap / 30).toFixed(1)}s between the bounce and the clear — the wait is the lesson, give it >=3s.`);
    }
  }
  if (d.browserStep) {
    const bs = d.browserStep;
    const st = bs.steps ?? [];
    const KINDS = ['goto', 'fill', 'click', 'check', 'assert'];
    if (st.length < 2) E(`${id}: BROWSER_STEP needs >=2 steps`);
    if (st.length > 5) E(`${id}: BROWSER_STEP max 5 steps (got ${st.length})`);
    let fills = 0;
    for (const s of st) {
      const kind = (s.title ?? '').toLowerCase();
      if (!KINDS.includes(kind)) E(`${id}: BROWSER_STEP step kind "${s.title}" must be one of ${KINDS.join('/')}`);
      if (kind === 'fill') fills++;
      if (len(s.text) > 38) E(`${id}: BROWSER_STEP code "${(s.text ?? '').slice(0, 22)}…" > 38 chars`);
      if (len(s.label) > 26) E(`${id}: BROWSER_STEP label "${s.label}" > 26 chars`);
      if (len(s.detail) > 16) E(`${id}: BROWSER_STEP element "${s.detail}" > 16 chars`);
      if (len(s.sub) > 18) E(`${id}: BROWSER_STEP value "${s.sub}" > 18 chars`);
      if (s.atWord == null) E(`${id}: BROWSER_STEP step "${(s.text ?? '').slice(0, 22)}…" needs atWord — stepping is the point`);
      checkColor(id, 'browserStep.step.color', s.color);
    }
    // the page is BUILT from the steps; more than 3 inputs overflows the form area
    if (fills > 3) E(`${id}: BROWSER_STEP max 3 fill steps (the page form only holds 3)`);
    if (len(bs.url) > 34) E(`${id}: BROWSER_STEP url > 34 chars`);
    if (len(bs.screenTitle) > 22) E(`${id}: BROWSER_STEP screenTitle > 22 chars`);
    if (len(bs.caption) > 40) E(`${id}: BROWSER_STEP caption > 40 chars`);
    checkColor(id, 'browserStep.color', bs.color);
    // TEACHING PACE (owner rule 2026-08-13)
    if (st.length && s.durationFrames) {
      const per = s.durationFrames / st.length;
      if (per < 120)
        W(`${id}: BROWSER_STEP gives ${(per / 30).toFixed(1)}s per step (need >=4s). Use fewer steps per beat.`);
    }
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
  // QUIZ_CARD — budgets sized to the NARROW (vertical) card. The question must be
  // readable in ~3 seconds; the site keeps the long wording, the video shortens it.
  if (d.quiz) {
    const q = d.quiz;
    if (len(q.question) > 64) E(`${id}: QUIZ_CARD question > 64 chars — shorten it for video, a quiz nobody can read in 3s costs more retention than it earns`);
    if (len(q.why) > 70) E(`${id}: QUIZ_CARD why > 70 chars (one line under the options)`);
    const opts = q.options ?? [];
    if (opts.length < 2) E(`${id}: QUIZ_CARD needs ≥2 options`);
    if (opts.length > 4) E(`${id}: QUIZ_CARD max 4 options (A-D)`);
    opts.forEach((o, i) => {
      if (len(o.text) > 34) E(`${id}: QUIZ_CARD option ${i + 1} "${o.text}" > 34 chars (vertical row width)`);
    });
    if (q.answerIndex == null) E(`${id}: QUIZ_CARD needs answerIndex`);
    else if (q.answerIndex < 0 || q.answerIndex >= opts.length)
      E(`${id}: QUIZ_CARD answerIndex ${q.answerIndex} is outside options[] (0-${opts.length - 1})`);
    // The hold is the point. Reveal too early and the viewer never commits to an
    // answer, which is the only reason the correction sticks. ~5s ≈ 12 words.
    if (q.revealAtWord != null && q.atWord != null && q.revealAtWord - q.atWord < 8)
      W(`${id}: QUIZ_CARD reveals ${(q.revealAtWord - q.atWord).toFixed(1)} words after the question — leave ~5s of silence (≈12 words) so the viewer actually answers.`);
    // ...but measuring from atWord (when the OPTIONS appear) is not enough, and a
    // shipped episode proved it: a 20-word question followed immediately by
    // "Ready? Option B" cleared the check above while giving the viewer literally
    // no time to think. Owner: "there is no gap at all between you asking the
    // question and the answer getting highlighted."
    // What actually matters is the gap between the QUESTION ENDING and the reveal,
    // and that gap has to be FILLED — a single TTS block has no silence in it, so
    // the thinking time is bought with words that give nothing away. The pattern
    // that worked for a dozen episodes: "...which check is reliable? Have a think,
    // and pause the video if you want longer. Ready? It is C."
    // Word-index maths only means anything BEFORE sync: afterwards revealAtWord holds
    // a frame (encoded as frame/FPW+1), so rounding it would index a random word. This
    // is the right moment to catch it anyway — pre-sync is when the narration can still
    // be rewritten without a re-voice.
    const qNar = String(s.narration ?? '');
    if (q.revealAtWord != null && qNar && s.timingSource !== 'tts') {
      const wds = qNar.trim().split(/\s+/);
      const revIdx = Math.min(Math.max(1, Math.round(q.revealAtWord)), wds.length) - 1;
      let lastQ = -1;
      for (let i = 0; i < revIdx; i++) if (wds[i].includes('?')) lastQ = i;
      if (lastQ >= 0) {
        const gap = revIdx - lastQ;
        const window = wds.slice(lastQ + 1, revIdx + 1).join(' ');
        const cue = /\b(think|pause|guess|decide|commit|call it|no rush|take a (second|moment)|your (call|answer))\b/i.test(window);
        if (gap < 9 || !cue)
          W(`${id}: QUIZ_CARD gives ${gap} word(s) between the question and the reveal${cue ? '' : ', and no pause cue'} — the viewer gets no thinking time. Put an invitation between them ("Have a think, and pause if you want longer.") and anchor the reveal AFTER it.`);
      }
    }
  }
  // THEATER_STAGE — budgets sized to the NARROW (vertical) stage: the actor row
  // is 5 cells wide at most, so a label over 14 glyphs collides with its neighbour.
  if (d.stage) {
    const st = d.stage;
    if (len(st.marquee) > 26) E(`${id}: THEATER_STAGE marquee > 26 chars (it sits in one line over the arch)`);
    if (len(st.caption) > 40) E(`${id}: THEATER_STAGE caption > 40 chars`);
    const acts = st.actors ?? [];
    if (acts.length < 2) E(`${id}: THEATER_STAGE needs ≥2 actors — one actor is not a stage, use REVEAL`);
    if (acts.length > 5) E(`${id}: THEATER_STAGE max 5 actors (the row collides on vertical)`);
    acts.forEach((a, i) => {
      if (len(a.label) > 14) E(`${id}: THEATER_STAGE actor ${i + 1} label "${a.label}" > 14 chars (vertical cell width)`);
      if (a.kind && !['button', 'field', 'link', 'text'].includes(a.kind))
        E(`${id}: THEATER_STAGE actor ${i + 1} kind must be button|field|link|text`);
    });
    if (st.curtain && !['raising', 'up', 'falling'].includes(st.curtain))
      E(`${id}: THEATER_STAGE curtain must be raising|up|falling`);
    if (st.spotlightIndex != null && (st.spotlightIndex < 0 || st.spotlightIndex >= acts.length))
      E(`${id}: THEATER_STAGE spotlightIndex ${st.spotlightIndex} is outside actors[] (0-${acts.length - 1})`);
    // The spotlight ARRIVING is the payoff; if it is never aimed, the beat is a
    // static picture of a stage and something else should carry it.
    if (st.spotlightIndex == null && !st.curtain)
      W(`${id}: THEATER_STAGE has neither spotlightIndex nor curtain — nothing happens on the stage. Aim the spotlight or move the curtain.`);
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
      if (!f || typeof f !== 'object' || !f.text) { E(`${id}: FLIP_CARD ${side} must be an OBJECT {label,text,color} — a bare string renders an EMPTY card (defect found 2026-07-17)`); continue; }
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
