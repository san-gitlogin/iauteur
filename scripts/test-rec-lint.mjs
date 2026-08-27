#!/usr/bin/env node
// TEST-REC-LINT — proves the RECORDED_STEP lint rules actually FIRE.
//
// LAW 0n corollary: "a seal like that must be tested by BREAKING a real file on purpose
// — the first version of that script reported a green tick while blind to 110 of 140
// call sites." So this takes the REAL, passing contract-test spec, breaks it one way at
// a time, and asserts the linter rejects each break with the expected message.
//
// A rule that cannot be shown to fire is not a rule.
//
// Usage: node scripts/test-rec-lint.mjs
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SRC = 'topics/rec-contract-test/long.json';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reclint-'));
const base = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const sceneOf = (spec) => spec.scenes.find((s) => s.type === 'RECORDED_STEP');

// Each case: a name, a mutation, and a substring the rejection MUST contain.
const CASES = [
  ['unbaked ref reaches the renderer', (sp) => {
    const c = sceneOf(sp).data.recordedStep.clips[1];
    delete c.src; c.ref = 'rec:_fixture#type-code';
  }, 'UNBAKED'],

  ['a clip with no anchor', (sp) => {
    delete sceneOf(sp).data.recordedStep.clips[2].atWord;
  }, 'no atWord'],

  ['footage cut off mid-action (gap < segment)', (sp) => {
    // clip 2 is 90 frames = 7.5 words; give it only 2 words of narration
    sceneOf(sp).data.recordedStep.clips[2].atWord = 14;
  }, 'CUT OFF mid-action'],

  ['anchors out of order', (sp) => {
    sceneOf(sp).data.recordedStep.clips[2].atWord = 4;
  }, 'anchors must ascend'],

  ['last clip overruns the scene', (sp) => {
    const sc = sceneOf(sp);
    sc.durationFrames = 300; // last clip anchored at word 25 = frame 288, needs 45
  }, 'cut off'],

  ['label over budget', (sp) => {
    sceneOf(sp).data.recordedStep.clips[0].label = 'x'.repeat(40);
  }, '> 26 chars'],
];

// sanity: the UNMUTATED spec must pass, or every result below is meaningless
const clean = path.join(tmp, 'clean.json');
fs.writeFileSync(clean, JSON.stringify(base, null, 2));
const run = (f) => {
  try {
    return {code: 0, out: execFileSync('node', ['scripts/lint-spec.mjs', f], {encoding: 'utf8'})};
  } catch (e) {
    return {code: e.status ?? 1, out: `${e.stdout ?? ''}${e.stderr ?? ''}`};
  }
};
const baseline = run(clean);
if (baseline.code !== 0) {
  console.error('BASELINE FAILS — the contract-test spec does not lint clean, so this test proves nothing:');
  console.error(baseline.out.split('\n').filter((l) => l.trim()).slice(-8).join('\n'));
  process.exit(2);
}
console.log('baseline: the unbroken spec PASSES lint\n');

let bad = 0;
for (const [name, mutate, expect] of CASES) {
  const sp = JSON.parse(JSON.stringify(base));
  mutate(sp);
  const f = path.join(tmp, `${name.replace(/[^a-z0-9]+/gi, '-')}.json`);
  fs.writeFileSync(f, JSON.stringify(sp, null, 2));
  const {code, out} = run(f);
  const rejected = code !== 0;
  const matched = out.includes(expect);
  const ok = rejected && matched;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) {
    console.log(`        rejected=${rejected} matched=${matched} (wanted a message containing ${JSON.stringify(expect)})`);
    console.log('        ' + out.split('\n').filter((l) => l.includes('•')).join('\n        ').slice(0, 700));
  }
}

fs.rmSync(tmp, {recursive: true, force: true});
console.log('');
if (bad) {
  console.error(`${bad} of ${CASES.length} lint seals DID NOT FIRE — the rules are decorative.`);
  process.exit(1);
}
console.log(`All ${CASES.length} RECORDED_STEP lint seals fire correctly.`);
