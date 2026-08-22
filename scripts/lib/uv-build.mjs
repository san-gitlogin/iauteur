// UV COURSE — the shared build harness for all fourteen chapters.
//
// Every chapter's `build.mjs` is a list of beats and nothing else. Duration and every
// anchor are COMPUTED from the narration here, so pacing cannot drift by hand-editing
// three hundred scenes across fourteen files, and a fix to the pacing model is one edit
// rather than fourteen.
//
// WHY A SHARED HARNESS AND NOT FOURTEEN COPIES. The Playwright series carries the same
// twenty-line preamble in every topic's build.mjs; when the frames-per-word estimate was
// re-measured, only the episode being worked on got the new number. A course is not a
// concatenation of videos, and its build rig should not be one either.
//
// The channel name and logo come from the gitignored `.env` via `scripts/lib/env.mjs`.
// They are NEVER written literally into a builder: this repo is public, and a literal
// would put the owner's brand into every fork.
import fs from 'node:fs';
import {MANIFEST} from './manifest.mjs';
import {channelName, channelLogo} from './env.mjs';

// 9.5 frames per word, measured against real Ava audio on the Playwright cut, where the
// repo's generic 12 over-estimated by ~25% (5.60 min predicted, 4.46 delivered). The
// estimate matters before sync because the linter judges pacing on it; `sync.mjs`
// overwrites every duration from the real audio afterwards.
export const FPW = 9.5;
export const PAD = 30;

export const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/** Anchor at a fraction of the narration, clamped into the first 70% (LAW 8): an
 *  element that lands on the last word of a sentence reads as arriving late. */
export const anchorAt = (n, frac) => Math.max(1, Math.min(Math.round(n * frac), Math.floor(n * 0.7)));

/**
 * A chapter under construction.
 *
 * `add(type, transition, background, narration, mk)` appends one beat. `mk(A, n)`
 * receives the anchor helper and the word count and returns the scene's DATA BODY —
 * which is wrapped in the manifest's `data_key` here rather than per scene, because
 * writing those fields at the top level renders an empty scene that still passes lint.
 */
export function chapter({fps = 30} = {}) {
  const S = [];
  const add = (type, transition, background, narration, mk = () => ({}), opts = {}) => {
    const n = words(narration);
    const A = (f) => anchorAt(n, f);
    const key = MANIFEST[type]?.data_key;
    const body = mk(A, n) ?? {};
    const sc = {
      // positional ids, so a beat can be inserted without renumbering fourteen files
      id: 's' + String(S.length + 1).padStart(2, '0'),
      type, transition, background, narration,
      data: key ? {[key]: body} : body,
      durationFrames: Math.max(60, Math.round(n * FPW + PAD)),
    };
    // The HOOK is capped at 8s by the linter, and the check runs AFTER sync — so a hook
    // that is two words too long is only discovered once the whole chapter has been
    // voiced, and fixing it costs another full TTS pass. Measured on chapter 00: 21 words
    // of Ava audio is 8.2s, including the breath sync adds. 15 is the safe ceiling.
    if (type === 'HOOK' && n > 15) {
      console.error(`✗ ${sc.id}: HOOK is ${n} words — real Ava audio runs past the 8s cap above ~15. Cut it now, not after the voiceover.`);
      process.exitCode = 1;
    }
    // A near-silent beat (LAW 0e r.4) declares its own hold: two or three seconds of
    // stillness on a real artefact is a teaching device, not dead air. Note that
    // `sync.mjs` recomputes every duration from the audio afterwards, so a hold survives
    // only if the beat's last anchor sits late in its (short) line.
    if (opts.holdFrames) sc.durationFrames = opts.holdFrames;
    if (opts.fx) sc.fx = opts.fx;
    S.push(sc);
    return sc;
  };

  /** A UV_STAGE beat. Kept as its own helper because every one of them needs the same
   *  four things spelled out and it is the type the course leans on hardest. */
  const uv = (transition, background, narration, mk, opts) =>
    add('UV_STAGE', transition, background, narration, mk, opts);

  const brand = () => ({
    theme: 'terminalcli', themeLight: 'paper', design: 'terminalcli',
    // LAW 0h — the background must not move. `plain` is the only one that holds
    // perfectly still behind a terminal, and a moving field behind mono text is the
    // fastest way to make a tutorial unreadable.
    background: 'plain',
    channel: channelName(), logo: channelLogo(),
  });

  const emit = (url, spec) => {
    fs.writeFileSync(url, JSON.stringify(spec, null, 2));
    const total = S.reduce((a, s) => a + s.durationFrames, 0);
    const mins = total / fps / 60;
    console.log(`${S.length} scenes · ${total} frames · ${mins.toFixed(2)} min (pre-sync estimate)`);
    console.log(`transitions: ${new Set(S.map((s) => s.transition)).size} distinct · longest scene ${(Math.max(...S.map((s) => s.durationFrames)) / fps).toFixed(1)}s`);
    // LAW 0e r.6a — the runtime FLOOR is 5:00. Printed rather than thrown, because the
    // fix is more teaching, and that is a decision for the author not the build script.
    if (mins < 5) console.log(`  ⚠ under the 5:00 floor by ${((5 - mins) * 60).toFixed(0)}s — teach more, do not pad`);
    return spec;
  };

  return {S, add, uv, brand, emit};
}
