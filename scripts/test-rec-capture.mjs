#!/usr/bin/env node
// TEST-REC-CAPTURE — proves the capture pipeline produces FRAME-ACCURATE CFR segments.
//
// A synthetic page is used deliberately: its content is CONTROLLED, so "did segment 2
// really start where we marked it" becomes a measurement instead of an impression. The
// page runs three one-second phases with clearly separated luma levels:
//
//   phase 1  #1a1a1a  Y ~26    (animating - a box slides)
//   phase 2  #7f7f7f  Y ~127   (animating)
//   phase 3  #e6e6e6  Y ~230   (STATIC - nothing moves at all)
//
// Phase 3 is the important one. CDP screencast only emits a frame when something
// CHANGES, so a still period produces no frames. A segment covering it must still come
// out as a full-length CFR clip by HOLDING the last painted frame. If that is broken,
// idle stretches of a real demo would collapse or fail.
//
// Usage: node scripts/test-rec-capture.mjs [--headed]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startCapture} from './lib/record/capture.mjs';

const headed = process.argv.includes('--headed');
const WORK = path.resolve('out/rec-capture-test');
const FRAMES = path.join(WORK, 'frames');
fs.rmSync(WORK, {recursive: true, force: true});
fs.mkdirSync(FRAMES, {recursive: true});

const FPS = 30;
const PHASES = [
  {name: 'p1-dark',   bg: '#1a1a1a', y: 26,  animate: true},
  {name: 'p2-mid',    bg: '#7f7f7f', y: 127, animate: true},
  {name: 'p3-static', bg: '#e6e6e6', y: 230, animate: false},
];

const PAGE = `
<body style="margin:0;overflow:hidden">
<div id="bg" style="width:100vw;height:100vh;background:#1a1a1a;position:relative">
  <div id="box" style="position:absolute;top:40px;left:0;width:80px;height:80px;background:#ff3b30"></div>
  <div id="lbl" style="position:absolute;bottom:20px;left:20px;font:700 48px monospace;color:#00e5ff">p1</div>
</div>
<script>
  window.__setPhase = (bg, label, animate) => {
    document.getElementById('bg').style.background = bg;
    document.getElementById('lbl').textContent = label;
    window.__animate = animate;
  };
  window.__animate = true;
  const box = document.getElementById('box');
  const t0 = performance.now();
  function tick(now){
    if (window.__animate) box.style.left = ((now - t0) / 4 % 800) + 'px';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
</script>
</body>`;

const results = [];
const check = (name, ok, detail = '') => {
  results.push({name, ok});
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

const probe = (file, entries) =>
  execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames',
    '-show_entries', `stream=${entries}`, '-of', 'csv=p=0', path.basename(file)],
    {cwd: path.dirname(file)}).toString().trim();

// Mean luma across EVERY frame of a segment — "which phase does this clip show".
// Checking only frame 0 is too brittle: a boundary legitimately lands within a frame of
// the paint, so the opening frame can still carry the previous picture for ~33ms.
const segmentLuma = (file) => {
  const dir = path.dirname(file);
  const out = execFileSync('ffprobe', ['-v', 'error', '-f', 'lavfi',
    '-i', `movie=${path.basename(file)},signalstats`,
    '-show_entries', 'frame_tags=lavfi.signalstats.YAVG', '-of', 'csv=p=0'],
    {cwd: dir}).toString().trim();
  const vals = out.split(/\r?\n/).map(Number).filter(Number.isFinite);
  return vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
};

const browser = await chromium.launch({headless: !headed});
const ctx = await browser.newContext({viewport: {width: 640, height: 360}, deviceScaleFactor: 1});
const page = await ctx.newPage();
await page.setContent(PAGE);
await page.waitForTimeout(500);

const rec = await startCapture(page, {dir: FRAMES, quality: 90});
await page.waitForTimeout(300); // let the first frames land

const bounds = [];
for (const ph of PHASES) {
  await page.evaluate(([bg, label, an]) => window.__setPhase(bg, label, an),
    [ph.bg, ph.name, ph.animate]);
  // Mark when the change is ON SCREEN, not when the DOM changed. Two rAFs guarantee the
  // browser has painted. Marking at the mutation put every boundary a frame early, which
  // is the same class of error as anchoring a scene to the wrong word.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const m = rec.mark(ph.name);
  bounds.push({...ph, t: m.t});
  await page.waitForTimeout(1000);
}
const tEnd = Date.now();
await rec.stop();
await browser.close();

