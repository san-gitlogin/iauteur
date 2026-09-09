#!/usr/bin/env node
// PREFLIGHT — every gate that does NOT need audio, run BEFORE a word is voiced.
//
// PAID FOR on Allure chapter 1, and it cost hours: the spec was voiced (101 scenes, ~50
// minutes of TTS), synced, and only then did `check-recordings` — which render-topic runs,
// but nothing before it did — report that eleven clips zoom 3.2x into a master that had
// been downscaled to 1920. The fix was a re-record, which changes every clip length, which
// invalidates the sync, which means re-voicing whatever no longer fits.
//
// Every check below can answer BEFORE the voice exists, where a fix is a rewrite instead of
// an hour of TTS. Voicing a spec that has not passed this is throwing time away.
//
//   node scripts/preflight.mjs <slug>
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const slug = process.argv[2];
if (!slug) { console.error('Usage: node scripts/preflight.mjs <slug>'); process.exit(2); }
const specs = ['long.json', 'shorts.json']
  .map((f) => `topics/${slug}/${f}`)
  .filter((p) => fs.existsSync(p) && (JSON.parse(fs.readFileSync(p, 'utf8')).scenes ?? []).length);

const step = (name, cmd, args) => {
  process.stdout.write(`→ ${name}\n`);
  try {
    execFileSync(cmd, args, {stdio: 'inherit'});
    return true;
  } catch {
    console.error(`\n✗ PREFLIGHT FAILED at: ${name}`);
    console.error('  Fix this BEFORE voicing. After the voice exists the same fix costs a');
    console.error('  re-record or a re-voice, and every clip length it changes cascades.');
    process.exit(1);
  }
};

// 1. the components compile at all
step('typecheck', 'npx', ['tsc', '--noEmit', '-p', '.']);
// 2. the footage exists, is baked, and is sharp enough for the zooms the spec asks for
step('recordings', 'node', ['scripts/check-recordings.mjs', '--quiet', '--slug', slug]);
for (const spec of specs) {
  // 3. every clip fits its beat at the SOLVER's rate, with the voice-rate margin applied
  step(`anchors  ${spec}`, 'node', ['scripts/anchor-spec.mjs', spec]);
  // 4. field budgets, palette, over-reliance, law checks
  step(`lint     ${spec}`, 'node', ['scripts/lint-spec.mjs', spec]);
  // 5. the voice talks about the picture it is standing in front of
  step(`voice/vis ${spec}`, 'node', ['scripts/check-narration-visual.mjs', '--spec', spec]);
}
console.log('\n✓ PREFLIGHT PASSED — safe to voice.');
