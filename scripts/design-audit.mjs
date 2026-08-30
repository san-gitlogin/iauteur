#!/usr/bin/env node
// DESIGN AUDIT — alignment, padding and breathing room, measured rather than eyeballed.
//
// WHY (owner, 2026-08-30): *"look at all possible places and correct everything w.r.t design
// principles and alignment, scaffolding, padding, giving enough room for items to breathe."*
//
// "All possible places" is ~350 registered components across 30 design packs, which is far
// past what anyone reviews by eye — and reviewing by eye is how the defects he has been
// reporting all session got shipped in the first place. This renders the component showcase
// and MEASURES four things per still:
//
//   BLEED    ink within a hair of the frame edge — content with no margin at all
//   MARGIN   the smallest gutter between the ink box and the frame, as a % of the frame
//   FILL     ink box area against frame area — the "patty inside a burger" measure (LAW 0n)
//   BALANCE  how far the ink box's centre sits from the frame's centre
//
// None of these is a defect on its own. A deliberately edge-anchored lower-third SHOULD have a
// small margin on one side; a title card SHOULD have low fill. What the sweep is for is the
// OUTLIERS — and specifically the combination that is always wrong: high bleed AND low margin
// on the same axis, which means content is being clipped rather than composed.
//
// Reads the same PNG helper the edge-scan seal uses, so both agree about what "ink" is.
//
// Usage:
//   node scripts/design-audit.mjs render <design> [wide|vert]   render the stills
//   node scripts/design-audit.mjs scan <dir>                    measure them
//   node scripts/design-audit.mjs scan <dir> --worst 25         just the worst offenders
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {readPng} from './lib/png-read.mjs';

const [cmd, ...rest] = process.argv.slice(2);

// ── INK EXTRACTION ───────────────────────────────────────────────────────────
// Background is estimated from the four corners, as edge-scan does. A pixel is ink when it
// differs from that background by more than `contrast` on any channel. Deliberately generous:
// a faint scrim IS content as far as composition is concerned.
const CONTRAST = 40;

const measure = (file) => {
  const {width: W, height: H, channels: C, data} = readPng(file);
  const at = (x, y) => {
    const o = (y * W + x) * C;
    return [data[o], data[o + 1], data[o + 2]];
  };
  const inset = Math.round(Math.min(W, H) * 0.02);
  const corners = [
    at(inset, inset), at(W - 1 - inset, inset),
    at(inset, H - 1 - inset), at(W - 1 - inset, H - 1 - inset),
  ];
  const bg = [0, 1, 2].map((k) => {
    const v = corners.map((c) => c[k]).sort((a, b) => a - b);
    return (v[1] + v[2]) / 2;
  });
  const isInk = (x, y) => {
    const p = at(x, y);
    return Math.abs(p[0] - bg[0]) > CONTRAST ||
           Math.abs(p[1] - bg[1]) > CONTRAST ||
           Math.abs(p[2] - bg[2]) > CONTRAST;
  };

  // Sample on a grid — full-resolution scanning of 700 stills is minutes of nothing.
  const step = Math.max(1, Math.round(Math.min(W, H) / 400));
  let x0 = W, y0 = H, x1 = -1, y1 = -1, count = 0;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (!isInk(x, y)) continue;
      count++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return {empty: true, W, H};

  // BLEED — ink inside a 12px band at any edge, counted per edge so a deliberate
  // full-bleed background does not read the same as a clipped label.
  const band = 12;
  const bleed = {top: 0, bottom: 0, left: 0, right: 0};
  for (let x = 0; x < W; x += step) {
    for (let y = 0; y < band; y += 2) if (isInk(x, y)) { bleed.top++; break; }
    for (let y = H - band; y < H; y += 2) if (isInk(x, y)) { bleed.bottom++; break; }
  }
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < band; x += 2) if (isInk(x, y)) { bleed.left++; break; }
    for (let x = W - band; x < W; x += 2) if (isInk(x, y)) { bleed.right++; break; }
  }
  const cols = Math.ceil(W / step), rows = Math.ceil(H / step);
  const bleedPct = {
    top: bleed.top / cols, bottom: bleed.bottom / cols,
    left: bleed.left / rows, right: bleed.right / rows,
  };

  const margin = {
    left: x0 / W, right: (W - 1 - x1) / W,
    top: y0 / H, bottom: (H - 1 - y1) / H,
  };
  const fill = ((x1 - x0) * (y1 - y0)) / (W * H);
  const density = (count * step * step) / (W * H);
  const balance = {
    x: ((x0 + x1) / 2 - W / 2) / W,
    y: ((y0 + y1) / 2 - H / 2) / H,
  };
  return {W, H, margin, fill, density, balance, bleed: bleedPct, empty: false};
};

