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
// ── AUTHORING RULES, learned by having the linter reject them ────────────────
// Every one of these cost a build-lint-fix round trip on chapters 00 and 01, so they are
// written down rather than rediscovered eleven more times:
//
//  1. THE GREETING must use a form the guard recognises — "Welcome back", "Welcome along",
//     "good to see you". "Good to have you back" is warm and does not count. It belongs in
//     scenes 2-4, never scene 1 (LAW 0g).
//  2. A BEAT EARNS 16 SECONDS with two anchored elements, and four more seconds for each
//     anchor beyond that. A 60-word beat with one step will be rejected; either step
//     something more or split the beat. Roughly: words <= 45 + 25 per extra anchor.
//  3. NAME THE SUBJECT. Bare it/this/that/they must stay under 4.5% of all words, and no
//     more than a handful of sentences may OPEN with one. Say "pip", "the interpreter",
//     "the shelf" — repeating a name is clarity, not repetition.
//  4. CARRY THE REASON INSIDE THE SENTENCE. because / which means / so that / that's why,
//     at least 0.8% of words.
//  5. CONTRACTIONS above 1.2%: you'll, it's, don't, here's.
//  6. ASK SOMETHING in the first four beats, and answer it later in the body.
//  7. A QUIZ_CARD reveal goes through `quizReveal(narration)`, never a fraction.
//  8. THE HOOK stays at or under 15 words — enforced below, because the 8s cap is only
//     checked after the whole chapter has been voiced.
//
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
 * Where a QUIZ_CARD's answer should be anchored: the word just BEFORE "Ready?".
 *
 * LAW 0e-q wants question -> pause invitation -> "Ready?" -> answer. The linter measures
 * the gap from the LAST question mark before the reveal, and "Ready?" is itself a question
 * mark — so anchoring the reveal after it reports a one-word thinking gap however long the
 * pause actually was. Anchor just before it and the gap measured is the real one.
 * Chapter 00 passed this by luck; chapter 01 did not, which is why it is a function now.
 */
export const quizReveal = (narration) => {
  const w = narration.trim().split(/\s+/).filter(Boolean);
  const i = w.findIndex((x) => /^ready[?!.,]?$/i.test(x));
  return i > 0 ? i : Math.max(1, Math.round(w.length * 0.62));
};

/**
 * A chapter under construction.
 *
 * `add(type, transition, background, narration, mk)` appends one beat. `mk(A, n, text)`
 * receives the anchor helper, the word count and the narration, and returns the DATA BODY —
 * which is wrapped in the manifest's `data_key` here rather than per scene, because
 * writing those fields at the top level renders an empty scene that still passes lint.
 */
export function chapter({fps = 30} = {}) {
  const S = [];
  const add = (type, transition, background, narration, mk = () => ({}), opts = {}) => {
    const n = words(narration);
    const A = (f) => anchorAt(n, f);
    const key = MANIFEST[type]?.data_key;
    // the narration is handed to `mk` as well, because a couple of components need to
    // anchor against the WORDS rather than a fraction — a quiz reveal must land just
    // before "Ready?", wherever in the line that happens to fall.
    const body = mk(A, n, narration) ?? {};
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

  const emit = (url, spec, {isShort = false} = {}) => {
    fs.writeFileSync(url, JSON.stringify(spec, null, 2));
    const total = S.reduce((a, s) => a + s.durationFrames, 0);
    const mins = total / fps / 60;
    console.log(`${S.length} scenes · ${total} frames · ${mins.toFixed(2)} min (pre-sync estimate)`);
    console.log(`transitions: ${new Set(S.map((s) => s.transition)).size} distinct · longest scene ${(Math.max(...S.map((s) => s.durationFrames)) / fps).toFixed(1)}s`);
    // LAW 0e r.6a — the runtime FLOOR is 5:00. Printed rather than thrown, because the
    // fix is more teaching, and that is a decision for the author not the build script.
    // LAW 0e r.6a's 5:00 floor is a LONG-FORM law. A short that cleared it would be a
    // short in name only, so the check does not run on one.
    if (!isShort && mins < 5) console.log(`  ⚠ under the 5:00 floor by ${((5 - mins) * 60).toFixed(0)}s — teach more, do not pad`);
    return spec;
  };

  return {S, add, uv, brand, emit};
}

/**
 * A SHORT for one chapter — the single sharpest moment in it, vertical, under a minute.
 *
 * Not a trailer and not a summary. A short that says "this chapter covers X, Y and Z" is
 * an advert; one that shows the actual surprise and stops is a lesson somebody can use
 * without ever opening the long cut. Every uv depiction was proofed at 9:16 alongside
 * 16:9, so the pictures already work here — what changes is the pace and the count.
 *
 * The linter's palette, over-reliance and specialist rules only fire at 8+ scenes, so a
 * six-beat short may lean on UV_STAGE throughout without tripping them. That is a
 * permission, not an instruction: the picture still has to be the right one.
 */
export function short({fps = 30} = {}) {
  const c = chapter({fps});
  const emitShort = (url, spec) => {
    const total = c.S.reduce((a, x) => a + x.durationFrames, 0);
    const secs = total / fps;
    // 58s is YouTube's Shorts ceiling with no margin at all, and sync ADDS frames from
    // the real audio. Flag anything over 50 pre-sync, because discovering it afterwards
    // costs another TTS pass.
    // Measured on chapter 00's short: 47.9s of estimate became 51.4s of real audio, so
    // sync adds roughly 7% plus a breath per scene. 48 pre-sync leaves genuine headroom
    // under the 58s ceiling; 50 did not leave much.
    if (secs > 48) console.error(`✗ short is ${secs.toFixed(1)}s pre-sync — sync adds ~7%, and 58s is the hard ceiling. Cut a beat.`);
    if (c.S.length > 7) console.error(`✗ ${c.S.length} scenes — a short holds 5 to 7. More is a summary, not a short.`);
    return c.emit(url, spec, {isShort: true});
  };
  return {...c, emitShort};
}
