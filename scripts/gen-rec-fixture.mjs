#!/usr/bin/env node
// GEN-REC-FIXTURE — builds a synthetic "recording" whose FRAME NUMBER IS BURNED INTO
// EVERY FRAME. That is the whole point: a rendered still then proves, unambiguously and
// machine-readably, which segment and which segment-frame is on screen at a given
// composition frame. This is what makes the two-frame anchor proof (LAW 0i / criterion S3)
// a measurement instead of an opinion.
//
// Output mirrors exactly what the real runner will emit (docs/SCREEN_RECORDING.md §4):
//   public/rec/<slug>/manifest.json + seg-NN.mp4
//
// The frames are PAINTED HERE and handed to ffmpeg as a PNG sequence, rather than drawn by
// ffmpeg's `drawtext` filter. `drawtext` needs an ffmpeg built --enable-libfreetype; the
// Homebrew build on macOS is not, so the whole test-rec suite died at
// `No such filter: 'drawtext'` on a machine where the PRODUCT itself worked fine. The real
// capture path already encodes a PNG sequence (capture.mjs), so this is the same road.
//
// Usage: node scripts/gen-rec-fixture.mjs [slug]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {Frame, hex} from './lib/record/framepaint.mjs';

const slug = process.argv[2] || '_fixture';
const OUT = path.resolve('public/rec', slug);
const FPS = 30;

// Deliberately UNEQUAL lengths — equal-length segments would hide off-by-one errors.
const SEGS = [
  {id: 'open-file', frames: 60, color: '0x1e3a5f', bbox: {x: 40, y: 40, w: 300, h: 120}},
  {id: 'type-code', frames: 90, color: '0x5f1e3a', bbox: {x: 480, y: 120, w: 420, h: 260}},
  {id: 'run-tests', frames: 45, color: '0x1e5f3a', bbox: {x: 60, y: 300, w: 840, h: 200}},
];

fs.rmSync(OUT, {recursive: true, force: true});
fs.mkdirSync(OUT, {recursive: true});

const W = 960, H = 540;
const WHITE = [255, 255, 255];
const YELLOW = [255, 214, 0];

/** One fixture frame: the segment label, the frame number, and a bar that MOVES.
 *  The moving bar is what makes "this clip is advancing" measurable; the numerals are
 *  what makes a still readable by a human debugging an anchor. */
const paint = (seg, n, i) => {
  const f = new Frame(W, H, hex(seg.color));
  f.text(40, 40, `SEG ${n} ${seg.id}`, 6, WHITE);
  f.text(40, 140, `F${i}`, 20, YELLOW);
  // mod(t*300, 900) at 30fps, in whole pixels so the sequence is reproducible.
  f.fill(Math.round((i * 300 / FPS) % 900), 440, 60, 60, WHITE);
  return f.png();
};

const steps = [];
let t = 0;
SEGS.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const file = `seg-${n}.mp4`;
  // Paint every frame, then encode the sequence. Exactly `s.frames` files exist, so the
  // count cannot drift the way the concat demuxer's repeated-last-image trick does
  // (gotcha 20) — there is nothing to trim.
  const fdir = path.join(OUT, `frames-${n}`);
  fs.mkdirSync(fdir, {recursive: true});
  for (let i = 0; i < s.frames; i++) {
    fs.writeFileSync(path.join(fdir, `f${String(i).padStart(5, '0')}.png`), paint(s, n, i));
  }

  execFileSync(
    'ffmpeg',
    ['-y', '-v', 'error',
     '-framerate', String(FPS), '-i', path.join(`frames-${n}`, 'f%05d.png'),
     '-frames:v', String(s.frames),
     '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(FPS),
     file],
    {cwd: OUT, stdio: ['ignore', 'inherit', 'inherit']},
  );
  fs.rmSync(fdir, {recursive: true, force: true});

  // verify what we actually produced — never trust the request, measure the artefact
  const probed = execFileSync('ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-count_frames',
     '-show_entries', 'stream=nb_read_frames,r_frame_rate,width,height',
     '-of', 'csv=p=0', file], {cwd: OUT}).toString().trim();
  const [w, h, rate, nb] = probed.split(',');
  if (Number(nb) !== s.frames) {
    console.error(`FAIL ${file}: asked for ${s.frames} frames, got ${nb}`);
    process.exit(1);
  }
  console.log(`  ${file}  ${w}x${h} @${rate}  ${nb} frames  [${s.id}]`);

  steps.push({
    id: s.id,
    index: i,
    action: 'fixture',
    tStart: +(t / FPS).toFixed(3),
    tEnd: +((t + s.frames) / FPS).toFixed(3),
    segment: file,
    segmentFrames: s.frames,
    bbox: s.bbox,
    sent: `(fixture) ${s.id}`,
    output: `(fixture) deterministic frame-numbered clip for ${s.id}`,
    exitCode: 0,
    truth: 'fixture', // real runs use 'read-back'; anything else must fail the gate
  });
  t += s.frames;
});


const manifest = {
  slug,
  surface: 'fixture',
  schema: 1,
  recordedAt: new Date().toISOString(),
  env: {os: os.platform(), node: process.version, note: 'synthetic fixture, not a real capture'},
  viewport: {width: 960, height: 540},
  fps: FPS,
  steps,
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\nOK  public/rec/${slug}/manifest.json  (${steps.length} segments, ${t} frames total)`);
