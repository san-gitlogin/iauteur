#!/usr/bin/env node
// Packages ONE topic into a STANDALONE project: extract → npm install →
// npm run dev → the video is right there. Usage: npm run package -- <slug>
import fs from 'node:fs';
import {execSync} from 'node:child_process';

const slug = process.argv[2];
if (!slug || !fs.existsSync(`topics/${slug}/long.json`)) {
  console.error('Usage: npm run package -- <slug>   (topic must exist and pass lint)');
  process.exit(2);
}
// Gate: never package an unlinted topic
execSync(`node scripts/lint-spec.mjs topics/${slug}/long.json`, {stdio: 'inherit'});
if (fs.existsSync(`topics/${slug}/shorts.json`))
  execSync(`node scripts/lint-spec.mjs topics/${slug}/shorts.json`, {stdio: 'inherit'});

const out = `dist/${slug}-video`;
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});

// engine + design layer (verified code travels as-is)
for (const p of ['src', 'scripts', 'specs', 'tsconfig.json', 'remotion.config.ts', 'PROJECT_RULES.md'])
  if (fs.existsSync(p)) fs.cpSync(p, `${out}/${p}`, {recursive: true});
// this topic only
fs.cpSync(`topics/${slug}`, `${out}/topics/${slug}`, {recursive: true});
// assets: shared assets + this topic's audio
if (fs.existsSync('public/assets')) fs.cpSync('public/assets', `${out}/public/assets`, {recursive: true});
if (fs.existsSync('public/audio')) {
  fs.mkdirSync(`${out}/public/audio`, {recursive: true});
  for (const f of fs.readdirSync('public/audio'))
    if (f.startsWith(slug)) fs.copyFileSync(`public/audio/${f}`, `${out}/public/audio/${f}`);
}
// package.json: same deps, topic-scoped convenience scripts
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.name = `${slug}-video`;
pkg.scripts = {
  dev: 'node scripts/gen-index.mjs && remotion studio',
  lint: 'node scripts/lint-all.mjs',
  typecheck: 'tsc --noEmit',
  'render:wide-dark': `node scripts/render-topic.mjs ${slug} wide-dark`,
  'render:wide-light': `node scripts/render-topic.mjs ${slug} wide-light`,
  'render:short-dark': `node scripts/render-topic.mjs ${slug} short-dark`,
  'render:short-light': `node scripts/render-topic.mjs ${slug} short-light`,
  'render:thumb': `node scripts/render-topic.mjs ${slug} thumb`,
  'render:cover': `node scripts/render-topic.mjs ${slug} cover`,
};
fs.writeFileSync(`${out}/package.json`, JSON.stringify(pkg, null, 2));
// regenerate the index INSIDE the package for just this topic
execSync('node scripts/gen-index.mjs', {cwd: out, stdio: 'inherit'});
fs.writeFileSync(
  `${out}/README.md`,
  `# ${slug} — standalone video project\n\n1. npm install\n2. npm run dev   ← Studio opens; compositions: ${slug}-wide-dark / -wide-light / -short-dark / -short-light + stills\n3. npm run render:wide-dark (or any variant) → topics/${slug}/out/\n\nSelf-contained: engine + this topic only. Edit topics/${slug}/*.json, save — Studio hot-reloads. Run npm run lint after edits.\n`,
);
// zip if a zipper exists (zip on mac/linux, Compress-Archive on Windows)
let zipped = '';
try { execSync(`cd dist && zip -rq ${slug}-video.zip ${slug}-video`, {stdio: 'ignore'}); zipped = `dist/${slug}-video.zip`; }
catch {
  try { execSync(`powershell -Command "Compress-Archive -Force -Path dist/${slug}-video -DestinationPath dist/${slug}-video.zip"`, {stdio: 'ignore'}); zipped = `dist/${slug}-video.zip`; }
  catch { /* folder is still the deliverable */ }
}
console.log(`\n✓ Standalone project: ${out}/${zipped ? `\n✓ Zip: ${zipped}` : ' (zip tool not found — the folder itself is the deliverable)'}\n→ Recipient: extract → npm install → npm run dev → boom.\n`);
