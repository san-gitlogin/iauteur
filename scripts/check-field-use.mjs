#!/usr/bin/env node
// CHECK-FIELD-USE — does the component that draws a scene type actually READ its fields?
//
// WHY THIS EXISTS. A design pack REPLACES the core component for a scene type. When the
// replacement omits a field the manifest declares, nothing anywhere complains: the spec is
// valid, the linter passes, tsc passes (the field is optional), the render succeeds, and
// the value simply never reaches the screen. It is the failure LAW 0n's corollary calls
// "three-for-three" — `parent`/`links` on the DSA cut, `out`/`series` on the Linux cut,
// `icon` on the MCP cut — and it has kept happening because the advice was "grep every
// `.map((c) =>` before you render", which is a habit, not a gate.
//
// Found the day this was written: `MdStatPanels` (moderndark — the STANDING DEFAULT design,
// so this is the path most videos take) rendered `kicker` and `value` and never `note`. One
// panel read "STILL DEARER / per word" while its note, "than Opus 5 · GPT-5.6", was the
// entire comparison. Twelve authored notes in one spec, none on screen.
//
// HOW IT CHECKS. For every type a pack overrides, read the pack's component source and the
// core component's, and require that each field name the manifest declares for that type
// appears in the pack's source. It is a TEXT check, deliberately: a field is read as
// `stat.note` / `d.note` / `{note}` and all of those contain the token. It cannot prove the
// value is drawn, only that the component mentions it — which is exactly the gap between
// "declared" and "never referenced" that this class of bug lives in.
//
// Usage: node scripts/check-field-use.mjs [--quiet]
import fs from 'node:fs';
import path from 'node:path';
import {MANIFEST} from './lib/manifest.mjs';

const quiet = process.argv.includes('--quiet');
const DESIGNS = 'src/designs';
// --spec <path> is the SHARP form, and the one render-topic uses: it asks only about the
// design pack THIS video declares, about the scene types it actually contains, and about
// the fields it actually SETS. That question is always actionable and always fatal.
// Repo-wide the same scan is a NOTICE: 62 fields are dropped across 28 packs today, and a
// gate that is permanently red is a gate people learn to ignore (docs/STATE.md, and the
// same argument check-recordings and check-sync each make about historical data).
const specArg = (() => {
  const i = process.argv.indexOf('--spec');
  return i >= 0 ? process.argv[i + 1] : null;
})();

// Field names too generic to be evidence of anything, or handled by shared chrome.
const IGNORE = new Set(['atWord', 'color', 'colour', 'source', 'headline', 'headlineColor']);

// Pull `TYPE: Component,` pairs out of a pack's registry.
const registryOf = (dir) => {
  const idx = path.join(DESIGNS, dir, 'index.ts');
  if (!fs.existsSync(idx)) return null;
  const src = fs.readFileSync(idx, 'utf8');
  const body = src.slice(src.indexOf('Registry: DesignRegistry = {'));
  const out = new Map();
  for (const m of body.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*:\s*([A-Za-z0-9_]+)/gm)) out.set(m[1], m[2]);
  return out;
};

// The item-field names a type declares, from the manifest's own notes.
// Fields are documented as `2-3 × {kicker, value, note?, color?, atWord}` — the brace list
// is the contract, so that is what is parsed.
const fieldsOf = (type) => {
  const def = MANIFEST[type];
  if (!def?.fields) return [];
  const names = new Set();
  for (const [key, f] of Object.entries(def.fields)) {
    if (!IGNORE.has(key)) names.add(key);
    const note = String(f?.note ?? '');
    for (const brace of note.matchAll(/\{([^{}]*)\}/g)) {
      for (const part of brace[1].split(',')) {
        const m = part.trim().match(/^([a-z][A-Za-z0-9]*)\??\s*(?:[:=]|$)/);
        if (m && !IGNORE.has(m[1])) names.add(m[1]);
      }
    }
  }
  return [...names];
};

// Every field name the spec actually POPULATES, per scene type. A field the video never
// sets cannot be dropped from it.
const usedFields = (spec) => {
  const byType = new Map();
  const walk = (v, into) => {
    if (v == null || typeof v !== 'object') return;
    if (Array.isArray(v)) { for (const x of v) walk(x, into); return; }
    for (const [k, q] of Object.entries(v)) {
      if (q != null && q !== '') into.add(k);
      walk(q, into);
    }
  };
  for (const sc of spec.scenes ?? []) {
    if (!sc?.type) continue;
    if (!byType.has(sc.type)) byType.set(sc.type, new Set());
    walk(sc.data, byType.get(sc.type));
  }
  return byType;
};

const sourceCache = new Map();
const packSource = (dir) => {
  if (sourceCache.has(dir)) return sourceCache.get(dir);
  let all = '';
  const d = path.join(DESIGNS, dir);
  for (const f of fs.readdirSync(d)) {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) all += fs.readFileSync(path.join(d, f), 'utf8');
  }
  sourceCache.set(dir, all);
  return all;
};

