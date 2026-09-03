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

// How far BEFORE its spoken word an anchored element starts animating, in frames.
// 12f = 0.4s: enough for the eye to catch the change and land on it as the voice
// arrives, small enough that the motion still feels caused by the sentence.
const LEAD = 12;

const retarget = (obj, words) => {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    // `atWord` plus suffixed variants (heroAtWord, headlineAtWord…) — all are
    // word anchors read via wordToFrame, so all must be retargeted to real audio.
    // AN ANCHOR CAN BE A LIST. `highlightAtWords` on DATABASE_TABLE is parallel to
    // `highlight`, one word per lit row — and the scalar test below skips arrays, so the
    // list would have survived sync as raw WORD indices while every other anchor in the
    // scene became a frame. The component calls wordToFrame() on whatever it finds, so the
    // rows would have lit at arbitrary moments with nothing failing anywhere. Handled
    // here, once, for any `…AtWords` key rather than for this one field.
    if (/atwords$/i.test(k) && Array.isArray(v) && v.every((x) => typeof x === 'number')) {
      obj[k] = v.map((n) => {
        const idx = Math.min(Math.max(1, Math.round(n)), words.length) - 1;
        const frame = Math.max(0, Math.round(words[idx] * FPS) - LEAD);
        return +(frame / FPW + 1).toFixed(3);
      });
    } else if (/atword$/i.test(k) && typeof v === 'number') {
      const idx = Math.min(Math.max(1, Math.round(v)), words.length) - 1;
      // LEAD (owner, 2026-08-16): *"the moment something changes on screen you start
      // to speak… the voice just starts to speak as quickly as possible just after the
      // animation changes something within the scene."* Anchors used to land on the
      // EXACT frame their word is spoken, so the element and the sentence about it
      // fired together and the eye never got to register the change first.
      // Pulling each anchor ~0.4s earlier means the motion STARTS, the viewer sees it,
      // and the voice arrives on it mid-animation. Clamped at 0 so an anchor early in
      // the read cannot go negative.
      const frame = Math.max(0, Math.round(words[idx] * FPS) - LEAD);
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

// BREATH (owner, 2026-08-16: *"the pause between sentences matters — just adjust a
// tiny bit"*). Measured on a finished 20-scene episode: EVERY scene ended 0.34s
// after its last word, because `base` was audio + 10 frames and `base` always wins
// over the settle path. So the voice stopped, a third of a second passed, the visual
// cut to something completely new — and the voice was already talking again. Twenty
// times out of twenty. No breath anywhere in the cut.
//
// This is the gap at a SCENE BOUNDARY, so it is doing two jobs at once: letting the
// last sentence land, and giving the eye a moment on the new picture before the next
// sentence starts. 22 frames is deliberately small — a beat, not a silence. Raising
// it further starts to read as dead air, which costs more than it buys.
// VERDICT (owner, same day): the SCENE-BOUNDARY gap was never the problem — "between
// scene changes the gap you give is fine". The missing pause is BETWEEN SENTENCES
// INSIDE one scene, which is a text/TTS concern, not a duration one. Left at 10.
const BREATH = 10; // 0.33s @30fps
for (const scene of spec.scenes) {
  const t = ts[scene.id];
  if (!t) { console.warn(`! no timestamps for ${scene.id}, keeping estimate`); continue; }
  // Only retarget anchors when we actually have per-word times — otherwise
  // words[idx] is undefined and every anchor would become NaN → null.
  // Walk the WHOLE scene, not just `data`: scene-level layers carry anchors too
  // (stepRail, pip). Retargeting only `data` left those anchors as raw word
  // indices while every other anchor became an exact frame — the same class of
  // bug that silently emptied WORD_ANCHOR_RAIL after a sync.
  // IDEMPOTENCE GUARD (2026-08-16). After a sync, `atWord` no longer holds a word
  // index — it holds a FRAME, encoded as frame/FPW+1 so components need no changes.
  // Re-running sync read that number back as a word index and retargeted from it:
  // measured 41 of 47 anchors silently corrupted on a second pass, with the spec
  // still linting clean and the runtime unchanged, so nothing surfaced it.
  // `timingSource` already records the state; a rebuild clears it, which is exactly
  // the legitimate build -> voiceover -> sync loop.
  if (scene.timingSource === 'tts') {
    console.warn(`! ${scene.id}: already synced — anchors left alone (re-run build.mjs first if you meant to re-time)`);
  } else if (Array.isArray(t.words) && t.words.length) retarget(scene, t.words);
  else console.warn(`! ${scene.id}: no word times, keeping anchors (duration still synced)`);
  const base = Math.ceil(t.duration * FPS) + BREATH;
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
