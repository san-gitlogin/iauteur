#!/usr/bin/env node
// Usage: node scripts/page-map.mjs <url> <outDir> [stepPx=900]
//
// PAGE MAP — walk a page top to bottom and record WHAT IS ON SCREEN at each scroll
// position, so a recorded beat can be aimed at the section that matches what the narration
// is saying rather than at a guess.
//
// Owner, 2026-09-10: "I want you to thoroughly go through the webpages and get to know at
// what scroll what is displayed and whether its clearly visible. Then record the exact
// things and add to the videos. Make sure you show the right section about what you are
// speaking must match with what you show in the page."
//
// This is the research counterpart to casting a recorded clip. LAW 0f's corollary — CAST
// THE FOOTAGE BY WATCHING IT, NEVER BY ITS LABEL — was paid for by a beat whose narration
// described a comparison table over footage of a scatter chart. A map of scrollY -> the
// page's own words makes that mistake impossible to make quietly.
//
// For each position it records: the largest heading in view, every heading, and an INK
// measure of how much of the viewport is actually painted, because a section that is
// mostly empty white space is not worth cutting to however good its heading is.
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const [url, outDir, stepArg] = process.argv.slice(2);
if (!url || !outDir) {
  console.error('Usage: node scripts/page-map.mjs <url> <outDir> [stepPx=900]');
  process.exit(2);
}
const STEP = Number(stepArg || 900);
fs.mkdirSync(outDir, {recursive: true});

const browser = await chromium.launch({headless: true});
const ctx = await browser.newContext({
  viewport: {width: 1600, height: 900}, deviceScaleFactor: 2,
  reducedMotion: 'reduce', colorScheme: 'dark',
});
const page = await ctx.newPage();
await page.goto(url, {waitUntil: 'load', timeout: 60000});
await page.waitForTimeout(3500);
for (const sel of ['.ac-gn-cta-close', 'button[aria-label*="Close" i]']) {
  const el = page.locator(sel).first();
  if (await el.count().catch(() => 0)) { await el.click({timeout: 2000}).catch(() => {}); break; }
}
await page.waitForTimeout(800);

const height = await page.evaluate(() => document.body.scrollHeight);
const rows = [];
for (let y = 0; y < height - 400; y += STEP) {
  await page.evaluate((yy) => window.scrollTo({top: yy, behavior: 'instant'}), y);
  await page.waitForTimeout(1100);                       // lazy media + any reveal
  const info = await page.evaluate(() => {
    const vh = window.innerHeight, vw = window.innerWidth;
    const seen = [];
    for (const h of document.querySelectorAll('h1,h2,h3,h4,p,li,figcaption')) {
      const r = h.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh || r.height < 8) continue;
      const t = (h.innerText || '').trim().replace(/\s+/g, ' ');
      if (!t || t.length < 3) continue;
      const size = parseFloat(getComputedStyle(h).fontSize) || 0;
      seen.push({t: t.slice(0, 110), size, tag: h.tagName});
    }
    seen.sort((a, b) => b.size - a.size);
    // How much of the viewport carries anything at all: a section that is 95% empty
    // reads as a blank slide however good its heading is.
    let painted = 0;
    for (const el of document.querySelectorAll('img,video,canvas,svg,picture,h1,h2,h3,p,table')) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh || r.width < 4 || r.height < 4) continue;
      painted += Math.min(r.width, vw) * Math.min(r.height, vh - Math.max(0, r.top));
    }
    return {
      biggest: seen[0]?.t ?? '(nothing)',
      biggestPx: Math.round(seen[0]?.size ?? 0),
      headings: seen.filter((s) => /^H[1-4]$/.test(s.tag)).slice(0, 4).map((s) => s.t),
      ink: Math.min(100, Math.round((painted / (vw * vh)) * 100)),
      media: document.querySelectorAll('video').length,
    };
  });
  const shot = path.join(outDir, `y${String(y).padStart(6, '0')}.png`);
  await page.screenshot({path: shot});
  rows.push({y, ...info, shot: path.basename(shot)});
  console.log(`y=${String(y).padStart(6)}  ink=${String(info.ink).padStart(3)}%  ${info.biggestPx}px  ${info.biggest}`);
}

fs.writeFileSync(path.join(outDir, 'map.json'),
  JSON.stringify({url, height, step: STEP, captured: new Date().toISOString(), rows}, null, 2));
console.log(`\npage height ${height}px · ${rows.length} positions · map.json written`);
await browser.close();
