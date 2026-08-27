#!/usr/bin/env node
// TEST-REC-CONTRACT — the two-frame proof for RECORDED_STEP (LAW 0i, criterion S3).
//
// The fixture burns its own frame number into every frame and slides a white box, so a
// rendered still is a MEASUREMENT of which segment and which segment-frame is on screen:
//
//   PRE-ROLL  f35  vs f36   DIFFER  segment 1 starts exactly on its own word
//   ADVANCE   f66  vs f67   DIFFER  the clip is really playing
//   FREEZE    f120 vs f131  SAME    it ran out at 60 frames and is HOLDING for the voice
//   SWITCH    f131 vs f132  DIFFER  segment 2 starts exactly on its own word
//   SWITCH-3  f200 vs f288  DIFFER  segment 3 starts exactly on its own word
//
// PAID-FOR LESSON — do NOT compare still hashes. Two reasons, both measured:
//   1. The BACKGROUND animates independently of the footage, so a whole-frame hash
//      reports motion that has nothing to do with the clip. Crop to the footage.
//   2. Video decode is not bit-exact frame to frame. A genuinely frozen clip still
//      measured YMAX=2 / YAVG=0.08 between two stills. Hash equality is therefore the
//      wrong assertion; a NUMERIC threshold is the right one.
// The measured separation is enormous, so the thresholds are not delicate:
//      frozen 2 · identical 0 · one frame of motion 145 · a segment switch 182.
//
// Anchors in topics/rec-contract-test/long.json, wordToFrame(w) = (w-1)*12:
//   clip1 atWord 4  -> frame 36,  60 frames -> exhausted at 96
//   clip2 atWord 12 -> frame 132, 90 frames
//   clip3 atWord 25 -> frame 288, 45 frames
//
// Usage: node scripts/test-rec-contract.mjs [bundleDir]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BUNDLE = process.argv[2] || 'build';
const SPEC = 'topics/rec-contract-test/long.json';
const COMP = 'rec-contract-test-wide-dark';
const OUT = path.resolve('out/rec-proof');

// Frames are SCENE-RELATIVE. The composition offset is computed from the spec so the
// proof survives scenes being added before the recorded one (a HOOK had to be added to
// satisfy the structural linter, which shifted every absolute frame by 180).
const SCENE_FRAMES = [35, 36, 66, 67, 120, 131, 132, 200, 288];

// The footage stage inside the 1920x1080 composition, cropped WELL INSIDE the panel
// border so neither the border nor the animated background leaks into the comparison.
const CROP = '1100:560:410:290';

// YMAX below this = the same picture; above the second = a different picture.
const SAME_MAX = 8;
const DIFF_MIN = 40;

if (!fs.existsSync(BUNDLE)) {
  console.error(`No bundle at ${BUNDLE} — run: npx remotion bundle`);
  process.exit(2);
}
if (!fs.existsSync('public/rec/_fixture/manifest.json')) {
  console.error('No fixture — run: node scripts/gen-rec-fixture.mjs');
  process.exit(2);
}
fs.mkdirSync(OUT, {recursive: true});

// Where does the RECORDED_STEP scene start in the composition?
const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
let OFFSET = 0;
let found = false;
for (const sc of spec.scenes) {
  if (sc.type === 'RECORDED_STEP') { found = true; break; }
  OFFSET += Number(sc.durationFrames || 0);
}
if (!found) {
  console.error(`No RECORDED_STEP scene in ${SPEC}`);
  process.exit(2);
}
const unbaked = spec.scenes.some((sc) => (sc?.data?.recordedStep?.clips || []).some((c) => c.ref));
if (unbaked) {
  console.error(`${SPEC} still has unbaked rec: references — run:\n  node scripts/bake-rec.mjs ${SPEC} --allow-fixture`);
  process.exit(2);
}
console.log(`RECORDED_STEP scene starts at composition frame ${OFFSET}`);
const FRAMES = SCENE_FRAMES.map((f) => f + OFFSET);
const at = (sceneFrame) => sceneFrame + OFFSET;

const still = (f) => {
  const raw = path.join(OUT, `f${String(f).padStart(4, '0')}.png`);
  const tight = path.join(OUT, `f${String(f).padStart(4, '0')}_tight.png`);
  execFileSync('npx', ['remotion', 'still', BUNDLE, COMP, `--frame=${f}`, raw],
    {stdio: ['ignore', 'ignore', 'inherit'], shell: true});
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-vf', `crop=${CROP}`, tight]);
  return tight;
};

// Max luma difference between two stills, 0..255. Pure measurement, no interpretation.
// NOTE: run from OUT with BARE FILENAMES. An absolute Windows path inside a lavfi
// `movie=` filter dies on the drive-letter colon ("Failed to avformat_open_input 'C'")
// because ':' is the filter option separator — the same trap as an ffmpeg fontfile path.
const ymax = (a, b) => {
  const out = execFileSync('ffprobe',
    ['-v', 'error', '-f', 'lavfi',
     '-i', `movie=${path.basename(a)}[x];movie=${path.basename(b)}[y];[x][y]blend=all_mode=difference,signalstats`,
     '-show_entries', 'frame_tags=lavfi.signalstats.YMAX', '-of', 'csv=p=0'],
    {cwd: OUT}).toString().trim();
  return Number(out.split(/\r?\n/)[0]);
};

console.log(`rendering ${FRAMES.length} stills from ${BUNDLE}...`);
const img = {};
for (const f of FRAMES) {
  img[f] = still(f);
  process.stdout.write(`  f${f}`);
}
console.log('\n');

const CHECKS = [
  ['PRE-ROLL', 'segment 1 starts on its own word', 35, 36, 'differ'],
  ['ADVANCE ', 'the clip is really playing',       66, 67, 'differ'],
  ['FREEZE  ', 'exhausted clip HOLDS for the voice', 120, 131, 'same'],
  ['SWITCH  ', 'segment 2 starts on its own word', 131, 132, 'differ'],
  ['SWITCH-3', 'segment 3 starts on its own word', 200, 288, 'differ'],
];

let bad = 0;
for (const [name, why, sa, sb, want] of CHECKS) {
  const a = at(sa);
  const b = at(sb);
  const d = ymax(img[a], img[b]);
  const ok = want === 'same' ? d <= SAME_MAX : d >= DIFF_MIN;
  if (!ok) bad++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${name}  ${why}\n` +
    `        f${a} vs f${b}: YMAX ${d}  (want ${want === 'same' ? `<=${SAME_MAX}` : `>=${DIFF_MIN}`})`,
  );
}

console.log('');
if (bad) {
  console.error(`${bad} of ${CHECKS.length} contract checks FAILED — the recording contract is broken.`);
  process.exit(1);
}
console.log(`All ${CHECKS.length} contract checks PASS.`);
console.log('Footage starts on its word and freezes for the voice. Stills in out/rec-proof/');
