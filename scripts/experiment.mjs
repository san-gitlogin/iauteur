#!/usr/bin/env node
// EXPERIMENT HARNESS — drives the two-paste flow to a human gate, writing every
// artifact under out/experiment/<slug>/ so a human can run the prompts through
// real models and paste results back.
//
//   node scripts/experiment.mjs init  <cfg.json>            → stage1-prompt.txt + single-prompt.txt
//   node scripts/experiment.mjs beats <slug> <beats.json>   → validate; emit stage2-prompt.txt or reask.txt
//   node scripts/experiment.mjs spec  <slug> <spec.json>    → normalize→lint→(fix-prompt); write verdict.md
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {normalizeSpec} from './lib/normalize-spec.mjs';
import {assembleSpec} from './lib/assemble.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const ex = (args) => { try { return {code: 0, out: execFileSync(NODE, args, {encoding: 'utf8'})}; } catch (e) { return {code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '')}; } };
const slugify = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'topic';
const dir = (slug) => { const d = path.join(ROOT, 'out', 'experiment', slug); fs.mkdirSync(d, {recursive: true}); return d; };
const gen = (cfgFile, mode, beats) => ex(['scripts/gen-prompt.mjs', cfgFile, mode, ...(beats ? [beats] : [])]).out;

const [cmd, a1, a2] = process.argv.slice(2);

if (cmd === 'init') {
  const cfg = JSON.parse(fs.readFileSync(a1, 'utf8').replace(/^\uFEFF/, ''));
  const slug = slugify(cfg.topic);
  const d = dir(slug);
  fs.writeFileSync(path.join(d, 'cfg.json'), JSON.stringify(cfg, null, 2));
  fs.writeFileSync(path.join(d, 'stage1-prompt.txt'), gen(a1, 'stage1'));
  fs.writeFileSync(path.join(d, 'single-prompt.txt'), gen(a1, 'single'));
  console.log(`✓ ${slug}: wrote stage1-prompt.txt + single-prompt.txt to ${path.relative(ROOT, d)}`);
  console.log('  NEXT: run stage1-prompt.txt through your LLM, then: experiment beats ' + slug + ' <beats.json>');
} else if (cmd === 'beats') {
  const slug = a1, d = dir(slug);
  const beatsFile = path.join(d, 'beats.json');
  fs.copyFileSync(a2, beatsFile);
  const v = ex(['scripts/validate-beats.mjs', beatsFile]);
  fs.writeFileSync(path.join(d, 'beats-verdict.txt'), v.out);
  if (v.code === 0) {
    fs.writeFileSync(path.join(d, 'stage2-prompt.txt'), gen(path.join(d, 'cfg.json'), 'stage2', beatsFile));
    console.log(`✓ ${slug}: beat sheet OK → wrote stage2-prompt.txt`);
  } else {
    fs.writeFileSync(path.join(d, 'reask.txt'), 'Your beat sheet was rejected — fix these and resend the JSON:\n\n' + v.out);
    console.log(`✗ ${slug}: beat sheet rejected → wrote reask.txt`); process.exitCode = 1;
  }
} else if (cmd === 'spec') {
  const slug = a1, d = dir(slug);
  const specFile = path.join(d, 'spec.json');
  const cfgFile = path.join(d, 'cfg.json');
  const cfg = fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, 'utf8').replace(/^\uFEFF/, '')) : {};
  const raw = JSON.parse(fs.readFileSync(a2, 'utf8').replace(/^\uFEFF/, ''));
  // ENVELOPE OUT OF CONTRACT: the console builds meta/brand from cfg; the model
  // only supplies story fields + thumbnail + scenes (lean shape). Legacy full
  // specs still work — assembleSpec reads model.meta/brand if present, else ignores.
  const {spec, changes: asmChanges} = assembleSpec(raw, cfg);
  fs.writeFileSync(specFile, JSON.stringify(spec, null, 2));
  const before = ex(['scripts/lint-spec.mjs', specFile]);
  const errBefore = (before.out.match(/REJECTED \((\d+)/) || [, '0'])[1];
  const {changes: normChanges, warnings} = normalizeSpec(spec);
  const changes = [...asmChanges, ...normChanges];
  fs.writeFileSync(specFile, JSON.stringify(spec, null, 2));
  const after = ex(['scripts/lint-spec.mjs', specFile]);
  const errAfter = (after.out.match(/REJECTED \((\d+)/) || [, '0'])[1];
  const firstTry = before.code === 0;
  let fixNote = 'none needed';
  if (after.code !== 0) {
    fs.writeFileSync(path.join(d, 'fix-prompt.txt'), ex(['scripts/gen-fix-prompt.mjs', specFile]).out);
    fixNote = 'wrote fix-prompt.txt (paste it to the model, then: experiment spec ' + slug + ' <reply-as-spec>)';
  }
  const verdict = [
    `# Verdict — ${slug}`, '',
    `- First-try lint PASS (as pasted): **${firstTry ? 'YES' : 'NO'}**`,
    `- Hard errors before normalize: ${errBefore}`,
    `- Hard errors after normalize:  ${errAfter}`,
    `- Deterministic auto-fixes: ${changes.length}`,
    `- Advisories (warnings): ${warnings.length}`,
    `- Residual repair: ${fixNote}`, '',
    '## Auto-fix change log', ...changes.map((c) => '- ' + c),
    warnings.length ? '\n## Advisories' : '', ...warnings.map((w) => '- ' + w),
    '\n## Lint after normalize', '```', after.out.trim(), '```',
  ].join('\n');
  fs.writeFileSync(path.join(d, 'verdict.md'), verdict);
  console.log(`✓ ${slug}: verdict.md written — first-try=${firstTry ? 'YES' : 'NO'}, errBefore=${errBefore}, errAfter=${errAfter}, autofixes=${changes.length}`);
  if (after.code !== 0) console.log('  → residual errors: ' + fixNote);
} else {
  console.error('Usage: experiment.mjs init <cfg.json> | beats <slug> <beats.json> | spec <slug> <spec.json>');
  process.exit(2);
}
