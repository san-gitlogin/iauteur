#!/usr/bin/env node
// FIT-REC-MASTER — downscale each recorded segment to the resolution its own beats need.
//
// WHY. `check-recordings` enforces a FLOOR: a clip's master must carry enough pixels for the
// deepest zoom the spec authors on it, or the camera upscales and the footage goes soft. That
// floor says nothing about the CEILING, and capturing everything at the deepest beat's
// requirement is what produced this failure:
//
//   Failed to fetch .../astra-openai/seg-02.mp4 ... Chrome rejecting the request
//   because the disk space is low
//
// A 6400x3600 master is four times the pixels of 3200x1800 and sixteen times 1600x900. On
// disk that is nothing (103MB for the whole shoot). At RENDER time Remotion decodes every
// frame through Chrome, and a beat that never zooms was paying full price for pixels the
// camera never visits.
//
// So: capture high, then fit each segment DOWN to `zoom x delivery`, exactly the number the
// gate asks for, with a small safety margin. Geometry is untouched — marks, bboxes and ink
// are CSS pixels and never mention the file's resolution.
//
//   node scripts/fit-rec-master.mjs <spec.json> [--margin 1.15] [--dry]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const argv = process.argv.slice(2);
const spec = argv.find((a) => !a.startsWith('--'));
const dry = argv.includes('--dry');
const mIdx = argv.indexOf('--margin');
const MARGIN = mIdx >= 0 ? Number(argv[mIdx + 1]) : 1.15;
// A CAP, because the floor is not the only constraint. Remotion decodes every frame through
// Chrome, so master pixels are paid for at RENDER time as well as on disk — a 6400x3600 take
// is four times the decode of 3200x1800. Measured: a 19-minute cut of 6400px footage failed
// at frame 2144 with 4GB free, and Remotion said so plainly ("Chrome rejecting the request
// because the disk space is low").
//
// What the cap costs, at the pipeline's deepest zoom (3.2x, i.e. a 500px CSS window):
//     6400 master -> 2000 real px into a 1920 frame  = 1:1, nothing lost
//     4800 master -> 1500 real px                    = 1.28x upscale, barely visible
//     3200 master -> 1000 real px                    = 1.92x upscale, visible
//     1920 master ->  600 real px                    = 3.2x upscale, the original defect
// 4800 keeps the fix and pays a quarter less. Raise it on a machine with room.
const cIdx = argv.indexOf('--cap');
const CAP = cIdx >= 0 ? Number(argv[cIdx + 1]) : Infinity;
if (!spec) { console.error('usage: fit-rec-master <spec.json> [--margin 1.15] [--dry]'); process.exit(2); }

const DELIVERY_W = 1920;
const TIGHTEST = 3.2;

const probe = (f, k) => Number(execFileSync('ffprobe',
  ['-v', 'error', '-select_streams', 'v:0', '-show_entries', `stream=${k}`,
   '-of', 'csv=p=0', f]).toString().trim().split(/\r?\n/)[0]);

// Same arithmetic as the SOFT ZOOM gate, so the two cannot disagree.
const zoomFactorFor = (clip, capW) => {
  const rectOf = (z) => {
    if (z.at === 'full') return null;
    if (z.marks?.length) {
      const rs = z.marks.map((m) => clip.marks?.[m]).filter(Boolean);
      if (!rs.length) return null;
      const x = Math.min(...rs.map((r) => Number(r.x)));
      const x1 = Math.max(...rs.map((r) => Number(r.x) + Number(r.w)));
      return {w: x1 - x};
    }
    if (z.mark) return clip.marks?.[z.mark] ?? null;
    return clip.bbox ?? null;
  };
  const entries = (clip.zooms ?? []).length ? clip.zooms : (clip.focus ? [{}] : []);
  let worst = 1;
  for (const z of entries) {
    const r = rectOf(z);
    const bw = r ? Number(r.w) : capW;
    if (!Number.isFinite(bw) || bw <= 0) continue;
    worst = Math.max(worst, capW / Math.max(bw * 1.08, capW / TIGHTEST));
  }
  return worst;
};

// One segment can be cast by several beats; the widest demand wins.
const need = new Map();
for (const file of [spec]) {
  const s = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const sc of s.scenes ?? []) {
    const rs = sc.data?.recordedStep;
    if (!rs) continue;
    const capW = Number(rs.capture?.width ?? 0) || 1600;
    for (const c of rs.clips ?? []) {
      if (!c.src) continue;
      const abs = path.resolve('public', c.src);
      const want = Math.min(CAP, Math.ceil((zoomFactorFor(c, capW) * DELIVERY_W * MARGIN) / 2) * 2);
      need.set(abs, Math.max(need.get(abs) ?? 0, want));
    }
  }
}

let saved = 0, touched = 0;
for (const [abs, want] of need) {
  if (!fs.existsSync(abs)) continue;
  const have = probe(abs, 'width');
  if (!have || have <= want) {
    console.log(`  keep  ${path.basename(path.dirname(abs))}/${path.basename(abs)}  ${have}px (needs ${want})`);
    continue;
  }
  const before = fs.statSync(abs).size;
  console.log(`  fit   ${path.basename(path.dirname(abs))}/${path.basename(abs)}  ${have} -> ${want}px`);
  if (dry) continue;
  const tmp = abs.replace(/\.mp4$/, '.fit.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', abs,
    '-vf', `scale=${want}:-2:flags=lanczos`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-an', tmp]);
  const after = fs.statSync(tmp).size;
  fs.renameSync(tmp, abs);
  saved += before - after;
  touched++;
}
console.log(`\n${touched} segment(s) fitted, ${(saved / 1e6).toFixed(1)}MB reclaimed.`);
console.log('Geometry is unchanged (marks and bboxes are CSS px), but frame counts are');
console.log('re-encoded — RE-BAKE before rendering: node scripts/bake-rec.mjs <spec>');
