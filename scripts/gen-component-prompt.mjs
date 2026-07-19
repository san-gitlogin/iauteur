#!/usr/bin/env node
// COMPONENT-CREATOR PROMPT GENERATOR — the "huge leap".
//
// Produces the prompt a user pastes into their OWN LLM to author a brand-new
// iAuteur scene component (a React/Remotion .tsx) when none of the existing
// library types fit a video segment. Two stages, mirroring the spec two-paste flow:
//
//   stage1  -> asks the LLM to DESIGN THE DATA CONTRACT and return a `config`
//              JSON in the exact shape scripts/new-component.mjs consumes.
//   stage2  -> given the (validated) config, asks the LLM to WRITE THE FULL
//              src/scenes/<Name>.tsx that respects THIS repo's theme tokens,
//              ×scale, both-aspect, deterministic-motion and visual-craft laws.
//
// Everything authoritative is READ FROM THE REAL SOURCES at generation time so
// the prompt never drifts: the 136-type menu (constants + manifest), our
// authoring LAW (component_authoring.md), the reusable craft guide (the Fable
// remotion-component-design skill), and a COMPLETE real shipped example
// (TRADEOFF_SCALE: manifest entry + types interface + component + showcase demo).
//
// Usage:
//   node scripts/gen-component-prompt.mjs <brief.json> stage1
//   node scripts/gen-component-prompt.mjs <brief.json> stage2 <config.json>
//
// brief.json (all optional except `need`):
//   { "need": "what the component must show/do",
//     "segment": "the narration line / beat it serves",
//     "example": "example content it would display",
//     "referenceNote": "a design reference or inspiration",
//     "dynamic": true, "categoryHint": "diagram", "familyHint": "diagram",
//     "typeName": "TRADEOFF_SCALE", "name": "TradeoffScale", "dataKey": "tradeoff",
//     "design": "moderndark", "theme": "moderndark" }
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {TYPES, SEM, ANIMS} from './lib/constants.mjs';
import {MANIFEST} from './lib/manifest.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => {
  try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return ''; }
};

const briefPath = process.argv[2];
const stage = (process.argv[3] || 'stage1').trim();
const configPath = process.argv[4];
if (!briefPath) {
  console.error('Usage: node scripts/gen-component-prompt.mjs <brief.json> <stage1|stage2> [config.json]');
  process.exit(2);
}
let brief;
try { brief = JSON.parse(fs.readFileSync(briefPath, 'utf8').replace(/^\uFEFF/, '')); }
catch (e) { console.error(`\u2717 cannot read brief: ${e.message}`); process.exit(2); }

const need = (brief.need || '').trim();
const segment = (brief.segment || '').trim();
const example = (brief.example || '').trim();
const referenceNote = (brief.referenceNote || '').trim();
const design = (brief.design || 'moderndark').trim();
const theme = (brief.theme || design).trim();

// ---- the "does an existing type already fit?" menu (grouped by category) -----
function componentMenu() {
  const groups = new Map();
  for (const t of TYPES) {
    const m = MANIFEST[t];
    const cat = (m && m.category) || 'other';
    if (!groups.has(cat)) groups.set(cat, []);
    const purpose = m ? m.purpose : '(see references/scene_library.md)';
    groups.get(cat).push(`  - ${t} — ${purpose}`);
  }
  const out = [];
  for (const [cat, lines] of groups) {
    out.push(`### ${cat}`);
    out.push(lines.join('\n'));
  }
  return out.join('\n');
}

// ---- the brief block (shared) -----------------------------------------------
function briefBlock() {
  const L = [];
  L.push('## The component you must create');
  L.push(`- **What it must show / do:** ${need || '(the user did not describe this — infer from the segment)'}`);
  if (segment) L.push(`- **The video segment / narration it serves:** ${segment}`);
  if (example) L.push(`- **Example content it would display:** ${example}`);
  if (referenceNote) L.push(`- **Design reference / inspiration:** ${referenceNote}`);
  L.push(`- **Design pack / theme the video uses (stay faithful, but read TOKENS not this name):** ${design} / ${theme}`);
  return L.join('\n');
}

