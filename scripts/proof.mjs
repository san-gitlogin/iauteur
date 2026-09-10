#!/usr/bin/env node
// PROOF SHEET — renders ONE still per scene so you review every frame
// in seconds without scrubbing. The visual half of the critique.
// Usage: node scripts/proof.mjs <CompositionId> <spec.json> [sceneId ...]
//        node scripts/proof.mjs <CompositionId> <spec.json> --frames 1900,2060,2340
//
// TWO THINGS THIS SCRIPT USED TO DO WRONG, both paid for on 2026-09-10 while proofing
// the Apple series:
//
//  1. IT SHELLED OUT TO `npx remotion still`, ONCE PER SHOT. npx is a resolver we do not
//     need, and on this machine it is broken outright —
//        npm error ERR_INVALID_PACKAGE_CONFIG
//        Invalid package config <path to npm's own libnpmexec/package.json>
//     which is the same failure render-topic.mjs recorded and fixed months ago by calling
//     the CLI path directly. Proof kept the broken call, so the ONE gate that reviews
//     every scene as a picture (LAW 0k — audit by still, not by render) could not run at
//     all. A bundle here is an API call, not a CLI call, so there is no npm layer left to
//     break.
//
//  2. IT RE-BUNDLED THE WHOLE PROJECT PER STILL. Fourteen scenes meant fourteen bundles,
//     which is the same defect render-covers.mjs was written for. Bundle ONCE, then every
//     still is a couple of seconds — a 14-scene cut proofs in the time one still used to
//     take, which is the difference between reviewing every scene and reviewing none.
//
// Pass scene ids to proof a subset (`node scripts/proof.mjs <comp> <spec> s05 s09`), which
// is what you want after a fix: re-shoot the two beats you changed, not all fourteen.
//
// `--frames a,b,c` shoots ABSOLUTE timeline frames instead. That is how you check a camera
// move: compute the frame of each zoom anchor from the synced spec, shoot them, and look.
// A 60%-through-the-scene still cannot tell you whether the camera ever pulled back.
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';

const argv = process.argv.slice(2);
const fi = argv.indexOf('--frames');
const rawFrames = fi >= 0 ? String(argv[fi + 1] ?? '').split(',').map(Number).filter((n) => Number.isFinite(n)) : [];
const rest = fi >= 0 ? argv.slice(0, fi).concat(argv.slice(fi + 2)) : argv;
const [comp, file, ...only] = rest;
if (!comp || !file) {
  console.error('Usage: node scripts/proof.mjs <CompositionId> <spec.json> [sceneId ...]');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
fs.mkdirSync('out/proof', {recursive: true});

let offset = spec.cover ? (spec.cover.frames ?? 2) : 0;
const shots = rawFrames.map((f) => ({name: 'f' + f, frame: f}));
if (!shots.length) {
  if (spec.cover && !only.length) shots.push({name: 'cover', frame: 0});
  for (const s of spec.scenes) {
    // 60% into the scene: entrances done, exit fade not started
    if (!only.length || only.includes(s.id))
      shots.push({name: s.id + '_' + s.type, frame: offset + Math.floor(s.durationFrames * 0.6)});
    offset += s.durationFrames;
  }
}
if (!shots.length) {
  console.error(`no scenes matched ${only.join(', ')} in ${file}`);
  process.exit(2);
}

// Same self-heal as render-topic.mjs: a stale topicsIndex.ts breaks bundling for every
// composition, not just the one being proofed.
execSync('node scripts/gen-index.mjs', {stdio: 'inherit'});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp});
for (const shot of shots) {
  const outfile = `out/proof/${comp}_${shot.name}.png`;
  await renderStill({
    composition, serveUrl, output: outfile, frame: shot.frame, imageFormat: 'png',
  });
  console.log(`→ ${outfile} (frame ${shot.frame})`);
}
console.log(`\n✓ Proof sheet: ${shots.length} stills in out/proof/ — review before rendering the video.\n`);
