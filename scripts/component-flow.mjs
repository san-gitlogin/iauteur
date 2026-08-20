#!/usr/bin/env node
// COMPONENT-FLOW — the webui-facing orchestrator for the Component Lab (the
// "component creator"). Mirrors scripts/flow.mjs (the spec two-paste flow) but
// produces a NEW scene component instead of a spec. Every subcommand prints ONE
// JSON object to stdout so the Flask console can parse it.
//
// Subcommands:
//   stage1   <cfg>                       -> { ok, prompt }           (design the data contract)
//   validate <cfg> <config>              -> { ok, errors[], config } (check the returned config)
//   stage2   <cfg> <config>              -> { ok, prompt }           (write the component)
//   assemble <cfg> <config> <tsx>        -> { ok, output, wired[], type, name }  (write + AUTO-WIRE + tsc + gate, ROLLBACK on fail)
//   proof    <cfg> <config>              -> { ok, output, stills[] } (render material/neo stills of the new component)
//   example  <TYPE> [dataFile]           -> { ok, type, dataKey, data, sample } (the beat's data if it can draw, else the manifest's sample)
//   shapes                               -> { ok, shapes: {TYPE:{dataKey,req[],fields[]}} } (so the console can judge drawability itself)
//
// cfg      = the Stage-1 brief json (see gen-component-prompt.mjs).
// config   = the new-component config json the LLM returned in Stage 1.
// tsx      = the component source the LLM returned in Stage 2 (raw, or {tsx:"..."}).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {TYPES} from './lib/constants.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const P = (rel) => path.join(ROOT, rel);
const R = (rel) => fs.readFileSync(P(rel), 'utf8');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const out = (o) => { process.stdout.write(JSON.stringify(o)); process.exit(o.ok === false ? 0 : 0); };
const die = (msg) => out({ok: false, error: msg});

const sub = (process.argv[2] || '').trim();
const cfgPath = process.argv[3];
// `shapes` is the only subcommand that reads nothing — it just reports the manifest.
if (!sub || (!cfgPath && sub !== 'shapes')) die('usage: component-flow <subcmd> <cfg> [config] [tsx]');

// `example` takes a TYPE, not a cfg file — it answers "what is this component
// MEANT to show?" from the manifest's own verified sample, so a beat that has no
// authored data yet can still be previewed (Stage 1 beats carry no `data`; that
// only arrives at Stage 2). Handled before the cfg read for that reason.
// The sample is for LOOKING ONLY — callers must never persist it into a spec.
// The drawability contract for every type, so the console can label a beat's
// preview ("real content" vs "sample") without a round-trip per row, using the
// SAME rule the example subcommand applies. Manifest stays the only source.
if (sub === 'shapes') {
  const {MANIFEST, MANIFEST_TYPES} = await import('./lib/manifest.mjs');
  const shapes = {};
  for (const t of MANIFEST_TYPES) {
    const m = MANIFEST[t]; if (!m) continue;
    shapes[t] = {
      dataKey: m.data_key || null,
      req: Object.entries(m.fields || {}).filter(([, f]) => f.req).map(([k]) => k),
      fields: Object.keys(m.fields || {}),
    };
  }
  out({ok: true, shapes});
}

if (sub === 'example') {
  const type = cfgPath.trim().toUpperCase();
  const {MANIFEST} = await import('./lib/manifest.mjs');
  const entry = MANIFEST[type];
  if (!entry) die(`unknown scene type "${type}"`);
  if (!entry.example) die(`${type} has no manifest example`);
  // Optional 2nd arg: the beat's own `data`. Judge whether it can actually DRAW —
  // a beat sheet often carries a stub like {"source":"illustrative"} which is
  // non-empty yet has none of the fields the component reads, so rendering it
  // yields an EMPTY scene. Non-empty is not the same as usable, so decide here
  // (where the manifest lives) rather than trusting a key count in the browser.
  let own = null;
  const dataFile = process.argv[4];
  if (dataFile) { try { own = readJson(dataFile); } catch { own = null; } }
  const dk = entry.data_key || null;
  const req = Object.entries(entry.fields || {}).filter(([, f]) => f.req).map(([k]) => k);
  const drawable = (d) => {
    if (!d || typeof d !== 'object') return false;
    const root = dk ? d[dk] : d;                       // where the component reads from
    if (!root || typeof root !== 'object') return false;
    const keys = Object.keys(root);
    if (!keys.length) return false;
    // Needs every REQUIRED field the component reads; when the manifest declares
    // none, any field the component actually reads will do.
    if (req.length) return req.every((k) => root[k] != null);
    return keys.some((k) => k in (entry.fields || {}));
  };
  const usable = drawable(own);
  out({ok: true, type, dataKey: dk, purpose: entry.purpose || '',
    data: usable ? own : entry.example, sample: !usable,
    ...(own && !usable ? {rejected: `the beat's data has none of the fields ${type} draws from`} : {})});
}

