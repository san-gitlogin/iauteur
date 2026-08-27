#!/usr/bin/env node
// TEST-REC-ANCHORS — proves the solver produces anchors that the LINTER accepts.
//
// The solver's whole job is to make the gap rule true BY CONSTRUCTION instead of by hand
// checking. So the test is not "does it return numbers" — it is "does every constraint the
// linter enforces already hold, across a wide range of inputs, including the awkward ones".
//
// It sweeps clip counts, clip lengths and narration lengths, and asserts on every solve.
import {solveAnchors, FPW, BASE_MAX} from './lib/record/anchors.mjs';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({name, ok});
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

const frameOf = (w) => Math.max(0, Math.round((w - 1) * FPW));

// ── the sweep ───────────────────────────────────────────────────────────────
// Deliberately awkward shapes: one tiny clip among long ones, many short clips, a single
// clip, and narration lengths from "barely enough" to "very generous".
const CLIP_SETS = [
  [60],                       // single
  [18, 18],                   // two tiny (a save + a save)
  [98, 78, 18, 61],           // the real vscode-hello shape
  [200, 12, 200],             // a tiny step between two long ones
  [30, 30, 30, 30, 30, 30],   // many equal
  [400],                      // one very long clip
];
const WORD_COUNTS = [40, 60, 84, 120, 200, 400];

let solved = 0, refused = 0;
const violations = [];

for (const clipFrames of CLIP_SETS) {
  for (const words of WORD_COUNTS) {
    const callouts = clipFrames.map((_, i) => (i % 2 === 0 ? 1 : 0));
    const r = solveAnchors({words, clipFrames, callouts});
    if (!r.ok) { refused++; continue; }
    solved++;
    const label = `[${clipFrames.join(',')}] x ${words}w`;

    // 1. GAP RULE — the constraint the whole solver exists for
    for (let i = 0; i < clipFrames.length; i++) {
      const end = i + 1 < clipFrames.length ? frameOf(r.clips[i + 1].atWord) : r.durationFrames;
      const gap = end - frameOf(r.clips[i].atWord);
      if (gap < clipFrames[i]) violations.push(`${label}: clip ${i} has ${clipFrames[i]}f but only ${gap}f of gap`);
    }
    // 2. BASE — nothing before the furniture is up
    if (frameOf(r.clips[0].atWord) > BASE_MAX) {
      violations.push(`${label}: first clip at frame ${frameOf(r.clips[0].atWord)} > BASE ${BASE_MAX}`);
    }
    // 3. ASCENDING — anchors must move forward
    for (let i = 1; i < r.clips.length; i++) {
      if (frameOf(r.clips[i].atWord) <= frameOf(r.clips[i - 1].atWord)) {
        violations.push(`${label}: clip ${i} does not advance`);
      }
    }
    // 4. LAW 8 — payoff not in the last 15%
    const last = frameOf(r.clips[r.clips.length - 1].atWord);
    if (last > r.durationFrames * 0.85) violations.push(`${label}: last anchor at ${Math.round(last / r.durationFrames * 100)}%`);
    // 5. CALLOUTS land inside their clip's window, after its footage has played
    for (let i = 0; i < r.clips.length; i++) {
      const clipStart = frameOf(r.clips[i].atWord);
      const end = i + 1 < r.clips.length ? frameOf(r.clips[i + 1].atWord) : r.durationFrames;
      for (const cw of r.clips[i].callouts) {
        const cf = frameOf(cw);
        if (cf < clipStart) violations.push(`${label}: callout before its clip`);
        if (cf > end) violations.push(`${label}: callout after its clip's window`);
      }
    }
  }
}

console.log(`swept ${CLIP_SETS.length * WORD_COUNTS.length} combinations: ${solved} solved, ${refused} refused\n`);
check('every solved layout satisfies the GAP RULE, BASE, ordering, LAW 8 and callout placement',
  violations.length === 0,
  violations.length ? violations.slice(0, 8).join('\n        ') : `${solved} solves, 0 violations`);

// ── the refusals must be HONEST, not silent ─────────────────────────────────
const tooShort = solveAnchors({words: 20, clipFrames: [400, 400], callouts: [0, 0]});
check('refuses when the narration is too short for the footage, and says how many words are needed',
  !tooShort.ok && /too short/.test(tooShort.reason) && /\d+ more words/.test(tooShort.reason),
  tooShort.reason);

check('a refusal never returns half-placed anchors', !tooShort.ok && tooShort.clips.length === 0,
  `clips returned: ${tooShort.clips.length}`);

// ── slack goes to the clips that need it ────────────────────────────────────
const uneven = solveAnchors({words: 300, clipFrames: [300, 30], callouts: [0, 0]});
if (uneven.ok) {
  const gap0 = frameOf(uneven.clips[1].atWord) - frameOf(uneven.clips[0].atWord);
  const gap1 = uneven.durationFrames - frameOf(uneven.clips[1].atWord);
  check('a long clip gets more airtime than a short one', gap0 > gap1,
    `300f clip -> ${gap0}f of narration, 30f clip -> ${gap1}f`);
} else {
  check('a long clip gets more airtime than a short one', false, uneven.reason);
}

const bad = results.filter((r) => !r.ok);
console.log('');
if (bad.length) {
  console.error(`${bad.length} of ${results.length} anchor checks FAILED.`);
  process.exit(1);
}
console.log(`All ${results.length} anchor checks PASS — the solver satisfies the linter by construction.`);
