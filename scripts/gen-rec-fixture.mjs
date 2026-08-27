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
// Usage: node scripts/gen-rec-fixture.mjs [slug]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

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

// Copy a font next to the output so the ffmpeg filter never needs a Windows drive-letter
// path — ':' is the filter option separator and escaping it portably is a trap.
const FONT_CANDIDATES = [
  'C:/Windows/Fonts/consola.ttf',
  'C:/Windows/Fonts/arial.ttf',
  '/System/Library/Fonts/Menlo.ttc',
  '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
];
const font = FONT_CANDIDATES.find((f) => fs.existsSync(f));
if (!font) {
  console.error('No usable font found; tried:\n  ' + FONT_CANDIDATES.join('\n  '));
  process.exit(1);
}
fs.copyFileSync(font, path.join(OUT, 'font.ttf'));

const steps = [];
let t = 0;
SEGS.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const file = `seg-${n}.mp4`;
  const secs = (s.frames / FPS + 2).toFixed(3); // generate long, trim with -frames:v
  const vf = [
    `drawtext=fontfile=font.ttf:text='SEG ${n} ${s.id}':fontcolor=white:fontsize=44:x=40:y=40`,
    `drawtext=fontfile=font.ttf:text='F%{frame_num}':fontcolor=yellow:fontsize=140:x=40:y=140:start_number=0`,
    // a moving bar: proves the clip is ADVANCING, not just showing a static frame
    `drawbox=x='mod(t*300\\,900)':y=440:w=60:h=60:color=white@0.9:t=fill`,
  ].join(',');

  execFileSync(
    'ffmpeg',
    ['-y', '-v', 'error',
     '-f', 'lavfi', '-i', `color=c=${s.color}:s=960x540:r=${FPS}:d=${secs}`,
     '-vf', vf,
     '-frames:v', String(s.frames),
     '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(FPS),
     file],
    {cwd: OUT, stdio: ['ignore', 'inherit', 'inherit']},
  );

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

fs.rmSync(path.join(OUT, 'font.ttf'));

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
