#!/usr/bin/env node
// COMPONENT SCAFFOLDER — turns "build a new component" from a 7-file ritual into
// one command. Given a small JSON describing the component, it:
//   1. WRITES src/scenes/<Name>.tsx — a token-driven, ×scale, both-aspect skeleton
//      that compiles and renders real content immediately (you replace the body
//      with the concept's real visualization);
//   2. EMITS an exact copy-paste WIRING REPORT (out/scaffold/<TYPE>.md + stdout)
//      for the other six touch-points — types.ts, MainComposition registry,
//      constants TYPES (+DYNAMIC), manifest entry, scene_library row, showcaseSpec
//      demo — plus a linter budget block.
//
// It NEVER auto-edits the core files (a bad regex could corrupt the 1700-line
// linter): the generator produces correct content, and Claude Code / you place it
// with reviewable edits, then run the render-proof loop in
// .claude/skills/tech-video-director/references/component_authoring.md.
//
// Usage: node scripts/new-component.mjs <config.json>
//
// config.json shape:
// {
//   "type": "MY_WIDGET",          // UPPER_SNAKE — the scene.type
//   "name": "MyWidget",           // PascalCase — component + src/scenes/<Name>.tsx
//   "dataKey": "myWidget",        // camelCase — scene.data.<dataKey> (nested; recommended)
//   "category": "diagram",        // prompt grouping (structure|text|list|data|chart|diagram|icon|branding|mockup|media|code|stream|framed|gauge|zone|systems|editorial|…)
//   "family": "diagram",          // adjacency family (RESTRICTED families read as one skeleton)
//   "dynamic": true,              // true → counts as a visual/animated "dynamic moment" (anti-monotony)
//   "purpose": "one line",
//   "useWhen": "when a director should reach for it",
//   "fields": [
//     {"name":"headline","t":"string","req":true,"max":48,"note":"the big line"},
//     {"name":"items","t":"items","req":true,"note":"3-5 × {label≤18, sub?, color?, atWord}"},
//     {"name":"color","t":"string","note":"blue|green|red|orange|purple|yellow"},
//     {"name":"atWord","t":"anchor"},
//     {"name":"source","t":"string","max":64}
//   ],
//   "example": { "headline": "...", "items": [ ... ] }   // optional; auto-built if omitted
// }
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {TYPES} from './lib/constants.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfgPath = process.argv[2];
if (!cfgPath) { console.error('Usage: node scripts/new-component.mjs <config.json>'); process.exit(2); }

let cfg;
try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8').replace(/^\uFEFF/, '')); }
catch (e) { console.error(`✗ cannot read config: ${e.message}`); process.exit(2); }

// ---- validate --------------------------------------------------------------
const errs = [];
const TYPE = (cfg.type || '').trim();
const Name = (cfg.name || '').trim();
const dataKey = (cfg.dataKey || '').trim();
if (!/^[A-Z][A-Z0-9_]*$/.test(TYPE)) errs.push('`type` must be UPPER_SNAKE (e.g. MY_WIDGET)');
if (!/^[A-Z][A-Za-z0-9]*$/.test(Name)) errs.push('`name` must be PascalCase (e.g. MyWidget)');
if (!/^[a-z][A-Za-z0-9]*$/.test(dataKey)) errs.push('`dataKey` must be camelCase (e.g. myWidget)');
if (TYPES.includes(TYPE)) errs.push(`type ${TYPE} already exists in constants TYPES — pick a new name`);
if (Name && fs.existsSync(path.join(ROOT, 'src', 'scenes', `${Name}.tsx`))) errs.push(`src/scenes/${Name}.tsx already exists`);
if (!Array.isArray(cfg.fields) || !cfg.fields.length) errs.push('`fields` must be a non-empty array');
if (errs.length) { console.error('✗ invalid config:\n  • ' + errs.join('\n  • ')); process.exit(1); }

const category = cfg.category || 'diagram';
const family = cfg.family || category;
const dynamic = cfg.dynamic !== false;
const purpose = (cfg.purpose || `TODO: what ${TYPE} shows`).trim();
const useWhen = (cfg.useWhen || 'TODO: when to reach for it').trim();
const fields = cfg.fields;