let brief;
try { brief = readJson(cfgPath); } catch (e) { die('cannot read cfg: ' + e.message); }

// ---------------------------------------------------------------- field typing
// (mirrors scripts/new-component.mjs so the interface + manifest agree)
const tsType = (Name, f) => f.name === 'color' ? 'SemColor' : ({
  string: 'string', number: 'number', anchor: 'number', asset: 'string',
  'asset[]': 'string[]', 'string[]': 'string[]', 'number[]': 'number[]',
  boolean: 'boolean', items: `${Name}Item[]`, object: 'Record<string, unknown>',
}[f.t] || 'string');
const FIELD_TYPES = new Set(['string', 'number', 'anchor', 'asset', 'asset[]', 'string[]', 'number[]', 'boolean', 'items', 'object']);

function validateConfig(cfg) {
  const errs = [];
  const TYPE = (cfg.type || '').trim();
  const Name = (cfg.name || '').trim();
  const dataKey = (cfg.dataKey || '').trim();
  if (!/^[A-Z][A-Z0-9_]*$/.test(TYPE)) errs.push('`type` must be UPPER_SNAKE (e.g. MY_WIDGET)');
  if (!/^[A-Z][A-Za-z0-9]*$/.test(Name)) errs.push('`name` must be PascalCase (e.g. MyWidget)');
  if (!/^[a-z][A-Za-z0-9]*$/.test(dataKey)) errs.push('`dataKey` must be camelCase (e.g. myWidget)');
  if (TYPE && TYPES.includes(TYPE)) errs.push(`type ${TYPE} already exists — pick a NEW name (or REUSE it instead)`);
  if (Name && fs.existsSync(P(`src/scenes/${Name}.tsx`))) errs.push(`src/scenes/${Name}.tsx already exists`);
  if (!Array.isArray(cfg.fields) || !cfg.fields.length) errs.push('`fields` must be a non-empty array');
  else cfg.fields.forEach((f, i) => {
    if (!f || typeof f.name !== 'string' || !/^[a-z][A-Za-z0-9]*$/.test(f.name)) errs.push(`fields[${i}].name must be camelCase`);
    if (!FIELD_TYPES.has(f.t)) errs.push(`fields[${i}] (${f && f.name}) has invalid t "${f && f.t}"`);
  });
  if ((cfg.fields || []).filter((f) => f.t === 'anchor').length > 1) errs.push('use at most ONE anchor field (e.g. atWord)');
  return errs;
}

// inner example (unwrap {dataKey:{...}} → {...} so we can rewrap consistently)
const innerExample = (cfg) => {
  const ex = cfg.example;
  if (ex && typeof ex === 'object' && ex[cfg.dataKey] && typeof ex[cfg.dataKey] === 'object') return ex[cfg.dataKey];
  return ex || {};
};

// ---------------------------------------------------------------- code builders
function buildInterface(cfg) {
  const Name = cfg.name;
  const hasItems = cfg.fields.some((f) => f.t === 'items');
  const itemIface = hasItems ? `export interface ${Name}Item {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
}
` : '';
  const body = cfg.fields.map((f) => `  ${f.name}?: ${tsType(Name, f)};`).join('\n');
  return `${itemIface}export interface ${Name}Data {\n${body}\n}`;
}

