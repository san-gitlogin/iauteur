#!/usr/bin/env node
// WHICH SCENES NEED RE-VOICING? — compares the spec's narration against the hash stored
// when each scene was last spoken.
//
// PAID FOR on Allure chapter 1: narration was corrected while a 50-minute TTS run was in
// flight, and the only way to find the affected scenes was to compare word counts — which
// flags tokenisation noise (231 vs 234 for an unchanged line) and misses a rewrite of the
// same length. Both mistakes cost a full re-voice to be safe.
//
//   node scripts/voice-diff.mjs topics/<slug>/long.json out/tts/<prefix>_timestamps.json
//
// prints the ONLY= list for scripts/voiceover.py, or nothing when the audio is current.
import fs from 'node:fs';
import crypto from 'node:crypto';

const [specPath, tsPath] = process.argv.slice(2);
if (!specPath || !tsPath) {
  console.error('Usage: node scripts/voice-diff.mjs <spec> <timestamps>');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const ts = fs.existsSync(tsPath) ? JSON.parse(fs.readFileSync(tsPath, 'utf8')) : {};
const sha = (t) => crypto.createHash('sha1').update(t.trim().split(/\s+/).join(' ')).digest('hex').slice(0, 12);

const stale = [];
const noHash = [];
for (const s of spec.scenes ?? []) {
  const got = ts[s.id];
  if (!got) { stale.push(s.id); continue; }
  if (!got.sha) { noHash.push(s.id); continue; }
  if (got.sha !== sha(s.narration ?? '')) stale.push(s.id);
}
if (noHash.length) {
  console.error(`note: ${noHash.length} scene(s) were voiced before hashes were recorded —`);
  console.error(`      they cannot be checked. Re-voice them once to make this exact.`);
}
if (!stale.length) { console.log('# audio is current — nothing to re-voice'); process.exit(0); }
console.log(stale.join(','));
