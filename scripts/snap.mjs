#!/usr/bin/env node
// SNAP — screenshot a reference web page into public/assets/ using Remotion's
// own bundled headless Chromium, with provenance recorded in SOURCES.json.
// Unlocks the media family (PHOTO, SCREENSHOT_CASCADE, MEDIA_*, IMAGE_SCENE…)
// for news/product beats: capture the announcement page, the leaderboard, the
// docs — then reference the file as img:<name> in the spec.
//
// Usage: node scripts/snap.mjs <url> <filename.png> "<source note>" [--width 1920] [--height 1080] [--wait 4000]
// Screenshots are used nominatively for commentary; keep the note factual.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const [url, name, note = '(no note)'] = args;
if (!url || !name) {
  console.error('Usage: node scripts/snap.mjs <url> <filename.png> "<source note>" [--width N] [--height N] [--wait ms]');
  process.exit(2);
}
const opt = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 ? Number(args[i + 1]) : dflt;
};
const width = opt('--width', 1920);
const height = opt('--height', 1080);
const wait = opt('--wait', 4000);

const shell = path.resolve('node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe');
if (!fs.existsSync(shell)) {
  console.error(`Chromium not found at ${shell} — run any render/still once so Remotion downloads it.`);
  process.exit(1);
}

const dir = path.resolve('public/assets');
fs.mkdirSync(dir, {recursive: true});
const dest = path.join(dir, name);

execFileSync(shell, [
  '--headless',
  `--screenshot=${dest}`,
  `--window-size=${width},${height}`,
  '--hide-scrollbars',
  '--disable-gpu',
  `--virtual-time-budget=${wait}`,
  url,
], {stdio: 'pipe', timeout: 90000});

if (!fs.existsSync(dest) || fs.statSync(dest).size < 5000) {
  console.error('Screenshot failed or came back empty — check the URL.');
  process.exit(1);
}

const sourcesFile = path.join(dir, 'SOURCES.json');
const rec = fs.existsSync(sourcesFile) ? JSON.parse(fs.readFileSync(sourcesFile, 'utf8')) : [];
rec.push({file: name, url, note: `screenshot for commentary — ${note}`, bytes: fs.statSync(dest).size, capturedAt: new Date().toISOString()});
fs.writeFileSync(sourcesFile, JSON.stringify(rec, null, 2));

console.log(`saved public/assets/${name} (${fs.statSync(dest).size} bytes, ${width}x${height}) — reference as img:${name}`);
console.log('provenance -> public/assets/SOURCES.json');
