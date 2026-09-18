// THROWAWAY — print what a page actually shows, in reader order, with positions.
import {chromium} from 'playwright';
const url = process.argv[2];
const b = await chromium.launch({headless: true});
const p = await b.newPage({viewport: {width: 1600, height: 900}});
await p.goto(url, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {});
await p.waitForTimeout(3500);
// full-page scroll so lazy Framer sections mount
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 700) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(220); }
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
const rows = await p.evaluate(() => {
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,li,span,div,video,img')) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (el.children.length > 0 && !['VIDEO','IMG'].includes(el.tagName)) continue;
    const tag = el.tagName;
    let txt = (el.innerText || '').replace(/\s+/g, ' ').trim();
    if (tag === 'VIDEO') txt = `<video src=${(el.getAttribute('src')||'').slice(-28)} autoplay=${el.autoplay} loop=${el.loop}>`;
    if (tag === 'IMG') { const s = el.currentSrc || el.src || ''; if (!/\.gif/i.test(s)) continue; txt = `<gif ${s.slice(-34)}>`; }
    if (!txt || txt.length > 150) continue;
    const key = tag + txt;
    if (seen.has(key)) continue; seen.add(key);
    out.push({y: Math.round(r.top + window.scrollY), tag, txt});
  }
  return out.sort((a, b2) => a.y - b2.y);
});
for (const r of rows) console.log(String(r.y).padStart(6), r.tag.padEnd(6), r.txt);
console.log('--- page height', H);
await b.close();
