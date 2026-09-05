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
// ── AND THE LINTER IS THE JUDGE, SO THE RENDER HAS TO ASK IT ────────────────────────
//
// CLAUDE.md has said "NOTHING renders until it passes" since the linter existed, and
// nothing enforced it: this script asked check-recordings and check-sync and never once
// ran lint-spec. A spec the linter REJECTED rendered end to end, silently, and produced a
// deliverable-looking mp4.
//
// Caught in the act: `topics/claude-fable-5-1/shorts.json` was rejected for a pinned card
// aspect and `npm run render -- claude-fable-5-1 short-dark` wrote a 5.7MB file anyway. A
// law that only exists in a document is a habit, not a gate — and habits are exactly what
// this repo keeps paying for. Scoped to the ONE spec being rendered, so the back
// catalogue's accumulated errors cannot block today's work.
const specFor = variant.startsWith('short') ? 'shorts.json' : 'long.json';
const specPath = `topics/${slug}/${specFor}`;
if (fs.existsSync(specPath)) {
  try {
    execSync(`node scripts/lint-spec.mjs ${specPath}`, {stdio: 'inherit'});
    // …and does the DESIGN PACK this spec picked actually draw the fields it sets? A pack
    // replaces the core component, so a field it forgets is authored, voiced around, and
    // never seen. Scoped to this spec's own pack, types and values, so it is always
    // actionable (scripts/check-field-use.mjs).
    execSync(`node scripts/check-field-use.mjs --quiet --spec ${specPath}`, {stdio: 'inherit'});
  } catch {
    console.error('');
    console.error(`REFUSING TO RENDER: ${specPath} did not pass its pre-render checks.`);
    console.error('The linter is the judge (CLAUDE.md, Law 5) — fix the spec, not the rule.');
    process.exit(1);
  }
}

if (variant !== 'thumb' && variant !== 'cover') {
  try {
    execSync(`node scripts/check-recordings.mjs --quiet --slug ${slug}`, {stdio: 'inherit'});
    // DOES THE VOICE TALK ABOUT THIS PICTURE? Owner, 2026-09-05: *"the last video we did on
    // MCP had too many places where the voice does not speak whats shown in the video."*
    // Every other gate checks WHEN a thing lands, never WHETHER it is the thing being
    // discussed, so this shipped repeatedly while lint, sync and holds were all green.
    execSync(`node scripts/check-narration-visual.mjs --spec ${specPath}`, {stdio: 'inherit'});
    // Same question, for the voice: are this cut's anchors real word times or estimates?
    execSync(`node scripts/check-sync.mjs --quiet --slug ${slug}`, {stdio: 'inherit'});
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

// CONCURRENCY IS A DISK SETTING, NOT ONLY A SPEED ONE.
//
// PAID FOR (2026-09-05): a 19-minute cut carrying 4800px browser footage died twice, both
// times with Remotion's own diagnosis — *"Chrome rejecting the request because the disk space
// is low"* — on a machine sitting at 99% full. Every concurrent worker is a Chrome tab holding
// its own decoded frames, so peak scratch scales with the worker count. Halving concurrency
// roughly halves the peak and costs wall-clock time, which is the correct trade when the
// alternative is no file at all.
//
// RENDER_CONCURRENCY overrides it; unset means Remotion's default (one worker per core).
const conc = process.env.RENDER_CONCURRENCY ? ` --concurrency=${process.env.RENDER_CONCURRENCY}` : '';
const cmd = variant === 'thumb' || variant === 'cover'
  ? `node ${REMOTION_CLI} still ${id} ${out}`
  : `node ${REMOTION_CLI} render ${id} ${out}${conc}`;
console.log('→ ' + cmd);
execSync(cmd, {stdio: 'inherit'});

// Every rendered video ships with its YouTube title + description (out/upload.md),
// assembled in the channel's house pattern from the spec + meta.seo.
if (variant !== 'thumb' && variant !== 'cover') {
  execSync(`node scripts/gen-upload-kit.mjs ${slug}`, {stdio: 'inherit'});
}
