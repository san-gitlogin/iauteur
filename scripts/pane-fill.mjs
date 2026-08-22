#!/usr/bin/env node
// PANE-FILL SWEEP — how much of the effect pane the depiction actually occupies.
//
// Why: LAW 0o's second complaint was not overflow but the opposite — *"the graph is
// kinda like a patty inside a burger"*: a picture sized to a constant, floating in the
// middle of a pane three times its height. edge-scan catches content spilling OUT. This
// catches content that never grew IN, which looks deliberate in a thumbnail and looks
// like a mistake at full size.
//
// A terminal-layout beat has no right pane at all, so it legitimately reports ~0% height
// and 100% width (that 100% is the terminal's own border crossing the region). Read those
// rows as "not applicable", not as a defect. A MIN fixture is also expected to be thin:
// one parcel in a large pane is honest. What this sweep is for is the MIX column — the
// content that actually ships.
//
// It measures the ink bounding box inside the stage region and reports the fraction of
// the pane's height and width it spans. Anything under the floor is printed for a
// full-res look; it is a PRE-SCREEN, not a verdict — a genuinely small subject (one
// parcel) is allowed to be small.
//
//   node scripts/pane-fill.mjs <dir> [--side right|left|both] [--floor 0.35] [--filter s]
import fs from 'node:fs';
import path from 'node:path';
import {readPng} from './lib/png-read.mjs';

const args = process.argv.slice(2);
const dir = args[0];
if (!dir) { console.error('usage: node scripts/pane-fill.mjs <dir> [--side right] [--floor 0.35] [--filter s]'); process.exit(2); }
const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const side = opt('--side', 'right');
const floor = Number(opt('--floor', '0.35'));
const filter = opt('--filter', '');

// The house stage geometry, in design px, shared by 141 scenes: headline band, then the
// stage, then a reserved bottom band. Scaled to whatever the still was rendered at.
const GEO = {
  wide: {W: 1920, H: 1080, top: 212, bottom: 832, left: 72, right: 1848, splitAt: 0.5},
  vert: {W: 1080, H: 1920, top: 322, bottom: 1686, left: 52, right: 1028, splitAt: 0.34},
};

const CONTRAST = 18;   // low enough to see deliberately DIM content — a warehouse wall drawn
                       // at 0.48 opacity is on screen and must count as ink; at 34 the
                       // sweep called a full pane "33% filled" and sent me chasing it.

const files = fs.readdirSync(dir)
  .filter((f) => f.endsWith('.png') && (f.startsWith('wide_') || f.startsWith('vert_')))
  .filter((f) => !filter || f.includes(filter))
  .sort();

let flagged = 0;
for (const f of files) {
  const aspect = f.startsWith('vert_') ? 'vert' : 'wide';
  const g = GEO[aspect];
  const {width: W, height: H, channels: C, data} = readPng(path.join(dir, f));
  const k = W / g.W;                       // the still may be rendered at any scale
  const px = (x, y) => { const o = (y * W + x) * C; return [data[o], data[o + 1], data[o + 2]]; };

  // The pane region: in wide the stage is side-by-side, in vert it is stacked.
  let x0, x1, y0, y1;
  if (aspect === 'wide') {
    const mid = (g.left + g.right) / 2;
    [x0, x1] = side === 'left' ? [g.left, mid] : side === 'both' ? [g.left, g.right] : [mid, g.right];
    [y0, y1] = [g.top, g.bottom];
  } else {
    const mid = g.top + (g.bottom - g.top) * g.splitAt;
    [x0, x1] = [g.left, g.right];
    [y0, y1] = side === 'left' ? [g.top, mid] : side === 'both' ? [g.top, g.bottom] : [mid, g.bottom];
  }
  // inset past the pane's own border and title bar so the chrome is not measured as ink
  const inset = 30, titleBar = 56;
  x0 = Math.round((x0 + inset) * k); x1 = Math.round((x1 - inset) * k);
  y0 = Math.round((y0 + titleBar) * k); y1 = Math.round((y1 - inset) * k);

  const bg = px(x0 + 4, y0 + 4);
  const ink = (p) => Math.max(Math.abs(p[0] - bg[0]), Math.abs(p[1] - bg[1]), Math.abs(p[2] - bg[2])) > CONTRAST;
  let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1, n = 0;
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      if (!ink(px(x, y))) continue;
      n++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (!n) { console.log(`  EMPTY  ${f} — no content in the ${side} pane at all`); flagged++; continue; }
  const fh = (maxY - minY) / (y1 - y0);
  const fw = (maxX - minX) / (x1 - x0);
  const bad = fh < floor;
  if (bad) flagged++;
  console.log(`  ${bad ? 'THIN ' : 'ok   '} ${f.padEnd(34)} fills ${(fh * 100).toFixed(0).padStart(3)}% of the pane height, ${(fw * 100).toFixed(0).padStart(3)}% of its width`);
}
console.log(`\npane-fill: ${files.length} cells, ${flagged} under the ${(floor * 100).toFixed(0)}% floor — open those full-res before accepting them`);
