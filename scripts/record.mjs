#!/usr/bin/env node
// RECORD — turn a demo.json into real footage plus its event manifest.
//
//   node scripts/record.mjs <demo.json> [--headless] [--keep-frames] [--out <dir>]
//   npm run record -- topics/<slug>/demo.json
//
// Output lands in public/rec/<slug>/ (gitignored — recordings stay local, decision D4):
//   manifest.json   what ran, when, where on screen, and what the machine said back
//   seg-NN.mp4      one CFR segment per step
//
// Then reference the steps from a spec as `rec:<slug>#<step-id>` and run
// `node scripts/bake-rec.mjs <spec>` to resolve them.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {recordDemo} from './lib/record/runner.mjs';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Usage: node scripts/record.mjs <demo.json> [--headless] [--keep-frames] [--out <dir>]');
  process.exit(2);
}
if (!fs.existsSync(file)) {
  console.error(`No such demo file: ${file}`);
  process.exit(2);
}
const outIdx = argv.indexOf('--out');
const demo = JSON.parse(fs.readFileSync(file, 'utf8'));

console.log(`recording "${demo.slug}" — ${demo.steps?.length ?? 0} step(s), theme ${demo.theme ?? 'dark'}\n`);

try {
  const {manifest, dir} = await recordDemo(demo, {
    outDir: outIdx >= 0 ? argv[outIdx + 1] : undefined,
    headless: argv.includes('--headless'),
    keepFrames: argv.includes('--keep-frames'),
  });

  const OK_TRUTH = new Set(['read-back', 'no-output']);
  const unverified = manifest.steps.filter((s) => !OK_TRUTH.has(s.truth));
  console.log(`\nOK  ${path.join(dir, 'manifest.json')}`);
  console.log(`    ${manifest.steps.length} step(s), ${manifest.steps.filter((s) => s.truth === 'read-back').length} verified by read-back`);
  if (unverified.length) {
    console.error(`\n!!  ${unverified.length} step(s) are NOT read-back verified: ${unverified.map((s) => s.id).join(', ')}`);
    console.error('    bake-rec.mjs will refuse these. Fix the demo rather than bypassing the gate.');
    process.exit(1);
  }
  // AUTO-REBAKE. A fresh capture invalidates every spec built on the previous take, and
  // "remember to re-bake" is not a mechanism — measured on a real re-record: 3 of 3 clips
  // left stale, with marks ten times too wide, and the render used them silently.
  // Find the specs that reference this slug and refresh them now.
  const specs = [];
  if (fs.existsSync('topics')) {
    for (const t of fs.readdirSync('topics')) {
      for (const f of ['long.json', 'shorts.json']) {
        const sp = path.join('topics', t, f);
        if (fs.existsSync(sp) && fs.readFileSync(sp, 'utf8').includes(`rec:${manifest.slug}#`)) specs.push(sp);
      }
    }
  }
  if (specs.length) {
    console.log(`\nre-baking ${specs.length} spec(s) built on this recording:`);
    for (const sp of specs) {
      try {
        execFileSync('node', ['scripts/bake-rec.mjs', sp], {stdio: ['ignore', 'inherit', 'inherit']});
      } catch {
        console.error(`   !! bake failed for ${sp} — fix it before rendering`);
        process.exit(1);
      }
    }
  } else {
    console.log('\nNext: reference steps as rec:' + manifest.slug + '#<id> in a spec, then');
    console.log('      node scripts/bake-rec.mjs topics/<slug>/long.json');
  }
} catch (err) {
  console.error(`\nRECORDING FAILED: ${err.message}`);
  console.error('\nNothing was written. A recording that cannot be verified is not written at all —');
  console.error('it never falls back to a plausible-looking guess.');
  process.exit(1);
}