// ---- STAGE 1 : design the data contract -------------------------------------
function stage1Prompt() {
  const suggested = [];
  if (brief.typeName) suggested.push(`"type": "${brief.typeName}"`);
  if (brief.name) suggested.push(`"name": "${brief.name}"`);
  if (brief.dataKey) suggested.push(`"dataKey": "${brief.dataKey}"`);
  const suggestedLine = suggested.length ? `\nThe user suggested: { ${suggested.join(', ')} } — use these unless they collide with an existing type.` : '';
  return `You are a senior motion-graphics engineer extending **iAuteur**, a Remotion (React-in-video)
"video factory". A video is JSON: an ordered list of scenes, each naming a **component type**
that renders that beat. There are already ${TYPES.length} component types. You are designing a **NEW** one
because none of the existing types fit a specific segment.

**STAGE 1 of 2 — design the DATA CONTRACT only. Do NOT write any React/TSX yet.**

${briefBlock()}

## Step A — first, make sure no existing type already fits
Scan the library below. If an existing type (or a close pairing) already covers this need, STOP and
reply with exactly: \`REUSE: <TYPE_NAME> — <one-line reason>\` instead of a config. Only invent a new
component when nothing here is honest.

${componentMenu()}

## Step B — if it is genuinely new, emit the component CONFIG
Return a single JSON object in the EXACT shape below (this is consumed by the repo's scaffolder,
\`scripts/new-component.mjs\`). Keep the data contract MINIMAL — only the fields the visual truly needs.${suggestedLine}

\`\`\`json
{
  "type": "UPPER_SNAKE",          // the scene.type, e.g. TRADEOFF_SCALE — must be NEW (not in the list above)
  "name": "PascalCase",           // the React component + file src/scenes/<Name>.tsx, e.g. TradeoffScale
  "dataKey": "camelCase",         // scene.data.<dataKey> holds this component's content, e.g. tradeoff
  "category": "diagram",          // one of: structure|text|list|editorial|data|chart|diagram|icon|branding|mockup|media|code|stream|framed|gauge|zone|systems
  "family": "diagram",            // adjacency family (usually = category); components in the same family shouldn't sit adjacent
  "dynamic": true,                // true if it is a visual/animated "moment" (counts toward the anti-monotony rule)
  "purpose": "one line — what it renders",
  "useWhen": "one line — the content signal a director should reach for it on",
  "fields": [
    // one entry per data field. t = the field type:
    //   "string"  plain text (give a "max" CHARACTER budget sized to the NARROW vertical frame)
    //   "number"  numeric (counts up / drives geometry)
    //   "anchor"  a word-timing anchor (e.g. "atWord"): the narration word this element animates in on
    //   "asset"   a single "lucide:icon" | "si:brand" | "img:file" reference
    //   "asset[]" an array of asset strings
    //   "items"   an array of objects (describe the item shape in "note", with per-field budgets)
    //   "object"  a nested object (describe its fields in "note", with per-field budgets)
    //   "string[]" an array of strings
    {"name": "headline", "t": "string", "req": true, "max": 48, "note": "one [accent] phrase allowed"},
    {"name": "atWord", "t": "anchor"}
  ],
  "example": { /* ONE valid example of scene.data.<dataKey>, every field filled with realistic content */ }
}
\`\`\`

### Contract rules (the scaffolder + linter enforce these)
- \`type\` UPPER_SNAKE and NEW; \`name\` PascalCase; \`dataKey\` camelCase.
- Every text field needs a \`max\` char budget sized to the **narrow (vertical 1080-wide) frame** — short.
  Headlines ≤48, labels ≤20, subs ≤30, captions ≤48, sources ≤64, tiny values/codes ≤12. Be strict.
- Include exactly ONE \`anchor\` field (usually \`atWord\`) if anything animates in on a spoken word.
- Colour fields use one of: ${SEM.join(', ')} (semantic colours that MEAN something).
- Keep it small: 3–7 fields is typical. A component that needs 15 fields is two components.
- The \`example\` must be complete and realistic — it becomes the showcase demo and a stress fixture.

## OUTPUT
Reply with ONLY the JSON config object (or a single \`REUSE:\` line). No prose, no code fences beyond the JSON.`;
}

