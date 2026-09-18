// THROWAWAY — validate mark needles the way the resolver does: the needle must land in ONE
// line box (a Range with a single client rect), inside a block that fits the viewport.
import fs from 'node:fs';
import {chromium} from 'playwright';
const demo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const vp = demo.viewport ?? {width: 1600, height: 900};
const b = await chromium.launch({headless: true});
const p = await b.newPage({viewport: vp});
await p.goto(demo.prep.url, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {});
await p.waitForTimeout(demo.prep.settleMs ?? 3000);
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 700) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(180); }
let bad = 0;
for (const st of demo.steps ?? []) {
  for (const m of st.marks ?? []) {
    const r = await p.evaluate(({needle, vh}) => {
      const out = [];
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walk.nextNode())) {
        const raw = node.nodeValue || '';
        const i = raw.replace(/\s+/g, ' ').indexOf(needle);
        if (i < 0) continue;
        // map the collapsed index back onto the raw text
        let seen = 0, start = -1;
        const coll = raw.replace(/\s+/g, ' ');
        for (let k = 0, c = 0; k < raw.length; k++) {
          const isWs = /\s/.test(raw[k]);
          if (isWs && k > 0 && /\s/.test(raw[k - 1])) continue;
          if (c === i) { start = k; break; }
          c++;
        }
        if (start < 0) start = raw.indexOf(needle);
        if (start < 0) continue;
        const rg = document.createRange();
        try { rg.setStart(node, start); rg.setEnd(node, Math.min(raw.length, start + needle.length)); } catch { continue; }
        const rects = rg.getClientRects();
        const par = node.parentElement?.getBoundingClientRect();
        out.push({rects: rects.length, blockH: Math.round(par?.height ?? 0), tag: node.parentElement?.tagName});
      }
      return out;
    }, {needle: m.text, vh: vp.height});
    const good = r.filter((x) => x.rects === 1 && x.blockH <= vp.height - 60);
    const ok = good.length > 0;
    if (!ok) bad++;
    console.log(ok ? '  ok  ' : '  ✗   ', `${st.id}/${m.id}`.padEnd(18),
      ok ? `single line box, block ${good[0].blockH}px (${good[0].tag})`
         : (r.length
             ? `${r.length} copy/copies, none usable: ${r.map(x => `${x.rects} line box(es)/${x.blockH}px`).join(', ')}`
             : 'NOT FOUND'),
      ok ? '' : `:: "${m.text}"`);
  }
}
console.log(bad ? `\n${bad} mark(s) would fail the take` : '\nevery mark resolves in one line box');
await b.close();
