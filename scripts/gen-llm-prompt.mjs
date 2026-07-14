#!/usr/bin/env node
// Compiles a SELF-CONTAINED prompt the user pastes into their own LLM
// (Claude / ChatGPT / Gemini) to get a valid iAuteur spec JSON back.
//
// It teaches the LLM EVERYTHING the director needs to choose correctly:
//   - the exact spec JSON schema (meta / brand / thumbnail|cover / scenes)
//   - ALL scene component types (the full authoritative TYPES list — nothing missed)
//   - every design pack + dark/light theme + background + transition + animation
//   - the hard laws (HOOK first, OUTRO/RECAP last, anti-monotony, budgets, TRUTH)
//
// Single source of truth: it READS scripts/lint-spec.mjs + scripts/catalog.mjs so
// the prompt never drifts from what the linter actually enforces. Read-only.
//
// Usage: node scripts/gen-llm-prompt.mjs <config.json>   (prompt → stdout)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const cfgPath = process.argv[2];
if (!cfgPath) {
  console.error('Usage: node scripts/gen-llm-prompt.mjs <config.json>');
  process.exit(2);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8').replace(/^\uFEFF/, ''));

// ---- read the authoritative sources (single source: constants + catalog) ----
const {CATALOG, ASSET_SOURCES} = await import(
  'file://' + path.join(ROOT, 'scripts', 'catalog.mjs').replace(/\\/g, '/')
);
const {TYPES, DARK_THEMES, LIGHT_THEMES, TRANSITIONS, ANIMS, SEM, BUDGET, BACKGROUNDS} = await import(
  'file://' + path.join(ROOT, 'scripts', 'lib', 'constants.mjs').replace(/\\/g, '/')
);

const designs = cfg.designs || []; // [{key,label}] passed in by the console
const designKeys = designs.map((d) => d.key);
const CORE_SKINS = DARK_THEMES.filter((t) => !designKeys.includes(t) && t !== 'creatorGlow');

// ---- config the user chose --------------------------------------------------
const topic = (cfg.topic || '').trim();
const design = cfg.design || 'moderndark';
const theme = cfg.theme || design;
const themeLight = cfg.themeLight || 'daylight';
const format = cfg.format || 'both';
const preset = cfg.preset || 'explainer';
const audience = cfg.audience || 'general';
const minutes = cfg.minutes || '';
const background = (cfg.background || '').startsWith('(') ? '' : cfg.background || '';
const channel = cfg.channel || 'THE STUDIO';
const notes = (cfg.notes || '').trim();
const source = (cfg.source || '').trim();

// ---- component catalog block (ALL types; nothing skipped) -------------------
function componentLines() {
  const documented = [];
  const bare = [];
  for (const t of TYPES) {
    const c = CATALOG[t];
    if (c) {
      const slots = (c.assets?.slots || [])
        .map((s) => `${s.path}${s.required ? ' (required)' : ''}`)
        .join(', ');
      const asset = slots ? ` · assets: ${slots}` : '';
      documented.push(
        `- **${t}** [${c.category}] — ${c.purpose} USE WHEN: ${c.useWhen}${asset}`
      );
    } else {
      bare.push(t);
    }
  }
  let out = documented.join('\n');
  if (bare.length) {
    out +=
      '\n\nAdditional available component types (same JSON shape — pick these too ' +
      'when they fit the beat; see references/scene_library.md for details):\n' +
      bare.map((t) => `\`${t}\``).join(', ');
  }
  return out;
}

const budgetLines = Object.entries(BUDGET)
  .map(([k, v]) => `${k} ≤ ${v} chars`)
  .join(' · ');

// ---- assemble the prompt ----------------------------------------------------
const L = [];
const p = (s = '') => L.push(s);

p('You are the DIRECTOR + SCREENWRITER for **iAuteur**, a Remotion video factory.');
p('Produce a single JSON video specification. Output **ONLY** the JSON (see OUTPUT');
p('at the end). Do not add prose before or after the JSON code block(s).');
p('');
p('## The brief');
p(`- **Topic:** ${topic || '<fill in>'}`);
p(`- **Format:** ${format}  (long = 1920×1080 landscape; shorts = 1080×1920 vertical)`);
p(`- **Screenplay preset:** ${preset}`);
p(`- **Audience:** ${audience}`);
if (minutes) p(`- **Target length:** ~${minutes} min (use screenplay "documentary" + CHAPTER scenes for 8+ min)`);
p(`- **Design pack:** ${design}  →  set brand.design="${design}", brand.theme="${theme}"`);
p(`- **Light twin:** brand.themeLight="${themeLight}"`);
if (background) p(`- **Background:** brand.background="${background}"`);
p(`- **Channel name:** ${channel}`);
if (notes) p(`- **Notes / constraints:** ${notes}`);
p('');

p('## TRUTH — the most important rule');
if (source) {
  p('Ground EVERY fact ONLY in the SOURCE below (or state it is common knowledge).');
  p('Never invent statistics, dates, quotes, prices, or version numbers. If a needed');
  p('fact is not in the source, write `MISSING: <fact>` in that narration line instead');
  p('of guessing. Mark any illustrative number by setting the scene data `source` field');
  p('to "illustrative".');
  p('');
  p('### SOURCE');
  p('```');
  p(source);
  p('```');
} else {
  p('No source was provided. For an evergreen / conceptual topic ("how X works"),');
  p('definitional facts are fine. Do NOT invent time-sensitive numbers (prices, current');
  p('versions, "latest" anything); if the topic needs those, write `MISSING: <fact>` in');
  p('the narration and mark illustrative numbers with data.source="illustrative".');
}
p('');

p('## The JSON schema');
p('```jsonc');
p('{');
p('  "meta": {');
p('    "topic": "<full descriptive topic>",');
p(`    "format": "${format === 'shorts' ? 'short' : 'long'}",   // "long" or "short" (per file)`);
p('    "fps": 30,');
p('    "onePayoff": "<the ONE thing the viewer takes away>",');
p('    "openLoop": "<the curiosity question the hook opens>",');
p('    "analogy": "<the through-line analogy>",');
p(`    "screenplay": "${preset}"`);
p('  },');
p('  "brand": {');
p(`    "theme": "${theme}",          // DARK skin (light renders automatically)`);
p(`    "design": "${design}",         // the design pack`);
p(`    "themeLight": "${themeLight}",`);
if (background) p(`    "background": "${background}",`);
p(`    "channel": "${channel}"`);
p('  },');
if (format === 'shorts') {
  p('  "cover": { "title": "<short punchy>", "badge": "<2-4 words>", "asset": "lucide:<icon>", "frames": 2 },');
} else {
  p('  "thumbnail": { "title": "<short punchy>", "badge": "<2-4 words>", "asset": "lucide:<icon>" },');
}
p('  "scenes": [');
p('    {');
p('      "id": "s01",                 // s01, s02, … in order');
p('      "type": "HOOK",              // scene 1 MUST be HOOK');
p('      "narration": "<the exact spoken sentence — this becomes the voiceover>",');
p('      "durationFrames": 210,       // ESTIMATE ≈ (words in narration × 12) + 30');
p('      "timingSource": "estimated", // ALWAYS "estimated" — the app re-times from real TTS');
p('      "background": "zoneA",       // zoneA | zoneB | zoneC (rotate for rhythm) or a named background');
p('      "data": { /* type-specific — see components below; use atWord anchors */ }');
p('    }');
p('    // … more scenes … last scene MUST be OUTRO_CTA (or RECAP)');
p('  ]');
p('}');
p('```');
p('');
p('### Field rules');
p('- **narration** is the spoken line. Keep it natural and paced; it drives the voiceover');
p('  and the scene length. One clear idea per scene.');
p('- **durationFrames**: estimate only. Rough guide ≈ (number of words × 12) + 30 at 30fps.');
p('  The app regenerates real per-word timing from Edge-TTS afterwards, so approximate is fine.');
p('- **timingSource** must be "estimated".');
p('- **atWord** (inside data): the 1-based WORD INDEX within THIS scene\'s narration at which');
p('  that element animates in. Count the words in the narration and point anchors at the moment');
p('  the narrator says the relevant word. Every animated element (headline, node, bar, step…)');
p('  takes an atWord so motion lands on the voice.');
p('- **transition** (optional, from scene 2 on): one of ' + TRANSITIONS.map((t) => `\`${t}\``).join(', ') + '.');
p('- **background** per scene: zoneA/zoneB/zoneC (theme zones) or a named background: ' + BACKGROUNDS.map((b) => `\`${b}\``).join(', ') + '.');
p('- **anim** (where a component takes one): ' + ANIMS.map((a) => `\`${a}\``).join(', ') + '.');
p('- **semantic colors** (where a component takes a color): ' + SEM.map((c) => `\`${c}\``).join(', ') + '.');
p('- **assets**: icons/logos only from these sources — ' +
  Object.entries(ASSET_SOURCES).map(([k, v]) => `\`${k}\` (${v.split(' — ')[0]})`).join('; ') +
  '. Never invent image files.');
p('');

p('## HARD LAWS (the linter rejects violations)');
p('1. Scene 1 is **HOOK**. The last scene is **OUTRO_CTA** (or RECAP).');
p('2. **Anti-monotony:** never place two same-family components adjacent; across a video of');
p('   N≥8 scenes use at least ~min(8, N/2) DISTINCT component types, and no single type more');
p('   than ~35% of scenes. Reach broadly across the component palette below.');
p('3. **Text budgets** (characters): ' + budgetLines + '.');
p('4. **Deterministic only** — no reference to randomness; motion is frame-driven.');
p('5. **Theme fits the topic** — pick a design whose mood matches the subject.');
p('');

p('## COMPONENT PALETTE — every available scene `type` (choose the RIGHT one per beat)');
p('Each entry: TYPE [category] — what it is. USE WHEN: when to reach for it.');
p('');
p(componentLines());
p('');

p('## DESIGN PACKS (set brand.design to one key)');
p(designs.map((d) => `\`${d.key}\` (${d.label})`).join(' · ') || designKeys.map((k) => `\`${k}\``).join(' · '));
p('');
p('## DARK THEMES for brand.theme (light renders automatically)');
p('Usually brand.theme = your chosen design pack (its dark twin). Core skins you can also use: ' +
  CORE_SKINS.map((t) => `\`${t}\``).join(', ') + '.');
p('brand.themeLight ∈ ' + LIGHT_THEMES.map((t) => `\`${t}\``).join(', ') + '.');
p('');

p('## OUTPUT');
if (format === 'both') {
  p('Return **TWO** JSON code blocks: first the long-form spec (meta.format="long", landscape');
  p('pacing, ~10–14 scenes unless documentary), then the shorts spec (meta.format="short", a');
  p('tight 5–7 scene vertical cut of the same story). Nothing else.');
} else if (format === 'shorts') {
  p('Return ONE JSON code block: a tight vertical short (meta.format="short", 5–7 scenes). Nothing else.');
} else {
  p('Return ONE JSON code block: the long-form spec (meta.format="long"). Nothing else.');
}
p('');
p('Begin now. Output only the JSON.');

process.stdout.write(L.join('\n') + '\n');
