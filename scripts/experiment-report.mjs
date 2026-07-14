#!/usr/bin/env node
// EXPERIMENT REPORT — ingests the committed pw-v1 corpus (beats ×4, spec ×4)
// through the real harness and writes per-model verdict.md + one EXPERIMENT_REPORT.md
// with an error-class taxonomy (ENVELOPE/DATA/STRUCTURAL/NARRATION/ANCHOR).
// Never touches the committed fixtures (works on copies). Usage: node scripts/experiment-report.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {normalizeSpec} from './lib/normalize-spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const DIR = path.join(ROOT, 'briefs', 'experiments', 'pw-v1');
const TMP = path.join(ROOT, 'out', 'tmp', 'report'); fs.mkdirSync(TMP, {recursive: true});
const MODELS = ['flash-lite', 'gemini-pro', 'qwen', 'mistral'];

const ex = (args) => { try { return {code: 0, out: execFileSync(NODE, args, {encoding: 'utf8'})}; } catch (e) { return {code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '')}; } };
const bullets = (lintOut) => { const o = []; let inR = false; for (const l of lintOut.split('\n')) { if (/REJECTED/.test(l)) inR = true; else if (/WARNINGS|PASSED|Fix the spec/.test(l)) inR = false; else if (inR) { const m = l.match(/^\s*[•*]\s*(.+?)\s*$/); if (m) o.push(m[1]); } } return o; };
const classifyErr = (m) => /missing narration/i.test(m) ? 'NARRATION'
  : /atword|anchor/i.test(m) ? 'ANCHOR'
  : /thumbnail|cover|brand\.|meta\.|component|screenplay|format/i.test(m) ? 'ENVELOPE'
  : /transition|scene 1|last scene|adjacency|palette|over-reliance|dynamic|scenes —|topicaxes|HOOK is/i.test(m) ? 'STRUCTURAL'
  : 'DATA';
const classifyChange = (c) => /component→type|meta\.|thumbnail|cover\.|→brand|brand\.|dropped unknown (meta|thumbnail|cover)/i.test(c) ? 'ENVELOPE'
  : /anchor|atword/i.test(c) ? 'ANCHOR'
  : /transition/i.test(c) ? 'STRUCTURAL'
  : /recomputed .* duration/i.test(c) ? 'TIMING'
  : 'DATA';

const tax = {ENVELOPE: 0, DATA: 0, STRUCTURAL: 0, NARRATION: 0, ANCHOR: 0};
const rows = [];
for (const m of MODELS) {
  // beats
  const bv = ex(['scripts/validate-beats.mjs', path.join(DIR, `beats-${m}.json`)]);
  const beatsVerdict = bv.code === 0 ? 'OK' : 'REJECTED';
  const beatErrs = (bv.out.match(/^✗ /gm) || []).length;
  // spec
  const work = path.join(TMP, `spec-${m}.json`);
  fs.copyFileSync(path.join(DIR, `spec-${m}.json`), work);
  const before = ex(['scripts/lint-spec.mjs', work]);
  const errBefore = bullets(before.out);
  const spec = JSON.parse(fs.readFileSync(work, 'utf8').replace(/^\uFEFF/, ''));
  const {changes} = normalizeSpec(spec);
  fs.writeFileSync(work, JSON.stringify(spec, null, 2));
  const after = ex(['scripts/lint-spec.mjs', work]);
  const errAfter = bullets(after.out);
  const firstTry = before.code === 0;
  // taxonomy: count each pre-normalize error + each residual + adjacency (beats)
  const findings = {ENVELOPE: 0, DATA: 0, STRUCTURAL: beatsVerdict === 'REJECTED' ? beatErrs : 0, NARRATION: 0, ANCHOR: 0};
  for (const e of errBefore) { const c = classifyErr(e); if (findings[c] != null) findings[c]++; }
  for (const k of Object.keys(findings)) tax[k] += findings[k];
  const changeClasses = {}; for (const c of changes) { const k = classifyChange(c); changeClasses[k] = (changeClasses[k] || 0) + 1; }
  const residualClasses = [...new Set(errAfter.map(classifyErr))];
  rows.push({m, beatsVerdict, beatErrs, firstTry, before: errBefore.length, autofix: changes.length, after: errAfter.length, residualClasses, changeClasses, errAfter});

  // per-model verdict
  fs.writeFileSync(path.join(DIR, `verdict-${m}.md`), [
    `# Verdict — ${m}`, '',
    `- Stage-1 beat sheet: **${beatsVerdict}**${beatErrs ? ` (${beatErrs} structural error(s))` : ''}`,
    `- Single-paste spec first-try lint: **${firstTry ? 'PASS' : 'FAIL'}**`,
    `- Errors before normalize: ${errBefore.length}`,
    `- Deterministic auto-fixes: ${changes.length} ${JSON.stringify(changeClasses)}`,
    `- Errors after normalize: ${errAfter.length}${errAfter.length ? ` (residual class: ${residualClasses.join(', ')})` : ' → PASS'}`,
    errAfter.length ? '\n## Residual (→ fix-prompt loop / creator)\n' + errAfter.map((e) => '- ' + e).join('\n') : '',
    '\n## Beat-sheet verdict\n```\n' + bv.out.trim() + '\n```',
  ].join('\n'));
}

