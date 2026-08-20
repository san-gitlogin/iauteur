#!/usr/bin/env node
// BUILD-AUDIO-TRACK — assemble one continuous audio track from the per-scene TTS mp3s.
//
// WHY THIS EXISTS: Remotion's own audio mixer expands every scene's mp3 to a
// full-timeline uncompressed WAV before blending. At 38 minutes that already needed
// several GB of scratch; at 110 minutes and 147 scenes it needs far more than this
// machine has, and the render dies with "No space left on device" AFTER spending an
// hour on the video. So the video renders `--muted`, this builds the track, and the
// two are stream-copied together — no re-encode, no scratch space, no drift.
//
// Each scene's audio is padded (or trimmed) to exactly its durationFrames, so the
// track lines up with the picture by construction rather than by luck.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const [specPath, prefix, outPath] = process.argv.slice(2);
if (!specPath || !prefix || !outPath) {
  console.error('usage: build-audio-track <spec.json> <audio-prefix> <out.m4a>');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const fps = spec.meta?.fps ?? 30;

const inputs = [];
const filters = [];
let missing = 0;
spec.scenes.forEach((s, i) => {
  const dur = (s.durationFrames ?? 0) / fps;
  const mp3 = `public/audio/${prefix}_${s.id}.mp3`;
  if (fs.existsSync(mp3)) {
    inputs.push('-i', mp3);
  } else {
    // a scene with no narration is silence of exactly its own length
    inputs.push('-f', 'lavfi', '-t', dur.toFixed(4), '-i', 'anullsrc=r=48000:cl=stereo');
    missing++;
  }
  filters.push(
    `[${i}:a]aresample=48000,apad=whole_dur=${dur.toFixed(4)},atrim=0:${dur.toFixed(4)},asetpts=N/SR/TB[a${i}]`
  );
});
const concat = spec.scenes.map((_, i) => `[a${i}]`).join('') +
  `concat=n=${spec.scenes.length}:v=0:a=1[out]`;

const script = filters.join(';\n') + ';\n' + concat;
const scriptFile = path.join(path.dirname(outPath), '.audio-filter.txt');
fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(scriptFile, script);

const total = spec.scenes.reduce((a, s) => a + (s.durationFrames ?? 0), 0) / fps;
console.log(`${spec.scenes.length} scenes · ${missing} silent · target ${(total / 60).toFixed(2)} min`);

execFileSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  ...inputs,
  '-filter_complex_script', scriptFile,
  '-map', '[out]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
  outPath,
], {stdio: 'inherit'});
fs.unlinkSync(scriptFile);

const probe = execFileSync('ffprobe', [
  '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outPath,
], {encoding: 'utf8'}).trim();
const drift = Math.abs(Number(probe) - total);
console.log(`✓ ${outPath} — ${Number(probe).toFixed(3)}s vs spec ${total.toFixed(3)}s (drift ${(drift * 1000).toFixed(0)}ms)`);
if (drift > 0.5) { console.error('DRIFT TOO LARGE'); process.exit(1); }