function buildManifestEntry(cfg) {
  const inner = innerExample(cfg);
  const dynamic = cfg.dynamic !== false;
  const fieldLines = cfg.fields.map((f) => {
    const bits = [`t: '${f.t}'`];
    if (f.req) bits.push('req: true');
    // preserveWs was accepted in the config and silently dropped here, so a field whose
    // note promised preserved indentation had it collapsed by normalize before the
    // component ever saw it (exactly how SPEC_TO_FRAME shipped documented-but-broken).
    if (f.preserveWs) bits.push('preserveWs: true');
    if (f.max) bits.push(`max: ${f.max}`);
    if (f.note) bits.push(`note: ${JSON.stringify(f.note)}`);
    return `      ${f.name}: {${bits.join(', ')}},`;
  }).join('\n');
  return `  ${cfg.type}: {
    category: ${JSON.stringify(cfg.category || 'diagram')}, family: ${JSON.stringify(cfg.family || cfg.category || 'diagram')}, data_key: ${JSON.stringify(cfg.dataKey)},
    purpose: ${JSON.stringify(cfg.purpose || '')},
    use_when: ${JSON.stringify(cfg.useWhen || cfg.use_when || '')},
    fields: {
${fieldLines}
    },
    example: {${cfg.dataKey}: ${JSON.stringify(inner)}},
  },
`;
  void dynamic;
}

function buildShowcaseEntry(cfg) {
  const inner = innerExample(cfg);
  const narration = `A ${cfg.type.toLowerCase().replace(/_/g, ' ')} demo scene shows this component.`;
  return `  {id: 'x-${cfg.dataKey.toLowerCase()}', type: '${cfg.type}', narration: ${JSON.stringify(narration)}, durationFrames: 200, timingSource: 'estimated', background: 'zoneA', data: {${cfg.dataKey}: ${JSON.stringify(inner)}}},\n`;
}

// insert an item just before the matching close of an array whose opener ends in '['
function insertInArray(src, opener, itemLine) {
  const start = src.indexOf(opener);
  if (start < 0) throw new Error(`anchor not found: ${opener.slice(0, 40)}…`);
  let bracket = start + opener.length - 1;            // the '[' at opener end
  let depth = 0, k = bracket;
  for (; k < src.length; k++) { const c = src[k]; if (c === '[') depth++; else if (c === ']') { depth--; if (depth === 0) break; } }
  if (k >= src.length) throw new Error(`no matching ] for ${opener.slice(0, 40)}…`);
  const head = src.slice(0, k).replace(/\s*$/, '');
  return head + '\n' + itemLine.replace(/\n$/, '') + '\n' + src.slice(k);
}
// insert content right after the first '{' (or '[') of an opener, on its own
// line, WITHOUT leaving a blank line (so a later `remove` reverses it cleanly).
function insertAfterObjectOpen(src, opener, content) {
  const i = src.indexOf(opener);
  if (i < 0) throw new Error(`anchor not found: ${opener.slice(0, 40)}…`);
  let at = i + opener.length;              // right after '{' / '['
  if (src[at] === '\n') at++;              // step past the existing newline
  return src.slice(0, at) + content.replace(/\n+$/, '') + '\n' + src.slice(at);
}

// ------------------------------------------------------------------- subcommands
function runGen(stage, cfgFile, configFile) {
  const args = [P('scripts/gen-component-prompt.mjs'), cfgFile, stage];
  if (configFile) args.push(configFile);
  return execFileSync(NODE, args, {encoding: 'utf8', maxBuffer: 1 << 26});
}

if (sub === 'stage1') {
  try { out({ok: true, prompt: runGen('stage1', cfgPath)}); }
  catch (e) { die('stage1 failed: ' + (e.stderr || e.message)); }
}

if (sub === 'validate') {
  const configFile = process.argv[4];
  if (!configFile) die('validate needs <config>');
  let cfg; try { cfg = readJson(configFile); } catch (e) { die('config is not valid JSON: ' + e.message); }
  const errs = validateConfig(cfg);
  out({ok: errs.length === 0, errors: errs, config: cfg});
}

if (sub === 'stage2') {
  const configFile = process.argv[4];
  if (!configFile) die('stage2 needs <config>');
  let cfg; try { cfg = readJson(configFile); } catch (e) { die('config is not valid JSON: ' + e.message); }
  const errs = validateConfig(cfg);
  if (errs.length) out({ok: false, errors: errs});
  try { out({ok: true, prompt: runGen('stage2', cfgPath, configFile)}); }
  catch (e) { die('stage2 failed: ' + (e.stderr || e.message)); }
}

