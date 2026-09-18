// LIST NEEDLES — every text run on a page that a mark could actually use.
//
//   node scripts/list-needles.mjs <url> [filter]
//
// Prints y position, block height and text for each run that is ONE text node in ONE line box.
// Author mark needles from this list rather than from the page's HTML: the DOM's text and the
// rendered text disagree more often than you would think (on typesafe.ai the FAQ questions are
// lowercase in the DOM and uppercased by CSS, so every capitalised needle missed).
import {chromium} from 'playwright';
const url = process.argv[2];
const filter = (process.argv[3] || '').toLowerCase();
const b = await chromium.launch({headless: true});
const p = await b.newPage({viewport: {width: 1600, height: 900}});
await p.goto(url, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {});
await p.waitForTimeout(4000);
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 700) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(160); }
const rows = await p.evaluate(() => {
  const out = []; const seen = new Set();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walk.nextNode())) {
    const txt = (node.nodeValue || '').replace(/\s+/g, ' ').trim();
    if (txt.length < 4 || txt.length > 120) continue;
    const rg = document.createRange(); rg.selectNodeContents(node);
    const rects = rg.getClientRects();
    if (rects.length !== 1) continue;
    const r = rects[0];
    if (r.width < 10 || r.height < 6) continue;
    const par = node.parentElement;
    const ph = Math.round(par?.getBoundingClientRect().height ?? 0);
    if (ph > 840) continue;
    if (seen.has(txt)) continue; seen.add(txt);
    out.push({y: Math.round(r.top + window.scrollY), txt, ph});
  }
  return out.sort((a, c) => a.y - c.y);
});
for (const r of rows) if (!filter || r.txt.toLowerCase().includes(filter)) console.log(String(r.y).padStart(6), String(r.ph).padStart(4) + 'px ', r.txt);
await b.close();
