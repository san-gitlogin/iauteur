#!/usr/bin/env node
// Usage: node scripts/ref-sweep.mjs <url> <tag> <outDir> [scrollY ...]
//
// REFERENCE SWEEP — scroll a page and shoot it at several depths, so a component can be
// drawn from the real product instead of from memory (LAW 0m: capture the artefact).
//
// `snap.mjs` shoots ONE viewport and is the right tool for a frame that will appear in a
// video, with provenance in SOURCES.json. This is its research counterpart: the output is
// working reference that informs geometry and colour, is never published, and therefore
// goes to a scratch directory rather than public/assets.
//
// Two details that matter and were paid for on the first run:
//  - The "choose another country or region" interstitial covers the header on every visit
//    from outside the US, so it is dismissed before the first shot.
//  - deviceScaleFactor 2, because the point is to read a corner radius and a lens ring.
import fs from 'node:fs';
import {chromium} from 'playwright';

const [url, tag, outDir, ...rest] = process.argv.slice(2);
if (!url || !tag || !outDir) {
  console.error('Usage: node scripts/ref-sweep.mjs <url> <tag> <outDir> [scrollY ...]');
  process.exit(2);
}
const shots = rest.length ? rest.map(Number) : [0, 1500, 3000, 4500, 6000];
fs.mkdirSync(outDir, {recursive: true});

const browser = await chromium.launch({headless: true});
const ctx = await browser.newContext({
  viewport: {width: 1600, height: 1000}, deviceScaleFactor: 2,
  reducedMotion: 'reduce', colorScheme: 'dark',
});
const page = await ctx.newPage();
await page.goto(url, {waitUntil: 'load', timeout: 60000});
await page.waitForTimeout(3500);

for (const sel of ['.ac-gn-cta-close', 'button[aria-label*="Close" i]', 'button:has-text("Continue")']) {
  const el = page.locator(sel).first();
  if (await el.count().catch(() => 0)) { await el.click({timeout: 2000}).catch(() => {}); break; }
}
await page.waitForTimeout(600);

for (const y of shots) {
  await page.evaluate((yy) => window.scrollTo({top: yy, behavior: 'instant'}), y);
  await page.waitForTimeout(1500);            // lazy media
  const f = `${outDir}/${tag}-y${String(y).padStart(5, '0')}.png`;
  await page.screenshot({path: f});
  console.log(`✓ ${f}`);
}
console.log('page height:', await page.evaluate(() => document.body.scrollHeight));
await browser.close();