if (sub === 'assemble') {
  const configFile = process.argv[4];
  const tsxFile = process.argv[5];
  if (!configFile || !tsxFile) die('assemble needs <config> <tsx>');
  let cfg; try { cfg = readJson(configFile); } catch (e) { die('config is not valid JSON: ' + e.message); }
  const errs = validateConfig(cfg);
  if (errs.length) out({ok: false, output: 'Config invalid:\n  • ' + errs.join('\n  • ')});

  // read the tsx payload (raw, or a JSON {tsx:"..."} / bare JSON string)
  let tsx = fs.readFileSync(tsxFile, 'utf8').replace(/^\uFEFF/, '');
  try { const j = JSON.parse(tsx); if (typeof j === 'string') tsx = j; else if (j && typeof j.tsx === 'string') tsx = j.tsx; } catch {}
  // strip a leading ```tsx fence if the model included one
  tsx = tsx.replace(/^\s*```(?:tsx|ts|jsx)?\s*\n/, '').replace(/\n```\s*$/, '').trim() + '\n';

  const Name = cfg.name, TYPE = cfg.type, dataKey = cfg.dataKey;
  const dynamic = cfg.dynamic !== false;

  // the files we will touch → back them up so we can ROLL BACK atomically
  const targets = {
    constants: 'scripts/lib/constants.mjs',
    types: 'src/types.ts',
    main: 'src/MainComposition.tsx',
    lint: 'scripts/lint-spec.mjs',
    manifest: 'scripts/lib/manifest.mjs',
    sceneLib: '.claude/skills/tech-video-director/references/scene_library.md',
    showcase: 'src/showcaseSpec.ts',
  };
  const backupDir = P('out/tmp/wire-backup');
  fs.rmSync(backupDir, {recursive: true, force: true});
  fs.mkdirSync(backupDir, {recursive: true});
  const backups = {};
  for (const [k, rel] of Object.entries(targets)) {
    if (fs.existsSync(P(rel))) { backups[k] = R(rel); fs.writeFileSync(path.join(backupDir, k), backups[k]); }
  }
  const newTsxPath = P(`src/scenes/${Name}.tsx`);
  const schemaBak = fs.existsSync(P('specs/video.schema.json')) ? R('specs/video.schema.json') : null;
  const typesGenBak = fs.existsSync(P('src/sceneTypes.generated.ts')) ? R('src/sceneTypes.generated.ts') : null;

  const rollback = () => {
    for (const [k, rel] of Object.entries(targets)) if (backups[k] != null) fs.writeFileSync(P(rel), backups[k]);
    if (schemaBak != null) fs.writeFileSync(P('specs/video.schema.json'), schemaBak);
    if (typesGenBak != null) fs.writeFileSync(P('src/sceneTypes.generated.ts'), typesGenBak);
    try { fs.rmSync(newTsxPath, {force: true}); } catch {}
  };

  const log = [];
  try {
    // 0) the component file
    fs.writeFileSync(newTsxPath, tsx); log.push(`wrote src/scenes/${Name}.tsx`);

    // 1) constants.mjs — TYPES
    let c = R(targets.constants);
    if (!c.includes(`'${TYPE}'`)) c = insertInArray(c, 'export const TYPES = [', `  '${TYPE}',`);
    fs.writeFileSync(P(targets.constants), c); log.push('constants.mjs: TYPES += ' + TYPE);

    // 2) types.ts — <Name>Data interface (before SceneData) + one SceneData field
    let ty = R(targets.types);
    const iface = buildInterface(cfg);
    ty = ty.replace('export interface SceneData {', `${iface}
export interface SceneData {
  ${dataKey}?: ${Name}Data;`);
    fs.writeFileSync(P(targets.types), ty); log.push('types.ts: +' + Name + 'Data + SceneData.' + dataKey);

    // 3) MainComposition.tsx — import + registry
    let mc = R(targets.main);
    const importLine = `import {${Name}} from './scenes/${Name}';`;
    if (!mc.includes(importLine)) {
      const sceneImports = [...mc.matchAll(/import \{[^}]+\} from '\.\/scenes\/[^']+';/g)];
      if (!sceneImports.length) throw new Error('no scene imports found in MainComposition.tsx');
      const last = sceneImports[sceneImports.length - 1];
      const at = last.index + last[0].length;
      mc = mc.slice(0, at) + '\n' + importLine + mc.slice(at);
    }
    mc = insertAfterObjectOpen(mc, 'const registry: Record<string, React.FC<{scene: Scene}>> = {', `  ${TYPE}: ${Name},`);
    fs.writeFileSync(P(targets.main), mc); log.push('MainComposition.tsx: import + registry');

    // 4) lint-spec.mjs — DYNAMIC (only for animated/visual types)
    if (dynamic) {
      let ls = R(targets.lint);
      if (!new RegExp(`const DYNAMIC = \\[[^\\]]*'${TYPE}'`).test(ls))
        ls = ls.replace('const DYNAMIC = [', `const DYNAMIC = ['${TYPE}', `);
      fs.writeFileSync(P(targets.lint), ls); log.push('lint-spec.mjs: DYNAMIC += ' + TYPE);
    }

    // 5) manifest.mjs — the entry (prepend as first key)
    let mf = R(targets.manifest);
    mf = insertAfterObjectOpen(mf, 'export const MANIFEST = {', buildManifestEntry(cfg));
    fs.writeFileSync(P(targets.manifest), mf); log.push('manifest.mjs: +' + TYPE);

    // 6) scene_library.md — a USE-WHEN row (doc; appended)
    if (backups.sceneLib != null) {
      const budgets = cfg.fields.map((f) => f.max ? `${f.name}≤${f.max}` : f.name).join(', ');
      const row = `| ${TYPE} | ${cfg.useWhen || cfg.use_when || ''} | ${budgets} |`;
      fs.writeFileSync(P(targets.sceneLib), backups.sceneLib.replace(/\s*$/, '') + '\n' + row + '\n');
      log.push('scene_library.md: +row');
    }

    // 7) showcaseSpec.ts — demo scene
    let sc = R(targets.showcase);
    sc = insertAfterObjectOpen(sc, 'const extra = [', buildShowcaseEntry(cfg));
    fs.writeFileSync(P(targets.showcase), sc); log.push('showcaseSpec.ts: +demo');

    // 8) regenerate derived files from the manifest
    execFileSync(NODE, [P('scripts/gen-schema.mjs')], {encoding: 'utf8'}); log.push('regenerated specs/video.schema.json');
    execFileSync(NODE, [P('scripts/gen-types.mjs')], {encoding: 'utf8'}); log.push('regenerated src/sceneTypes.generated.ts');

    // 9) VALIDATE: tsc + gate — any failure rolls everything back
    execFileSync(NODE, [P('node_modules/typescript/bin/tsc'), '--noEmit'], {encoding: 'utf8', cwd: ROOT});
    log.push('✓ tsc --noEmit clean');
    execFileSync(NODE, [P('scripts/check-manifest.mjs')], {encoding: 'utf8'});
    execFileSync(NODE, [P('scripts/gen-schema.mjs'), '--check'], {encoding: 'utf8'});
    execFileSync(NODE, [P('scripts/gen-types.mjs'), '--check'], {encoding: 'utf8'});
    log.push('✓ manifest + schema + types checks pass');

    out({ok: true, type: TYPE, name: Name, dataKey, wired: log,
      output: log.join('\n') + `\n\n✓ ${TYPE} wired into the library. Preview it in any design's showcase (e.g. material-wide) or run a proof.`});
  } catch (e) {
    const msg = (e.stdout || '') + '\n' + (e.stderr || e.message);
    rollback();
    out({ok: false, output: log.join('\n') + '\n\n✗ FAILED — all changes rolled back.\n\n' + msg.trim()});
  }
}

