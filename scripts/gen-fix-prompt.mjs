#!/usr/bin/env node
// FIX-PROMPT GENERATOR (Fable step 5). Lints a spec, then emits a paste-ready
// prompt containing ONLY the failing scenes — each with its manifest schema (the
// same DSL as stage 2) and the linter's verbatim message — instructing the model
// to return just the corrected scenes. Keeps the fix context tiny (Tier-C safe).
// Usage: node scripts/gen-fix-prompt.mjs <spec.json>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {schemaDSL} from './lib/schema-dsl.mjs';
import {advertised} from './lib/constants.mjs';

// The schema block already shows advertised budgets; the linter's verbatim message
// still quotes the REAL limit. Rewrite those numbers to advertised so the fix loop
// teaches the SAME target the original prompt did — otherwise a model "fixes"
// 45→43 and hits enforcement-boundary roulette on the next field. Only touches
// char-budget numbers (the "…chars…" patterns), never counts or ids.
const advMsg = (m) => m
  .replace(/> (\d+) chars/g, (_, n) => `> ${advertised(+n)} chars`)
  .replace(/(\d+) chars > (\d+)/g, (_, a, b) => `${a} chars > ${advertised(+b)}`);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/gen-fix-prompt.mjs <spec.json>'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));

// NARRATION-ONLY fix (R3: narration is meaning-bearing — never auto-filled).
// When whole scenes lack a spoken line (e.g. Flash Lite), ask ONLY for the
// missing narrations, keyed by scene id, and short-circuit the schema fixer.
const noNarr = (spec.scenes || []).filter((s) => !(s.narration && String(s.narration).trim()));
if (noNarr.length) {
  const N = [];
  N.push(`${noNarr.length} scene(s) in this iAuteur spec are missing their spoken narration.`);
  N.push('Return ONLY a JSON array [ { "id": "...", "narration": "..." } ] — one spoken line per scene id below.');
  N.push('Spoken and natural, one idea each, \u226420 words (HOOK \u226417 words). Do NOT change anything else.');
  N.push('');
  for (const s of noNarr) {
    const hint = (s.data && (s.data.title || s.data.label || s.data.message || s.data.headline || s.data.quote || s.data.text)) || '';
    N.push(`- ${s.id} ${s.type}${hint ? ' — visual: ' + JSON.stringify(String(hint).slice(0, 60)) : ''}`);
  }
  N.push('');
  N.push('## OUTPUT');
  N.push(`Return ONLY: [ { "id": "${noNarr[0].id}", "narration": "..." }${noNarr.length > 1 ? ', …' : ''} ]`);
  process.stdout.write(N.join('\n') + '\n');
  process.exit(0);
}
let lintOut = '';
try { lintOut = execFileSync(NODE, [path.join(ROOT, 'scripts', 'lint-spec.mjs'), file], {encoding: 'utf8'}); }
catch (e) { lintOut = (e.stdout || '') + (e.stderr || ''); }

const sceneErr = {}; const globalErr = [];
let inReject = false;
for (const line of lintOut.split('\n')) {
  if (/REJECTED/.test(line)) { inReject = true; continue; }
  if (/WARNINGS|PASSED|Fix the spec/.test(line)) { inReject = false; continue; }
  if (!inReject) continue;
  const m = line.match(/^\s*[•*]\s*(.+?)\s*$/);
  if (!m) continue;
  const sm = m[1].match(/^(s\d+):\s*(.+)$/);
  if (sm) (sceneErr[sm[1]] ||= []).push(sm[2]);
  else globalErr.push(m[1]);
}

const ids = Object.keys(sceneErr);
if (!ids.length && !globalErr.length) { console.log('No hard errors — nothing to fix.'); process.exit(0); }

const byId = Object.fromEntries(spec.scenes.map((s) => [s.id, s]));
const L = [];
L.push('You are fixing a few scenes of an iAuteur video spec that the validator REJECTED.');
L.push('Correct ONLY the scenes below. Keep each scene\u2019s "id" and "narration" unchanged.');
L.push('Return ONLY a JSON array of the corrected scene objects — do NOT touch or include any other scene.');
L.push('');
for (const id of ids) {
  const sc = byId[id];
  if (!sc) continue;
  L.push(`## Scene ${id} — ${sc.type}`);
  L.push('Validator said:');
  for (const msg of sceneErr[id]) L.push(`  - ${advMsg(msg)}`);
  L.push('');
  L.push('Schema (`!`=required · `?`=optional · `\u2264N`=max chars · at:"word" = a word from this scene\u2019s narration):');
  L.push('    ' + schemaDSL(sc.type).split('\n').join('\n    '));
  L.push('');
  L.push('Current scene (fix the flagged problem, keep everything else):');
  L.push('```json');
  L.push(JSON.stringify(sc, null, 2));
  L.push('```');
  L.push('');
}
if (globalErr.length) {
  L.push('## Spec-level issues to also respect');
  for (const g of globalErr) L.push(`  - ${advMsg(g)}`);
  L.push('');
}
L.push('## OUTPUT');
L.push(`Return ONLY a JSON array of the ${ids.length} corrected scene object(s): [ { "id": "${ids[0]}", ... } ]`);
process.stdout.write(L.join('\n') + '\n');