// Shared factories (makeTitleCard(kit), makeLineChart(kit), …) live outside the pack
// directory and are already exercised by every pack that uses them — a miss there is one
// bug, not thirty. They reach the registry two ways, and BOTH have to be recognised:
//   LINE_CHART: makeLineChart(kit)          — inline
//   const SwissLineChart = makeLineChart(k) — aliased, then LINE_CHART: SwissLineChart
// Missing the aliased form is what made the first run of this script report 25 packs as
// broken: `SwissLineChart` is not a name the pack ever defines a body for, so every field
// looked absent.
const SHARED = /^(make[A-Z]|Kit)/;
const aliasesOf = (dir) => {
  const idx = path.join(DESIGNS, dir, 'index.ts');
  const src = fs.existsSync(idx) ? fs.readFileSync(idx, 'utf8') : '';
  const out = new Set();
  for (const m of src.matchAll(/const\s+([A-Za-z0-9_]+)\s*=\s*(make[A-Z][A-Za-z0-9_]*)\s*\(/g)) {
    out.add(m[1]);
  }
  return out;
};

// The body of ONE component, so a field found in a sibling does not excuse this one.
const bodyOf = (src, comp) => {
  const i = src.search(new RegExp(`(export\\s+)?const\\s+${comp}\\s*[:=]`));
  if (i < 0) return null;
  const rest = src.slice(i + 1);
  const j = rest.search(/\n(export\s+)?const\s+[A-Z]/);
  return j < 0 ? rest : rest.slice(0, j);
};

// A component that hands the whole data object to a shared primitive is not dropping
// anything — the primitive reads the fields. `<LineChart data={d.lineChart} …>` and
// `<Foo scene={scene} …>` are both that shape.
const DELEGATES = /data=\{d\.[A-Za-z0-9_]+\}|scene=\{scene\}|\{\.\.\.d\}|\{\.\.\.scene\}/;

const problems = [];
let checkedPacks = 0, checkedTypes = 0;

if (specArg) {
  const spec = JSON.parse(fs.readFileSync(specArg, 'utf8'));
  const dir = String(spec.brand?.design ?? '').trim();
  if (!dir || !fs.existsSync(path.join(DESIGNS, dir))) {
    if (!quiet) console.log(`FIELD-USE CHECK: ${specArg} declares no design pack — core components draw it.`);
    process.exit(0);
  }
  const reg = registryOf(dir) ?? new Map();
  const src = packSource(dir);
  const alias = aliasesOf(dir);
  const used = usedFields(spec);
  for (const [type, set] of used) {
    const comp = reg.get(type);
    if (!comp || SHARED.test(comp) || alias.has(comp)) continue;   // core or shared draws it
    const body = bodyOf(src, comp);
    if (body == null || DELEGATES.test(body)) continue;
    checkedTypes++;
    const declared = new Set(fieldsOf(type));
    const missing = [...set].filter((f) => declared.has(f) && !new RegExp(`\\b${f}\\b`).test(body));
    if (missing.length) {
      problems.push(`${dir}/${comp} (${type}): this spec SETS ${missing.map((m) => `\`${m}\``).join(', ')} ` +
        `and the pack never reads ${missing.length === 1 ? 'it' : 'them'} — the value is authored, ` +
        `voiced around, and never drawn.`);
    }
  }
  if (!quiet) {
    console.log(`FIELD-USE CHECK: ${specArg} on design "${dir}" — ${checkedTypes} pack component(s).`);
  }
  if (problems.length) {
    console.error('\n\u2717 FIELD-USE CHECK FAILED — the design pack drops fields this spec sets:');
    for (const p of problems) console.error(`  \u2022 ${p}`);
    console.error('\nRender the field in the pack component, or drop it from the spec. Shipping it');
    console.error('authored-but-undrawn is the failure mode this check exists for.');
    process.exit(1);
  }
  if (!quiet) console.log('\u2713 FIELD-USE CHECK PASSED (the pack reads every field this spec sets)');
  process.exit(0);
}

for (const dir of fs.readdirSync(DESIGNS)) {
  if (!fs.statSync(path.join(DESIGNS, dir)).isDirectory()) continue;
  const reg = registryOf(dir);
  if (!reg) continue;
  checkedPacks++;
  const src = packSource(dir);
  const alias = aliasesOf(dir);
  for (const [type, comp] of reg) {
    if (SHARED.test(comp) || alias.has(comp)) continue;
    const fields = fieldsOf(type);
    if (!fields.length) continue;
    const body = bodyOf(src, comp);
    if (body == null || DELEGATES.test(body)) continue;
    checkedTypes++;
    const missing = fields.filter((f) => !new RegExp(`\\b${f}\\b`).test(body));
    if (missing.length) {
      problems.push(`${dir}/${comp} (${type}): never mentions ${missing.map((m) => `\`${m}\``).join(', ')}` +
        ` — the manifest declares ${missing.length === 1 ? 'it' : 'them'}, so ${missing.length === 1 ? 'a spec that sets it' : 'a spec that sets them'} renders nothing.`);
    }
  }
}

if (!quiet) {
  console.log(`FIELD-USE CHECK: ${checkedTypes} pack component(s) across ${checkedPacks} design pack(s).`);
}
if (problems.length) {
  console.error(`\nNOTE: ${problems.length} pack component(s) never read a field their type declares:`);
  for (const p of problems) console.error(`  \u2022 ${p}`);
  console.error('\nA pack REPLACES the core component, so anything it forgets is invisible: the spec');
  console.error('is valid, tsc passes (the field is optional) and the render succeeds with the value');
  console.error('missing. This does NOT fail the gate — fixing 30 packs is a design job, not video');
  console.error('production (Law 6) — but `--spec <path>` IS fatal, and render-topic runs it, so no');
  console.error('video ships with a field it authored and never drew.');
}
if (!quiet) console.log('✓ FIELD-USE CHECK PASSED (every pack reads the fields its types declare)');