if (sub === 'remove') {
  // Reverse everything `assemble` wired for a component, so a mistaken/unwanted
  // type can be deleted WITHOUT hand-editing the seven files. Same atomic
  // backup + tsc/gate + rollback discipline as assemble.
  const TYPE = (brief.type || process.argv[4] || '').trim();
  if (!/^[A-Z][A-Z0-9_]*$/.test(TYPE)) die('remove needs a TYPE (UPPER_SNAKE) in the brief `type` or as arg 4');
  if (!TYPES.includes(TYPE)) die(`${TYPE} is not a registered type — nothing to remove.`);

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cutLine = (src, contentRe) => src.replace(new RegExp(`^[^\\n]*${contentRe}[^\\n]*\\n`, 'm'), '');
  const cutBlock = (src, anchor, trailingComma) => {
    const i = src.indexOf(anchor);
    if (i < 0) return src;
    let k = i + anchor.length - 1;
    while (k < src.length && src[k] !== '{') k++;
    let depth = 0, j = k;
    for (; j < src.length; j++) { const c = src[j]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) break; } }
    let end = j + 1;
    if (trailingComma && src[end] === ',') end++;
    while (end < src.length && (src[end] === ' ' || src[end] === '\t')) end++;
    if (src[end] === '\n') end++;
    let s = i;
    while (s > 0 && (src[s - 1] === ' ' || src[s - 1] === '\t')) s--;
    let startCut = (src[s - 1] === '\n') ? s : i;
    return src.slice(0, startCut) + src.slice(end);
  };

  // derive Name (from the registry) and dataKey (from the SceneData mapping)
  const mcSrc = R('src/MainComposition.tsx');
  const nameM = mcSrc.match(new RegExp(`\\n\\s*${esc(TYPE)}:\\s*(\\w+),`));
  const Name = nameM ? nameM[1] : null;
  const tySrc = R('src/types.ts');
  const dkM = Name ? tySrc.match(new RegExp(`(\\w+)\\??:\\s*${esc(Name)}Data;`)) : null;
  const dataKey = dkM ? dkM[1] : null;
  if (!Name) die(`could not find a registry entry for ${TYPE} in MainComposition.tsx`);

  const targets = {
    constants: 'scripts/lib/constants.mjs', types: 'src/types.ts', main: 'src/MainComposition.tsx',
    lint: 'scripts/lint-spec.mjs', manifest: 'scripts/lib/manifest.mjs',
    sceneLib: '.claude/skills/tech-video-director/references/scene_library.md', showcase: 'src/showcaseSpec.ts',
  };
  const backupDir = P('out/tmp/wire-backup'); fs.rmSync(backupDir, {recursive: true, force: true}); fs.mkdirSync(backupDir, {recursive: true});
  const backups = {};
  for (const [k, rel] of Object.entries(targets)) if (fs.existsSync(P(rel))) { backups[k] = R(rel); fs.writeFileSync(path.join(backupDir, k), backups[k]); }
  const scenePath = P(`src/scenes/${Name}.tsx`);
  const sceneBak = fs.existsSync(scenePath) ? fs.readFileSync(scenePath, 'utf8') : null;
  const schemaBak = fs.existsSync(P('specs/video.schema.json')) ? R('specs/video.schema.json') : null;
  const typesGenBak = fs.existsSync(P('src/sceneTypes.generated.ts')) ? R('src/sceneTypes.generated.ts') : null;
  const rollback = () => {
    for (const [k, rel] of Object.entries(targets)) if (backups[k] != null) fs.writeFileSync(P(rel), backups[k]);
    if (sceneBak != null) fs.writeFileSync(scenePath, sceneBak);
    if (schemaBak != null) fs.writeFileSync(P('specs/video.schema.json'), schemaBak);
    if (typesGenBak != null) fs.writeFileSync(P('src/sceneTypes.generated.ts'), typesGenBak);
  };

  const log = [];
  try {
    let c = R(targets.constants); c = cutLine(c, `'${esc(TYPE)}',`); fs.writeFileSync(P(targets.constants), c); log.push('constants.mjs: TYPES -= ' + TYPE);
    let ty = R(targets.types);
    if (dataKey) ty = cutLine(ty, `${esc(dataKey)}\\??:\\s*${esc(Name)}Data;`);
    ty = cutBlock(ty, `export interface ${Name}Data {`, false);
    ty = cutBlock(ty, `export interface ${Name}Item {`, false);
    fs.writeFileSync(P(targets.types), ty); log.push('types.ts: -' + Name + 'Data' + (dataKey ? ' + SceneData.' + dataKey : ''));
    let mc = R(targets.main); mc = cutLine(mc, `import \\{${esc(Name)}\\} from './scenes/${esc(Name)}'`); mc = cutLine(mc, `${esc(TYPE)}:\\s*${esc(Name)},`); fs.writeFileSync(P(targets.main), mc); log.push('MainComposition.tsx: -import/-registry');
    let ls = R(targets.lint); ls = ls.replace(new RegExp(`'${esc(TYPE)}',\\s?`), ''); fs.writeFileSync(P(targets.lint), ls); log.push('lint-spec.mjs: DYNAMIC -= ' + TYPE);
    let mf = R(targets.manifest); mf = cutBlock(mf, `  ${TYPE}: {`, true); fs.writeFileSync(P(targets.manifest), mf); log.push('manifest.mjs: -' + TYPE);
    if (backups.sceneLib != null) { fs.writeFileSync(P(targets.sceneLib), cutLine(R(targets.sceneLib), `\\| ${esc(TYPE)} \\|`)); log.push('scene_library.md: -row'); }
    let sc = R(targets.showcase); if (dataKey) sc = cutLine(sc, `id: 'x-${esc(dataKey.toLowerCase())}'`); fs.writeFileSync(P(targets.showcase), sc); log.push('showcaseSpec.ts: -demo');
    if (sceneBak != null) { fs.rmSync(scenePath, {force: true}); log.push(`deleted src/scenes/${Name}.tsx`); }

    execFileSync(NODE, [P('scripts/gen-schema.mjs')], {encoding: 'utf8'});
    execFileSync(NODE, [P('scripts/gen-types.mjs')], {encoding: 'utf8'});
    execFileSync(NODE, [P('node_modules/typescript/bin/tsc'), '--noEmit'], {encoding: 'utf8', cwd: ROOT}); log.push('✓ tsc --noEmit clean');
    execFileSync(NODE, [P('scripts/check-manifest.mjs')], {encoding: 'utf8'});
    execFileSync(NODE, [P('scripts/gen-schema.mjs'), '--check'], {encoding: 'utf8'});
    execFileSync(NODE, [P('scripts/gen-types.mjs'), '--check'], {encoding: 'utf8'}); log.push('✓ manifest + schema + types checks pass');
    out({ok: true, type: TYPE, name: Name, wired: log, output: log.join('\n') + `\n\n✓ ${TYPE} fully removed from the library.`});
  } catch (e) {
    const msg = (e.stdout || '') + '\n' + (e.stderr || e.message);
    rollback();
    out({ok: false, output: log.join('\n') + '\n\n✗ FAILED — all changes rolled back (nothing removed).\n\n' + msg.trim()});
  }
}