// ── RENDER ───────────────────────────────────────────────────────────────────
if (cmd === 'render') {
  const design = rest[0] ?? 'moderndark';
  const aspect = rest[1] ?? 'wide';
  const comp = `${design}-${aspect === 'vert' ? 'short' : 'wide'}`;
  const outDir = path.join('out', 'audit', `${design}-${aspect}`);
  fs.mkdirSync(outDir, {recursive: true});

  // Scene boundaries come from the showcase itself, so a still lands mid-scene rather than
  // during a transition — a transition frame is half of two components and measures as
  // neither.
  const src = fs.readFileSync('src/showcaseSpec.ts', 'utf8');
  void src;
  const meta = JSON.parse(execSync(
    `node -e "import('./src/showcaseSpec.ts').then(m=>{let a=0;const o=[];for(const s of m.showcaseSpec.scenes){o.push({id:s.id,type:s.type,mid:a+Math.round((s.durationFrames||150)*0.55)});a+=s.durationFrames||150;}console.log(JSON.stringify(o));})" --experimental-strip-types`,
    {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024},
  ).trim().split('\n').pop());

  console.log(`${meta.length} scenes -> ${outDir}`);
  const R = 'node_modules/@remotion/cli/remotion-cli.js';
  for (const [i, s] of meta.entries()) {
    const out = path.join(outDir, `${String(i).padStart(3, '0')}_${s.type}_${s.id}.png`);
    if (fs.existsSync(out)) continue;
    try {
      execSync(`node ${R} still ${comp} "${out}" --frame=${s.mid} --log=error`, {stdio: 'ignore'});
    } catch { console.error(`  ! ${s.id} (${s.type}) failed to render`); }
    if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${meta.length}`);
  }
  console.log('done');
  process.exit(0);
}

// ── SCAN ─────────────────────────────────────────────────────────────────────
if (cmd === 'scan') {
  const dir = rest.find((a) => !a.startsWith('--')) ?? 'out/audit';
  const wi = process.argv.indexOf('--worst');
  const worst = wi >= 0 ? Number(process.argv[wi + 1]) : 30;

  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.png')) files.push(full);
    }
  };
  walk(dir);
  if (!files.length) { console.error(`no PNGs under ${dir}`); process.exit(1); }

  const rows = [];
  let skippedCrop = 0, skippedBleed = 0;
  for (const f of files) {
    let m;
    try { m = measure(f); } catch (e) { console.error(`  ! ${f}: ${e.message}`); continue; }
    if (m.empty) { rows.push({f, score: 999, why: 'EMPTY — nothing rendered'}); continue; }

    // ── WHAT THIS SWEEP IS *NOT* FOR ──────────────────────────────────────────
    //
    // The first version flagged 83 of 124 stills, and almost all of it was noise: my own
    // debugging CROPS (a cropped region has no gutter by definition) and every FULL-BLEED
    // screen recording (footage filling the frame is the design, not a defect). A sweep that
    // reports 67% of its input has told you nothing, and it is the third time this session I
    // have nearly shipped a check whose failure mode is "learn to ignore me".
    //
    // Two exclusions, both structural rather than tuned:
    //   · only FULL FRAMES are judged. A still that is not 16:9 or 9:16 at render size is a
    //     crop, and a crop's margins are an artefact of where I cut it.
    //   · ink at ALL FOUR edges is full-bleed BY DESIGN. The composition error this is hunting
    //     is ASYMMETRIC — healthy gutters on some sides and none on another, which is what a
    //     label running off the frame looks like and what a background never looks like.
    const isFullFrame = (m.W === 1920 && m.H === 1080) || (m.W === 1080 && m.H === 1920);
    if (!isFullFrame) { skippedCrop++; continue; }

    const sides = ['left', 'right', 'top', 'bottom'];
    const tight = sides.filter((k) => m.margin[k] < 0.015);
    const healthy = sides.filter((k) => m.margin[k] > 0.03);
    if (tight.length === 4) { skippedBleed++; continue; }   // full-bleed by design

    const minMargin = Math.min(...sides.map((k) => m.margin[k]));
    const maxBleed = Math.max(...sides.map((k) => m.bleed[k]));
    const off = Math.max(Math.abs(m.balance.x), Math.abs(m.balance.y));

    const faults = [];
    // ASYMMETRIC and running along the edge: some sides compose, one is cut.
    const asym = tight.length > 0 && healthy.length >= 2;
    if (asym && maxBleed > 0.45) {
      faults.push(`CLIPPED on ${tight.join('/')} (${Math.round(maxBleed * 100)}% of an edge, ` +
        `${(minMargin * 100).toFixed(1)}% gutter, but ${healthy.length} other sides compose)`);
    } else if (asym) {
      faults.push(`NO BREATHING ROOM on ${tight.join('/')} (${(minMargin * 100).toFixed(1)}% gutter)`);
    }
    // FLOATING — real content that never grew into its frame (LAW 0n's "patty in a burger").
    if (m.fill < 0.12 && m.density > 0.004) faults.push(`FLOATING (fills ${Math.round(m.fill * 100)}%)`);
    if (off > 0.18 && !asym) faults.push(`OFF-CENTRE by ${Math.round(off * 100)}%`);

    if (faults.length) {
      const score = (asym && maxBleed > 0.45 ? 100 : 0)
        + (asym ? Math.max(0, (0.015 - minMargin) * 2000) : 0)
        + (m.fill < 0.12 && m.density > 0.004 ? 20 : 0)
        + Math.max(0, (off - 0.18) * 60);
      rows.push({f, score, why: faults.join(' · ')});
    }
  }

  rows.sort((a, b) => b.score - a.score);
  console.log(`\nscanned ${files.length} still(s): ${skippedCrop} crop(s) and ${skippedBleed} ` +
    `full-bleed frame(s) skipped, ${rows.length} carry a layout fault\n`);
  for (const r of rows.slice(0, worst)) {
    console.log(`  ${String(Math.round(r.score)).padStart(4)}  ${path.basename(r.f)}`);
    console.log(`        ${r.why}`);
  }
  if (rows.length > worst) console.log(`\n  …and ${rows.length - worst} more`);
  process.exit(0);
}

console.error('Usage: design-audit.mjs render <design> [wide|vert] | scan <dir> [--worst N]');
process.exit(2);
