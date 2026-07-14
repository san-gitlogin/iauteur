#!/usr/bin/env node
// Generates briefs/fable-brief.md — a COMPLETE, code-blind briefing for an
// external expert model ("Fable") to advise on making the iAuteur spec-authoring
// pipeline work with ANY LLM (from <1M-param local models up to frontier APIs).
//
// Everything code-derived (the live system prompt, the full 136-component list,
// the data schema, the validation rules, the laws, the failure example) is READ
// FROM THE REAL SOURCES so the brief never drifts and contains no invented facts.
//
// Usage: node scripts/gen-fable-brief.mjs   ->   briefs/fable-brief.md
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const R = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ---- pull authoritative constants from the linter ---------------------------
const lintSrc = R('scripts/lint-spec.mjs');
function sliceBalanced(src, startToken, open, close) {
  const i = src.indexOf(startToken);
  if (i < 0) return null;
  const s = src.indexOf(open, i);
  if (s < 0) return null;
  let depth = 0;
  for (let j = s; j < src.length; j++) {
    if (src[j] === open) depth++;
    else if (src[j] === close) { depth--; if (depth === 0) return src.slice(s, j + 1); }
  }
  return null;
}
const strArray = (name) => {
  const body = sliceBalanced(lintSrc, `const ${name} = `, '[', ']');
  return body ? [...body.matchAll(/'([^']*)'/g)].map((m) => m[1]) : [];
};
const TYPES = strArray('TYPES');
const DARK_THEMES = strArray('DARK_THEMES');
const LIGHT_THEMES = strArray('LIGHT_THEMES');
const TRANSITIONS = strArray('TRANSITIONS');
const ANIMS = strArray('ANIMS');
const CORE_SKINS = ['studio', 'neonGrid', 'midnight', 'terminal', 'linear', 'vapor', 'luxe'];
const DESIGN_PACKS = DARK_THEMES.filter((t) => !CORE_SKINS.includes(t) && t !== 'creatorGlow');

const {CATALOG} = await import('file://' + path.join(ROOT, 'scripts', 'catalog.mjs').replace(/\\/g, '/'));

// ---- current system prompt (exactly what LLMs receive) ----------------------
function currentSystemPrompt() {
  const cfg = {
    topic: 'How HTTPS keeps the web secure', design: 'corptrust', theme: 'corptrust',
    themeLight: 'daylight', format: 'both', preset: 'explainer', audience: 'general',
    channel: 'YOUR CHANNEL',
    designs: DESIGN_PACKS.map((k) => ({key: k, label: k})),
  };
  const tmp = path.join(ROOT, 'out', 'tmp'); fs.mkdirSync(tmp, {recursive: true});
  const f = path.join(tmp, 'fable_sample_cfg.json');
  fs.writeFileSync(f, JSON.stringify(cfg));
  try {
    return execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'gen-llm-prompt.mjs'), f],
      {encoding: 'utf8', maxBuffer: 1 << 24});
  } finally { try { fs.unlinkSync(f); } catch {} }
}

// ---- validation contract (every rule the linter enforces, verbatim) ---------
function validationRules() {
  const rules = new Set();
  for (const m of lintSrc.matchAll(/\b([EW])\(`([^`]*)`\)/g)) rules.add(`[${m[1] === 'E' ? 'REJECT' : 'warn'}] ${m[2].replace(/\$\{[^}]*\}/g, '…')}`);
  for (const m of lintSrc.matchAll(/\b([EW])\('([^']*)'\)/g)) rules.add(`[${m[1] === 'E' ? 'REJECT' : 'warn'}] ${m[2]}`);
  return [...rules].sort();
}

// ---- the flat data surface (SceneData) --------------------------------------
const sceneData = 'export interface SceneData {' +
  (sliceBalanced(R('src/types.ts'), 'export interface SceneData {', '{', '}') || '').slice(1);

// ---- the director laws (hard rules) -----------------------------------------
function hardRules() {
  const s = R('.claude/skills/tech-video-director/SKILL.md');
  const a = s.indexOf('## Hard rules — THEME');
  const b = s.indexOf('## Design integrity');
  return a >= 0 && b > a ? s.slice(a, b).trim() : '(hard-rules section not found)';
}

// ---- component digest (ALL 136; nothing skipped) ----------------------------
function componentDigest() {
  const out = [];
  for (const t of TYPES) {
    const c = CATALOG[t];
    if (c) {
      const slots = (c.assets?.slots || []).map((s) => `${s.path}${s.required ? '*' : ''}`).join(', ');
      out.push(`- **${t}** [${c.category}] — ${c.purpose} _USE WHEN:_ ${c.useWhen}${slots ? ` _assets:_ ${slots}` : ''}`);
    } else {
      out.push(`- **${t}** — (in the library; full description in references/scene_library.md; data shape in src/types.ts)`);
    }
  }
  return out.join('\n');
}

const documentedCount = TYPES.filter((t) => CATALOG[t]).length;

// ---- assemble ----------------------------------------------------------------
const md = `# iAuteur — Expert Brief for Fable

> **What this is.** A complete, self-contained briefing so you (Fable) can improve
> the prompt/authoring system of a video factory called **iAuteur** WITHOUT reading
> the codebase. Everything below — the live system prompt, all ${TYPES.length} components, the
> data schema, the validation rules, the laws, and a real failure — is copied
> verbatim from the actual source files. Nothing here is invented.
>
> **The one question we most need you to answer:** how do we get *any* LLM — from a
> sub-1-million-parameter locally-hosted model, through 7B–70B open models, up to
> frontier APIs (Claude/GPT/Gemini) — to reliably emit a **valid, render-correct**
> iAuteur spec on the first try? Today even Gemini fails (see §9).

---

## 1 · What iAuteur is

iAuteur is a **Remotion** (React-in-video) factory: a single JSON file *is* the movie.
A "spec" describes a video as an ordered list of **scenes**; each scene names a
**component type** (one of **${TYPES.length}** in the library), a spoken **narration** line, a
**duration**, a **transition**, a **background**, and a **data** object holding that
component's content. The renderer turns the JSON into an MP4 (landscape 1920×1080
"long" and vertical 1080×1920 "shorts"), in a chosen **design pack** (one of
${DESIGN_PACKS.length}) and **theme** (${DARK_THEMES.length} dark + ${LIGHT_THEMES.length} light).