// ---- field helpers ---------------------------------------------------------
const tsType = (f) => f.name === 'color' ? 'SemColor' : ({
  string: 'string', number: 'number', anchor: 'number', asset: 'string',
  'asset[]': 'string[]', items: `${Name}Item[]`, object: 'Record<string, unknown>',
}[f.t] || 'string');
// local (in-file) type mapping — items point at the in-file item type so the
// scaffolded component COMPILES STANDALONE, before it is wired into SceneData.
const localTsType = (f) => f.t === 'items' ? `${Name}ItemLocal[]` : tsType(f);

const strFields = fields.filter((f) => f.t === 'string');
const itemsField = fields.find((f) => f.t === 'items');
const anchorField = fields.find((f) => f.t === 'anchor') || fields.find((f) => f.name === 'atWord');
const colorField = fields.find((f) => f.name === 'color');
const sourceField = fields.find((f) => f.name === 'source');
const headlineField = strFields.find((f) => /^(headline|title|heading|label)$/i.test(f.name)) || strFields[0];

// ---- 1 · the component .tsx -------------------------------------------------
const hasItems = !!itemsField;
const colorExpr = colorField ? `sem(d.${colorField.name} ?? 'blue')` : `sem('blue')`;
const anchorExpr = anchorField ? `d.${anchorField.name} ?? 1` : '1';

// In-file types so the scaffold compiles on its own; once you wire the real
// ${Name}Data into src/types.ts (report step 1) you can switch `d` to read
// scene.data.${dataKey} directly and delete these.
const itemLocalDecl = hasItems ? `type ${Name}ItemLocal = {label?: string; text?: string; title?: string; sub?: string; detail?: string; color?: SemColor; asset?: string; atWord?: number};\n` : '';
const dataLocalDecl = `type ${Name}DataLocal = {\n${fields.map((f) => `  ${f.name}?: ${localTsType(f)};`).join('\n')}\n};`;

