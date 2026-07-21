#!/usr/bin/env node
// PHASE 0 — CENSUS. Derives the full component inventory from SOURCE (never a
// hand-list) and cross-checks the registry / linter TYPES / showcase / scene_library
// against each other. Any type present in one source and missing from another is
// defect A-census (P0). Emits audit/census.json and prints the counts.
import fs from 'node:fs';
import path from 'node:path';
import {parseVariantEnums} from './lib/parse-variants.mjs';
import {TYPES as CONST_TYPES} from './lib/constants.mjs';

const read = (p) => fs.readFileSync(path.resolve(p), 'utf8');
const uniq = (a) => [...new Set(a)];
const defects = [];
const D = (id, sev, msg) => defects.push({id, sev, msg});

// ── 1. linter TYPES + DYNAMIC ────────────────────────────────────────────
const lint = read('scripts/lint-spec.mjs');
// ALL type-name regexes accept [A-Z0-9_] — a type name may contain a DIGIT
// (K8S_CLUSTER). Using [A-Z_] silently dropped it from EVERY set below, so no
// cross-check ever fired (Session-5 finding, §5 lesson). Never narrow these.
const grab = (src, marker) => {
  const i = src.indexOf(marker);
  const j = src.indexOf('];', i);
  return uniq([...src.slice(i, j).matchAll(/'([A-Z0-9_]+)'/g)].map((m) => m[1]));
};
// TYPES is the authoritative allow-list; it lives in scripts/lib/constants.mjs
// (imported by the linter too). Read it from SOURCE, never re-parse lint-spec.
const TYPES = uniq(CONST_TYPES);
const DYNAMIC = uniq([...lint.slice(lint.indexOf('const DYNAMIC = [')).slice(0, 4000).matchAll(/'([A-Z0-9_]+)'/g)].map((m) => m[1]));

// ── 2. registry (MainComposition) — map entries + scene.type special-cases ──
const main = read('src/MainComposition.tsx');
const regBlock = main.slice(main.indexOf('const registry'), main.indexOf('const UnknownScene'));
const REGISTRY = uniq([...regBlock.matchAll(/^\s*([A-Z0-9_]+):\s*[A-Za-z]/gm)].map((m) => m[1]));
// components rendered via a `scene.type === 'X'` special case (e.g. CHANNEL_CARD needs brand)
const SPECIAL = uniq([...main.matchAll(/scene\.type === '([A-Z0-9_]+)'\s*\?/g)].map((m) => m[1]));
const RENDERED = uniq([...REGISTRY, ...SPECIAL]);
// PERMISSIVE GUARD — capture every UPPER-SNAKE registry key with a maximally broad
// token and require it be in TYPES. Catches the whole "a regex silently dropped a
// type" class even if a future edit re-narrows one of the regexes above.
const REGISTRY_BROAD = uniq([...regBlock.matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*):\s*[A-Za-z]/gm)].map((m) => m[1]).filter((k) => /^[A-Z][A-Z0-9_]*$/.test(k)));

// ── 3. variant / mode enums — authoritative, from linter validation msgs ──
// the linter emits `TYPE variant must be a/b/c` (and `mode`, `os`, `action`,
// `panel`, `kind`) — the TYPE + the enum live together, unambiguous.
// NOTE: enum lists use EITHER `/` OR `|` as the separator (both forms exist in
// lint-spec) — the shared parser accepts both (a `|`-separated list otherwise
// silently drops all but the first variant = defect L-BK-1). The parser lives in
// scripts/lib/parse-variants.mjs so the census self-test exercises the REAL code.
const variantsByType = parseVariantEnums(lint);
// PIPELINE variants live in a union (no `must be` msg) — read the type union.
const types = read('src/types.ts');
for (const m of types.matchAll(/export interface PipelineData \{([\s\S]*?)\n\}/g)) {
  const vm = m[1].match(/variant\?:\s*([^;]+);/);
  if (vm) variantsByType.PIPELINE = uniq([...(variantsByType.PIPELINE ?? []), ...[...vm[1].matchAll(/'([a-zA-Z]+)'/g)].map((x) => x[1])]);
}

