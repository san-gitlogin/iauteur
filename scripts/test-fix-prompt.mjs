#!/usr/bin/env node
// §2 acceptance test for the fix-prompt loop:
//   (1) gen-fix-prompt on the committed reject fixture equals the golden file,
//   (2) applying a canned model reply → re-normalize → re-lint ⇒ PASS.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const ex = (args) => { try { return {code: 0, out: execFileSync(NODE, args, {encoding: 'utf8'})}; } catch (e) { return {code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '')}; } };
let fail = 0;
const check = (name, ok, detail = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '  :: ' + detail)); if (!ok) fail++; };

// (1) golden-file: the fix-prompt for the committed reject is byte-stable
const gen = ex(['scripts/gen-fix-prompt.mjs', 'briefs/examples/fix-input-long.json']).out;
const golden = fs.readFileSync('briefs/examples/fix-prompt-s08.golden.txt', 'utf8');
check('fix-prompt matches golden', gen === golden, 'regenerate: node scripts/gen-fix-prompt.mjs briefs/examples/fix-input-long.json');
check('fix-prompt is scoped to s08 only', gen.includes('## Scene s08 — TIMELINE') && !/## Scene s0[1-79]/.test(gen));
check('fix-prompt states the ADVERTISED linter limit', gen.includes('milestone title "SAG-AFTRA & CAA Revolt" > 15 chars'));
check('fix-prompt leaks no RAW budget value', !gen.includes('> 18 chars'));
check('fix-prompt carries the TIMELINE schema', gen.includes('data.timeline: {') && gen.includes('milestones!'));

// (2) ingest round-trip: apply canned reply → normalize → lint PASS
const tmp = path.join(ROOT, 'out', 'tmp'); fs.mkdirSync(tmp, {recursive: true});
const work = path.join(tmp, 'fixtest-long.json');
fs.copyFileSync('briefs/examples/fix-input-long.json', work);
const before = ex(['scripts/lint-spec.mjs', work]).code;
const applied = ex(['scripts/apply-fix.mjs', work, 'briefs/examples/fix-reply-s08.json']);
check('reject BEFORE fix (lint fails)', before !== 0);
check('ingest → re-normalize → re-lint PASS', applied.code === 0, applied.out.slice(-400));
fs.rmSync(work, {force: true});

console.log(fail ? `\n✗ FIX-PROMPT TEST FAILED (${fail})` : '\n✓ FIX-PROMPT TEST PASSED');
process.exit(fail ? 1 : 0);
