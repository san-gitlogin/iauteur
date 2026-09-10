// APPLE SEPTEMBER 2026 — the shared build harness for the whole series.
//
// Five wide cuts and five shorts: iPhone 18 Pro, iPhone Duo, Apple Watch, AirPods 5, and
// a combined cut of the event. Every builder is a list of beats; duration and every anchor
// are COMPUTED here, so pacing cannot drift between five files and a change to the pacing
// model is one edit rather than five.
//
// Modelled on scripts/lib/uv-build.mjs, whose authoring rules were each paid for by a
// linter rejection. The ones that apply here are repeated below rather than rediscovered.
//
// The channel name and logo come from the gitignored `.env`. NEVER write them literally:
// this repo is public and a literal would put the owner's brand into every fork.
//
// ── AUTHORING RULES ─────────────────────────────────────────────────────────
//  1. SCENE 1 NAMES `meta.subject` (LAW 0g.1, an ERROR not a warning) and the HOOK
//     headline must share a distinctive word with `meta.seo.title`.
//  2. THE GREETING lives in scenes 2-4, never scene 1, and must use a form the guard
//     recognises — "Welcome back", "Welcome along". "Good to have you back" does not count.
//  3. A BEAT EARNS 16 SECONDS with two anchored elements and four more per anchor beyond.
//     Roughly: words <= 45 + 25 per extra anchor. Give every cell its own atWord.
//  4. NAME THE SUBJECT. Bare it/this/that under 4.5% of words, few sentences OPENING with
//     one. Say "the iPhone 18 Pro", "the plateau", "that chip".
//  5. CARRY THE REASON IN THE SENTENCE — because / which means / so / that's why.
//  6. CONTRACTIONS above 1.2%. Written-out forms are the loudest tell.
//  7. ASK SOMETHING in the first four beats and answer it in the body.
//  8. THE HOOK stays at or under 15 words — the 8s cap is only checked AFTER sync, so a
//     hook two words too long costs a whole extra TTS pass to discover.
//  9. `meta.seo.pinned` is REQUIRED and should contain a question.
//
// ── HOUSE VOICE, for this series specifically (owner, 2026-09-10) ────────────
// "See how naturally reviewers review products. I need in that way." And: avoid "nothing
// much", "no more" and similar tics. So: write as somebody who has read the spec sheet and
// watched the keynote and is telling a friend which four things matter. Concrete numbers,
// an opinion where one is honestly held, no hype, and no negation-fragments used as filler.
import fs from 'node:fs';
import {MANIFEST} from './manifest.mjs';
import {channelName, channelLogo} from './env.mjs';

/** 9.5 frames per word, measured against real Ava audio across the uv and Playwright
 *  cuts, where the repo's generic 12 over-estimated by ~25%. `sync.mjs` overwrites every
 *  duration from the real audio afterwards; this estimate is what the linter judges
 *  pacing on, and it is the only chance to catch a short cut before paying for a voice. */
export const FPW = 9.5;
export const PAD = 30;

export const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/** Anchor at a fraction of the narration, clamped into the first 70% (LAW 8): an element
 *  landing on the last word of a sentence reads as arriving late. */
export const anchorAt = (n, frac) =>
  Math.max(1, Math.min(Math.round(n * frac), Math.floor(n * 0.7)));

export function cut({fps = 30} = {}) {
  const S = [];

  const add = (type, transition, background, narration, mk = () => ({}), opts = {}) => {
    const n = words(narration);
    const A = (f) => anchorAt(n, f);
    const key = MANIFEST[type]?.data_key;
    const body = mk(A, n, narration) ?? {};
    const sc = {
      id: 's' + String(S.length + 1).padStart(2, '0'),
      type, transition, background, narration,
      data: key ? {[key]: body} : body,
      durationFrames: Math.max(60, Math.round(n * FPW + PAD)),
    };
    if (type === 'HOOK' && n > 15) {
      console.error(`✗ ${sc.id}: HOOK is ${n} words — real Ava audio runs past the 8s cap above ~15. Cut it now, not after the voiceover.`);
      process.exitCode = 1;
    }
    if (opts.holdFrames) sc.durationFrames = opts.holdFrames;
    if (opts.fx) sc.fx = opts.fx;
    S.push(sc);
    return sc;
  };

  /** An APPLE_STAGE beat. Its own helper because the series leans on it hardest and every
   *  one needs the same fields spelled out. */
  const stage = (transition, background, narration, mk, opts) =>
    add('APPLE_STAGE', transition, background, narration, mk, opts);

  const brand = () => ({
    theme: 'moderndark', themeLight: 'daylight', design: 'moderndark',
    // LAW 0h — the background must not move. `grid` is still; nothing pulses or drifts
    // behind a drawing the viewer is being asked to read.
    background: 'grid',
    channel: channelName(), logo: channelLogo(),
  });

  const emit = (url, spec, {isShort = false} = {}) => {
    fs.writeFileSync(url, JSON.stringify(spec, null, 2));
    const total = S.reduce((a, s) => a + s.durationFrames, 0);
    const mins = total / fps / 60;
    const longest = Math.max(...S.map((s) => s.durationFrames)) / fps;
    console.log(`${S.length} scenes · ${total} frames · ${mins.toFixed(2)} min (pre-sync estimate)`);
    console.log(`transitions: ${new Set(S.map((s) => s.transition)).size} distinct · longest scene ${longest.toFixed(1)}s`);
    if (!isShort && mins < 5) {
      console.log(`  ⚠ under the 5:00 floor by ${((5 - mins) * 60).toFixed(0)}s — add BEATS, do not pad the ones you have`);
    }
    return spec;
  };

  return {S, add, stage, brand, emit};
}

/** A SHORT — the single sharpest thing about one product, vertical, under a minute.
 *  Not a trailer and not a summary: a short that lists what the video covers is an advert;
 *  one that shows the actual surprise and stops is worth watching on its own. */
export function short({fps = 30} = {}) {
  const c = cut({fps});
  const emitShort = (url, spec) => {
    const total = c.S.reduce((a, x) => a + x.durationFrames, 0);
    const secs = total / fps;
    // Measured on the uv shorts: 47.9s of estimate became 51.4s of real audio, so sync
    // adds roughly 7% plus a breath per scene. 48 pre-sync leaves real headroom under
    // YouTube's 58s ceiling; 50 did not.
    if (secs > 48) console.error(`✗ short is ${secs.toFixed(1)}s pre-sync — sync adds ~7%, and 58s is the ceiling. Cut a beat.`);
    if (c.S.length > 7) console.error(`✗ ${c.S.length} scenes — a short holds 5 to 7. More is a summary, not a short.`);
    return c.emit(url, spec, {isShort: true});
  };
  return {...c, emitShort};
}

/** The four finishes, with the honest provenance of each colour.
 *  Burgundy is MEASURED off Apple's own macro photography. The other three are Apple's
 *  picker swatches paired with a derived deep stop — real published Apple values, but
 *  pastel UI tokens rather than body colours, so they are never described on screen or in
 *  narration as a measured body colour. See briefs/apple/00-event-dossier.md. */
export const FINISHES = [
  {label: 'Burgundy', sub: '#2a1618,#a16974'},
  {label: 'Glacier', sub: '#2c3238,#f8fbff'},
  {label: 'Silver', sub: '#3a3d40,#fdfdfd'},
  {label: 'Black', sub: '#141414,#c0c0c0'},
];
