#!/usr/bin/env node
// CHECK-SYNC — are the word timings REAL, or evenly-spaced guesses?
//
// WHY THIS EXISTS. `voiceover.py` asks edge-tts for word boundaries and falls back to
// spreading words evenly across the scene when none arrive. The fallback is correct as a
// last resort and catastrophic as a default — and it WAS the default, for the entire back
// catalogue, because edge-tts's `boundary` parameter defaults to "SentenceBoundary" and no
// WordBoundary event is ever sent unless you ask. Nothing said so. The symptom reached the
// owner as *"your sync of voice narration with highlight is somewhat lacking, and I am not
// able to follow as a viewer"* — every anchor in every video landing on an estimate rather
// than on the word being spoken.
//
// The tell is arithmetic and unmistakable: real speech never spaces its words evenly.
// Measured on one scene before the fix: 14 words at a uniform 0.432s apart. After:
// 0.243 / 0.336 / 0.694 / 0.347 / 0.081.
//
// Usage: node scripts/check-sync.mjs [--quiet]
import fs from 'node:fs';
import path from 'node:path';

const quiet = process.argv.includes('--quiet');
// --slug <slug> scopes the check to ONE topic, and makes it FATAL. Repo-wide it is a
// notice, for the same reason check-recordings is: out/tts/ accumulates timestamp files
// for every video ever voiced on this machine, including cuts that shipped long ago on the
// old estimated timings. Failing the gate on those would make it permanently red, and a
// gate you learn to ignore is worse than no gate (docs/STATE.md, check-fresh). What IS
// actionable is the topic you are about to render — so render-topic asks about that one.
const slugArg = (() => {
  const i = process.argv.indexOf('--slug');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const DIR = 'out/tts';
if (!fs.existsSync(DIR)) {
  if (!quiet) console.log('SYNC CHECK: no out/tts — nothing voiced on this machine.');
  process.exit(0);
}

let files = fs.readdirSync(DIR).filter((f) => f.endsWith('_timestamps.json'));
if (slugArg) files = files.filter((f) => f.startsWith(`${slugArg}_`));
const bad = [];
let scanned = 0;

for (const f of files) {
  let doc;
  try { doc = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  const flat = [];
  for (const [sid, v] of Object.entries(doc)) {
    const w = v?.words;
    if (!Array.isArray(w) || w.length < 4) continue;   // too short to judge
    scanned++;
    const gaps = [];
    for (let i = 1; i < w.length; i++) gaps.push(Number((w[i] - w[i - 1]).toFixed(4)));
    // Evenly spaced == at most a couple of distinct gaps across the whole scene. Real
    // speech produces almost as many distinct gaps as it has words.
    if (new Set(gaps).size <= 2) flat.push(sid);
  }
  if (flat.length) bad.push({file: f, scenes: flat});
}

if (!quiet) {
  console.log(`SYNC CHECK: ${files.length} timestamp file(s), ${scanned} scene(s) with word timings.`);
}

if (bad.length && !slugArg) {
  console.error(`\nNOTE: ${bad.length} timestamp file(s) still carry evenly-spaced word timings.`);
  for (const b of bad) console.error(`  • ${b.file} (${b.scenes.length} scene(s))`);
  console.error('Those were voiced before voiceover.py asked for WordBoundary events, so their');
  console.error('anchors are estimates. This does NOT fail the gate — the cuts already shipped —');
  console.error('but re-voice and re-sync before re-rendering any of them.');
}

if (bad.length && slugArg) {
  console.error('\n✗ SYNC CHECK FAILED — evenly-spaced word timings found:');
  for (const b of bad) {
    console.error(`  • ${b.file}: ${b.scenes.length} scene(s) — ${b.scenes.slice(0, 6).join(', ')}` +
      (b.scenes.length > 6 ? ' …' : ''));
  }
  console.error('\nThose scenes were voiced WITHOUT real word boundaries, so every atWord in');
  console.error('them is an estimate and the highlights will not land on the words. Re-voice:');
  console.error('  python3 scripts/voiceover.py topics/<slug>/long.json <prefix>');
  console.error('  node scripts/sync.mjs topics/<slug>/long.json out/tts/<prefix>_timestamps.json <prefix>');
  console.error('and check voiceover.py still passes boundary="WordBoundary" to edge_tts.Communicate.');
  process.exit(1);
}

if (!quiet) console.log('✓ SYNC CHECK PASSED (word timings are real, not evenly spaced)');
