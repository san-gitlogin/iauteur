// split-rec-step.mjs — JUMP CUTS FOR A LONG LIVE TAKE, WITHOUT RE-RECORDING IT.
//
// A clip never plays faster than capture speed (src/recWarp.mjs caps the rate at 1), so a
// nine-minute agent run cannot sit under one beat. This cuts one recorded step into named
// pieces — the moments worth watching — and adds each as its own step, so a spec references
// `rec:<slug>#<piece>` like any other clip. The ORIGINAL step stays in the manifest untouched,
// and the pre-split manifest is kept beside it.
//
// Honesty rules the pieces carry:
//   · every piece is a contiguous range of the real segment — no reordering, no speed change
//   · marks, ink and screenText describe the END of the original step, so only a piece that
//     reaches that end keeps them; earlier pieces carry none rather than a wrong rectangle
//
// Usage: node scripts/split-rec-step.mjs <slug> <stepId> <pieceId>:<fromSec>-<toSec|end> [...]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const [slug, stepId, ...specs] = process.argv.slice(2);
if (!slug || !stepId || !specs.length) {
  console.error('Usage: node scripts/split-rec-step.mjs <slug> <stepId> <pieceId>:<fromSec>-<toSec|end> [...]');
  process.exit(1);
}
const dir = path.resolve('public/rec', slug);
const mPath = path.join(dir, 'manifest.json');
const m = JSON.parse(fs.readFileSync(mPath, 'utf8'));
const at = m.steps.findIndex((s) => s.id === stepId);
if (at < 0) throw new Error(`step "${stepId}" not in ${mPath}`);
const step = m.steps[at];
const fps = m.fps || 30;
const src = path.join(dir, step.segment);
const total = Number(step.segmentFrames);

const frames = (file) => Number(String(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', file])).trim());

const pieces = specs.map((s) => {
  const mm = /^([\w-]+):([\d.]+)-([\d.]+|end)$/.exec(s);
  if (!mm) throw new Error(`bad piece "${s}" — want id:from-to (seconds, or "end")`);
  const from = Math.round(Number(mm[2]) * fps);
  const to = mm[3] === 'end' ? total : Math.min(total, Math.round(Number(mm[3]) * fps));
  if (!(to > from)) throw new Error(`piece "${mm[1]}" is empty (${from}..${to} of ${total})`);
  if (m.steps.some((x) => x.id === mm[1])) throw new Error(`step id "${mm[1]}" already exists`);
  return {id: mm[1], from, to};
});
for (let i = 1; i < pieces.length; i++) {
  if (pieces[i].from < pieces[i - 1].to) throw new Error(`pieces overlap or run backwards at "${pieces[i].id}"`);
}

fs.copyFileSync(mPath, path.join(dir, `manifest.pre-split-${stepId}.json`));
const base = step.segment.replace(/\.mp4$/i, '');
const made = pieces.map((p) => {
  const segment = `${base}-${p.id}.mp4`;
  const out = path.join(dir, segment);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-ss', (p.from / fps).toFixed(3), '-to', (p.to / fps).toFixed(3),
    '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', out]);
  const real = frames(out);
  const reachesEnd = p.to >= total;
  const piece = {
    ...step,
    id: p.id,
    label: `${step.label} (${(p.from / fps).toFixed(0)}s-${(p.to / fps).toFixed(0)}s)`,
    segment,
    segmentFrames: real,
    tStart: +(step.tStart + p.from / fps).toFixed(3),
    tEnd: +(step.tStart + p.to / fps).toFixed(3),
    changes: Array.isArray(step.changes)
      ? step.changes.filter((f) => f >= p.from && f < p.to).map((f) => f - p.from) : step.changes,
  };
  // marks is an object keyed by mark id; ink keeps whatever shape the recorder wrote.
  if (!reachesEnd) { piece.marks = {}; piece.ink = Array.isArray(step.ink) ? [] : {}; delete piece.screenText; }
  console.log(`  ${p.id.padEnd(12)} ${segment}  ${real}f  ${(p.from / fps).toFixed(1)}s-${(p.to / fps).toFixed(1)}s` +
    (reachesEnd ? '  (keeps marks)' : ''));
  return piece;
});
m.steps.splice(at + 1, 0, ...made);
fs.writeFileSync(mPath, JSON.stringify(m, null, 2));
console.log(`split ${slug}#${stepId} (${total}f) into ${made.length} piece(s); original step kept.`);
