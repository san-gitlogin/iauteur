// Download an image/asset the AI is confident about into public/assets/ and
// record its provenance. Usage:
//   node scripts/fetch-asset.mjs <url> <filename> "<source note / license>"
// Only use for sources you are CONFIDENT are free to use (CC0, public domain,
// official press kits, no-attribution stock). The note is stored for audit.
import fs from 'node:fs';
import path from 'node:path';

const [url, name, ...noteParts] = process.argv.slice(2);
if (!url || !name) {
  console.error('Usage: node scripts/fetch-asset.mjs <url> <filename> "<source note>"');
  process.exit(2);
}
const note = noteParts.join(' ') || '(no note)';
const dir = path.resolve('public/assets');
fs.mkdirSync(dir, {recursive: true});

const res = await fetch(url, {redirect: 'follow', headers: {'User-Agent': 'iauteur-asset-fetch'}});
if (!res.ok) {
  console.error(`HTTP ${res.status} for ${url}`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
const dest = path.join(dir, name);
fs.writeFileSync(dest, buf);

const sourcesFile = path.join(dir, 'SOURCES.json');
const rec = fs.existsSync(sourcesFile) ? JSON.parse(fs.readFileSync(sourcesFile, 'utf8')) : [];
rec.push({file: name, url, note, bytes: buf.length, contentType: res.headers.get('content-type'), fetchedAt: new Date().toISOString()});
fs.writeFileSync(sourcesFile, JSON.stringify(rec, null, 2));

console.log(`saved public/assets/${name}  (${buf.length} bytes, ${res.headers.get('content-type')})`);
console.log(`provenance -> public/assets/SOURCES.json`);
