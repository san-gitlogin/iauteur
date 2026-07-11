#!/usr/bin/env node
// Usage: node scripts/render-topic.mjs <slug> <wide-dark|wide-light|short-dark|short-light|thumb|cover>
import {execSync} from 'node:child_process';
const [slug, variant] = process.argv.slice(2);
if (!slug || !variant) { console.error('Usage: node scripts/render-topic.mjs <slug> <variant>'); process.exit(2); }
const id = `${slug}-${variant}`;
const out = variant === 'thumb' || variant === 'cover'
  ? `topics/${slug}/out/${variant}.png`
  : `topics/${slug}/out/${variant}.mp4`;
const cmd = variant === 'thumb' || variant === 'cover'
  ? `npx remotion still ${id} ${out}`
  : `npx remotion render ${id} ${out}`;
console.log('→ ' + cmd);
execSync(cmd, {stdio: 'inherit'});