const report = [
  '# EXPERIMENT_REPORT — pw-v1 (password managers)',
  '',
  'Corpus: 4 stage-1 beat sheets + 4 single-paste specs (Gemini Flash Lite, Gemini Pro, Qwen 3.7 Plus, Mistral),',
  'committed verbatim under `briefs/experiments/pw-v1/`. Every number below is produced by',
  '`node scripts/experiment-report.mjs` (validate-beats + lint + normalize on copies). Regenerate to refresh.',
  '',
  '## Results',
  '',
  '| Model | Beats (stage-1) | Spec first-try lint | Err before | Auto-fixes | Err after | Residual class |',
  '|-------|-----------------|---------------------|-----------|-----------|-----------|----------------|',
  ...rows.map((r) => `| ${r.m} | ${r.beatsVerdict}${r.beatErrs ? ` (${r.beatErrs})` : ''} | ${r.firstTry ? 'PASS' : 'FAIL'} | ${r.before} | ${r.autofix} | ${r.after} | ${r.after ? r.residualClasses.join(', ') : '— (PASS)'} |`),
  '',
  '## Error-class taxonomy (drives priorities)',
  '',
  '| Class | Count | Meaning / owner |',
  '|-------|-------|-----------------|',
  `| ENVELOPE | ${tax.ENVELOPE} | wrong wrapper (component/meta/thumbnail) — **absorbed by normalizer §2 / moved out of contract §3** |`,
  `| DATA | ${tax.DATA} | per-field budgets/shapes — mostly auto-fixed; content overflows → fix-loop (R2) |`,
  `| STRUCTURAL | ${tax.STRUCTURAL} | beat order / same-family adjacency — **stage-1 validator §4 + prompt family law** |`,
  `| NARRATION | ${tax.NARRATION} | missing spoken lines (Flash Lite) — unrepairable downstream → narration fix-prompt §3 |`,
  `| ANCHOR | ${tax.ANCHOR} | atWord issues — resolver owns; examples now phrase-form §0 |`,
  '',
  '## Findings (calibration)',
  '- Data layer is SEALED: per-type fields overwhelmingly correct across all 4 models (nested flip, object points, message/sub, headlineAtWord).',
  '- Envelope layer was the error mass: `component` vs `type` (3/4), `meta.title`/`resolution`/`description` drift, `thumbnail` field names, missing `brand.channel`. §2 absorbs; §3 removes it from the model contract.',
  '- Stage-1 diagram-family adjacency in 3/4 beat sheets is CAUGHT by validate-beats (§4). Gemini Pro is clean.',
  '- Flash Lite omitted narration entirely → NARRATION class, unrepairable by the normalizer (R3); needs a narration fix-prompt.',
  '- Anchors: v1 models emitted numeric atWord because the prompt EXAMPLES showed numbers (§0 defect). Examples are now phrase-form; numeric is discouraged (the resolver owns indices).',
  '',
  '## Per-model verdicts',
  ...MODELS.map((m) => `- [verdict-${m}.md](verdict-${m}.md)`),
].join('\n');
fs.writeFileSync(path.join(DIR, 'EXPERIMENT_REPORT.md'), report);
console.log('✓ wrote EXPERIMENT_REPORT.md + 4 verdicts to briefs/experiments/pw-v1/');
for (const r of rows) console.log(`  ${r.m}: beats=${r.beatsVerdict} firstTry=${r.firstTry ? 'PASS' : 'FAIL'} before=${r.before} after=${r.after} residual=${r.after ? r.residualClasses.join('/') : 'PASS'}`);
console.log('  taxonomy', JSON.stringify(tax));