console.log(`captured ${rec.frameCount()} screencast frames\n`);
check('screencast produced frames', rec.frameCount() > 10, `${rec.frameCount()} frames`);

// ── cut one segment per phase ────────────────────────────────────────────────
const segs = [];
for (let i = 0; i < bounds.length; i++) {
  const t0 = bounds[i].t;
  const t1 = i + 1 < bounds.length ? bounds[i + 1].t : tEnd;
  const out = path.join(WORK, `seg-${i + 1}.mp4`);
  const info = rec.segment({t0, t1, out, fps: FPS});
  const wanted = Math.round(((t1 - t0) / 1000) * FPS);
  segs.push({...bounds[i], ...info, wanted, spanMs: t1 - t0});
  console.log(`  seg-${i + 1} ${bounds[i].name.padEnd(10)} span ${String(t1 - t0).padStart(5)}ms  ` +
              `frames ${info.frames} (planned ${info.planned})  distinct sources ${info.sourceFrames}`);
}
console.log('');

for (const s of segs) {
  const rate = probe(s.out, 'r_frame_rate');
  check(`${s.name}: constant ${FPS}fps`, rate === `${FPS}/1`, `r_frame_rate=${rate}`);
  // within one frame of the requested span
  check(`${s.name}: length matches the marked span`, Math.abs(s.frames - s.wanted) <= 1,
    `got ${s.frames} frames, span implies ${s.wanted}`);
}

// THE BOUNDARY PROOF: each segment must SHOW its own phase, not a neighbour's.
// The phases are ~100 luma apart, so a segment that started a whole phase early would
// miss by ~100 and this cannot pass by accident.
for (const s of segs) {
  const luma = segmentLuma(s.out);
  const ok = Math.abs(luma - s.y) < 25;
  check(`${s.name}: segment shows the right content`, ok,
    `mean YAVG=${luma.toFixed(1)}, expected ~${s.y} (other phases: ${PHASES.filter(q=>q.y!==s.y).map(q=>q.y).join(', ')})`);
}

// THE DEAD-AIR TRIM PROOF. The static phase is one frozen frame for a whole second. With
// a LOW hold cap that run must be cut down; with the default cap (1200ms) a one-second
// freeze is under the limit and must be left alone. Testing both directions is the point:
// a trimmer that always fires would eat real pauses, and one that never fires is decoration.
{
  const still = segs.find((s) => !s.animate);
  const t0 = still.t;
  const t1 = tEnd;
  const tight = rec.segment({t0, t1, out: path.join(WORK, 'seg-trimmed.mp4'), fps: FPS, maxHoldMs: 200});
  const loose = rec.segment({t0, t1, out: path.join(WORK, 'seg-untrimmed.mp4'), fps: FPS, maxHoldMs: null});
  check('dead-air trim SHORTENS a frozen stretch', tight.frames < loose.frames,
    `maxHold 200ms -> ${tight.frames}f, no cap -> ${loose.frames}f (trimmed ${tight.trimmedFrames} frames)`);
  check('the default cap leaves a ~1s pause alone', still.trimmedFrames === 0,
    `default run trimmed ${still.trimmedFrames} frames`);
}

// THE HOLD PROOF: the static phase emitted (almost) no new frames, yet still produced a
// full-length clip built by holding the last painted frame.
const still = segs.find((s) => !s.animate);
check('a STATIC period still yields a full-length clip (frame held)',
  still.frames >= still.wanted - 1 && still.sourceFrames <= 3,
  `${still.frames} output frames from only ${still.sourceFrames} distinct captured frame(s)`);

const bad = results.filter((r) => !r.ok);
console.log('');
if (bad.length) {
  console.error(`${bad.length} of ${results.length} capture checks FAILED. Artefacts in ${WORK}`);
  process.exit(1);
}
console.log(`All ${results.length} capture checks PASS. Segments in ${WORK}`);
