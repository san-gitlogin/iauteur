// ANCHOR SOLVER — place every `atWord` automatically, from measured footage.
//
// WHY THIS EXISTS. Every anchor in this subsystem was hand-computed until now: read the
// segment's frame count, divide by 12, pick a word, check the gap by hand, repeat. That is
// fine for a four-clip demo and impossible for a 20-30 minute course with sixty scenes —
// and the owner's ask was explicit: *"the planning should also happen automatically"*.
//
// The author writes the CREATIVE part (which steps, what to say, what to point at). This
// computes the MECHANICAL part (when each thing lands), from numbers that were measured at
// capture time rather than guessed.
//
// THE CONSTRAINTS, all of which are real and all of which have bitten:
//   1. GAP RULE — the narration between clip i and clip i+1 must be at least clip i's own
//      frame count, or the footage is cut off mid-action. (lint-spec enforces it; this
//      makes it true by construction.)
//   2. BASE — the first clip cannot land before the scene's furniture is up (~frame 38).
//   3. PAYOFF EARLY (LAW 8) — the last anchor must not fall in the final 15% of the read,
//      or the reveal has no settle time and the linter rejects it.
//   4. CALLOUTS land INSIDE their clip's window, after the footage has played, so the
//      viewer sees the thing before it is labelled.
//
// Frames and words are the same axis here: FRAMES_PER_WORD = 12 (150wpm at 30fps).

export const FPW = 12;
export const BASE_MAX = 38;

const wordOf = (frame) => Math.max(1, Math.round(frame / FPW) + 1);
const frameOf = (word) => Math.max(0, Math.round((word - 1) * FPW));

/**
 * Solve anchors for ONE scene.
 *
 * @param {object}   o
 * @param {number}   o.words      how many words the narration has
 * @param {number[]} o.clipFrames measured length of each clip, in frames
 * @param {number[]} [o.callouts] per clip, how many IN-CLIP EVENTS it carries
 *                                (zoom moves + callouts share one timeline)
 * @param {number}   [o.settle]   frames of tail after the last clip finishes
 * @returns {{ok:boolean, reason?:string, durationFrames:number, clips:{atWord:number, callouts:number[]}[]}}
 */
