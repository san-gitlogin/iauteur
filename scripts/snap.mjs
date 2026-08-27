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

const dir = path.resolve('public/assets');
fs.mkdirSync(dir, {recursive: true});
const dest = path.join(dir, name);

// CROSS-OS CAPTURE. This used to hardcode
//   node_modules/.remotion/chrome-headless-shell/win64/...chrome-headless-shell.exe
// which meant snap.mjs worked on exactly one platform (criterion S6). Two engines now,
// tried in order:
//   1. Playwright's Chromium — a dependency since the recording subsystem landed, resolved
//      by Playwright itself on every OS, and it can WAIT for the page instead of guessing
//      with a virtual-time budget.
//   2. Remotion's bundled headless shell, with the platform directory DETECTED rather than
//      assumed, for a checkout that has not installed Playwright.
const remotionShell = () => {
  const root = path.resolve('node_modules/.remotion/chrome-headless-shell');
  if (!fs.existsSync(root)) return null;
  // e.g. win64/chrome-headless-shell-win64/chrome-headless-shell.exe
  //      mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell
  for (const plat of fs.readdirSync(root)) {
    const inner = path.join(root, plat, `chrome-headless-shell-${plat}`);
    for (const exe of ['chrome-headless-shell', 'chrome-headless-shell.exe']) {
      const p = path.join(inner, exe);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
};

let engine = null;
try {
  const {chromium} = await import('playwright');
  const browser = await chromium.launch({headless: true});
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1});
  const page = await ctx.newPage();
  // Wait for the page rather than racing a fixed budget: a screenshot of a half-drawn
  // page is worse than no screenshot, and this is a SOURCE for a video.
  await page.goto(url, {waitUntil: 'load', timeout: 60000});
  await page.waitForTimeout(wait);
  await page.screenshot({path: dest});
  await browser.close();
  engine = `playwright ${JSON.parse(fs.readFileSync('node_modules/playwright/package.json', 'utf8')).version}`;
} catch (err) {
  const shell = remotionShell();
  if (!shell) {
    console.error([
      'No capture engine available.',
      `  playwright failed: ${err.message}`,
      "  and Remotion's headless shell was not found — run any render/still once so Remotion",
      '  downloads it, or: npm i -D playwright && npx playwright install chromium',
    ].join(String.fromCharCode(10)));
    process.exit(1);
  }
  execFileSync(shell, [
    '--headless',
    `--screenshot=${dest}`,
    `--window-size=${width},${height}`,
    '--hide-scrollbars',
    '--disable-gpu',
    `--virtual-time-budget=${wait}`,
    url,
  ], {stdio: 'pipe', timeout: 90000});
  engine = `remotion-headless-shell (${path.basename(path.dirname(path.dirname(shell)))})`;
}

if (!fs.existsSync(dest) || fs.statSync(dest).size < 5000) {
  console.error('Screenshot failed or came back empty — check the URL.');
  process.exit(1);
}

const sourcesFile = path.join(dir, 'SOURCES.json');
const rec = fs.existsSync(sourcesFile) ? JSON.parse(fs.readFileSync(sourcesFile, 'utf8')) : [];
rec.push({file: name, url, note: `screenshot for commentary — ${note}`, bytes: fs.statSync(dest).size, capturedAt: new Date().toISOString(), engine, viewport: `${width}x${height}`});
fs.writeFileSync(sourcesFile, JSON.stringify(rec, null, 2));

console.log(`saved public/assets/${name} (${fs.statSync(dest).size} bytes, ${width}x${height}) — reference as img:${name}`);
console.log('provenance -> public/assets/SOURCES.json');
