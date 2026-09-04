#!/usr/bin/env node
// CHECK-HOLDS — how long does each piece of footage STAY on screen after it finishes?
//
// WHY THIS EXISTS. Owner, on a shipped cut: *"the voiceover is shooting very fast while
// the on screen typing and highlighting just flashes only for a few seconds which is not
// processable by a human eye."* Every gate had passed. The linter passed. `audit-sync`
// passed — every element landed on the word that named it.
//
// SYNC IS NOT COMPREHENSION. A thing can arrive at exactly the right moment and still be
// gone before anyone has read it. Footage plays at CAPTURE speed whatever the voice does,
// so the only thing deciding how long a finished state stays up is how long the narration
// over it lasts:
//
//     hold = (next anchor − this anchor) − footage frames
//
// Measured on the cut he was watching: a beat that types a whole block of code held for
// 0.3 SECONDS after the last character landed. Nothing in the repo computed that number.
import fs from 'node:fs';

const [specPath, ...rest] = process.argv.slice(2);
if (!specPath) { console.error('usage: check-holds <spec.json> [--min <seconds>] [--quiet]'); process.exit(2); }
const quiet = rest.includes('--quiet');
const mi = rest.indexOf('--min');
// 2s is the floor for something you are asked to READ. It is a judgement, and it is the
// one the owner's complaint lands on: under two seconds a block of code is a flash.
const MIN = mi >= 0 ? Number(rest[mi + 1]) : 2.0;

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const fps = spec.meta?.fps ?? 30;
// Post-sync, `atWord` holds a frame-derived fractional value: frame = (v - 1) * 12.
const F = (w) => Math.max(0, (Number(w) - 1) * 12);

// A step whose whole content is "the file is saved" or "the folder is listed" has nothing
// to read, so a short hold is correct. A step that TYPES is the case this exists for.
const READS = /^(type|d[0-9]|client|thecall|a[0-9]|fix|.*key$|.*data$|.*who$)/i;

const rows = [];
for (const sc of spec.scenes ?? []) {
  const r = sc.data?.recordedStep;
  if (!r?.clips?.length) continue;
  const cl = r.clips;
  cl.forEach((c, i) => {
    if (c.frames == null || c.atWord == null) return;
    const st = F(c.atWord);
    const end = i + 1 < cl.length ? F(cl[i + 1].atWord) : (sc.durationFrames ?? st + c.frames);
    rows.push({
      scene: sc.id, id: c.id ?? String(i), label: c.label ?? '',
      foot: c.frames / fps, hold: (end - st - c.frames) / fps,
      reads: READS.test(String(c.id ?? '')),
    });
  });
}
if (!rows.length) { console.log('HOLD CHECK: no baked footage in this spec — nothing to measure.'); process.exit(0); }

rows.sort((a, b) => a.hold - b.hold);
const bad = rows.filter((r) => r.reads && r.hold < MIN);
if (!quiet) {
  console.log(`\nHOLD CHECK — seconds a clip's last frame stays up before the next anchor (min ${MIN}s to read)\n`);
  for (const r of rows.slice(0, 16)) {
    console.log(`  ${r.scene} ${r.id.padEnd(12)} footage ${r.foot.toFixed(1).padStart(5)}s  ` +
      `HOLD ${r.hold.toFixed(1).padStart(5)}s${r.reads && r.hold < MIN ? '   ← TOO FAST TO READ' : ''}`);
  }
  const reads = rows.filter((r) => r.reads);
  if (reads.length) {
    const med = reads.map((r) => r.hold).sort((a, b) => a - b)[Math.floor(reads.length / 2)];
    console.log(`\n  ${reads.length} clip(s) the viewer is asked to READ — median hold ${med.toFixed(1)}s`);
  }
}
if (bad.length) {
  console.error(`\n✗ HOLD CHECK: ${bad.length} clip(s) the viewer must read are gone in under ${MIN}s.`);
  for (const r of bad) console.error(`  ${r.scene}/${r.id}: ${r.hold.toFixed(1)}s — give the beat more words after it, or move the next anchor later.`);
  process.exit(1);
}
console.log(`\n✓ HOLD CHECK PASSED — every clip the viewer must read stays up at least ${MIN}s.`);
