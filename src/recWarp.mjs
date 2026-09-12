// REC WARP — how a recorded clip is spread across the airtime a beat owns.
//
// THE FEATURE THIS PROTECTS. A recorded clip is routinely shorter than the beat that
// carries it, and `RecordedStep` has always stretched it to fill the gap so a typed line
// lands as it is being talked about, with pauses in between. That is worth keeping. What
// was wrong was HOW it stretched: one `playbackRate` over the whole file, so the pauses
// AND the motion both slowed down together.
//
// WHY THAT HURTS (measured 2026-09-11, owner: *"why are the screen recordings laggy"*).
// A browser take on this machine captures roughly 3 distinct pictures a second at
// deviceScaleFactor 4 — the page is 6400x3600 and Chrome cannot paint it faster. Across
// the thirteen Apple beats the uniform stretch then ran at 0.40x-0.79x, so:
//
//     ~3 distinct frames/sec captured  ->  ~1.2 distinct frames/sec on screen
//
// Slowing a scroll does not make it more readable, it makes it sluggish, and it stretches
// the judder with it. Slowing a PAUSE costs nothing at all — a still picture held longer
// is still a still picture.
//
// WHAT THIS DOES INSTEAD. The capture already knows which stretches of a clip are moving
// and which are frozen (screencast only emits a frame when the picture changes, so the
// resampler's plan repeats a file across a pause). Given that map:
//
//   · every MOVING run plays at its recorded speed — 1.0x, never slower
//   · the slack is absorbed by the PAUSES, in proportion to how long each already is
//   · if there is not enough pause to absorb it, the leftover goes to the end as a freeze
//   · if the clip is LONGER than its airtime, it falls back to the old uniform slow-down,
//     because there is no slack to place and something has to give
//
// For a scroll — one travel, one long hold — every bit of slack lands in the hold: the
// page scrolls at natural speed and then sits still while the voice catches up. For a
// typing demo — many short pauses between lines — the slack spreads across those pauses,
// which is exactly the pacing the uniform stretch was reaching for.
//
// AND IT GIVES THE SOLVER THE NUMBER IT WAS MISSING. `settle` is the frame at which the
// picture stops changing. `anchor-spec` used to assume that was `start + frames`, i.e.
// 1:1 playback, and place callouts after it — on the AirPods cut that put a highlight on
// screen 187 frames before the text it points at arrived underneath it, which is the
// "highlight comes in before the thing it highlights" the owner reported. Both the
// renderer and the solver import this file, so they cannot disagree again.
//
// Pure, dependency-free, and .mjs on purpose: `scripts/lib/record/anchors.mjs` imports it
// with plain node, `src/scenes/RecordedStep.tsx` imports it through the bundler.

/** A pause worth stretching. Shorter runs are part of the motion — at a low capture rate
 *  a scroll's own frames can sit 8-10 apart, and treating those gaps as pauses would
 *  stretch the scroll itself, which is the thing this exists to stop. 12 frames = 0.4s. */
export const HOLD_MIN = 12;
/** Never mount more pieces than this; the shortest pauses get folded back into motion. */
export const MAX_PIECES = 8;
/** The old constants, kept for the fallback path so nothing changes when there is no map. */
export const READ_TAIL = 0.86;
export const MIN_RATE = 0.4;

/**
 * @param {object} o
 * @param {number} o.frames      the clip's own length, in frames
 * @param {number[]} [o.changes] frame indices at which the picture changes (from the bake)
 * @param {number} o.airtime     frames this clip owns on the timeline
 * @returns {{pieces: {at:number, from:number, to:number, rate:number}[], shown:number, settle:number, rate:number, mode:string}}
 *   `pieces` are mounts in clip order: show source frames [from,to) starting at timeline
 *   offset `at`, at `rate`. Each piece freezes on its last frame until the next takes over.
 *   `shown` is when the footage stops advancing, `settle` when the picture stops CHANGING.
 */
