// probe-artifact-ui.mjs — run the artifact's own search, then report EVERY copy of the needle
// with its rectangle, in the same reader order the recorder's resolver walks. The camera must
// frame the node the product highlighted, not the first string that happens to match.
//
//   node scripts/probe-artifact-ui.mjs <page.html|url> [needle]
import {createRequire} from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');

const [file, needle = 'sync.mjs'] = process.argv.slice(2);
const url = 'file:///' + path.resolve(file).replace(/\\/g, '/');
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
await page.goto(url, {waitUntil: 'load'});
await page.waitForTimeout(2500);

// Drive it exactly like the take: '/', type, Enter.
await page.keyboard.press('Slash');
await page.waitForTimeout(900);
await page.keyboard.type('sync.mjs', {delay: 90});
await page.waitForTimeout(1200);
await page.keyboard.press('Enter');
await page.waitForTimeout(3000);

const copies = await page.evaluate((n) => {
  const out = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const node = walk.currentNode;
    const text = (node.nodeValue || '').replace(/\s+/g, ' ');
    if (!text.includes(n)) continue;
    const r = document.createRange();
    r.selectNodeContents(node);
    const b = r.getBoundingClientRect();
    const el = node.parentElement;
    const visible = b.width > 1 && b.height > 1 && b.bottom > 0 && b.top < innerHeight;
    out.push({
      text: text.trim().slice(0, 60),
      x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
      visible,
      tag: el?.tagName,
      cls: (el?.getAttribute('class') || '').slice(0, 48),
      parent: (el?.parentElement?.getAttribute('class') || '').slice(0, 48),
      opacity: el ? getComputedStyle(el).opacity : '',
    });
  }
  return out;
}, needle);

copies.forEach((c, i) => console.log(
  `copy ${i + 1}  y=${String(c.y).padStart(4)} x=${String(c.x).padStart(4)} ${c.w}x${c.h}  ` +
  `vis=${c.visible} op=${c.opacity} <${c.tag} class="${c.cls}"> parent="${c.parent}"  "${c.text}"`));

// What the page itself marks as focused/selected after the search.
const focus = await page.evaluate(() => {
  const hits = [];
  for (const el of document.querySelectorAll('[class*="focus"],[class*="active"],[class*="selected"],[data-focus],[aria-selected="true"]')) {
    const b = el.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) continue;
    hits.push({cls: (el.getAttribute('class') || '').slice(0, 60), tag: el.tagName,
      x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50)});
  }
  return hits.slice(0, 12);
});
console.log('\n--- elements the page marks focused/active/selected ---');
for (const f of focus) console.log(`  <${f.tag} class="${f.cls}"> ${f.x},${f.y} ${f.w}x${f.h}  "${f.text}"`);

await page.screenshot({path: 'out/rec-proof/probe-after.png'});
await browser.close();
