#!/usr/bin/env node
// CHECK-CAMERA — may the camera go there? Only if the voice is talking about it.
//
// Owner, 2026-09-11, on the FluidRAM cut: *"zooming in is absolute shot. You zoom in at a
// specific place only, and you are speaking about something which is not in focus."*
//
// Every other gate checked WHEN a camera move lands, never WHAT it frames. audit-sync reads
// callouts and clip labels; nothing read a zoom's target, so a punch-in could sit on one line
// for twenty seconds while the narration had moved on to three others, and every check passed.
//
// The rule: a zoom framing one or more marks must have at least one distinctive word of the
// text those marks cover SPOKEN within WINDOW words of the move. The covered text comes from
// the recording itself (`marks[*].covers`, measured by the runner), so the check reads what is
// really on screen, not what the author meant to put there. A pull-back (`at: 'full'`) frames
// the whole page and is always allowed.
//
//   node scripts/check-camera.mjs --spec topics/<slug>/long.json [--timestamps out/tts/<p>_timestamps.json]
//
// Exits 1 on any move that frames text the voice is not saying. Silent when a spec has no
// recorded zooms (a short made only of pictures has nothing to check).
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const specPath = opt('--spec') ?? argv.find((a) => a.endsWith('.json'));
if (!specPath) { console.error('usage: node scripts/check-camera.mjs --spec <spec.json> [--timestamps <file>]'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const slug = path.basename(path.dirname(path.resolve(specPath)));
const isShort = /shorts?\.json$/i.test(specPath);

// THE WINDOW LEANS FORWARD. A camera that arrives and THEN hears the line named is how a
// reader's eye works ("line one seventeen — the allocation asks with GFP kernel": the move
// lands on the line number and the content is spoken 8 words on). A camera still sitting on
// a line the voice left long ago is the defect. So a move may lead its words by up to AHEAD
// and trail them by BACK, which is audit-sync's own ±7.
const BACK = 7, AHEAD = 10;
const FPS = 30, FPW = 12;  // post-sync atWord encodes a frame: frame = (v - 1) * 12

const tsPath = opt('--timestamps') ?? [
  spec.meta?.audioPrefix && `out/tts/${spec.meta.audioPrefix}_timestamps.json`,
  `out/tts/${slug}_${isShort ? 'shorts' : 'long'}_timestamps.json`,
  `out/tts/${slug}_timestamps.json`,
].filter(Boolean).find((p) => fs.existsSync(p));

const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'are', 'was', 'you', 'your', 'can',
  'one', 'two', 'not', 'has', 'have', 'its', 'but', 'from', 'self', 'return', 'if', 'int', 'u8']);
const stem = (w) => {
  w = w.toLowerCase().replace(/'s$/, '');
  for (const suf of ['ing', 'ed', 'es', 'e', 's']) if (w.endsWith(suf) && w.length - suf.length >= 3) return w.slice(0, -suf.length);
  return w;
};
// Code is split on everything that is not a letter or digit, so `gf_mul(u8 a` yields `gf`, `mul`.
// Narration is written for a voice, so it spells out what the screen abbreviates: "one
// gigabyte" over "1 GB", "microseconds" over "us". Both sides go through the same table.
const UNIT = {gb: 'gigabyte', mb: 'megabyte', kb: 'kilobyte', tb: 'terabyte', ms: 'millisecond',
  us: 'microsecond', ns: 'nanosecond', ghz: 'gigahertz', mhz: 'megahertz', vm: 'virtual', io: 'input'};
const toks = (s) => String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).map((w) => UNIT[w] ?? w)
  .filter((w) => w.length >= 3 && !STOP.has(w)).map(stem);
const same = (a, b) => a === b || (a.length >= 4 && b.startsWith(a)) || (b.length >= 4 && a.startsWith(b));

const scenes = (spec.scenes ?? []).filter((s) => s.type === 'RECORDED_STEP');
const moves = [];
for (const sc of scenes) for (const [ci, clip] of (sc.data?.recordedStep?.clips ?? []).entries()) {
  for (const z of clip.zooms ?? []) {
    if (z.at === 'full') continue;
    const names = z.marks?.length ? z.marks : z.mark ? [z.mark] : [];
    if (!names.length || typeof z.atWord !== 'number') continue;
    moves.push({sc, ci, z, names, covers: names.map((n) => clip.marks?.[n]?.covers ?? '').join(' | ')});
  }
}
if (!moves.length) { console.log('✓ CAMERA CHECK — no recorded zooms to check.'); process.exit(0); }
if (!tsPath) {
  console.error(`✗ CAMERA CHECK — ${moves.length} zoom(s) to check but no timestamps file for ${specPath}.`);
  console.error('  The check compares a move with the words spoken around it, so it needs the real read.');
  process.exit(1);
}
const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));

const bad = [];
for (const m of moves) {
  const words = m.sc.narration.split(/\s+/);
  const times = ts[m.sc.id]?.words ?? [];
  // the move's moment, back in seconds, then the spoken word nearest it
  const t = ((m.z.atWord - 1) * FPW) / FPS + 0.1;
  let wi = 0;
  for (let i = 0; i < times.length; i++) if (times[i] <= t) wi = i;
  const lo = Math.max(0, wi - BACK), hi = Math.min(words.length, wi + AHEAD + 1);
  const spoken = words.slice(lo, hi).flatMap(toks);
  const shown = toks(m.covers);
  const hit = shown.some((a) => spoken.some((b) => same(a, b)));
  if (!m.covers.trim()) {
    bad.push({...m, why: 'the marks carry no measured text (`covers`) — re-record so the runner measures them', said: words.slice(lo, hi).join(' ')});
  } else if (!hit) {
    bad.push({...m, why: 'nothing the camera frames is being said', said: words.slice(lo, hi).join(' ')});
  }
}

if (bad.length) {
  console.error(`✗ CAMERA CHECK: ${bad.length} of ${moves.length} zoom(s) frame something the voice is not talking about.`);
  for (const b of bad) {
    console.error(`  ${b.sc.id} clip${b.ci} zoom → ${b.names.join(' + ')}: ${b.why}`);
    console.error(`     framed : ${b.covers.slice(0, 110)}`);
    console.error(`     spoken : …${b.said}…`);
  }
  console.error('Move the zoom onto the words that name what it frames, frame what is being said, or pull back to full.');
  process.exit(1);
}
console.log(`✓ CAMERA CHECK PASSED — all ${moves.length} zoom(s) frame what the voice is saying.`);
