#!/usr/bin/env node
// FLEET REGRESSION + IDEMPOTENCY gate. Copies every shipped topic spec to a tmp
// area, lints, normalizes, lints again, normalizes a second time — and asserts:
//   (a) no spec's lint status regresses (pass→fail),
//   (b) the SECOND normalize pass reports ZERO changes (true idempotency),
//   (c) first-pass changes on shipped specs are listed (should be benign).
// Never touches the real specs (works on copies). Part of `npm run gate`.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT = process.cwd();
const NODE = process.execPath;
const TMP = path.join('out', 'tmp', 'fleet');
fs.rmSync(TMP, {recursive: true, force: true});
fs.mkdirSync(TMP, {recursive: true});

const run = (args) => {
  try { return {code: 0, out: execFileSync(NODE, args, {encoding: 'utf8'})}; }
  catch (e) { return {code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '')}; }
};
const fixCount = (out) => out.includes('already clean') ? 0
  : (out.match(/(\d+) auto-fix/) ? +out.match(/(\d+) auto-fix/)[1] : 0);

const specs = [];
for (const slug of fs.readdirSync('topics')) {
  for (const kind of ['long', 'shorts']) {
    const p = path.join('topics', slug, `${kind}.json`);
    if (fs.existsSync(p)) specs.push({slug, kind, p});
  }
}

const regressions = [], notIdempotent = [], firstPass = [];
for (const s of specs) {
  const tmp = path.join(TMP, `${s.slug}_${s.kind}.json`);
  fs.copyFileSync(s.p, tmp);
  const a = run(['scripts/lint-spec.mjs', tmp]).code === 0 ? 'pass' : 'fail';
  const n1 = run(['scripts/normalize.mjs', tmp]);
  const b = run(['scripts/lint-spec.mjs', tmp]).code === 0 ? 'pass' : 'fail';
  const n2 = run(['scripts/normalize.mjs', tmp]);
  const c1 = fixCount(n1.out), c2 = fixCount(n2.out);
  if (a === 'pass' && b === 'fail') regressions.push(`${s.slug}/${s.kind}: lint ${a}→${b}`);
  if (c2 !== 0) notIdempotent.push(`${s.slug}/${s.kind}: 2nd pass made ${c2} change(s)`);
  if (c1 > 0) firstPass.push(`${s.slug}/${s.kind}: ${c1} first-pass fix(es) [lint ${a}→${b}]`);
}

console.log(`FLEET: ${specs.length} specs checked.`);
if (firstPass.length) { console.log('\nFirst-pass changes on shipped specs (should be benign — mostly duration recompute):'); for (const l of firstPass) console.log('  • ' + l); }
const fail = regressions.length || notIdempotent.length;
if (regressions.length) { console.log('\n✗ LINT REGRESSIONS:'); for (const l of regressions) console.log('  • ' + l); }
if (notIdempotent.length) { console.log('\n✗ NOT IDEMPOTENT (2nd pass changed something):'); for (const l of notIdempotent) console.log('  • ' + l); }
console.log(fail ? '\n✗ FLEET GATE FAILED' : '\n✓ FLEET GATE PASSED (no regressions; idempotent)');
process.exit(fail ? 1 : 0);
