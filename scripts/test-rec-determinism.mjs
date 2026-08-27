#!/usr/bin/env node
// TEST-REC-DETERMINISM — criterion S5: "same script -> same footage".
//
// WHAT DETERMINISM CAN HONESTLY MEAN HERE. Byte-identical video is impossible and it
// would be dishonest to claim it: a real shell takes a different number of milliseconds
// every run, so segment LENGTHS legitimately differ. Asserting frame-count equality would
// either fail forever or force us to fake the timing.
//
// What MUST be identical is everything the spec and the viewer depend on:
//   · the sequence of step ids and actions
//   · the OUTPUT read back from the real terminal, character for character
//   · the exit codes
//   · the bboxes and named marks (the layout the overlays are positioned from)
//
// If those hold, a re-record is a drop-in replacement: every callout still lands, every
// anchor still means the same thing, and only the segment durations move. That is the
// property the pipeline actually relies on, so that is what this measures.
//
// Usage: node scripts/test-rec-determinism.mjs [demo.json]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const demoPath = process.argv[2] || 'demos/vscode-hello.json';
if (!fs.existsSync(demoPath)) {
  console.error(`No such demo: ${demoPath}`);
  process.exit(2);
}
const demo = JSON.parse(fs.readFileSync(demoPath, 'utf8'));
const OUT_A = path.resolve('out/rec-determinism/a');
const OUT_B = path.resolve('out/rec-determinism/b');

const record = (out, label) => {
  console.log(`\n--- take ${label} ---`);
  execFileSync('node', ['scripts/record.mjs', demoPath, '--out', out],
    {stdio: ['ignore', 'ignore', 'inherit']});
  return JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'), 'utf8'));
};

console.log(`recording "${demo.slug}" twice to compare...`);
const a = record(OUT_A, 'A');
const b = record(OUT_B, 'B');

const results = [];
const check = (name, ok, detail = '') => {
  results.push({name, ok});
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

console.log('');
check('same number of steps', a.steps.length === b.steps.length,
  `A=${a.steps.length} B=${b.steps.length}`);

const ids = (m) => m.steps.map((s) => `${s.id}:${s.action}`).join(' | ');
check('same step sequence', ids(a) === ids(b), `A: ${ids(a)}\n        B: ${ids(b)}`);

// THE ONE THAT MATTERS: the machine said exactly the same thing both times.
let outMismatch = [];
let exitMismatch = [];
let bboxDrift = 0;
let markDrift = 0;
let markMissing = [];

for (const [i, sa] of a.steps.entries()) {
  const sb = b.steps[i];
  if (!sb) break;
  if ((sa.output ?? '') !== (sb.output ?? '')) {
    outMismatch.push(`${sa.id}\n          A=${JSON.stringify((sa.output ?? '').slice(0, 120))}\n          B=${JSON.stringify((sb.output ?? '').slice(0, 120))}`);
  }
  if (sa.exitCode !== sb.exitCode) exitMismatch.push(`${sa.id}: A=${sa.exitCode} B=${sb.exitCode}`);
  if (sa.bbox && sb.bbox) {
    for (const k of ['x', 'y', 'w', 'h']) bboxDrift = Math.max(bboxDrift, Math.abs(sa.bbox[k] - sb.bbox[k]));
  }
  const ma = sa.marks ?? {};
  const mb = sb.marks ?? {};
  for (const key of Object.keys(ma)) {
    if (!mb[key]) { markMissing.push(`${sa.id}.${key}`); continue; }
    for (const k of ['x', 'y', 'w', 'h']) markDrift = Math.max(markDrift, Math.abs(ma[key][k] - mb[key][k]));
  }
}

check('terminal / editor OUTPUT is identical, character for character', outMismatch.length === 0,
  outMismatch.length ? outMismatch.join('\n        ') : `${a.steps.filter((s) => s.output).length} step(s) compared`);
check('exit codes identical', exitMismatch.length === 0,
  exitMismatch.length ? exitMismatch.join('; ') : 'all match');
check('every named mark present in both takes', markMissing.length === 0,
  markMissing.length ? `missing: ${markMissing.join(', ')}` : 'all present');
// A couple of pixels of drift is sub-glyph and cannot move a callout off its target.
check('bboxes stable (<=2px)', bboxDrift <= 2, `max drift ${bboxDrift}px`);
check('marks stable (<=2px)', markDrift <= 2, `max drift ${markDrift}px`);

// Reported, NOT asserted — this is the part that legitimately varies.
const lens = a.steps.map((s, i) => `${s.id} ${s.segmentFrames}f vs ${b.steps[i]?.segmentFrames}f`);
console.log(`\n        segment lengths (expected to vary — a real shell is not a metronome):`);
console.log(`        ${lens.join('\n        ')}`);

const bad = results.filter((r) => !r.ok);
console.log('');
if (bad.length) {
  console.error(`${bad.length} of ${results.length} determinism checks FAILED. Manifests in out/rec-determinism/`);
  process.exit(1);
}
console.log(`All ${results.length} determinism checks PASS — a re-record is a drop-in replacement.`);