There is **no built-in LLM.** The creative step is done by the *user's own* LLM:
our console generates a big prompt, the user pastes it into their chat model with a
topic, the model returns spec JSON, and the user pastes it back. We then generate an
**Edge-TTS voiceover** with word-level timestamps that re-time every animation to the
spoken word, and render.

## 2 · The end goal

- **100% UI-driven** for a non-technical creator: no CLI, no hand-editing JSON, no
  prompt engineering. They pick a topic + look, copy a prompt, paste JSON back, click
  Voiceover, click Render.
- **Bring-your-own-LLM, any LLM.** It must work with whatever model the user has —
  **including tiny locally-hosted models (even <1M parameters)**, mid-size open models,
  and frontier APIs. This is the hard requirement we need your help on.
- **Rich, not boring.** Viewers tire of pure animation. We want to weave in **images,
  videos, and logos from _official_ sources** (press kits, brand assets, CC0/Wikimedia,
  simple-icons for logos) — legally and correctly, never invented.
- **Professional, trustworthy output** — factually grounded, on-brand, lint-clean.

## 3 · The pipeline today

1. **Configure** (console UI): topic, source text, format, screenplay preset, audience,
   design pack, theme, background, channel.
2. **Generate LLM prompt** → the console compiles the prompt in §4 and the user pastes
   it into their LLM.