export const planWarp = ({frames, changes, airtime}) => {
  const len = Math.max(1, Math.round(Number(frames) || 1));
  const air = Math.max(1, Math.round(Number(airtime) || 1));
  const budget = Math.floor(air * READ_TAIL);

  // ── NO MAP, OR NO ROOM: the original behaviour, unchanged ──────────────────
  // Old bakes carry no `changes`, and a clip longer than its airtime has no slack to
  // place. Both fall back to the uniform rate this file replaced, so every topic recorded
  // before today renders exactly as it did.
  const uniform = (why) => {
    const rate = Math.max(MIN_RATE, Math.min(1, len / budget));
    const shown = Math.round(len / rate);
    return {pieces: [{at: 0, from: 0, to: len, rate}], shown, settle: shown, rate, mode: why};
  };
  // A ONE-ENTRY MAP IS A MEASUREMENT, NOT A MISSING ONE. `[0]` says the picture changed on
  // its first frame and never again — a page that finished loading before its segment began
  // (the browser runner cuts a `goto` after paint). Read as "no map", a still picture was
  // slowed to 0.4x and reported settling at frame 90 of a 36-frame clip, so the solver
  // refused every camera move asked for in the first three seconds (FluidRAM s28/s32,
  // 2026-09-11: moves landed 14-20 words after the line numbers that named them).
  if (!Array.isArray(changes) || changes.length < 1) return uniform('uniform:no-map');
  if (len >= budget) return uniform('uniform:no-slack');

  // ── WHERE ARE THE PAUSES? ──────────────────────────────────────────────────
  // A run between two consecutive changes is a pause when it is long enough to read as
  // one. `changes` is sorted and starts at 0; the final run ends at `len`.
  const edges = [...new Set(changes.map((c) => Math.max(0, Math.min(len, Math.round(c)))))]
    .sort((a, b) => a - b);
  if (edges[0] !== 0) edges.unshift(0);
  const runs = [];
  for (let i = 0; i < edges.length; i++) {
    const from = edges[i];
    const to = i + 1 < edges.length ? edges[i + 1] : len;
    if (to > from) runs.push({from, to, len: to - from});
  }
  let holds = runs.filter((r) => r.len >= HOLD_MIN);
  // Keep the longest pauses only, so a clip with dozens of tiny gaps does not become
  // dozens of video mounts. The ones dropped simply stay part of the motion.
  if (holds.length > MAX_PIECES) {
    holds = [...holds].sort((a, b) => b.len - a.len).slice(0, MAX_PIECES).sort((a, b) => a.from - b.from);
  }
  if (!holds.length) {
    // Nothing to stretch: play it straight and freeze the rest of the beat. This is the
    // right answer, not a failure — a continuous take has no pause to give.
    return {pieces: [{at: 0, from: 0, to: len, rate: 1}], shown: len, settle: len, rate: 1, mode: 'straight'};
  }

  // ── SPREAD THE SLACK ACROSS THEM, IN PROPORTION ────────────────────────────
  const slack = budget - len;
  const holdTotal = holds.reduce((a, h) => a + h.len, 0);
  const extra = holds.map((h) => Math.floor((slack * h.len) / holdTotal));

  // ── BUILD THE MOUNTS ───────────────────────────────────────────────────────
  // One piece per stretch of clip that plays: everything up to a pause, then everything
  // up to the next, and so on. The pause itself is not a mount — the previous piece
  // freezes on its own last frame, which IS the paused picture, until the next starts.
  const pieces = [];
  let at = 0;
  let cursor = 0;
  let settle = 0;
  holds.forEach((h, i) => {
    // play from the cursor through to the START of this pause (its first frame is the
    // last thing that moved, so it is included and then held)
    const to = h.from + 1;
    if (to > cursor) {
      pieces.push({at, from: cursor, to, rate: 1});
      at += to - cursor;
      settle = at;
      cursor = to;
    }
    at += h.len - 1 + extra[i];     // the pause, stretched
    // SKIP THE PAUSE'S OWN FRAMES. They are byte-identical repeats of the one we just
    // froze on, so replaying them would spend the beat's time showing the same picture
    // twice — and, worse, `settle` would land at the END of the freeze instead of at the
    // last thing that actually moved. Caught by the planner's own test on the first run:
    // a 41-frame scroll reported settling at frame 850.
    cursor = h.to;
  });
  if (cursor < len) {
    pieces.push({at, from: cursor, to: len, rate: 1});
    at += len - cursor;
    settle = at;
  }
  return {pieces, shown: at, settle, rate: 1, mode: 'warp'};
};

/** The frame (relative to the clip's start) at which the picture stops changing.
 *  This is the number a solver needs: a label placed before it lands on a moving page. */
export const settleFrames = (o) => planWarp(o).settle;
