#!/usr/bin/env node
// TEST-REC-ZOOMRES — proves the SOFT ZOOM seal fires, and that it goes quiet when the
// master really is big enough.
//
// Owner, 2026-09-05: *"I would like to see an optimal difference in clarity so that even
// zooming in, panning in does not degrade the quality of my video."*
//
// Two bugs produced that, and both were silent — valid manifest, green linter, clean render:
//   1. capture.mjs downscaled every segment to 1920 wide. That is a supersample only for a
//      beat whose camera never moves.
//   2. browser.mjs asked for deviceScaleFactor 1.2 (exactly 1920) and omitted Chrome's
//      high-DPI flags, so an explicit request for dsf 4 was CAPPED AT 2 and reported success.
//
// The seal in check-recordings.mjs computes, per clip, how wide the master must be for the
// zoom the spec actually authored. This test breaks a fixture on purpose in BOTH directions,
// because a guard that always fires is as useless as one that never does.
//
// Usage: node scripts/test-rec-zoomres.mjs
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SLUG = '_zoomres-selftest';
const rec = path.resolve('public/rec', SLUG);
const top = path.resolve('topics', SLUG);
const clean = () => { fs.rmSync(rec, {recursive: true, force: true}); fs.rmSync(top, {recursive: true, force: true}); };
clean();
fs.mkdirSync(rec, {recursive: true});
fs.mkdirSync(top, {recursive: true});

// A clip that zooms onto a 180px-wide mark. RecordedStep frames it at
// winW = max(180*1.08, 1600/3.2) = 500, i.e. a 3.20x push, so the renderer stretches the
// master to 3.20 * 1920 = 6144px.
const CAP_W = 1600;
const MARK_W = 180;
const EXPECT_ZOOM = 3.2;
const NEED_W = 6144;

fs.writeFileSync(path.join(rec, 'manifest.json'), JSON.stringify({
  slug: SLUG, surface: 'browser', schema: 1, viewport: {width: CAP_W, height: 900}, fps: 30,
  startUrl: 'https://example.invalid/',
  steps: [{id: 'z', segment: 'seg-01.mp4', segmentFrames: 30, truth: 'read-back',
           bbox: {x: 0, y: 0, w: CAP_W, h: 900}, ink: [{x: 10, y: 10, w: 100, h: 20}],
           marks: {tiny: {x: 100, y: 200, w: MARK_W, h: 24}}}],
}, null, 1));

fs.writeFileSync(path.join(top, 'long.json'), JSON.stringify({
  meta: {slug: SLUG},
  scenes: [{id: 's1', type: 'RECORDED_STEP', narration: 'x', data: {recordedStep: {
    capture: {width: CAP_W, height: 900},
    clips: [{ref: `rec:${SLUG}#z`, id: 'z', src: `rec/${SLUG}/seg-01.mp4`, frames: 30,
             bbox: {x: 0, y: 0, w: CAP_W, h: 900},
             marks: {tiny: {x: 100, y: 200, w: MARK_W, h: 24}},
             zooms: [{mark: 'tiny', atWord: 5}]}]}}}],
}, null, 1));

const seg = (w) => {
  const h = Math.round((w * 9) / 16 / 2) * 2;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi',
    '-i', `color=c=gray:s=${w}x${h}:d=1:r=30`, '-frames:v', '30',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30', '-pix_fmt', 'yuv420p',
    path.join(rec, 'seg-01.mp4')]);
};

const findings = () => {
  let out = '';
  // SCOPED. Repo-wide, SOFT ZOOM is a notice truncated to the first five entries (174 clips
  // across already-shipped cuts would otherwise bury it), so an unscoped run cannot see this
  // fixture at all. --slug is also the mode that matters: it is what a render runs.
  try { out = execFileSync('node', ['scripts/check-recordings.mjs', '--slug', SLUG], {encoding: 'utf8'}); }
  catch (e) { out = `${e.stdout ?? ''}${e.stderr ?? ''}`; }
  return out.split('\n').filter((l) => l.includes(SLUG) && l.includes('SOFT ZOOM'));
};

// [master width, how many SOFT ZOOM findings we require, why]
// The gate allows a MEASURED tolerance of 2.0x rather than demanding 1:1 — see the curve in
// check-recordings.mjs. So the boundary, for this fixture's 6144px ideal, sits at 3072px.
// Both sides of that line are pinned here: a guard whose threshold nobody tests is a
// threshold that drifts.
const FLOOR = Math.ceil(NEED_W / 2.0 / 2) * 2;   // 3072
const CASES = [
  [NEED_W,     0, `exactly the ${EXPECT_ZOOM}x the spec asks for — nothing to report`],
  [NEED_W * 2, 0, 'more than enough — a bigger master must never be an error'],
  [FLOOR + 128, 0, 'just inside the measured 2.0x tolerance (SSIM 0.990) — allowed'],
  [FLOOR - 128, 1, 'just outside the tolerance — the first width that must be caught'],
  [1920,       1, 'the OLD pipeline default — a 3.20x upscale, and it must be caught'],
  [2048,       1, 'still a 3x upscale — caught'],
];

let bad = 0;
console.log(`SOFT ZOOM seal — clip zooms ${EXPECT_ZOOM}x on a ${MARK_W}px mark, needs ${NEED_W}px\n`);
for (const [w, want, why] of CASES) {
  seg(w);
  const got = findings();
  const ok = got.length === want;
  if (!ok) bad++;
  console.log(`  ${ok ? 'PASS' : '*** FAIL ***'}  master ${String(w).padStart(5)}px  findings ${got.length} (wanted ${want})  — ${why}`);
  if (!ok && got.length) console.log(`         ${got[0].trim().slice(0, 160)}`);
}

clean();
console.log('');
if (bad) {
  console.error(`${bad} of ${CASES.length} SOFT ZOOM cases behaved wrongly — the seal is decorative.`);
  process.exit(1);
}
console.log(`All ${CASES.length} SOFT ZOOM cases behave correctly: it fires when the master is short, and stays quiet when it is not.`);