const tsx = `import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';

// ${TYPE} — ${purpose}
// SCAFFOLD: a token-driven, ×scale, both-aspect starting point that COMPILES and
// renders real content. This is the START, not the finish. Replace the body with
// the true visualization, then hand-tune it to the VISUAL CRAFT LAWS in
// references/component_authoring.md §5b before sealing:
//  • tokens only (no hardcoded colour/font/radius/px); every px × scale.
//  • FONTS by role: display=headings, body=prose, mono=numbers/ids, accent=one flourish.
//    One dominant size per frame; tune tracking + line-height.
//  • ALIGN structurally (grid/flex/SVG); one optical centre; one spacing rhythm; safe margins.
//  • TRANSPARENCY: read-text on OPAQUE panels; alpha/blur only for de-emphasis; never
//    leave text on a translucent fill over a busy background; nothing stuck at partial opacity.
//  • COLOUR: semantic colours MEAN; active element glows in its OWN colour; check dark AND light.
//  • gate glow on t.style.glow, radius on t.style.cornerRadius; branch layout on \`vertical\`;
//    clamp every interpolate; motion a pure function of frame.
${itemLocalDecl}${dataLocalDecl}
export const ${Name}: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = (scene.data as Record<string, unknown>).${dataKey} as ${Name}DataLocal | undefined;
  if (!d) return <AbsoluteFill />;
  const start = wordToFrame(${anchorExpr});
  const accent = ${colorExpr};
  const appear = interpolate(frame - start, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
${hasItems ? `  const items: ${Name}ItemLocal[] = d.${itemsField.name} ?? [];` : ''}

  return (
    <AbsoluteFill style={{background: t.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 80 * scale}}>
      <div style={{opacity: appear, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 * scale, width: '100%', maxWidth: (vertical ? 900 : 1500) * scale}}>
${headlineField ? `        {d.${headlineField.name} ? (
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 60 : 74) * scale, lineHeight: 1.06, letterSpacing: t.style.displayTracking, color: t.colors.text, textAlign: 'center'}}>{d.${headlineField.name}}</div>
        ) : null}` : ''}
${hasItems ? `        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', flexWrap: 'wrap', gap: 20 * scale, justifyContent: 'center', width: '100%'}}>
          {items.map((it: ${Name}ItemLocal, i: number) => {
            const c = it.color ? sem(it.color) : accent;
            const s = interpolate(frame - start, [8 + i * 4, 22 + i * 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={i} style={{
                opacity: s,
                transform: \`translateY(\${(1 - s) * 14 * scale}px)\`,
                background: t.colors.panel,
                border: \`\${2 * scale}px solid \${hexA(c, 0.5)}\`,
                borderRadius: 16 * scale * t.style.cornerRadius,
                boxShadow: t.style.glow > 0 ? \`0 0 \${18 * scale}px \${hexA(c, 0.25 * t.style.glow)}\` : 'none',
                padding: 24 * scale, minWidth: 200 * scale,
                display: 'flex', flexDirection: 'column', gap: 6 * scale,
              }}>
                <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 30 * scale, color: t.colors.text}}>{it.label ?? it.text ?? it.title}</div>
                {it.sub ?? it.detail ? <div style={{fontFamily: t.fonts.body, fontSize: 22 * scale, color: t.colors.muted}}>{it.sub ?? it.detail}</div> : null}
              </div>
            );
          })}
        </div>` : `        {/* TODO: render the fields of scene.data.${dataKey} here */}`}
      </div>
${sourceField ? `      {d.${sourceField.name} ? <SourceFooter text={d.${sourceField.name}} /> : null}` : ''}
    </AbsoluteFill>
  );
};
`;

fs.mkdirSync(path.join(ROOT, 'src', 'scenes'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'src', 'scenes', `${Name}.tsx`), tsx);

// ---- 2 · wiring snippets ----------------------------------------------------
const itemIface = hasItems ? `export interface ${Name}Item {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
}

` : '';
const ifaceFields = fields.map((f) => `  ${f.name}?: ${tsType(f)};`).join('\n');
const typesSnippet = `${itemIface}export interface ${Name}Data {
${ifaceFields}
}

// …and add ONE line inside \`export interface SceneData { … }\`:
//   ${dataKey}?: ${Name}Data;`;

const registrySnippet = `import {${Name}} from './scenes/${Name}';   // with the other scene imports
// …and inside \`const registry\`:
  ${TYPE}: ${Name},`;

const constantsSnippet = `// add '${TYPE}' to the TYPES array in scripts/lib/constants.mjs${dynamic ? `
// (it is a visual/animated type — also add '${TYPE}' to the DYNAMIC array near the
//  top of scripts/lint-spec.mjs so the anti-monotony gate counts it)` : ''}`;

const manifestFields = fields.map((f) => {
  const bits = [`t: '${f.t}'`];
  if (f.req) bits.push('req: true');
  if (f.max) bits.push(`max: ${f.max}`);
  if (f.note) bits.push(`note: ${JSON.stringify(f.note)}`);
  return `      ${f.name}: {${bits.join(', ')}},`;
}).join('\n');
const example = cfg.example || (() => {
  const ex = {};
  for (const f of fields) {
    if (f.t === 'string') ex[f.name] = f.name === 'source' ? 'illustrative' : f.name === 'color' ? 'blue' : `${Name} ${f.name}`;
    else if (f.t === 'number') ex[f.name] = 42;
    else if (f.t === 'anchor') ex[f.name] = 1;
    else if (f.t === 'asset') ex[f.name] = 'lucide:sparkles';
    else if (f.t === 'asset[]') ex[f.name] = ['si:react'];
    else if (f.t === 'items') ex[f.name] = [{label: 'First', sub: 'detail', atWord: 1}, {label: 'Second', sub: 'detail', atWord: 2}];
  }
  return ex;
})();
const manifestSnippet = `  ${TYPE}: {
    category: '${category}', family: '${family}', data_key: '${dataKey}',
    purpose: ${JSON.stringify(purpose)},
    use_when: ${JSON.stringify(useWhen)},
    fields: {
${manifestFields}
    },
    example: {${dataKey}: ${JSON.stringify(example)}},
  },`;

const budgetLines = strFields.filter((f) => f.max).map((f) => `    if (len(x.${f.name}) > ${f.max}) E(\`\${id}: ${TYPE} ${f.name} > ${f.max} chars\`);`).join('\n');
const linterSnippet = `  // per-field budgets (add near the other \`if (d.<key>)\` blocks in lint-spec.mjs)
  if (d.${dataKey}) {
    const x = d.${dataKey};
${budgetLines || `    // TODO: add a char budget for every text field, sized to the NARROW (vertical) container`}
  }`;

const fieldSummary = fields.map((f) => f.max ? `${f.name}≤${f.max}` : f.name).join(', ');
const sceneLibSnippet = `| ${TYPE} | ${useWhen} | ${fieldSummary} |`;

const demoData = {[dataKey]: example};
const showcaseSnippet = `  {id: 'x-${dataKey.toLowerCase()}', type: '${TYPE}', narration: 'A ${TYPE.toLowerCase().replace(/_/g, ' ')} demo scene.', durationFrames: 200, timingSource: 'estimated', background: 'zoneA', data: ${JSON.stringify(demoData)}},`;

// ---- 3 · report ------------------------------------------------------------
const report = `# Scaffold: ${TYPE}  (component ${Name}, scene.data.${dataKey})

✓ WROTE  src/scenes/${Name}.tsx  (token-driven skeleton — replace the render body with the real visualization)

Now wire the six touch-points below, then run the render-proof loop
(references/component_authoring.md §3): MIN/MAX/MIX fixtures × wide + vertical ×
material + neobrutalism, view the stills, then \`npm run gate\`.

──────────────────────────────────────────────────────────────────────────
## 1 · src/types.ts   (add the interface, then one field on SceneData)
\`\`\`ts
${typesSnippet}
\`\`\`

## 2 · src/MainComposition.tsx   (import + registry)
\`\`\`ts
${registrySnippet}
\`\`\`

## 3 · scripts/lib/constants.mjs   (+ scripts/lint-spec.mjs DYNAMIC)
${constantsSnippet}

## 4 · scripts/lib/manifest.mjs   (the entry that teaches the LLM + gate)
\`\`\`js
${manifestSnippet}
\`\`\`

## 5 · scripts/lint-spec.mjs   (per-field character budgets)
\`\`\`js
${linterSnippet}
\`\`\`

## 6 · references/scene_library.md   (append a USE-WHEN row)
\`\`\`
${sceneLibSnippet}
\`\`\`

## 7 · src/showcaseSpec.ts   (add to the \`extra[]\` array so it shows in every design)
\`\`\`ts
${showcaseSnippet}
\`\`\`

──────────────────────────────────────────────────────────────────────────
## After wiring
1. \`node node_modules/typescript/bin/tsc --noEmit\`  → clean
2. Regenerate the derived files (manifest changed):
     \`node scripts/gen-schema.mjs\`  and  \`node scripts/gen-types.mjs\`
3. Render-proof (both aspects × material + neobrutalism + a LIGHT twin), VIEW the stills.
4. \`npm run gate\`  (or run the 10 checks directly if npm is blocked).

## VISUAL CRAFT CHECKLIST (references/component_authoring.md §5b — a scaffold is NOT done until every box is true, verified against the stills)
[ ] TYPOGRAPHY: display/body/mono/accent roles correct; ONE dominant size per frame; tracking + line-height tuned; accent/script font ≤1 short phrase
[ ] ALIGNMENT: structural (grid/flex/SVG maths), one optical centre, one spacing rhythm, safe margins, ONE focal point
[ ] TRANSPARENCY/BLUR: read-text on OPAQUE panels (border + glow-gated shadow); alpha/blur only for de-emphasis; nothing stuck at partial opacity at rest
[ ] COLOUR: semantic colours carry meaning; active element glows in its OWN colour; contrast verified on dark AND a light twin
[ ] MOTION: entrances 12–18f staggered; deterministic; clamped; content animates after chrome settles
[ ] both aspects (wide + vertical) look intentional at MIN and MAX content
`;

const outDir = path.join(ROOT, 'out', 'scaffold');
fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(path.join(outDir, `${TYPE}.md`), report);

console.log(`✓ src/scenes/${Name}.tsx written.`);
console.log(`✓ wiring report → out/scaffold/${TYPE}.md\n`);
console.log(report);
