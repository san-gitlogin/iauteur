#!/usr/bin/env node
// CENSUS SELF-TEST — the gate that guards the denominator gets its own guard.
// L-BK-1 was a defect IN the census gate: its variant regex accepted only
// `/`-separated enums, so `|`-separated lint messages dropped all but the first
// variant, silently shrinking the type/variant denominator for MULTIPLE sessions
// while the gate reported GREEN. The regex fix landed; this is the fixture that
// would have caught it. §5 lesson: gates are code; untested gates are unverified
// claims about everything they guard.
//
// PART A: unit-test the REAL shared parser (parse-variants.mjs) against a fixture
//   covering every separator/shape (/-sep, |-sep, mixed, single, no-variant,
//   lowercase-dotted-non-match). Fails if the L-BK-1 regex is reverted.
// PART B: assert the matrix generator and the census agree on the variant
//   universe — census.json variants ↔ matrix.md `TYPE:variant` rows, 1:1.
import fs from 'node:fs';
import path from 'node:path';
import {parseVariantEnums} from './lib/parse-variants.mjs';

const read = (p) => fs.readFileSync(path.resolve(p), 'utf8');
let failed = 0;
const fail = (msg) => {
  console.error('  \u2717 ' + msg);
  failed++;
};
const ok = (msg) => console.log('  \u2713 ' + msg);

// ── PART A: parser unit tests on a fixture of known lint-message shapes ──
console.log('census self-test A — variant parser:');
const FIXTURE = [
  'id: SLASHTYPE variant must be a/b/c', // /-separated → 3
  'id: PIPETYPE variant must be x|y', // |-separated → 2  (the L-BK-1 case)
  'id: MIXTYPE variant must be p/q|r', // mixed / and | → 3
  'id: MODETYPE mode must be only', // single, `mode` keyword → 1
  'id: NOVARTYPE has some other message', // no "variant/mode must be" → absent
  'id: lowerdot.variant must be foo|bar', // lowercase/dotted TYPE → must NOT match
].join('\n');

const expected = {
  SLASHTYPE: ['a', 'b', 'c'],
  PIPETYPE: ['x', 'y'],
  MIXTYPE: ['p', 'q', 'r'],
  MODETYPE: ['only'],
};
const got = parseVariantEnums(FIXTURE);

for (const [ty, vs] of Object.entries(expected)) {
  const g = got[ty] ?? [];
  if (g.length === vs.length && vs.every((v) => g.includes(v))) ok(`${ty} → [${g.join(',')}] (${g.length})`);
  else fail(`${ty}: expected [${vs.join(',')}] got [${g.join(',')}] — is the /|-separator regex intact? (L-BK-1)`);
}
// negative assertions: no-variant + lowercase-dotted must NOT be captured
for (const bad of ['NOVARTYPE', 'LOWERDOT', 'lowerdot']) {
  if (!got[bad]) ok(`${bad} correctly absent`);
  else fail(`${bad} should not be captured — got [${got[bad].join(',')}]`);
}
// explicit L-BK-1 regression tripwire: the |-separated case must keep BOTH variants
if ((got.PIPETYPE ?? []).length < 2) fail('L-BK-1 REGRESSION: |-separated enum dropped a variant');
if ((got.MIXTYPE ?? []).length < 3) fail('L-BK-1 REGRESSION: mixed /| enum dropped a variant');

// ── PART B: census.json ↔ matrix.md variant-universe agreement ──
console.log('census self-test B — census \u2194 matrix agreement:');
const census = JSON.parse(read('audit/census.json'));
const matrix = read('audit/matrix.md');

// census universe: TYPE:variant per variant, else bare TYPE
const censusUniverse = new Set();
for (const r of census.rows) {
  if (r.variants && r.variants.length) for (const v of r.variants) censusUniverse.add(`${r.type}:${v}`);
  else censusUniverse.add(r.type);
}
// matrix universe: every sub-type in a data row `| `sub` | c1 | … |`
const matrixUniverse = new Set();
for (const m of matrix.matchAll(/^\| `([^`]+)` \| /gm)) matrixUniverse.add(m[1].trim());

let divergences = 0;
for (const s of censusUniverse)
  if (!matrixUniverse.has(s)) {
    fail(`census has "${s}" but matrix.md has NO row — regenerate matrix (gen-matrix.mjs)`);
    divergences++;
  }
for (const s of matrixUniverse)
  if (!censusUniverse.has(s)) {
    fail(`matrix.md has row "${s}" absent from census — hand-edit or generator drift`);
    divergences++;
  }
if (!divergences) ok(`census \u2194 matrix agree on ${censusUniverse.size} sub-types`);

if (failed) {
  console.error(`\ncensus self-test: ${failed} FAILURE(S)`);
  process.exit(1);
}
console.log('\ncensus self-test: PASS');
