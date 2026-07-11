#!/usr/bin/env node
// Scaffolds a new topic folder + regenerates the index. NOTHING is ever overwritten.
// Usage: node scripts/new-topic.mjs <kebab-slug> "Topic title"
import fs from 'node:fs';
import {execSync} from 'node:child_process';

const [slug, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ') || slug;
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Usage: node scripts/new-topic.mjs <kebab-slug> "Topic title"');
  process.exit(2);
}
const dir = `topics/${slug}`;
if (fs.existsSync(dir)) {
  console.error(`✗ ${dir} already exists — pick a new slug (topics are immutable).`);
  process.exit(1);
}
fs.mkdirSync(`${dir}/out`, {recursive: true});
const stub = (format) => ({
  meta: {topic: title, format, fps: 30, onePayoff: 'TODO', openLoop: 'TODO', analogy: 'TODO'},
  brand: {theme: 'CHOOSE_DARK_THEME', channel: 'TODO'},
  ...(format === 'long' ? {thumbnail: {title: 'TODO', badge: 'TODO', asset: 'lucide:sparkles'}} : {cover: {title: 'TODO', badge: 'TODO', asset: 'lucide:sparkles', frames: 2}}),
  scenes: [],
});
fs.writeFileSync(`${dir}/long.json`, JSON.stringify(stub('long'), null, 2));
fs.writeFileSync(`${dir}/shorts.json`, JSON.stringify(stub('short'), null, 2));
execSync('node scripts/gen-index.mjs', {stdio: 'inherit'});
console.log(`✓ ${dir}/ scaffolded (long.json, shorts.json, out/). Fill scenes, then: node scripts/lint-spec.mjs ${dir}/long.json`);