// ---- STAGE 2 : write the component ------------------------------------------
function stage2Prompt() {
  let config = null;
  if (configPath) {
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '')); }
    catch (e) { console.error(`\u2717 cannot read config: ${e.message}`); process.exit(2); }
  }
  if (!config) { console.error('\u2717 stage2 needs the validated <config.json> as arg 4'); process.exit(2); }

  const Name = config.name || 'MyComponent';
  const dataKey = config.dataKey || 'myData';
  const TYPE = config.type || 'MY_TYPE';

  // real sources, read live so the prompt never drifts
  const authoring = R('.claude/skills/tech-video-director/references/component_authoring.md');
  const fableSkill = R('.claude/skills/remotion-component-design/SKILL.md');
  const fableDesign = R('.claude/skills/remotion-component-design/references/design-system.md');
  const fableAnim = R('.claude/skills/remotion-component-design/references/animation.md');
  const fableLayout = R('.claude/skills/remotion-component-design/references/layout.md');
  const fableAssets = R('.claude/skills/remotion-component-design/references/assets.md');
  const goldTsx = R('src/scenes/TradeoffScale.tsx');
  const goldTypes = `export interface TradeoffSide {
  label?: string;
  sub?: string;
  asset?: string;
  color?: SemColor;
}
export interface TradeoffScaleData {
  headline?: string;
  left?: TradeoffSide;
  right?: TradeoffSide;
  lean?: number; // -1..1
  caption?: string;
  atWord?: number;
  source?: string;
}
// …and one line on SceneData:  tradeoff?: TradeoffScaleData;`;
  const goldManifest = JSON.stringify(MANIFEST.TRADEOFF_SCALE, null, 2);

  return `You are a senior motion-graphics engineer writing a component for **iAuteur** (a Remotion
video factory). **STAGE 2 of 2 — write the full React/TSX file.** The DATA CONTRACT is FIXED (below).
Your job is the visualisation: a beautiful, token-driven, both-aspect, deterministic scene component.

${briefBlock()}

## The FIXED contract (from Stage 1 — do not change field names or types)
\`\`\`json
${JSON.stringify(config, null, 2)}
\`\`\`
The component file is \`src/scenes/${Name}.tsx\`, exporting \`export const ${Name}: React.FC<{scene: Scene}>\`.
It reads its content from \`scene.data.${dataKey}\` and renders scene type \`${TYPE}\`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚠ API OVERRIDE — YOUR GENERAL REMOTION KNOWLEDGE IS WRONG FOR THIS REPO
This repo does NOT use the common Remotion patterns. Do NOT use any of the following:
- ❌ \`spring()\`  → use \`interpolate(frame, [...], [...], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})\`
- ❌ \`@remotion/google-fonts\` / \`loadFont\`  → fonts are THEME TOKENS, already loaded (\`t.fonts.display\` …)
- ❌ a local \`lib/theme.ts\` with {bg/surface/fg/accent}  → use \`useTheme()\` tokens (below)
- ❌ \`<Series>\` / \`<TransitionSeries>\`  → the composition sequences scenes for you; render ONE scene
- ❌ \`staticFile()\` + \`<Img>\`  → use \`<AssetIcon asset="lucide:x" .../>\` for icons/logos/images
- ❌ raw hex colours, raw px font sizes, hardcoded radii/shadows  → tokens + \`× scale\` ONLY

### The ONLY API you may use (imports)
\`\`\`tsx
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene, SemColor} from '../types';           // + your own <Name>Data type once wired
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA, Headline, Panel, Pill, Kicker} from '../ui';
import {AssetIcon} from '../AssetIcon';
\`\`\`

### The token vocabulary (get EVERY visual constant from here)
\`\`\`
const t = useTheme();
t.colors.bg | panel | panelBorder | text | muted | onAccent | glowSoft
t.colors.accent | accent2 | accent3
t.colors.sem.{blue|green|red|orange|purple|yellow}   // SEMANTIC colours that MEAN something
t.fonts.display | body | mono | accent               // roles: headings | prose | numbers/ids | one flourish
t.style.cornerRadius   // multiply every radius by this (→ 0 = sharp on neobrutalism)
t.style.glow           // gate every boxShadow/glow on \`t.style.glow > 0\`, scale it by this
t.style.displayWeight | displayTracking

const sem = useSem();                  // sem('blue') → t.colors.sem.blue
const {scale, vertical} = useScale();  // scale multiplies EVERY px; vertical = 1080×1920 shorts
hexA('#rrggbb' or token, 0.4)          // colour + alpha (de-emphasis only)
wordToFrame(n)                         // the frame a 1-based narration word is spoken
\`\`\`
Guard: \`const d = scene.data.${dataKey}; if (!d) return <AbsoluteFill />;\`
Timing: base visual on screen within 38 frames — \`const start = Math.min(wordToFrame(d.atWord ?? 1), 38);\`
(only an emphasis payoff may use the un-clamped \`wordToFrame(d.atWord)\`).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## THE AUTHORING LAW (this repo's non-negotiable contract — obey every rule)
${authoring}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CRAFT GUIDE (universal motion-design principles — apply the PRINCIPLES, translate the API)
The following guide teaches how to make motion smooth and layouts beautiful. Its CODE EXAMPLES use
the generic Remotion API you were told NOT to use — take the PRINCIPLES (velocity curves, exits faster
than entrances, 60/30/10 colour, one focal point, tabular-nums, staggering, ambient motion during
holds, contrast, never pure #000/#FFF, geometry-based alignment) and express them with THIS repo's API.

${fableSkill}

${fableDesign}

${fableAnim}

${fableLayout}

${fableAssets}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## A COMPLETE REAL EXAMPLE (a shipped component — imitate this exact shape & discipline)
### its manifest entry (the contract, like yours)
\`\`\`js
${goldManifest}
\`\`\`
### its types (src/types.ts)
\`\`\`ts
${goldTypes}
\`\`\`
### its component (src/scenes/TradeoffScale.tsx) — note: BASE≤38 clamp, both-aspect branch on \`vertical\`,
### SVG + cards share ONE coordinate space, glow gated on \`t.style.glow\`, radius × \`t.style.cornerRadius\`,
### font roles, one focal point, opaque cards, alpha only for de-emphasis, clamped interpolate throughout:
\`\`\`tsx
${goldTsx}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## OUTPUT
Return ONLY the complete contents of \`src/scenes/${Name}.tsx\` in a single \`\`\`tsx code block.
- It must compile as-is: import a local \`type ${Name}Data\` (and any sub-item types) at the top of the
  file mirroring your Stage-1 fields, and read \`(scene.data as Record<string, unknown>).${dataKey}\` cast to it
  (the repo wires the real type into SceneData afterward).
- Define BOTH the wide (row / left→right) and vertical (column / top→bottom) layout, branching on \`vertical\`.
- Every px \`× scale\`; tokens only; every \`interpolate\` clamps both sides; motion is a pure function of frame.
- Anim entrance vocabulary if you reference one: ${ANIMS.join(', ')} (these are NOT scene transitions).
No prose outside the code block.`;
}

const out = stage === 'stage2' ? stage2Prompt() : stage1Prompt();
process.stdout.write(out);
