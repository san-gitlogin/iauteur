#!/usr/bin/env node
// Converts ESTIMATED timing into REAL TTS timing — the sync step.
// Word anchors become exact frames (stored as fractional atWord so components
// need zero changes: wordToFrame((frame/12)+1) === frame).
// Usage: node scripts/sync.mjs specs/long.json out/tts/long_timestamps.json long
import fs from 'node:fs';

const [specPath, tsPath, prefix] = process.argv.slice(2);
if (!specPath || !tsPath || !prefix) {
  console.error('Usage: node scripts/sync.mjs <spec.json> <timestamps.json> <prefix>');
  process.exit(2);
}
const FPS = 30, FPW = 12;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));

const retarget = (obj, words) => {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    // `atWord` plus suffixed variants (heroAtWord, headlineAtWord…) — all are
    // word anchors read via wordToFrame, so all must be retargeted to real audio.
    if (/atword$/i.test(k) && typeof v === 'number') {
      const idx = Math.min(Math.max(1, Math.round(v)), words.length) - 1;
      const frame = Math.round(words[idx] * FPS);
      obj[k] = +(frame / FPW + 1).toFixed(3); // fractional anchor = exact frame
    } else retarget(v, words);
  }
};

// The deepest frame any anchored element starts animating at in this scene.
const maxAnchorFrame = (obj) => {
  let m = 0;
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (/atword$/i.test(k) && typeof v === 'number') m = Math.max(m, (v - 1) * FPW);
      else walk(v);
    }
  };
  walk(obj);
  return m;
};

// How many DISTINCT anchored elements this scene steps through. A stepping scene
// (CODE_RUN, BROWSER_STEP, CHANGE_RIPPLE…) is not static, so its settle cap is
// earned rather than flat — see the STATIC-SCENE GUARD note in lint-spec.mjs.
const anchorCount = (obj) => {
  const seen = new Set();
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (/atword$/i.test(k) && typeof v === 'number') seen.add(v);
      else walk(v);
    }
  };
  walk(obj);
  return seen.size;
};

// SETTLE TAIL (2026-07-18): a payoff anchored to a late word used to animate into
// a 10-frame tail — the reveal got cut mid-draw with zero processing time. Every
// scene now ends no earlier than lastAnchor + SETTLE frames (animation ~45f + the
// human beat to absorb it), capped so a late anchor can't stretch a scene past its
// pacing budget (HOOK ≤8s, any scene ≤16s). The real fix for a very late anchor is
// naming the payoff earlier in the narration — the linter now flags that.
const SETTLE = 75; // 2.5s @30fps
for (const scene of spec.scenes) {
  const t = ts[scene.id];
  if (!t) { console.warn(`! no timestamps for ${scene.id}, keeping estimate`); continue; }
  // Only retarget anchors when we actually have per-word times — otherwise
  // words[idx] is undefined and every anchor would become NaN → null.
  // Walk the WHOLE scene, not just `data`: scene-level layers carry anchors too
  // (stepRail, pip). Retargeting only `data` left those anchors as raw word
  // indices while every other anchor became an exact frame — the same class of
  // bug that silently emptied WORD_ANCHOR_RAIL after a sync.
  if (Array.isArray(t.words) && t.words.length) retarget(scene, t.words);
  else console.warn(`! ${scene.id}: no word times, keeping anchors (duration still synced)`);
  const base = Math.ceil(t.duration * FPS) + 10;
  // The cap only limits how far a LATE anchor may stretch a scene past its audio —
  // `base` below always wins, so a long read is never truncated. Amended 2026-08-15:
  // a stepping scene earns 4s per anchored element (matching lint-spec.mjs's
  // sceneCeiling), so the last taught line of a 6-line CODE_RUN still gets its settle.
  const steps = anchorCount(scene);
  const cap = scene.type === 'HOOK' ? 240 : steps < 2 ? 480 : Math.max(480, Math.min(900, 120 * steps + 120));
  // ceil: anchors are fractional frames after retargeting; durationFrames must be an integer.
  const settled = Math.min(Math.ceil(maxAnchorFrame(scene)) + SETTLE, cap);
  scene.durationFrames = Math.max(base, settled);
  scene.audio = `audio/${prefix}_${scene.id}.mp3`;
  scene.timingSource = 'tts';
}
fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
console.log(`✓ ${specPath} re-timed from real audio (${Object.keys(ts).length} scenes). Lint, then Studio.`);
