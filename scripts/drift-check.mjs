#!/usr/bin/env node
// PROMPT↔LINTER DRIFT CHECK. Generates the prompts and asserts that every numeric
// constraint they state equals the shared constant (which the linter imports). If
// someone edits a budget/enum/limit in one place, this fails the gate.
// Usage: node scripts/drift-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {BUDGET, HOOK_MAX_WORDS, TOPIC_AXES, TRANSITIONS, STUDIO_SOURCE_TYPES, RESTRICTED_FAMILIES, advertised} from './lib/constants.mjs';
import {MANIFEST, MANIFEST_TYPES} from './lib/manifest.mjs';
import {SCREENPLAYS} from './screenplays.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const tmp = path.join(ROOT, 'out', 'tmp'); fs.mkdirSync(tmp, {recursive: true});
const cfgFile = path.join(tmp, 'driftcfg.json');
fs.writeFileSync(cfgFile, JSON.stringify({topic: 'Drift check', design: 'corptrust', theme: 'corptrust', format: 'long', preset: 'explainer', channel: 'X'}));
const gen = (mode) => execFileSync(NODE, [path.join(ROOT, 'scripts', 'gen-prompt.mjs'), cfgFile, mode], {encoding: 'utf8'});
const stage1 = gen('stage1'), single = gen('single'), both = stage1 + '\n' + single;

const miss = [];
const must = (text, token, label) => { if (!text.includes(token)) miss.push(`${label}: prompt is missing "${token}"`); };
const mustNot = (text, token, label) => { if (text.includes(token)) miss.push(`${label}: prompt leaks RAW "${token}" (should be advertised)`); };

must(both, `\u2264 ${HOOK_MAX_WORDS} words`, 'HOOK word budget');
// Budgets are ADVERTISED with headroom (constants.advertised); the linter still
// enforces the raw BUDGET. Assert the prompt prints advertised(), never the raw
// value — the relationship stays single-source and drift-proof.
must(both, `\u2264${advertised(BUDGET.source)}`, 'source budget (advertised)');
must(single, `\u2264${advertised(BUDGET.hookHeadline)}`, 'hook headline budget (advertised)');
mustNot(both, `"source" \u2264${BUDGET.source} chars`, 'source budget');
mustNot(single, `headline!\u2264${BUDGET.hookHeadline}`, 'hook headline schema');
const sc = SCREENPLAYS.explainer?.scenes;
if (sc) must(stage1, `${sc[0]}\u2013${sc[1]}`, 'explainer scene range');
for (const a of TOPIC_AXES) must(stage1, a, 'topicAxes');
must(both, TRANSITIONS.join(', '), 'transitions enum');
for (const t of STUDIO_SOURCE_TYPES) must(stage1, t, 'studio source types');

// family law: the prompt's restricted-family groupings equal MANIFEST + RESTRICTED_FAMILIES
const groups = {};
for (const t of MANIFEST_TYPES) { const f = MANIFEST[t].family; if (RESTRICTED_FAMILIES.includes(f)) (groups[f] ||= []).push(t); }
for (const [f, ts] of Object.entries(groups)) if (ts.length > 1) must(stage1, `${f} = ${ts.join(', ')}`, 'family law');

// ADJACENCY LAW: the linter AND the beat validator must read the SAME fine-grained
// FAMILY/CONSOLIDATED source (constants.mjs) — otherwise the beat sheet could pass
// Stage 1 only to be rejected by the linter at Stage 2. Assert both structurally
// import them, and functionally that the beat validator now rejects a CONSOLIDATED
// adjacency the linter would reject.
const srcLint = fs.readFileSync(path.join(ROOT, 'scripts', 'lint-spec.mjs'), 'utf8');
const srcBeat = fs.readFileSync(path.join(ROOT, 'scripts', 'validate-beats.mjs'), 'utf8');
const importsBoth = (src) => /import\s*\{[^}]*\bFAMILY\b[^}]*\bCONSOLIDATED\b[^}]*\}\s*from\s*'\.\/lib\/constants\.mjs'/.test(src)
  || (/\bFAMILY\b/.test(src) && /\bCONSOLIDATED\b/.test(src) && /from '\.\/lib\/constants\.mjs'/.test(src));
if (!importsBoth(srcLint)) miss.push('adjacency law: lint-spec.mjs must import FAMILY+CONSOLIDATED from constants.mjs');
if (!importsBoth(srcBeat)) miss.push('adjacency law: validate-beats.mjs must import FAMILY+CONSOLIDATED from constants.mjs (same source as the linter)');
// functional: two adjacent code-surface beats must be rejected by the beat validator.
const beatsFile = path.join(tmp, 'driftbeats.json');
fs.writeFileSync(beatsFile, JSON.stringify({meta: {screenplay: 'explainer'}, beats: [
  {id: 's01', type: 'HOOK', narration: 'a hook'},
  {id: 's02', type: 'CODE_WINDOW', narration: 'first code surface'},
  {id: 's03', type: 'CODE_EDITOR', narration: 'second code surface adjacent'},
  {id: 's04', type: 'OUTRO_CTA', narration: 'outro'},
]}));
let beatOut = '';
try { beatOut = execFileSync(NODE, [path.join(ROOT, 'scripts', 'validate-beats.mjs'), beatsFile], {encoding: 'utf8'}); }
catch (e) { beatOut = (e.stdout || '') + (e.stderr || ''); }
if (!/consolidated-family adjacency/.test(beatOut))
  miss.push('adjacency law: the beat validator does NOT reject two adjacent code-surface beats — it must mirror the linter');
fs.rmSync(beatsFile, {force: true});

fs.rmSync(cfgFile, {force: true});
if (miss.length) { console.log('✗ DRIFT DETECTED (prompt disagrees with shared constants):'); for (const m of miss) console.log('  • ' + m); console.log('\n✗ DRIFT CHECK FAILED'); process.exit(1); }
console.log('✓ DRIFT CHECK PASSED (every budget in the prompt equals advertised() of the linter\u2019s shared constant)');
