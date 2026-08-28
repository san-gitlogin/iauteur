// RENDER A LONG CUT WITHOUT RUNNING OUT OF DISK — LAW 12, made into a command.
//
// Remotion buffers every frame to disk before encoding, and its audio mixer expands every scene
// mp3 to a full-timeline WAV before blending. Both were measured on the 87-minute Linux cut and
// both killed a render AFTER an hour of work. The recipe that survived is written down in LAW 12
// but was never a script, so it had to be re-typed by hand every time:
//
//   1. render the video in SEGMENTS, `--muted`, deleting the temp dir between passes
//   2. concat the segments with `-c copy` (no re-encode)
//   3. build one continuous audio track from the per-scene mp3s (build-audio-track.mjs)
//   4. stream-copy picture and sound together
//
// This run: 27,382 frames against 7.7 GB free. One pass would want roughly 4 GB of scratch, and
// "roughly" is not a number to bet an hour of rendering on.
//
// Usage: node scripts/render-long.mjs <slug> <composition> <segments>
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const [slug, comp, segArg] = process.argv.slice(2);
if (!slug || !comp) {
  console.error('Usage: node scripts/render-long.mjs <slug> <composition-id> [segments]');
  process.exit(2);
}
const segments = Number(segArg || 4);
const specPath = `topics/${slug}/long.json`;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const total = spec.scenes.reduce((a, s) => a + s.durationFrames, 0);
const outDir = path.resolve(`topics/${slug}/out`);
const work = path.resolve(`out/render-${slug}`);
fs.mkdirSync(outDir, {recursive: true});
// RESUMABLE. A long render is the one job most likely to be interrupted — the machine is wanted
// for something else, or it is simply late. Wiping the work directory on start threw away two
// finished segments and an hour of rendering the first time this was paused. Finished segments are
// kept and skipped; `--fresh` is there for when the spec has actually changed.
if (process.argv.includes('--fresh')) fs.rmSync(work, {recursive: true, force: true});
fs.mkdirSync(work, {recursive: true});

const REMOTION = path.resolve('node_modules/@remotion/cli/remotion-cli.js');
const free = () => {
  try {
    const out = execFileSync('powershell', ['-NoProfile', '-Command',
      '[math]::Round((Get-PSDrive C).Free/1GB,1)'], {encoding: 'utf8'});
    return String(out).trim();
  } catch { return '?'; }
};

console.log(`${slug} / ${comp} — ${total} frames in ${segments} segment(s). Free: ${free()} GB`);

const per = Math.ceil(total / segments);
const parts = [];
for (let i = 0; i < segments; i++) {
  const start = i * per;
  const end = Math.min(total - 1, start + per - 1);
  if (start > end) break;
  const part = path.join(work, `seg-${String(i).padStart(2, '0')}.mp4`);
  // Already done on an earlier run? Keep it. A segment is only written once ffmpeg has finished
  // it, so a file being present means it is complete rather than half-written.
  if (fs.existsSync(part) && fs.statSync(part).size > 0) {
    console.log(`[${i + 1}/${segments}] frames ${start}-${end}  — already rendered, skipping`);
    parts.push(part);
    continue;
  }
  console.log(`\n[${i + 1}/${segments}] frames ${start}-${end}  (free ${free()} GB)`);
  execFileSync('node', [REMOTION, 'render', comp, part,
    `--frames=${start}-${end}`, '--muted', '--concurrency=2',
    '--log=error'], {stdio: 'inherit'});
  parts.push(part);
  // DELETE THE SCRATCH BETWEEN PASSES. Peak usage is then one segment, not the whole timeline —
  // which is the entire point of segmenting.
  for (const d of fs.readdirSync(work)) {
    if (d.startsWith('remotion-') || d.endsWith('.tmp')) {
      fs.rmSync(path.join(work, d), {recursive: true, force: true});
    }
  }
}

const listFile = path.join(work, 'parts.txt');
fs.writeFileSync(listFile, parts.map((p) => `file '${p.split('\\').join('/')}'`).join('\n') + '\n');
const mute = path.join(work, 'video-muted.mp4');
console.log('\nconcat (stream copy) ...');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
  '-c', 'copy', mute], {stdio: 'inherit'});

const track = path.join(work, 'track.m4a');
console.log('building the audio track ...');
execFileSync('node', [path.resolve('scripts/build-audio-track.mjs'), specPath,
  spec.meta?.audioPrefix || `${slug.split('-')[0]}_long`, track], {stdio: 'inherit'});

const final = path.join(outDir, `${comp.replace(`${slug}-`, '')}.mp4`);
console.log('muxing ...');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', mute, '-i', track,
  '-c', 'copy', '-shortest', final], {stdio: 'inherit'});

// VERIFY, do not assume. Frame count must equal the spec's, and drift must be ~0 — both were
// wrong once and both were only caught because they were measured.
// ffprobe's `csv=p=0` emits a TRAILING COMMA and a CR, so `27382,\r` came back — and
// `Number('27382,')` is NaN, which made a perfect render report MISMATCH and a drift of NaN ms.
// A verifier that cries wolf is worse than none: strip to the number and mean it.
const probe = (args) => {
  const raw = String(execFileSync('ffprobe', args, {encoding: 'utf8'}));
  const m = /-?\d+(?:\.\d+)?/.exec(raw);
  return m ? Number(m[0]) : NaN;
};
const vFrames = probe(['-v', 'error', '-select_streams', 'v:0', '-count_frames',
  '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', final]);
// the VIDEO stream's own duration is absent in some muxes; the container's is always there
const vDur = probe(['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', final]);
const aDur = probe(['-v', 'error', '-select_streams', 'a:0',
  '-show_entries', 'stream=duration', '-of', 'csv=p=0', final]);

console.log(`\n${final}`);
console.log(`  frames: ${vFrames} (spec says ${total})  ${vFrames === total ? 'EXACT' : 'MISMATCH'}`);
console.log(`  drift : ${Math.round((vDur - aDur) * 1000)} ms`);
console.log(`  free  : ${free()} GB`);
fs.rmSync(work, {recursive: true, force: true});
if (vFrames !== total) process.exitCode = 1;
