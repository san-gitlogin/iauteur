#!/usr/bin/env node
// ANCHOR-SPEC — place every RECORDED_STEP anchor in a spec, automatically.
//
// The author writes WHAT happens and WHAT to say; this computes WHEN each thing lands,
// from frame counts measured at capture time. It is the step that makes a long course
// possible: hand-computing sixty scenes' worth of anchors is not work anybody should do.
//
// Run it AFTER bake-rec (so the real frame counts are present) and BEFORE lint. It is
// idempotent — re-running after a re-record simply re-solves from the new numbers.
//
// Usage:
//   node scripts/anchor-spec.mjs <spec.json> [--settle 45] [--dry]
import fs from 'node:fs';
import {anchorScene} from './lib/record/anchors.mjs';

const args = process.argv.slice(2);
const specPath = args.find((a) => !a.startsWith('--'));
if (!specPath) {
  console.error('Usage: node scripts/anchor-spec.mjs <spec.json> [--settle 45] [--dry]');
  process.exit(2);
}
const si = args.indexOf('--settle');
const settle = si >= 0 ? Number(args[si + 1]) : 45;
const dry = args.includes('--dry');

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const scenes = (spec.scenes ?? []).filter((s) => s.type === 'RECORDED_STEP');
if (!scenes.length) { console.log('no RECORDED_STEP scenes in this spec'); process.exit(0); }

// A synced spec's `atWord` encodes a FRAME, not a word index. Re-solving one would place
// anchors from meaningless numbers, so refuse — the legitimate loop is
// build -> anchor -> voiceover -> sync.
const synced = scenes.filter((s) => s.timingSource === 'tts');
if (synced.length) {
  console.error(
    `REFUSING: ${synced.map((s) => s.id).join(', ')} already synced (timingSource: tts).\n` +
    `  After a sync, atWord holds a FRAME rather than a word index, so re-solving would\n` +
    `  place anchors from numbers that no longer mean what the solver expects.\n` +
    `  Re-build the spec (or restore the pre-sync copy), then anchor, then voice and sync.`);
  process.exit(1);
}

let bad = 0;
for (const sc of scenes) {
  const before = sc.durationFrames;
  const r = anchorScene(sc, {settle});
  if (!r.ok) {
    console.error(`✗ ${sc.id}: ${r.reason}`);
    bad++;
    continue;
  }
  const cl = sc.data.recordedStep.clips;
  console.log(`✓ ${sc.id}  ${r.words}w  ${before ?? '-'} -> ${r.durationFrames}f`);
  cl.forEach((c, i) => {
    const f = Math.round((c.atWord - 1) * 12);
    const end = i + 1 < cl.length ? Math.round((cl[i + 1].atWord - 1) * 12) : r.durationFrames;
    console.log(`    ${String(c.id ?? i).padEnd(12)} w${String(c.atWord).padStart(3)}  f${String(f).padStart(4)}  ` +
      `footage ${String(c.frames).padStart(3)}f  gap ${String(end - f).padStart(4)}f  holds ${end - f - c.frames}f` +
      ((c.callouts ?? []).length ? `  callouts@w${(c.callouts).map((x) => x.atWord).join(',')}` : ''));
  });
}

if (bad) { console.error(`\n${bad} scene(s) could not be solved — fix the script or the capture.`); process.exit(1); }
if (dry) { console.log('\n--dry: nothing written'); process.exit(0); }
fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
console.log(`\nOK  anchored ${scenes.length} scene(s) -> ${specPath}`);