if (sub === 'preview') {
  // Render ONE scene (any type + its data) to a short MP4 in the CHOSEN design/
  // theme, so the console can show it in a <video> with a scrub/timeline. Used
  // per-beat in the Author flow.
  const design = (brief.design || 'moderndark').trim();
  const theme = (brief.theme || design).trim();
  const vertical = /short/i.test(brief.format || '');
  // specFile: a ready 1-scene spec (already voiced + timed by voiceover.py/sync.mjs).
  // When present we render IT as-is so the beat's <Audio> and real durationFrames apply.
  const specFile = (brief.specFile || '').trim();
  let preSpec = null;
  if (specFile) { try { preSpec = readJson(specFile); } catch (e) { die('cannot read specFile: ' + e.message); } }
  const s0 = preSpec && preSpec.scenes && preSpec.scenes[0];
  const type = specFile ? ((s0 && s0.type) || '').trim() : (brief.type || '').trim();
  const sceneData = specFile ? (s0 && s0.data) || {} : brief.sceneData || {};
  const durationFrames = specFile
    ? Math.max(30, Math.min(1800, (s0 && s0.durationFrames) || 150))
    : Math.max(30, Math.min(600, brief.durationFrames || 150));
  if (!type) die('preview needs a scene `type` in the brief');
  (async () => {
    let bundle, selectComposition, renderMedia;
    try {
      ({bundle} = await import('file://' + P('node_modules/@remotion/bundler/dist/index.js').replace(/\\/g, '/')));
      ({selectComposition, renderMedia} = await import('file://' + P('node_modules/@remotion/renderer/dist/index.js').replace(/\\/g, '/')));
    } catch (e) { out({ok: false, output: 'renderer/bundler not available: ' + e.message}); return; }
    const spec = preSpec || {meta: {topic: type, format: vertical ? 'shorts' : 'long', fps: 30}, scenes: [
      {id: 's01', type, narration: 'preview', durationFrames, timingSource: 'estimated', background: 'zoneA', data: sceneData},
    ]};
    const compId = `${design}-${vertical ? 'short' : 'wide'}`;
    const outDir = P('out/proof/complab'); fs.mkdirSync(outDir, {recursive: true});
    // Hash the CONTENT (data + duration + aspect + voiced?) so two beats of the same type but
    // different data get distinct preview files instead of clobbering one another;
    // identical content reuses the same file (cheap re-open, no wasted render).
    const hash = crypto.createHash('sha1')
      .update(JSON.stringify(sceneData) + '|' + durationFrames + '|' + (vertical ? 's' : 'w') + '|' + design + '|' + (specFile ? 'vo' : ''))
      .digest('hex').slice(0, 10);
    const safe = (type + '_' + design + (vertical ? '_short' : '_wide') + (specFile ? '_vo' : '')).replace(/[^A-Za-z0-9_]/g, '');
    const outfile = path.join(outDir, `preview_${safe}_${hash}.mp4`);
    try {
      let lastBundle = -1;
      const serveUrl = await bundle({entryPoint: P('src/index.ts'), onProgress: (p) => {
        const pct = Math.round(p); if (pct !== lastBundle) { lastBundle = pct; process.stderr.write(`bundling ${pct}%\n`); }
      }});
      const inputProps = {spec, themeOverride: theme, designOverride: design};
      const composition = await selectComposition({serveUrl, id: compId, inputProps});
      let lastRender = -1;
      await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: outfile,
        inputProps, frameRange: [0, durationFrames - 1], overwrite: true, onProgress: ({progress}) => {
          const pct = Math.round((progress || 0) * 100); if (pct !== lastRender) { lastRender = pct; process.stderr.write(`rendering ${pct}%\n`); }
        }});
      out({ok: true, clip: 'out/proof/complab/' + path.basename(outfile), file: path.basename(outfile)});
    } catch (e) { out({ok: false, output: 'preview render failed: ' + (e.stack || e.message)}); }
  })();
}

