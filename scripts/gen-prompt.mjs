#!/usr/bin/env node
// TWO-PASTE (+ single-paste) PROMPT GENERATOR. Every number comes from
// scripts/lib/constants.mjs (the same module the linter imports) and every schema
// from scripts/lib/manifest.mjs — so the prompt can NEVER disagree with the
// validator. Implements Fable's architecture (§3.2/§3.3) and the ratified §4.
//
// Usage:
//   node scripts/gen-prompt.mjs <cfg.json> stage1
//   node scripts/gen-prompt.mjs <cfg.json> stage2 <beats.json>
//   node scripts/gen-prompt.mjs <cfg.json> single
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MANIFEST, MANIFEST_TYPES} from './lib/manifest.mjs';
import {schemaDSL, menuLine} from './lib/schema-dsl.mjs';
import {
  DESIGN_PACKS, CORE_SKINS, LIGHT_THEMES, BACKGROUNDS, TRANSITIONS, TOPIC_AXES,
  BUDGET, HOOK_MAX_WORDS, STUDIO_SOURCE_TYPES, RESTRICTED_FAMILIES, advertised,
} from './lib/constants.mjs';
import {SCREENPLAYS, SCREENPLAY_NAMES} from './screenplays.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfgPath = process.argv[2];
const mode = process.argv[3] || 'stage1';
const beatsPath = process.argv[4];
if (!cfgPath) { console.error('Usage: node scripts/gen-prompt.mjs <cfg.json> stage1|stage2|single [beats.json]'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8').replace(/^\uFEFF/, ''));

const topic = (cfg.topic || '').trim();
const design = cfg.design || 'moderndark';
const theme = cfg.theme || design;
const themeLight = cfg.themeLight || 'daylight';
const format = cfg.format === 'shorts' ? 'short' : (cfg.format || 'long');
const preset = SCREENPLAY_NAMES.includes(cfg.preset) ? cfg.preset : 'explainer';
const audience = cfg.audience || 'general';
const channel = cfg.channel || 'THE STUDIO';
const notes = (cfg.notes || '').trim();
const source = (cfg.source || '').trim();
const sceneRange = SCREENPLAYS[preset]?.scenes || [6, 12];

// restricted family groupings (these read as one skeleton — never adjacent)
function familyGroups() {
  const g = {};
  for (const t of MANIFEST_TYPES) { const f = MANIFEST[t].family; if (RESTRICTED_FAMILIES.includes(f)) (g[f] ||= []).push(t); }
  return Object.entries(g).filter(([, ts]) => ts.length > 1).map(([f, ts]) => `${f} = ${ts.join(', ')}`).join('; ');
}

// Present the palette GROUPED BY INTENT (not the raw Object.keys order). A flat
// 136-line dump buries the specialized components after the core editorial ones,
// so models anchor on the head of the list; grouping by what each does makes the
// long tail discoverable and defeats that primacy bias.
const CATEGORY_ORDER = [
  ['structure', 'STRUCTURE — the spine (open, name, chapter, recap, close)'],
  ['text', 'TEXT MOMENTS — a single line as a beat'],
  ['list', 'LISTS'],
  ['editorial', 'EDITORIAL — quote / flip'],
  ['data', 'DATA & NUMBERS'],
  ['chart', 'CHARTS — choose by the SHAPE of the data'],
  ['diagram', 'DIAGRAMS, FLOWS & MECHANISMS'],
  ['icon', 'ICONS'],
  ['branding', 'LOGOS & BRAND (si: only)'],
  ['mockup', 'MOCKUPS — chat / notification'],
  ['media', 'MEDIA — photo / video / overlays'],
  ['code', 'CODE'],
  ['stream', 'TERMINAL & LOGS'],
  ['framed', 'DEVICES, BROWSERS & WINDOWS'],
  ['gauge', 'GAUGES & METERS'],
  ['zone', 'SYSTEM ZONES'],
  ['systems', 'HARDWARE & SYSTEMS'],
];
function groupedPalette(render, sep) {
  const byCat = {};
  for (const t of MANIFEST_TYPES) { const c = MANIFEST[t].category || 'other'; (byCat[c] ||= []).push(t); }
  const seen = new Set();
  const out = [];
  for (const [cat, title] of CATEGORY_ORDER) {
    const ts = byCat[cat]; if (!ts || !ts.length) continue;
    ts.forEach((t) => seen.add(t));
    out.push(`### ${title}`, ts.map(render).join(sep));
  }
  const rest = MANIFEST_TYPES.filter((t) => !seen.has(t)); // safety net: never drop a type
  if (rest.length) out.push('### OTHER', rest.map(render).join(sep));
  return out.join('\n');
}

// ONE literal example scene — teaches the exact envelope keys the app expects.
const exampleScene = [
  '## ONE COMPLETE EXAMPLE SCENE (copy these envelope keys EXACTLY)',
  '```json',
  '{ "type": "STAT_CALLOUT", "narration": "Modern vaults wrap every secret in 256-bit AES encryption.",',
  '  "transition": "fade",',
  '  "data": { "value": 256, "suffix": "-bit", "label": "AES vault encryption", "at": "encryption", "source": "illustrative" } }',
  '```',
  'Per-scene keys: `type`, `narration`, `transition` (optional), `data`. NOTHING else \u2014 no id / durationFrames / fps.',
].join('\n');

// The ONE global budget instruction — placed right after the `≤N` legend, where
// the model learns what `≤N` means (attention), not repeated per-field. The "3–6
// words" clause changes PHRASING behaviour (word counts models track) rather than
// demanding character arithmetic (which they can't do).
const BUDGET_LAW = '`\u2264N` is a COUNTED limit \u2014 N+1 characters is rejected outright, so never write up to it. Use the shortest natural phrasing: labels, list items, and step titles read best at 3\u20136 words. If something doesn\u2019t fit naturally, rephrase it \u2014 never pad, never squeeze.';

// VOICE — two layers. (1) NARRATIVE CRAFT: the script must sound like a human who
// KNOWS the topic explaining it to one friend — a point of view, an open loop, one
// carried analogy, a fair cold-water beat, a real takeaway. This is the "soul" that
// separates a genuine explainer from a Wikipedia read-aloud. (2) SPOKEN RHYTHM: the
// narration is read by a neural TTS voice whose prosody is driven ENTIRELY by
// punctuation, so the writing must physically breathe. Applies to every narration
// the model writes (stage 1 + single). The scene narrations, read top to bottom,
// are ONE continuous spoken monologue — write them to flow into each other.
const NARRATION_VOICE = [
  '## VOICE \u2014 write like a human who KNOWS this, talking to ONE friend (not a textbook, not a press release)',
  'Read the scene narrations top-to-bottom as ONE continuous spoken monologue \u2014 each line should flow into the next, not restart.',
  '- Open on what the viewer already believes or has \u201cheard a hundred times,\u201d then complicate it. Take a clear STANCE in the first breath (\u201cThe honest answer? No \u2014 and also, kind of yes.\u201d).',
  '- Plant ONE open loop early (\u201clet me show you exactly what broke\u201d) and pay it off before the end. Use callbacks \u2014 reference something you said earlier so the video feels authored, not assembled.',
  '- Carry ONE analogy the whole way through; don\u2019t start a fresh metaphor every scene.',
  '- Be fair to the other side before you make your case (\u201csome fairness \u2014 I genuinely like X\u201d) and include ONE honest limitation or cold-water beat. Nuance reads as authority; cheerleading reads as an ad.',
  '- Prefer the concrete over the abstract: a real product the viewer uses, a moment they remember, a named example \u2014 never \u201ca certain framework.\u201d',
  '- Land on a real TAKEAWAY: what the viewer should now DO or believe \u2014 not a summary of what you just said.',
  '',
  '## SPOKEN RHYTHM \u2014 the narration is read by a neural TTS voice; its rhythm comes ONLY from your punctuation',
  '- Commas for natural breath pauses; em-dashes (\u2014) for a beat or an aside; real questions (?) to lift intonation.',
  '- Use contractions (it\u2019s, they\u2019re, that\u2019s) and vary sentence length \u2014 a long line, then a short punch. Not everything is a full sentence.',
  '- Read each line aloud in your head: if it sounds stiff or listy, rewrite it until it flows.',
  '- Never stack three flat declaratives in a row \u2014 that is exactly what makes TTS sound like a robot.',
].join('\n');

// RESEARCH — a bare topic is a starting point, not the script. This block makes the
// model MINE the topic for concrete, real specifics (named companies/products/
// versions/events/numbers) instead of paraphrasing the one line it was handed. It is
// written to coexist with the TRUTH block: research means pulling in VERIFIABLE
// specifics, never inventing time-sensitive facts.
const RESEARCH_DEPTH = [
  '## RESEARCH THE TOPIC \u2014 go BEYOND the one line you were given',
  'A topic is where you START, not what you write. A knowledgeable person doesn\u2019t summarize a headline \u2014 they reach for the specifics that prove they actually understand it.',
  '- If you can browse or search, do it NOW and pull CONCRETE specifics: the named companies, products, versions, dates, and real numbers an expert would cite (e.g. \u201cFigma\u2019s canvas is C++ compiled to WebAssembly,\u201d \u201cBlazor is roughly 42% of live WASM\u201d). Specifics are what separate an expert from a summary.',
  '- Find the ONE surprising, non-obvious truth underneath the headline \u2014 the thing most explainers miss \u2014 and build the whole video around it.',
  '- Show who ACTUALLY wins today and where the hype breaks down; a real, current landscape beats a vague overview.',
  '- RESPECT THE SOURCE: every stat / chart / studio scene carries a REAL attribution in its data.source \u2014 outlet + date ("Reuters, Jul 2026"), the paper, or the vendor\u2019s own announcement. "illustrative" is the exception you consciously choose for made-up example numbers, never the default for facts you were too lazy to attribute.',
  '- RESPECT THE VIEWER with earned depth: include at least one fun fact people will repeat to a friend, and one harsh reality / cold-water beat the fans won\u2019t like. Specifics over vibes \u2014 a video that only flatters its topic is an ad, not an explainer.',
  '- TRUTH still governs everything (see above): never fabricate a number, quote, version, or date. If you can\u2019t verify a time-sensitive fact, write `MISSING: <fact>` and mark illustrative figures with data.source "illustrative". Well-established evergreen facts you are confident about are fine.',
].join('\n');

// REACH-FOR — the missing POSITIVE pressure. The palette teaches WHAT each
// component is; this teaches WHEN to reach for it from a content signal, so the
// model stops collapsing every topic onto HOOK/TITLE_CARD/STAT_CALLOUT/LIST_BUILD/
// STEP_FLOW/RECAP/OUTRO. A number is NOT automatically a STAT_CALLOUT; a
// comparison is NOT automatically a list. Ported from the director skill (4b).
const REACH_FOR = [
  '## REACH FOR THE RIGHT SHAPE (match the component to what the narration NAMES \u2014 do not default to text/lists)',
  'When a line names one of these, use the component built for it:',
  '- a company / product / tool / brand \u2192 LOGO_WALL (a set / \u201ctrusted by\u201d), LOGO_VERSUS (X vs Y), LOGO_TIMELINE (evolution), or ICON_CALLOUT (one hero). Brand logos via si: only.',
  '- a tech stack / feature set / \u201cwhat\u2019s included\u201d \u2192 ICON_GRID; \u201cconnects to everything\u201d / an ecosystem hub \u2192 ICON_BURST.',
  '- data BY SHAPE: trend over time \u2192 LINE_CHART; share of a whole \u2192 DONUT or PICTOGRAM; ranking / magnitude \u2192 BAR_COMPARE; conversion / drop-off \u2192 FUNNEL; cumulative +/\u2212 bridge \u2192 WATERFALL; multi-axis profile \u2192 RADAR; price / OHLC \u2192 CANDLESTICK; spread / variance \u2192 BOX_PLOT; nested sizes \u2192 TREEMAP; flow of value \u2192 SANKEY; ONE hero number \u2192 STAT_CALLOUT; a few numbers \u2192 STAT_PANELS.',
  '- a market / stock / crypto / live prices \u2192 TICKER_TAPE.',
  '- a mechanism / architecture / how-it-works \u2192 DIAGRAM (sequence=handshake, tree=hierarchy, block=architecture, hub=one-to-many, flow=pipeline) or CONCEPT_DIAGRAM; a numbered / sequential process \u2192 STEP_FLOW or PIPELINE; two forking outcomes \u2192 SPLIT_PATHS.',
  '- a phone / app / device / UI \u2192 DEVICE_FRAME, WINDOW_FRAME, or CHAT_MOCKUP; code / a terminal \u2192 CODE_WINDOW, CODE_EDITOR, or TERMINAL_SESSION.',
  '- bits / bytes / memory / quantization \u2192 BITS, MEMORY, or NUMBER_BASE; encryption \u2192 ENCRYPTION; a data structure \u2192 POINTER_DIAGRAM, QUEUE, or CALL_STACK.',
  '- set-pieces: an equation \u2192 FORMULA; chemistry \u2192 MOLECULE; genetics \u2192 DNA_HELIX; \u201clabel the parts\u201d \u2192 LABELED_FIGURE; physics forces \u2192 VECTOR_FIELD; a circuit \u2192 CIRCUIT_FLOW; monitoring / scanning \u2192 MAP_RADAR.',
  '- a punch / breather / one-line statement \u2192 KINETIC_TEXT; a person or principle that carries weight \u2192 QUOTE_SPOTLIGHT; a dated sequence \u2192 TIMELINE.',
  'Every video needs at least one genuinely VISUAL moment (a diagram, chart, device, media, or kinetic beat). A spec built only from HOOK / TITLE_CARD / STAT_CALLOUT / LIST_BUILD / STEP_FLOW / RECAP / OUTRO_CTA is under-directed and will be REJECTED \u2014 those are the connective tissue, not the whole video. These are cues, not quotas: still obey the anti-monotony law and one idea per scene.',
].join('\n');

// CASTING PROTOCOL — the mechanism that stops autopilot. Teaching the palette is
// not enough: a model (especially a small one) still grabs the same familiar cards
// unless it is forced to SHOW ITS WORK per beat. So every beat carries a worksheet
// — shape (from a closed vocabulary) → three candidates from DIFFERENT groups → the
// most specific type, chosen LAST. Writing the deliberation IS the deliberation.
// This is local to each beat (no cross-video memory) and is dropped before render.
const CASTING_PROTOCOL = [
  '## CAST EVERY BEAT DELIBERATELY — the single most important rule',
  'The #1 failure is autopilot: reaching for the same few cards (STAT_CALLOUT, SPLIT_PATHS, TIMELINE, SPEC_COMPARE, LIST_BUILD, STEP_FLOW, QUOTE_SPOTLIGHT) on every topic. You will NOT do that. For EVERY beat you fill a tiny worksheet FIRST and pick the component LAST:',
  '1. shape — in a few words, what is this beat’s content ACTUALLY? Choose from: cold-open stake · name/title · chapter turn · one hero number · a few numbers · trend over time · proportion of a whole · ranking / magnitude · flow / drop-off · brand-vs-brand · a set of brands · mechanism / architecture · step-by-step process · fork / either-or · dated sequence · quote / principle · device / app / UI · code / terminal · data structure / bits / memory · set-piece (formula / molecule / circuit / DNA / label) · monitoring / scan · one-line punch · recap · close / CTA. Decide the shape from the NARRATION, BEFORE you look at any component.',
  '2. considered — name THREE candidate components that could carry that shape, EACH FROM A DIFFERENT GROUP in the menu, with one short clause each on why. Scan the WHOLE menu, every group top to bottom — not just the first few; the specialist families near the end exist because a purpose-built shape beats a generic card. At least ONE of the three MUST be a specialist (a chart, a diagram, a device, a media, or a set-piece) unless the beat is genuinely a bare HOOK / title / recap / CTA. If the shape has an obvious purpose-built match (brand-vs-brand → LOGO_VERSUS; trend → LINE_CHART; architecture → DIAGRAM; proportion → DONUT; dated sequence → TIMELINE), it MUST be one of the three.',
  '3. type — pick the MOST SPECIFIC fit of your three. If you choose a generic card (LIST_BUILD / STAT_CALLOUT / STEP_FLOW / CONCEPT_DIAGRAM / TITLE_CARD) over a specialist you listed, add one clause saying why the specialist did NOT fit. “It’s simpler” or “it’s cleaner” is NOT a valid reason.',
  'Take your time — a small or fast model is NEVER an excuse to skip the worksheet. The worksheet IS how you think, written down. Never jump straight to a type.',
].join('\n');

// ---- shared blocks -----------------------------------------------------------
const truth = source
  ? ['## TRUTH (most important)', 'Ground EVERY fact ONLY in the SOURCE below. Never invent numbers, dates,',
     'quotes, prices, or versions. A missing fact → write `MISSING: <fact>` in that narration.',
     'Mark illustrative numbers with a data.source of "illustrative".', '', '### SOURCE', '```', source, '```'].join('\n')
  : ['## TRUTH (most important)', 'For an evergreen/conceptual topic, definitional facts are fine. Do NOT invent',
     'time-sensitive numbers (prices, "current/latest" X); if needed, write `MISSING: <fact>`',
     'and mark illustrative numbers with data.source "illustrative".'].join('\n');

const laws = [
  '## STRUCTURAL LAWS (the linter enforces these exact numbers)',
  `1. Scene 1 is HOOK; the last scene is OUTRO_CTA (or RECAP).`,
  `2. Scene count for "${preset}": ${sceneRange[0]}\u2013${sceneRange[1]} (a ${format} video).`,
  `3. Anti-monotony: never two same-family components adjacent; use \u2265 min(8, round(N/2)) DISTINCT types; no single type > ~35% of scenes.`,
  `3b. Vary the skeleton — avoid placing two of the same shape-family back-to-back (they read as one look): ${familyGroups()}.`,
  `4. HOOK (s01) is the TIGHTEST line in the whole video: aim for 10\u201313 words, HARD CAP ${HOOK_MAX_WORDS} (it must fit \u22648s). COUNT the words in s01 before you output \u2014 if it is over ${HOOK_MAX_WORDS}, cut it. A hook is a punch, not a sentence. One clear idea per scene; spoken, \u226420-word sentences.`,
  `5. Studio components (${STUDIO_SOURCE_TYPES.join(', ')}) MUST include a factual "source" \u2264${advertised(BUDGET.source)} chars.`,
  `6. Semantic colors MEAN: green=works, red=broken, blue=info, purple=AI, orange=tension, yellow=cost.`,
  `7. Assets: lucide: (glyphs) · si: (brand logos) · img: (only files that exist). Never invent files. If a media scene needs a real photo/clip/logo you don't have, DECLARE it: add {key, kind, query} to a top-level "assetsNeeded" list and reference it as "needed:<key>" — never fabricate a URL.`,
  `8. PAYOFF EARLY (animation timing): the word that names each scene's visual payoff must land in the FIRST ~70% of that narration — the element animates in AT that word, and it needs on-screen time to be absorbed. Spend the closing words on meaning ("…and that changes everything"), never on the first mention of the reveal. A payoff named on the final word animates with zero time to breathe (linted).`,
  `9. CAST EVERY BEAT VIA THE WORKSHEET (see “CAST EVERY BEAT DELIBERATELY” above): shape → three candidates from DIFFERENT groups → the most specific type, in that order. NEVER assign a component without it. Scan the whole menu below, every group to the last — the specialist families exist because a purpose-built shape beats a generic card (also linted).`,
].join('\n');

const brief = [
  '## BRIEF',
  `- Topic: ${topic || '<fill in>'}`,
  `- Format: ${format} (${format === 'short' ? '1080\u00d71920 vertical' : '1920\u00d71080 landscape'})`,
  `- Screenplay: ${preset}  ·  Audience: ${audience}  ·  Channel: ${channel}`,
  `- Look: brand.design="${design}", brand.theme="${theme}", brand.themeLight="${themeLight}"`,
  notes ? `- Notes: ${notes}` : '',
].filter(Boolean).join('\n');

// ---- STAGE 1 — beat sheet ----------------------------------------------------
function stage1() {
  return [
    'You are the DIRECTOR of iAuteur, a video factory. STAGE 1 of 2: plan the BEAT SHEET only.',
    'Output ONLY the JSON described in OUTPUT — no prose, no spec data yet.', '',
    brief, '', truth, '', RESEARCH_DEPTH, '', laws, '', REACH_FOR, '',
    CASTING_PROTOCOL, '',
    NARRATION_VOICE, '',
    '## topicAxes — pick \u22652 (channel strategy):', TOPIC_AXES.map((a) => `\`${a}\``).join(' · '), '',
    `## COMPONENT MENU (choose types from THIS list only — ${MANIFEST_TYPES.length} available, grouped by what they do)`,
    groupedPalette(menuLine, '\n'), '',
    '## OUTPUT (one JSON object)',
    '```json',
    '{',
    '  "meta": { "topic": "...", "onePayoff": "...", "openLoop": "...", "analogy": "...",',
    `           "screenplay": "${preset}", "topicAxes": ["...", "..."] },`,
    '  "beats": [',
    '    { "id": "s01", "shape": "cold-open stake", "considered": [ {"t":"HOOK","why":"scene 1 stake"}, {"t":"REVEAL","why":"one dramatic line"}, {"t":"KINETIC_TEXT","why":"a punch"} ], "type": "HOOK", "intent": "the stake", "narration": "one punchy hook line \u2014 10 to 13 words" }',
    `    // ${sceneRange[0]}\u2013${sceneRange[1]} beats. EVERY beat carries shape + considered (3, each from a DIFFERENT group) + type, decided in that order. First beat is HOOK (COUNT its words: \u2264${HOOK_MAX_WORDS}, aim 10\u201313); last is OUTRO_CTA or RECAP.`,
    '  ]',
    '}',
    '```',
    'Write natural narration now. STAGE 2 will fill each beat\u2019s visual data.',
  ].join('\n');
}

// ---- STAGE 2 — fill ----------------------------------------------------------
function stage2() {
  let beats = [];
  try { const raw = JSON.parse(fs.readFileSync(beatsPath, 'utf8').replace(/^\uFEFF/, '')); beats = raw.beats || raw; } catch {}
  const chosen = [...new Set(beats.map((b) => b.type))].filter((t) => MANIFEST[t]);
  const beatList = beats.map((b) => `  ${b.id} ${b.type}: ${JSON.stringify(b.narration || '')}`).join('\n');
  return [
    'You are the DIRECTOR of iAuteur. STAGE 2 of 2: FILL each beat\u2019s visual data.',
    'Output ONLY the final spec JSON. Keep the narration and order from the beat sheet unchanged.', '',
    truth, '',
    '## The beat sheet (fixed):', beatList, '',
    exampleScene, '',
    '## SCHEMAS for the component types you must fill',
    '(`!`=required · `?`=optional · `\u2264N`=max chars · anchors: `at:"word"` = a word copied from THIS scene\u2019s narration)',
    BUDGET_LAW, '',
    chosen.map(schemaDSL).join('\n\n'), '',
    '## RULES',
    '- Do NOT write durationFrames, timingSource, fps, or scene id \u2014 the app owns those.',
    '- `transition` (optional) is a SCENE CUT, one of: ' + TRANSITIONS.join(', ') + '.',
    ...(format === 'short' ? [] : ['- Vary the cutting: a long video needs at least 5 DISTINCT transition kinds, chosen for the beat (a diagram assembling → push/morph; a set of tiles → slide; a verdict → dip). Reusing only fade/slide/push is linted.']),
    '- background (optional): zoneA|zoneB|zoneC or a named background.',
    `- Studio components need a "source". HOOK headline ≤${advertised(BUDGET.hookHeadline)}.`,
    `- ${format === 'short' ? 'cover' : 'thumbnail'}.title ≤ ${advertised(BUDGET.coverTitle)} chars — a SHORT punch (3–4 words), NOT the full topic; badge ≤ ${advertised(BUDGET.badgeInCard)}.`, '',
    '## OUTPUT \u2014 story & look already come from the beat sheet + console. Return ONLY:',
    '```json',
    '{',
    format === 'short'
      ? '  "cover": { "title": "...", "badge": "...", "asset": "lucide:..." },'
      : '  "thumbnail": { "title": "...", "badge": "...", "asset": "lucide:..." },',
    '  "scenes": [ { "id": "s01", "type": "HOOK", "narration": "...", "transition": "fade", "data": { /* per schema */ } } ]',
    '}',
    '```',
  ].join('\n');
}

// ---- SINGLE-PASTE (frontier models) -----------------------------------------
function single() {
  return [
    'You are the DIRECTOR of iAuteur, a video factory. Produce a complete spec JSON in ONE response.',
    'First think a beat sheet, then output ONLY the final spec JSON (no prose).', '',
    brief, '', truth, '', RESEARCH_DEPTH, '', laws, '', REACH_FOR, '',
    CASTING_PROTOCOL, '', exampleScene, '',
    NARRATION_VOICE, '',
    '## topicAxes — pick \u22652:', TOPIC_AXES.map((a) => `\`${a}\``).join(' · '), '',
    `## COMPONENT PALETTE (${MANIFEST_TYPES.length} types — use ONLY these; grouped by what they do; each with its exact data schema)`,
    '(`!`=required · `?`=optional · `\u2264N`=max chars · anchors: `at:"word"` copied from the scene’s narration)',
    BUDGET_LAW, '',
    groupedPalette(schemaDSL, '\n\n'), '',
    '## RULES',
    '- Do NOT write durationFrames, timingSource, fps, or scene id \u2014 the app owns those.',
    `- HOOK (first scene) narration MUST be \u2264 ${HOOK_MAX_WORDS} words \u2014 count them and cut; aim for 10\u201313. A hook is a punch, not a sentence.`,
    '- `transition` is a SCENE CUT: ' + TRANSITIONS.join(', ') + '. (Entrance animations live inside a component’s data, never as a transition.)',
    `- ${format === 'short' ? 'cover' : 'thumbnail'}.title ≤ ${advertised(BUDGET.coverTitle)} chars — a SHORT punch (3–4 words), NOT the full topic; badge ≤ ${advertised(BUDGET.badgeInCard)}.`, '',
    '## OUTPUT \u2014 the console owns the envelope (topic/format/design/theme/channel are added by the app).',
    'Return ONE JSON object with EXACTLY these keys \u2014 NO meta, NO brand. Fill `casting` FIRST (one worksheet row per scene, same order as scenes), then `scenes`:',
    '```json',
    '{',
    '  "onePayoff": "...", "openLoop": "...", "analogy": "...", "topicAxes": ["...","..."],',
    '  "casting": [ { "id": "s01", "shape": "cold-open stake", "considered": [ {"t":"HOOK","why":"scene 1 stake"}, {"t":"REVEAL","why":"dramatic line"}, {"t":"KINETIC_TEXT","why":"a punch"} ], "type": "HOOK" } ],',
    `  "${format === 'short' ? 'cover' : 'thumbnail'}": { "title": "...", "badge": "...", "asset": "lucide:..." },`,
    '  "scenes": [ { "type": "HOOK", "narration": "...", "transition": "fade", "data": { /* per schema */ } } ]',
    '}',
    '```',
    'The `casting` array is your visible thinking \u2014 the app reads it to confirm you deliberated, then DROPS it; the video is built from `scenes`. There must be one casting row per scene, in order, and `scenes[i].type` MUST equal `casting[i].type`.',
    'Output only the JSON.',
  ].join('\n');
}

process.stdout.write(({stage1, stage2, single}[mode] || stage1)().trim() + '\n');
