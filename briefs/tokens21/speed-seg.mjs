// SPEED UP A RECORDED STEP, HONESTLY.
//   node briefs/tokens21/speed-seg.mjs <slug> <stepId> <factor>
//
// Why: an agent take spends most of its footage WAITING (a model thinking for 50 seconds, a spinner,
// a long command being typed). The recorder already trims frozen frames, but a spinner changes every
// second, so nothing is trimmed and the beat has to stretch to fit the footage — measured on this cut,
// a 46-second explanation over 95 seconds of footage. That is dragging, which the owner ruled out.
//
// What this does: re-times ONE segment by `factor` with ffmpeg (the original is kept as
// seg-NN.x1.mp4, and re-running always starts from it), rescales that step's segmentFrames and motion
// map in the manifest, and records `speed` on the step. The spec MUST say so on screen: the clip label
// carries "N× speed" (checked by the builder), so the viewer is never shown sped-up footage as live.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const [slug, stepId, f] = process.argv.slice(2);
const k = Number(f);
if (!slug || !stepId || !(k >= 1)) { console.error('usage: speed-seg.mjs <slug> <stepId> <factor>=1'); process.exit(2); }
const dir = path.join('public/rec', slug);
const mf = path.join(dir, 'manifest.json');
const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
const st = m.steps.find((s) => s.id === stepId);
if (!st?.segment) { console.error(`no step ${stepId} with a segment in ${mf}`); process.exit(1); }
const seg = path.join(dir, st.segment);
const orig = seg.replace(/\.mp4$/, '.x1.mp4');
if (!fs.existsSync(orig)) fs.copyFileSync(seg, orig);
st.origFrames ??= st.segmentFrames;
st.origChanges ??= st.changes;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', orig, '-filter:v', `setpts=PTS/${k}`, '-an', '-r', '30',
  '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', seg]);
const n = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries',
  'stream=nb_read_frames', '-of', 'csv=p=0', seg], {encoding: 'utf8'}).trim());
st.segmentFrames = n;
st.changes = [...new Set((st.origChanges ?? []).map((c) => Math.min(n - 1, Math.round(c / k))))];
st.speed = k;
fs.writeFileSync(mf, JSON.stringify(m, null, 2));
console.log(`${slug}#${stepId}: ${st.origFrames}f -> ${n}f at ${k}x (original kept as ${path.basename(orig)})`);