if (sub === 'proof') {
  const configFile = process.argv[4];
  if (!configFile) die('proof needs <config>');
  let cfg; try { cfg = readJson(configFile); } catch (e) { die('config is not valid JSON: ' + e.message); }
  (async () => {
    let bundle, selectComposition, renderStill;
    try {
      ({bundle} = await import('file://' + P('node_modules/@remotion/bundler/dist/index.js').replace(/\\/g, '/')));
      ({selectComposition, renderStill} = await import('file://' + P('node_modules/@remotion/renderer/dist/index.js').replace(/\\/g, '/')));
    } catch (e) { out({ok: false, output: 'renderer/bundler not available: ' + e.message}); return; }
    const inner = innerExample(cfg);
    const spec = {meta: {topic: cfg.type, format: 'long', fps: 30}, scenes: [
      {id: 's01', type: cfg.type, narration: 'proof', durationFrames: 200, timingSource: 'estimated', background: 'zoneA', data: {[cfg.dataKey]: inner}},
    ]};
    const outDir = P('out/proof/complab'); fs.mkdirSync(outDir, {recursive: true});
    const stills = [];
    try {
      const serveUrl = await bundle({entryPoint: P('src/index.ts'), onProgress: () => {}});
      const jobs = [
        {id: 'material-wide', design: 'material'},
        {id: 'material-short', design: 'material'},
        {id: 'neobrutalism-wide', design: 'neobrutalism'},
      ];
      for (const j of jobs) {
        const composition = await selectComposition({serveUrl, id: j.id,
          inputProps: {spec, themeOverride: j.design, designOverride: j.design}});
        const outfile = path.join(outDir, `${cfg.type}_${j.id}.png`);
        await renderStill({composition, serveUrl, output: outfile, frame: 120,
          inputProps: {spec, themeOverride: j.design, designOverride: j.design}});
        stills.push(path.relative(ROOT, outfile).replace(/\\/g, '/'));
      }
      out({ok: true, stills, output: `Rendered ${stills.length} proof stills for ${cfg.type}.`});
    } catch (e) { out({ok: false, output: 'proof render failed: ' + (e.stack || e.message), stills}); }
  })();
} else if (!['stage1', 'validate', 'stage2', 'assemble', 'remove', 'preview', 'example', 'shapes'].includes(sub)) {
  die('unknown subcommand: ' + sub);
}
