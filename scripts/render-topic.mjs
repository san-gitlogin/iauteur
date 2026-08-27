#!/usr/bin/env node
// Usage: node scripts/render-topic.mjs <slug> <wide-dark|wide-light|short-dark|short-light|thumb|cover>
import {execSync} from 'node:child_process';
import fs from 'node:fs';
const [slug, variant] = process.argv.slice(2);
if (!slug || !variant) { console.error('Usage: node scripts/render-topic.mjs <slug> <variant>'); process.exit(2); }

// Self-heal src/topicsIndex.ts: it statically imports every topics/*/long.json, so a
// topic folder deleted (or added) outside new-topic.mjs leaves dangling imports that
// break bundling for EVERY composition, not just the touched topic.
const folderSlugs = fs.readdirSync('topics')
  .filter((d) => !d.startsWith('_') && fs.existsSync(`topics/${d}/long.json`))
  .sort();
const indexSrc = fs.existsSync('src/topicsIndex.ts') ? fs.readFileSync('src/topicsIndex.ts', 'utf8') : '';
const indexedSlugs = [...indexSrc.matchAll(/\{slug: '([^']+)'/g)].map((m) => m[1]).sort();
if (folderSlugs.join('\n') !== indexedSlugs.join('\n')) {
  console.log('→ src/topicsIndex.ts is out of sync with topics/ — regenerating');
  execSync('node scripts/gen-index.mjs', {stdio: 'inherit'});
}
if (!folderSlugs.includes(slug)) {
  console.error(`✗ topics/${slug}/long.json not found — cannot render "${slug}".`);
  process.exit(1);
}

// A spec that has been REBUILT after syncing silently reverts to estimated
// durations, and the render then plays real audio against timings that were only
// ever a guess. That shipped once: two MCP chapters were re-rendered after a spec
// rebuild and lost 1,723 frames of sync between them. If the spec was voiced, it
// must be re-synced before it is rendered.
{
  const spec = JSON.parse(fs.readFileSync(`topics/${slug}/long.json`, 'utf8'));
  const isVideo = variant.startsWith('wide') || variant.startsWith('short');
  const voiced = fs.existsSync('out/tts') &&
    fs.readdirSync('out/tts').some((f) => f.endsWith('_timestamps.json'));
  const synced = (spec.scenes ?? []).some((sc) => sc.timingSource === 'tts');
  const narrated = (spec.scenes ?? []).some((sc) => (sc.narration ?? '').trim().length > 0);
  if (isVideo && narrated && voiced && !synced) {
    console.error(`✗ topics/${slug}/long.json has narration but no timingSource:"tts".`);
    console.error(`  The spec was rebuilt after voicing, so its durations are estimates and the`);
    console.error(`  audio will drift. Run scripts/sync.mjs against its timestamps, then render.`);
    process.exit(1);
  }
}
const id = `${slug}-${variant}`;
const out = variant === 'thumb' || variant === 'cover'
  ? `topics/${slug}/out/${variant}.png`
  : `topics/${slug}/out/${variant}.mp4`;
// A SPEC WITH AN UNBAKED CLIP MUST NOT RENDER AT ALL.
//
// PAID FOR: a 47-second short rendered end to end as an empty box with the words NOT BAKED
// in the middle of it, because rebuilding the spec from its builder had wiped the bake. The
// render was perfectly happy — RecordedStep draws a placeholder rather than crashing, which
// is right for Studio and wrong for a deliverable. Four minutes of CPU produced a file that
// could never have been used.
//
// check-recordings already knows how to spot it, so the render asks it first. Skipped for
// thumb/cover, which draw no footage.
if (variant !== 'thumb' && variant !== 'cover') {
  try {
    execSync('node scripts/check-recordings.mjs --quiet', {stdio: 'inherit'});
  } catch {
    console.error('');
    console.error('REFUSING TO RENDER: the spec references footage it has not baked.');
    console.error('Rendering it would produce a placeholder, not a video. Fix the above first.');
    process.exit(1);
  }
}

// CALL THE CLI DIRECTLY, NOT THROUGH npx.
//
// PAID FOR: `npx remotion render` died on this machine with
//   npm error ERR_INVALID_PACKAGE_CONFIG
//   Invalid package config <UNC-prefixed path to npm's own libnpmexec/package.json>
// after `npx remotion bundle` had worked minutes earlier in the same shell. npx is a
// resolver we do not need: the CLI is a dependency, its path is known, and `node <path>`
// has no npm layer to be broken by. One less moving part between a finished spec and a file.
const REMOTION_CLI = 'node_modules/@remotion/cli/remotion-cli.js';
const cmd = variant === 'thumb' || variant === 'cover'
  ? `node ${REMOTION_CLI} still ${id} ${out}`
  : `node ${REMOTION_CLI} render ${id} ${out}`;
console.log('→ ' + cmd);
execSync(cmd, {stdio: 'inherit'});

// Every rendered video ships with its YouTube title + description (out/upload.md),
// assembled in the channel's house pattern from the spec + meta.seo.
if (variant !== 'thumb' && variant !== 'cover') {
  execSync(`node scripts/gen-upload-kit.mjs ${slug}`, {stdio: 'inherit'});
}