// ── 4. showcase demos (showcaseSpec.ts + gallery + widgets JSON) ──────────
const showcase = read('src/showcaseSpec.ts');
const showcaseTypes = uniq([...showcase.matchAll(/type:\s*'([A-Z0-9_]+)'/g)].map((m) => m[1]));
const showcaseIds = uniq([...showcase.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]));
const jsonTypes = (p) => uniq([...read(p).matchAll(/"type":\s*"([A-Z0-9_]+)"/g)].map((m) => m[1]));
const galleryTypes = jsonTypes('specs/gallery.json');
const widgetTypes = jsonTypes('specs/widgets.json');
const demoTypes = uniq([...showcaseTypes, ...galleryTypes, ...widgetTypes]);

// ── 5. scene_library rows ────────────────────────────────────────────────
const lib = read('.claude/skills/tech-video-director/references/scene_library.md');
const libTypes = uniq(
  [...lib.matchAll(/^\|\s*([A-Z0-9_]+)(?:\s*[·(]|[\s|])/gm)].map((m) => m[1]).filter((t) => t.length > 2),
);

// ── 6. text budgets presence (best-effort: type token appears) ────────────
const budgets = read('.claude/skills/tech-video-director/references/text_budgets.md');

// ── CROSS-CHECKS (A-census) ──────────────────────────────────────────────
for (const t of TYPES) if (!RENDERED.includes(t)) D('A-census', 'P0', `${t} in linter TYPES but has NO renderer (registry entry or scene.type special-case)`);
for (const t of RENDERED) if (!TYPES.includes(t)) D('A-census', 'P0', `${t} has a renderer but is MISSING from linter TYPES`);
for (const t of REGISTRY_BROAD) if (!TYPES.includes(t)) D('A-census', 'P0', `${t} is a registry key but MISSING from TYPES — a type-name regex is dropping it (regexes must accept [A-Z0-9_]; digits like K8S_CLUSTER)`);
for (const t of TYPES) if (!demoTypes.includes(t)) D('A-census', 'P0', `${t} has NO showcase/gallery/widgets demo`);
for (const t of TYPES) if (!libTypes.includes(t)) D('A-census', 'P1', `${t} has NO scene_library row`);
for (const t of DYNAMIC) if (!TYPES.includes(t)) D('A-census', 'P0', `${t} in DYNAMIC but not in TYPES`);

// ── EMIT census ──────────────────────────────────────────────────────────
const rows = TYPES.map((t) => ({
  type: t,
  inRegistry: REGISTRY.includes(t),
  specialRender: SPECIAL.includes(t),
  inDynamic: DYNAMIC.includes(t),
  variants: variantsByType[t] ?? [],
  hasShowcase: demoTypes.includes(t),
  hasSceneLibRow: libTypes.includes(t),
}));
const totalVariants = rows.reduce((a, r) => a + r.variants.length, 0);
const census = {
  generatedAt: new Date().toISOString(),
  counts: {types: TYPES.length, registry: REGISTRY.length, dynamic: DYNAMIC.length, variantsDeclared: totalVariants, showcaseDemos: showcaseIds.length, sceneLibRows: libTypes.length},
  rows,
  defects,
};
fs.mkdirSync('audit', {recursive: true});
fs.writeFileSync('audit/census.json', JSON.stringify(census, null, 2));

console.log('── CENSUS ──');
console.log(`TYPES:            ${TYPES.length}`);
console.log(`renderers:        ${RENDERED.length}  (registry ${REGISTRY.length} + special ${SPECIAL.length}: ${SPECIAL.join(',')})`);
console.log(`DYNAMIC:          ${DYNAMIC.length}`);
console.log(`variants declared:${totalVariants}  (${rows.filter((r) => r.variants.length).map((r) => `${r.type}[${r.variants.join('|')}]`).join(', ')})`);
console.log(`showcase demos:   ${showcaseIds.length}`);
console.log(`scene_library rows:${libTypes.length}`);
console.log(`A-census defects: ${defects.length}`);
for (const d of defects) console.log(`  [${d.sev}] ${d.msg}`);
console.log(`\nwrote audit/census.json`);
process.exit(defects.some((d) => d.sev === 'P0') ? 1 : 0);