export const solveAnchors = ({words, clipFrames, callouts = [], settle = 45}) => {
  const n = clipFrames.length;
  if (!n) return {ok: false, reason: 'no clips', durationFrames: 0, clips: []};

  const total = words * FPW;                 // the whole read, in frames
  const start = Math.min(BASE_MAX, total);   // clip 1 cannot precede the furniture
  const footage = clipFrames.reduce((a, b) => a + b, 0);
  const usable = total - start - settle;

  // HONEST FAILURE. If the narration is shorter than the footage it is describing, no
  // placement can satisfy the gap rule — the answer is more words or a tighter capture,
  // and saying so beats quietly cutting the demo off mid-action.
  if (usable < footage) {
    const needWords = Math.ceil((footage + start + settle) / FPW);
    return {
      ok: false,
      reason: `narration is too short for the footage: ${footage}f of clips need at least ` +
        `${needWords} words, the script has ${words}. Write ${needWords - words} more words, ` +
        `or shorten the capture.`,
      durationFrames: total + settle,
      clips: [],
    };
  }

  // LAW 8 IS A CONSTRAINT, NOT A CHECK AT THE END.
  // PAID FOR: distributing slack proportionally across ALL clips pushed the LAST anchor to
  // 86% of the read for a [300f, 30f] pair — a long first step ate the airtime and the
  // payoff landed in the settle tail. Solve it structurally instead: every anchor must fit
  // inside the first LAW8_LIMIT of the scene, and only the LEADING clips share the slack.
  // The final clip's own length is the tail, which is what the settle is for.
  const LAW8_LIMIT = 0.72;
  // LAW 8 bounds the LAST ANCHOR, and a callout is an anchor. Everything — the final clip's
  // footage and every event inside it — has to be done by this line.
  const LAW8_TAIL = 0.80;
  const lead = n - 1;                                   // clips before the last
  const leadFootage = clipFrames.slice(0, lead).reduce((a, b) => a + b, 0);
  // THE LAST CLIP'S OWN CALLOUTS ARE PART OF THE TAIL, and reserving only its footage was
  // not enough. PAID FOR twice on the SQLite course: pass 1 placed the final clip correctly
  // at ~72%, pass 2 then had to put that clip's callouts after its footage, and they landed
  // past the last spoken word. Clamping them merely moved the defect into LAW 8's final 15%.
  // A callout IS an anchor, so the room it needs is reserved here, before anything is placed.
  const tailCallouts = callouts[n - 1] ?? 0;
  const tailNeed = clipFrames[n - 1] + FPW * (tailCallouts + 1);
  // Room the leading clips may occupy without pushing the last ANCHOR past the limit.
  const leadRoom = Math.max(leadFootage,
    Math.min(usable - clipFrames[n - 1], total * LAW8_TAIL - start - tailNeed));

  if (lead > 0 && leadRoom < leadFootage) {
    const needWords = Math.ceil((leadFootage + tailNeed + start + settle) / (FPW * LAW8_LIMIT));
    return {
      ok: false,
      reason: `too many steps for this narration: the leading clips need ${leadFootage}f but only ` +
        `${Math.round(leadRoom)}f fit before LAW 8's ${Math.round(LAW8_LIMIT * 100)}% payoff limit. ` +
        `Split the beat, or grow the script to ~${needWords} words.`,
      durationFrames: total + settle,
      clips: [],
    };
  }

  // Share the LEADING slack proportionally to each leading clip's own length, so a long
  // step gets more room to be talked over than a short one. An even split would give a
  // 0.6s save the same airtime as a 4s run.
  const slack = Math.max(0, leadRoom - leadFootage);
  const weights = clipFrames.slice(0, lead).map((f) => f + FPW); // +1 word floor so a tiny clip still breathes
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;

  // PASS 1 — place the CLIP anchors.
  let cursor = start;
  const clips = [];
  const starts = [];
  for (let i = 0; i < n; i++) {
    starts.push(cursor);
    clips.push({atWord: wordOf(cursor), callouts: []});
    cursor += clipFrames[i] + (i < lead ? Math.round((slack * weights[i]) / wsum) : 0);
  }

  // LAW 8: the last anchor must not sit in the final 15% of the read.
  const lastFrame = frameOf(clips[n - 1].atWord);
  const durationFrames = Math.max(total, cursor + clipFrames[n - 1]) + settle;

  // PASS 2 — place the IN-CLIP EVENTS (zoom moves and callouts), now that every clip's
  // REAL window is known.
  // PAID FOR: this used to run inside pass 1, where the only room it knew about was the
  // clip's own share. For a SINGLE-clip scene `lead` is 0, so there is no share at all —
  // every event collapsed onto the same word while 944 frames of hold sat unused. The hold
  // is exactly where events belong: the footage has played, the picture is frozen, and the
  // voice is still talking about it.
  // AN ANCHOR PAST THE LAST SPOKEN WORD IS NEVER VALID. `durationFrames` can exceed the
  // narration (it stretches to fit footage that outruns the read), so using it as the final
  // window's end placed callouts on words nobody ever says — the linter rejected them with
  // "atWord N exceeds narration word count". The window has to close at the LAST WORD.
  //
  // PAID FOR on the SQLite course: three beats had their second clip placed correctly at ~72%
  // and then its callouts pushed to word 105 of a 96-word script. LAW 8 bounds the last
  // ANCHOR, not the last clip, and this is where that distinction was being lost.
  // ...and LAW 8 wants the last anchor out of the final 15% entirely, so the window closes
  // at 80% of the read rather than on the last word. Clamping to the last word merely moved
  // the defect: every one of those beats then reported "payoff lands in the last 15%".
  // The rule bounds the LAST ANCHOR, so that is what this has to bound.
  const lastWordFrame = Math.max(FPW, Math.floor(total * LAW8_TAIL));
  let overflow = null;
  for (let i = 0; i < n; i++) {
    const cn = callouts[i] ?? 0;
    if (!cn) continue;
    const winEnd = i + 1 < n ? starts[i + 1] : Math.min(durationFrames - settle, lastWordFrame);
    const afterFootage = starts[i] + clipFrames[i];
    const room = winEnd - afterFootage;
    if (room < FPW * cn) {
      // Not enough spoken words left after this clip's footage to hold its callouts.
      const needWords = Math.ceil((afterFootage + FPW * (cn + 1) + settle) / FPW);
      overflow = `clip ${i + 1} has ${cn} callout(s) but only ` +
        `${Math.max(0, Math.round(room / FPW))} word(s) of script after its footage ends. ` +
        `Give the beat ~${needWords} words, or move a callout to an earlier clip.`;
      continue;
    }
    for (let j = 0; j < cn; j++) {
      clips[i].callouts.push(wordOf(afterFootage + Math.round((room * (j + 1)) / (cn + 1))));
    }
  }
  if (overflow) {
    return {ok: false, reason: overflow, durationFrames, clips};
  }
  if (lastFrame > durationFrames * 0.85) {
    return {
      ok: false,
      reason: `the last clip lands at ${Math.round((lastFrame / durationFrames) * 100)}% of the ` +
        `scene — LAW 8 wants the payoff named in the first ~70%. Move a step to the next beat, ` +
        `or give the earlier steps less airtime.`,
      durationFrames,
      clips,
    };
  }

  return {ok: true, durationFrames, clips};
};

/**
 * Apply a solve to a RECORDED_STEP scene in place. The clips must already be baked, so the
 * real frame counts are present — anchors are never computed from a guess.
 */
export const anchorScene = (scene, {settle = 45} = {}) => {
  const d = scene?.data?.recordedStep;
  if (!d?.clips?.length) return {ok: false, reason: 'not a RECORDED_STEP scene with clips'};
  const missing = d.clips.filter((c) => c.frames == null);
  if (missing.length) {
    return {ok: false, reason: `${missing.length} clip(s) are not baked — run bake-rec first, ` +
      `so the solver works from MEASURED frame counts and not from a guess`};
  }
  const words = String(scene.narration ?? '').trim().split(/\s+/).filter(Boolean).length;

  // Zoom moves and callouts share ONE in-clip timeline, interleaved zoom-then-callout so
  // the camera arrives before the label names what it arrived at. Teaching order, not
  // array order.
  const eventPlan = d.clips.map((c) => {
    const zs = c.zooms ?? [];
    const cs = c.callouts ?? [];
    const seq = [];
    for (let j = 0; j < Math.max(zs.length, cs.length); j++) {
      if (zs[j]) seq.push({kind: 'zoom', obj: zs[j]});
      if (cs[j]) seq.push({kind: 'callout', obj: cs[j]});
    }
    return seq;
  });

  const res = solveAnchors({
    words,
    clipFrames: d.clips.map((c) => Number(c.frames)),
    callouts: eventPlan.map((seq) => seq.length),
    settle,
  });
  if (!res.ok) return res;

  d.clips.forEach((c, i) => {
    c.atWord = res.clips[i].atWord;
    eventPlan[i].forEach((e, j) => { e.obj.atWord = res.clips[i].callouts[j]; });
  });
  if (d.atWord == null) d.atWord = 2;
  scene.durationFrames = res.durationFrames;
  return {ok: true, words, durationFrames: res.durationFrames};
};
