// PHASE A — CONTACT SHEET generator. Tiles rendered matrix stills into HTML sheets
// for bulk triage (open in the browser, screenshot, view). Suspect tiles are then
// drilled at full-res PNG (downscaled montages can HIDE collisions — COMP-1 lesson).
//   node scripts/contact-sheet.mjs <dir> <aspect(wide|vert)> [cols=4] [tag]
import fs from 'node:fs';
import path from 'node:path';

const [dir, aspect = 'wide', cols = '4', tag] = process.argv.slice(2);
const abs = path.resolve(dir);
const scNum = (f) => {const m = f.match(/_sc(\d+)_/); return m ? Number(m[1]) : 1e9;};
const files = fs.readdirSync(abs).filter((f) => f.startsWith(`${aspect}_`) && f.endsWith('.png') && !f.includes('band') && !f.startsWith('mb_')).sort((a, b) => scNum(a) - scNum(b) || a.localeCompare(b));
const label = (f) => f.replace(`${aspect}_`, '').replace('.png', '');
const tiles = files.map((f) => `<figure><img src="file:///${path.join(abs, f).replace(/\\/g, '/')}"><figcaption>${label(f)}</figcaption></figure>`).join('\n');
const html = `<!doctype html><meta charset=utf8><style>
  body{margin:0;background:#0b0b0d;font:12px monospace;color:#ddd}
  .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px}
  figure{margin:0;background:#000;border:1px solid #222}
  img{width:100%;display:block}
  figcaption{padding:3px 5px;color:#8f8;background:#111}
</style><div class=grid>${tiles}</div>`;
const outName = `sheet_${tag || path.basename(abs)}_${aspect}.html`;
const out = path.join(abs, outName);
fs.writeFileSync(out, html);
console.log(out, `(${files.length} tiles, ${cols} cols)`);
