#!/usr/bin/env node
// FRAME-EDGE OVERFLOW DETECTOR (the mechanical assist ruled in after G-VQ-1 —
// the family-G sweep RENDERED but never individually opened NUMBER_BASE·neo·vert,
// so the 16-bit row clipping the right frame edge slipped past representative
// viewing until the six-cell spot-check). This machine-opens EVERY rendered cell
// and flags content-bearing pixels hugging a frame edge (a shape cut off by the
// boundary) so edge-sensitive owned classes (fit-row-to-budget / tall-headline /
// pip-occlusion) get per-cell pre-screening instead of relying on the eye.
//
// It is a PRE-SCREEN, not an auto-verdict: flagged cells MUST be full-res opened.
// It targets FRAMED/centred-content fixtures (family G etc.); full-bleed media
// families (PHOTO/IMAGE/GALLERY) legitimately paint to the edges and will flag by
// design — there the agent inspects knowing edge content is expected.
//
//   node scripts/edge-scan.mjs <dir> [--filter <substr>] [--strict]
//   --filter: only scan files whose name contains <substr> (e.g. "-max" — the class
//             is a MAX-fixture concern). --strict: exit 1 if any file is flagged
//             (used to PROVE-TO-FAIL against a known-clipped render).
import fs from 'node:fs';
import path from 'node:path';
import {readPng} from './lib/png-read.mjs';

// tuned so a ~40px-tall bright bit-cell hugging the edge flags, while faint grid
// lines / gradient scrims / cornered chrome do not. `band` = how many px in from
// each edge count as "at the boundary" (the G-2 cell hugged to ~6px).
const OPTS = {band: 12, cornerExclude: 160, contrast: 64, minRun: 20};

export function edgeScan(file, opts = OPTS) {
  const {band, cornerExclude, contrast, minRun} = {...OPTS, ...opts};
  const {width: W, height: H, channels: C, data} = readPng(file);
  const px = (x, y) => {
    const o = (y * W + x) * C;
    return [data[o], data[o + 1], data[o + 2]];
  };
  // background estimate = median of four samples taken just inside each corner
  const corners = [
    px(cornerExclude, cornerExclude),
    px(W - 1 - cornerExclude, cornerExclude),
    px(cornerExclude, H - 1 - cornerExclude),
    px(W - 1 - cornerExclude, H - 1 - cornerExclude),
  ];
  const bg = [0, 1, 2].map((ch) => corners.map((s) => s[ch]).sort((a, b) => a - b)[1]);
  const dist = (p) => Math.max(Math.abs(p[0] - bg[0]), Math.abs(p[1] - bg[1]), Math.abs(p[2] - bg[2]));
  // max contrast anywhere in the outer `band` px at this edge position
  const bandMaxX = (xFrom, xTo, y) => {
    let m = 0;
    for (let x = xFrom; x <= xTo; x++) m = Math.max(m, dist(px(x, y)));
    return m;
  };
  const bandMaxY = (yFrom, yTo, x) => {
    let m = 0;
    for (let y = yFrom; y <= yTo; y++) m = Math.max(m, dist(px(x, y)));
    return m;
  };
  const maxRun = (vals) => {
    let best = 0, cur = 0;
    for (const v of vals) {
      if (v > contrast) best = Math.max(best, ++cur);
      else cur = 0;
    }
    return best;
  };
  const rangeY = [];
  for (let y = cornerExclude; y < H - cornerExclude; y++) rangeY.push(y);
  const rangeX = [];
  for (let x = cornerExclude; x < W - cornerExclude; x++) rangeX.push(x);
  const runs = {
    left: maxRun(rangeY.map((y) => bandMaxX(0, band - 1, y))),
    right: maxRun(rangeY.map((y) => bandMaxX(W - band, W - 1, y))),
    top: maxRun(rangeX.map((x) => bandMaxY(0, band - 1, x))),
    bottom: maxRun(rangeX.map((x) => bandMaxY(H - band, H - 1, x))),
  };
  const flagged = Object.entries(runs).filter(([, r]) => r >= minRun).map(([e]) => e);
  return {file: path.basename(file), W, H, bg, runs, flagged, isFlagged: flagged.length > 0};
}

// ── CLI ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length && !args[0].startsWith('--')) {
  const dir = args[0];
  const filter = args.includes('--filter') ? args[args.indexOf('--filter') + 1] : '';
  const strict = args.includes('--strict');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.png') && (!filter || f.includes(filter)))
    .sort();
  let flaggedCount = 0;
  for (const f of files) {
    let r;
    try {
      r = edgeScan(path.join(dir, f));
    } catch (e) {
      console.error(`  ! ${f}: ${e.message}`);
      continue;
    }
    if (r.isFlagged) {
      flaggedCount++;
      console.log(`  \u26A0 FLAG ${f} — content at [${r.flagged.join(',')}] edge (runs L${r.runs.left}/R${r.runs.right}/T${r.runs.top}/B${r.runs.bottom}px) — OPEN full-res`);
    } else {
      console.log(`  \u00B7 ok   ${f} (max edge run ${Math.max(...Object.values(r.runs))}px)`);
    }
  }
  console.log(`\nedge-scan: ${files.length} cells, ${flaggedCount} flagged for full-res inspection`);
  if (strict && flaggedCount > 0) process.exit(1);
}
