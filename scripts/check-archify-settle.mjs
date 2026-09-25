#!/usr/bin/env node
// CHECK-ARCHIFY-SETTLE — the picture a viewer stares at must be STILL.
//
// WHY THIS EXISTS (owner, 2026-09-25: *"we need to be double sure that the voice over syncs
// perfectly with the archify chart display"*).
//
// A recorded clip plays at capture speed and then HOLDS ITS LAST FRAME for the rest of the
// narration (docs/VIDEO_METHOD.md, the hold arithmetic). For a terminal that is exactly right:
// the last frame is the finished output. For an Archify artifact it is a trap — `focus.set`,
// `view.reveal` and a chapter beat all kick off a transition, and if the segment is cut while
// that transition is still moving, the frame we hold for the next ten seconds is the diagram
// caught MID-SLIDE. Every gate stays green: the API reported success, the state read back
// correctly, the anchors all land on their words. The only thing wrong is the picture, and no
// existing check looks at pixels.
//
// So this measures the thing directly: the last half-second of every Archify clip, frame to
// frame, and fails when the picture is still moving at the cut.
//
//   node scripts/check-archify-settle.mjs <spec.json> [--tail 0.5] [--max 0.35]
//
// The metric is mean luma difference between consecutive frames (0-255). A settled Archify
// clip measures ~0.0001. A cursor blink or a running animation measures whole numbers.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const argv = process.argv.slice(2);
const specPath = argv.find((a) => !a.startsWith('--'));
const num = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? Number(argv[i + 1]) : dflt;
};
const TAIL = num('--tail', 0.5);
const MAX = num('--max', 0.35);

if (!specPath || !fs.existsSync(specPath)) {
  console.error('Usage: node scripts/check-archify-settle.mjs <spec.json> [--tail 0.5] [--max 0.35]');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

/** Max frame-to-frame luma difference over the last `TAIL` seconds of a clip. */
const tailMotion = (mp4) => {
  // ffmpeg prints filter metadata on STDERR, not stdout — execFileSync returns stdout, so the
  // first draft read null and crashed. spawnSync gives both.
  const r = spawnSync('ffmpeg', [
    '-loglevel', 'info', '-sseof', String(-TAIL), '-i', mp4,
    '-vf', 'tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG',
    '-f', 'null', '-',
  ], {encoding: 'utf8'});
  const out = `${r.stderr ?? ''}${r.stdout ?? ''}`;
  // Scientific notation is the NORMAL reading for a settled frame (8.2e-05). A regex of
  // [0-9.]+ silently matches "8" out of "8.2e-05" and reports a settled clip as moving —
  // which is how the first draft of this check produced a false alarm on a perfect take.
  const vals = [...out.matchAll(/YAVG=([0-9.eE+-]+)/g)].map((m) => Number(m[1])).filter(Number.isFinite);
  return vals.length ? Math.max(...vals) : null;
};

const manifests = new Map();
const manifestFor = (slug) => {
  if (!manifests.has(slug)) {
    const p = path.join('public/rec', slug, 'manifest.json');
    manifests.set(slug, fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
  }
  return manifests.get(slug);
};

const rows = [];
for (const sc of spec.scenes ?? []) {
  for (const clip of sc.data?.recordedStep?.clips ?? []) {
    const ref = clip.ref ?? '';
    const [, slug, stepId] = /^rec:([^#]+)#(.+)$/.exec(ref) ?? [];
    if (!slug) continue;
    const man = manifestFor(slug);
    const step = man?.steps?.find((s) => s.id === stepId);
    // Only Archify steps. A terminal cursor blinks and a VS Code caret pulses, so a general
    // "nothing may move" rule would be noise — and a gate that always fires is one the author
    // learns to ignore.
    if (!step || !/^Archify\./.test(String(step.sent ?? ''))) continue;
    const mp4 = path.join('public/rec', slug, `seg-${String(step.index + 1).padStart(2, '0')}.mp4`);
    if (!fs.existsSync(mp4)) continue;
    rows.push({scene: sc.id, slug, stepId, label: clip.label ?? stepId, mp4, motion: tailMotion(mp4)});
  }
}

if (!rows.length) {
  console.log('ARCHIFY SETTLE: no Archify clips in this spec — nothing to check.');
  process.exit(0);
}

console.log(`ARCHIFY SETTLE — ${rows.length} clip(s), last ${TAIL}s of each, threshold ${MAX}`);
const bad = [];
for (const r of rows) {
  const m = r.motion;
  const ok = m != null && m <= MAX;
  if (!ok) bad.push(r);
  console.log(`  ${ok ? 'ok  ' : 'MOVE'} ${r.scene} ${r.slug}#${r.stepId}  ${m == null ? 'unmeasured' : m.toExponential(2)}  ${r.label}`);
}

if (bad.length) {
  console.error(`\n✗ ARCHIFY SETTLE: ${bad.length} clip(s) are still moving when the segment ends.`);
  console.error('  That frame is HELD for the rest of the narration, so the viewer stares at a');
  console.error('  diagram caught mid-transition while the voice explains the finished state.');
  console.error('  Raise the step\'s `settleMs` in the demo and re-record. Do NOT fix it by');
  console.error('  shortening the narration — the hold is where the explanation lives.');
  process.exit(1);
}
console.log('\n✓ ARCHIFY SETTLE PASSED — every Archify clip is still at the cut.');