3. **Paste JSON back** → the console validates it with the linter (§7) and saves it.
4. **Voiceover** → Edge-TTS makes per-scene audio + word timestamps; a sync step rewrites
   each scene's duration and every \`atWord\` anchor to the real audio (millisecond-exact),
   and sets \`scene.audio\`.
5. **Render** → Remotion bakes narration into the MP4.

## 4 · The CURRENT system prompt (verbatim — this is what we hand the LLM)

This is generated live from the component catalog + linter constants. It lists all
${TYPES.length} components but only gives each a one-line purpose — critically, **it does NOT teach
the per-component \`data\` field schema** (see §6). Judge it hard.

\`\`\`text
${currentSystemPrompt().trim()}
\`\`\`

## 5 · The full component library (${TYPES.length} types — ${documentedCount} have catalog entries)

${componentDigest()}

## 6 · The data-contract reality (the core problem)

Every scene has a \`data\` object. But \`data\` is typed as ONE big flat interface where
**every field is optional** — each component reads only the handful of fields it needs,
and that "type → which fields" mapping lives in component code, **not** in any schema the
LLM ever sees. So an LLM guesses field names, and guesses wrong (see §9). The linter
(§7) checks budgets, transitions, durations and a few structural rules — but it does
**NOT** validate data field names, so wrong-but-plausible JSON passes lint and then
renders **blank or broken**.

Scene shape:
\`\`\`ts
interface Scene {
  id: string;                 // "s01", "s02", …
  type: string;               // one of the ${TYPES.length} component types
  narration: string;          // the spoken line (drives voiceover + duration)
  durationFrames: number;     // 30fps; HOOK must be ≤ 240 (8s)
  timingSource?: string;      // "estimated" from the LLM; "tts" after voiceover
  background: 'zoneA'|'zoneB'|'zoneC';
  transition?: string;        // scene cut — ONE OF: ${TRANSITIONS.join(', ')}
  data: SceneData;            // the component content (below)
}
\`\`\`

The flat data surface (abridged head shown; note how nothing tells the LLM which
fields belong to which type):
\`\`\`ts
${sceneData.split('\n').slice(0, 60).join('\n')}
  /* … many more optional fields, one cluster per component … */
}
\`\`\`

**Animations vs transitions (a real trap):** \`transition\` is a scene-level cut and must
be one of: ${TRANSITIONS.join(', ')}. Separately, some components take an *animation* in
their data (\`anim\`/\`kinetic.fx\`) from a DIFFERENT set: ${ANIMS.join(', ')}. LLMs conflate
these (they put \`pop\`/\`slideUp\` — which are animations — into \`transition\`).

## 7 · The validation contract (the rules a spec must satisfy)

A spec must pass the linter before anything renders. \`[REJECT]\` = hard error; \`[warn]\`
= warning. There are **${validationRules().length} distinct checks** in total — most are per-component
field validations (evidence of how strict, and how *implicit*, the data contract is).
The **global/structural** rules every author must satisfy:

${(() => {
  const all = validationRules();
  const perScene = all.filter((r) => /\]\s+…:/.test(r));
  const global = all.filter((r) => !/\]\s+…:/.test(r));
  const sample = perScene.slice(0, 14);
  return global.map((r) => '- ' + r).join('\n') +
    `\n\nPlus **${perScene.length} per-scene / per-component field checks** (names, ranges, ids). A sample:\n\n` +
    sample.map((r) => '- ' + r).join('\n');
})()}

## 8 · The director laws (from the project skill, verbatim)

${hardRules()}

## 9 · A REAL failure (Google Gemini, from the current prompt)

We gave the §4 prompt to Gemini for the topic *"Instagram's newest AI tool didn't
survive the week."* It produced fluent, well-structured JSON that was **rejected**, and
worse, contained silent schema errors lint can't catch.

**Linter result + the deeper mismatches:**
\`\`\`text
${R('briefs/examples/gemini-lint.txt').trim()}
\`\`\`

**Gemini's long.json (verbatim):**
\`\`\`json
${R('briefs/examples/gemini-long.json').trim()}
\`\`\`

**Gemini's shorts.json (verbatim):**
\`\`\`json
${R('briefs/examples/gemini-shorts.json').trim()}
\`\`\`

## 10 · What we already suspect — and where we need your judgement

Our working hypotheses (challenge them):
1. **Teach the exact per-type data schema, not just a purpose.** The prompt should carry,
   for each component the video will use, its precise field list (names, types, required,
   budgets) + a tiny valid example. Open question: how to do this for ${TYPES.length} components without
   blowing the context window of small models.
2. **A two-stage flow may beat one-shot:** stage 1 the LLM picks an ordered list of
   component types (a "shot list"); stage 2 it fills only those components' schemas. This
   shrinks what a small model must hold at once.
3. **Constrained/GBNF/JSON-Schema decoding** for local models (llama.cpp/Ollama grammars)
   to make invalid JSON structurally impossible — is this the right backbone for the
   sub-1M / tiny-model requirement, or is that requirement unrealistic and we should set a
   floor (e.g. a 3B instruct model)?
4. **A repair loop:** feed linter errors back to the model (or auto-fix mechanically:
   remap known field aliases like statValue→value, clamp HOOK to 8s, coerce
   transition-that-is-actually-an-anim). How much should be deterministic auto-repair vs
   model round-trips?
5. **Official media/logos:** how to let the model REQUEST an image/video/logo (e.g. emit
   \`assetsNeeded\` with an official-source query) and have the console fetch it safely
   (simple-icons for logos; Wikimedia/press-kit/CC0 for images) rather than inventing files.

**Please analyse and advise on, at minimum:**
- A concrete prompt architecture that makes **valid, render-correct** specs likely on the
  **first** try across the whole model-size spectrum, and exactly how it degrades for tiny
  local models (what's the realistic floor, and the design for models below it?).
- How to represent ${TYPES.length} component schemas compactly (progressive disclosure? retrieval of
  only the chosen components' schemas? a compressed DSL instead of raw JSON?).
- The right split between (a) prompt design, (b) deterministic pre/post-processing &
  auto-repair, (c) a validate→repair model loop, and (d) constrained decoding.
- A plan to incorporate official images/videos/logos so videos aren't all-animation.
- Anything about our current prompt (§4), laws (§8), or validation (§7) that is wrong,
  missing, or counterproductive.

## 11 · What we want back from you

1. A critique of the current prompt (§4) — what to cut, add, or restructure.
2. A recommended **prompt architecture** (with the schema-teaching + shot-list ideas
   resolved) that we can implement in our console's prompt generator.
3. A clear **model-tier strategy**: what to do for frontier APIs vs mid open models vs
   tiny/local models (and the honest floor).
4. A **deterministic auto-repair** spec (field-alias map, clamps, coercions) so near-miss
   JSON becomes valid without a model round-trip.
5. An **official-media/logo** sourcing design.
6. Any correction to our assumptions in §10.

Write for engineers who will implement your recommendations directly. Be concrete.
`;

fs.mkdirSync(path.join(ROOT, 'briefs'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'briefs', 'fable-brief.md'), md);
console.log(`✓ briefs/fable-brief.md written (${md.length} chars, ${TYPES.length} components, ${validationRules().length} rules)`);
