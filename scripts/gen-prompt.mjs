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

// VOICE — narration is spoken by Edge-TTS, whose prosody is driven ENTIRELY by
// punctuation. Flat, comma-less sentences sound robotic; this block makes the
// script breathe. Applies to every narration the model writes (stage 1 + single).
const NARRATION_VOICE = [
  '## VOICE \u2014 write narration to be SPOKEN, not read',
  'The narration is fed to a neural TTS voice; its rhythm comes ONLY from your punctuation.',
  '- Use commas for natural breath pauses, and em-dashes (\u2014) for a beat or an aside.',
  '- Ask real questions (?) to lift intonation; use the occasional short punch. Not everything!',
  '- Use contractions (it\u2019s, they\u2019re, that\u2019s) and vary sentence length \u2014 a long line, then a short one.',
  '- Open scenes like a host continuing a story (\u201cBut here\u2019s the twist\u2026\u201d, \u201cAnd that\u2019s when\u2026\u201d), not a textbook.',
  '- Read each line aloud in your head: if it sounds stiff or listy, rewrite it until it flows.',
  '- Never stack three flat declaratives in a row; that is what makes TTS sound like a robot.',
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
  `3b. These count as ONE family - NEVER place two adjacent: ${familyGroups()}.`,
  `4. HOOK narration \u2264 ${HOOK_MAX_WORDS} words (it must fit \u22648s). One clear idea per scene; spoken, \u226420-word sentences.`,
  `5. Studio components (${STUDIO_SOURCE_TYPES.join(', ')}) MUST include a factual "source" \u2264${advertised(BUDGET.source)} chars.`,
  `6. Semantic colors MEAN: green=works, red=broken, blue=info, purple=AI, orange=tension, yellow=cost.`,
  `7. Assets: lucide: (glyphs) · si: (brand logos) · img: (only files that exist). Never invent files. If a media scene needs a real photo/clip/logo you don't have, DECLARE it: add {key, kind, query} to a top-level "assetsNeeded" list and reference it as "needed:<key>" — never fabricate a URL.`,
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
    brief, '', truth, '', laws, '',
    NARRATION_VOICE, '',
    '## topicAxes — pick \u22652 (channel strategy):', TOPIC_AXES.map((a) => `\`${a}\``).join(' · '), '',
    `## COMPONENT MENU (choose types from THIS list only — ${MANIFEST_TYPES.length} available)`,
    MANIFEST_TYPES.map(menuLine).join('\n'), '',
    '## OUTPUT (one JSON object)',
    '```json',
    '{',
    '  "meta": { "topic": "...", "onePayoff": "...", "openLoop": "...", "analogy": "...",',
    `           "screenplay": "${preset}", "topicAxes": ["...", "..."] },`,
    '  "beats": [',
    '    { "id": "s01", "type": "HOOK", "intent": "the stake", "narration": "the exact spoken line" }',
    `    // ${sceneRange[0]}\u2013${sceneRange[1]} beats; last is OUTRO_CTA or RECAP`,
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
    '- background (optional): zoneA|zoneB|zoneC or a named background.',
    `- Studio components need a "source". HOOK headline \u2264${advertised(BUDGET.hookHeadline)}.`, '',
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
    brief, '', truth, '', laws, '', exampleScene, '',
    NARRATION_VOICE, '',
    '## topicAxes — pick \u22652:', TOPIC_AXES.map((a) => `\`${a}\``).join(' · '), '',
    `## COMPONENT PALETTE (${MANIFEST_TYPES.length} types — use ONLY these; each with its exact data schema)`,
    '(`!`=required · `?`=optional · `\u2264N`=max chars · anchors: `at:"word"` copied from the scene\u2019s narration)',
    BUDGET_LAW, '',
    MANIFEST_TYPES.map(schemaDSL).join('\n\n'), '',
    '## RULES',
    '- Do NOT write durationFrames, timingSource, fps, or scene id \u2014 the app owns those.',
    '- `transition` is a SCENE CUT: ' + TRANSITIONS.join(', ') + '. (Entrance animations live inside a component\u2019s data, never as a transition.)', '',
    '## OUTPUT \u2014 the console owns the envelope (topic/format/design/theme/channel are added by the app).',
    'Return ONE JSON object with EXACTLY these keys \u2014 NO meta, NO brand:',
    '```json',
    '{',
    '  "onePayoff": "...", "openLoop": "...", "analogy": "...", "topicAxes": ["...","..."],',
    `  "${format === 'short' ? 'cover' : 'thumbnail'}": { "title": "...", "badge": "...", "asset": "lucide:..." },`,
    '  "scenes": [ { "type": "HOOK", "narration": "...", "transition": "fade", "data": { /* per schema */ } } ]',
    '}',
    '```',
    'Output only the JSON.',
  ].join('\n');
}

process.stdout.write(({stage1, stage2, single}[mode] || stage1)().trim() + '\n');
