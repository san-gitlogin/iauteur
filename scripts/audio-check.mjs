// AUDIO CURVE GATE — the mechanical, falsifiable test for the audio-ducking
// doctrine. esbuild-imports the PURE curve (src/audioDuck.ts, no react/remotion)
// and asserts EXACT expected volumes at known frames of fixture scenes, plus ramp
// monotonicity and [0,1] clamping. Any audio-bearing component's duck behaviour is
// now falsifiable here — same status as a layout budget.
//   node scripts/audio-check.mjs        (also runs inside `npm run audit`)
import esbuild from 'esbuild';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';

const tmp = path.resolve('scripts/_audio.mjs');
await esbuild.build({
  stdin: {
    contents: `export {duckedVolume} from '../src/audioDuck';`,
    resolveDir: path.resolve('scripts'),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: tmp,
  logLevel: 'warning',
});
const {duckedVolume} = await import(pathToFileURL(tmp).href);
fs.rmSync(tmp, {force: true});

let fails = 0;
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
const eq = (label, got, want) => {
  const ok = near(got, want);
  if (!ok) {
    console.log(`FAIL ${label}: got ${got.toFixed(6)} want ${want.toFixed(6)}`);
    fails++;
  } else {
    console.log(`ok   ${label} = ${got.toFixed(4)}`);
  }
};

// ── Fixture 1: explicit narration gap [100,160] (60f ≥ 1s), ramp 9, defaults ──
const g = duckedVolume({gaps: [[100, 160]], ramp: 9});
eq('gap: narration before (f50)', g(50), 0.25); // ducked while narration speaks
eq('gap: gap start (f100)', g(100), 0.25); // ramp-up begins at ducked
eq('gap: ramp-up mid (f104.5)', g(104.5), 0.525); // 0.25→0.8 halfway
eq('gap: ramp-up end (f109)', g(109), 0.8); // full solo
eq('gap: mid-gap (f130)', g(130), 0.8); // holds solo in the gap
eq('gap: ramp-down mid (f155.5)', g(155.5), 0.525); // 0.8→0.25 halfway
eq('gap: gap end (f160)', g(160), 0.25); // back to ducked
eq('gap: narration after (f200)', g(200), 0.25); // narration resumes → ducked

// ── Fixture 2: narrationFrames=90 (no gaps) — swell only AFTER narration ends ──
const n = duckedVolume({narrationFrames: 90, ramp: 9});
eq('narr: during (f50)', n(50), 0.25);
eq('narr: end (f90)', n(90), 0.25);
eq('narr: ramp end (f99)', n(99), 0.8);
eq('narr: after (f120)', n(120), 0.8);

// ── Fixture 3: default (narration owns whole scene) — always ducked ──
const d = duckedVolume();
eq('default (f0)', d(0), 0.25);
eq('default (f300)', d(300), 0.25);

// ── Fixture 4: custom levels honoured ──
const c = duckedVolume({gaps: [[50, 120]], ramp: 10, clipVolume: 0.1, clipVolumeSolo: 0.9});
eq('custom: ducked (f0)', c(0), 0.1);
eq('custom: solo (f85)', c(85), 0.9);

// ── Property checks: sub-min gap ignored; ramp monotone; clamped to [0,1] ──
const small = duckedVolume({gaps: [[100, 120]], ramp: 9}); // 20f < 30f minGap → ignored
if (!near(small(110), 0.25)) { console.log(`FAIL sub-min gap should be ignored: ${small(110)}`); fails++; } else console.log('ok   sub-min gap (<1s) ignored → stays ducked');

let mono = true, clamped = true, prev = -1;
for (let f = 100; f <= 109; f++) { const v = g(f); if (v < prev - 1e-9) mono = false; prev = v; }
for (let f = 0; f <= 400; f++) { const v = g(f); if (v < 0 || v > 1) clamped = false; }
if (!mono) { console.log('FAIL ramp-up not monotone'); fails++; } else console.log('ok   ramp-up monotone non-decreasing');
if (!clamped) { console.log('FAIL volume left [0,1]'); fails++; } else console.log('ok   volume clamped to [0,1] across sweep');

console.log(`\nAUDIO-CHECK: ${fails === 0 ? 'PASS (duckedVolume curve verified)' : `FAIL — ${fails} assertion(s)`}`);
process.exit(fails === 0 ? 0 : 1);
