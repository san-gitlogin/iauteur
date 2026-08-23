#!/usr/bin/env node
// Usage: node scripts/render-covers.mjs [slug ...]
//
// Renders the 9:16 shorts COVER still for every topic that has a rendered short and an
// authored `cover` block in shorts.json but no out/cover.png on disk.
//
// Why this exists: `render-topic.mjs <slug> cover` shells out to `npx remotion still`,
// which re-bundles the whole project on every call. That is fine for one cover and
// absurd for twenty, which is why the whole Playwright Dojo series shipped its shorts
// without covers. Here the bundle happens ONCE and every still reuses it.
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';

const only = process.argv.slice(2);
const wanted = (d) =>
  fs.existsSync(`topics/${d}/shorts.json`) &&
  fs.existsSync(`topics/${d}/out/short-dark.mp4`) &&
  !fs.existsSync(`topics/${d}/out/cover.png`) &&
  Boolean(JSON.parse(fs.readFileSync(`topics/${d}/shorts.json`, 'utf8')).cover);

const slugs = (only.length ? only : fs.readdirSync('topics')).filter(wanted).sort();
if (!slugs.length) { console.log('✓ every rendered short already has a cover'); process.exit(0); }

// Same self-heal as render-topic.mjs: a stale topicsIndex.ts breaks bundling for every
// composition, not just the touched one.
execSync('node scripts/gen-index.mjs', {stdio: 'inherit'});

console.log(`covers to render: ${slugs.length}`);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const slug of slugs) {
  const out = `topics/${slug}/out/cover.png`;
  const c = await selectComposition({serveUrl, id: `${slug}-cover`});
  await renderStill({composition: c, serveUrl, output: out, imageFormat: 'png'});
  console.log(`✓ ${out}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}
