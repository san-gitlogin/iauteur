// Shift every chapter stamp in topics/<slug>/out/upload.md by N seconds and add "00:00 - Disclaimer".
//   node briefs/agent-reach/shift-chapters.mjs <slug> <seconds>
import fs from 'node:fs';
const [slug, sec] = process.argv.slice(2);
const f = `topics/${slug}/out/upload.md`;
const add = Math.round(Number(sec));
let s = fs.readFileSync(f, 'utf8');
if (s.includes(' - Disclaimer')) { console.log('already shifted'); process.exit(0); }
const fmt = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
let n = 0;
s = s.replace(/^(\d{2}):(\d{2}) - (.+)$/gm, (_, m, x, label) => { n++; return `${fmt(Number(m) * 60 + Number(x) + add)} - ${label}`; });
s = s.replace(/^(\d{2}:\d{2} - )/m, `00:00 - Disclaimer\n$1`);
fs.writeFileSync(f, s);
console.log(`shifted ${n} chapter(s) by ${add}s`);
