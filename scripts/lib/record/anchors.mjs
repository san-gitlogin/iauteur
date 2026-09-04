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
export const solveAnchors = ({words, clipFrames, callouts = [], releases = [], settle = 45,
                             want = [], eventWant = []}) => {
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
  //
  // ── AN AUTHORED ANCHOR IS AN INSTRUCTION THE SOLVER SHOULD TRY TO KEEP ──────────
  //
  // This pass used to overwrite every clip's `atWord` unconditionally, so a spec that
  // said "start the scroll ON the word 'Scroll'" was silently re-timed to wherever the
  // proportional slack happened to land — three words into the NEXT sentence, describing
  // a movement the viewer had already watched. The author knows which word names the
  // action; the solver only knows how long the footage is.
  //
  // So the solver's numbers become a FLOOR rather than the answer. An authored anchor is
  // honoured whenever it sits at or after the earliest frame this clip could legally
  // start (previous clip's footage played, LAW 8 room still reserved for what follows);
  // otherwise the computed position stands, because a clip cut off mid-action is a worse
  // defect than a clip that starts a beat late. `want[i] == null` keeps the old behaviour
  // exactly, which is what every existing spec has.
  let cursor = start;
  const clips = [];
  const starts = [];
  const overridden = [];
  for (let i = 0; i < n; i++) {
    const auto = cursor;
    let at = auto;
    const asked = want[i] == null ? null : frameOf(want[i]);
    if (asked != null) {
      // THE FLOOR IS "THE PREVIOUS CLIP HAS FINISHED PLAYING", not the auto position.
      // `cursor` has already been inflated by this clip's share of the leading slack, so
      // testing against it would refuse every anchor EARLIER than the automatic one — and
      // earlier is the case authors actually have: the solver spreads clips evenly across
      // the read, while the word naming the action is usually well before that. The only
      // real constraint is that the preceding clip is not cut off mid-action.
      // THE FLOOR CARRIES A MARGIN, BECAUSE THIS SOLVE IS IN MODEL TIME AND THE VIDEO
      // IS NOT. Everything here runs at FRAMES_PER_WORD = 12, a flat average; `sync.mjs`
      // then re-times every anchor against REAL word boundaries, where "and we add one
      // line to it" is far quicker than twelve frames a word and a spelled-out
      // AZURE_OPENAI_API_KEY is far slower. A clip placed exactly `previous + footage`
      // has zero slack for that, so a run of fast words silently closes the gap and the
      // previous clip ships cut off mid-action.
      //
      // MEASURED, 2026-09-04: six clips passed this solve and failed the linter after
      // sync, the worst by 71 frames — `openignore` needed 215f and got 144f across the
      // words "and we add one line to it". A 25% cushion covered every case in that cut.
      //
      // AND THEN IT DID NOT, ON THE NEXT ONE (2026-09-04, the MCP agent cut: 11 clips cut
      // off, nine of them by fewer than 12 frames). The cushion has TWO jobs and was sized
      // for only one of them:
      //   (a) the SYSTEMATIC gap between what this solver assumes and what the voice does.
      //       This pass runs pre-voice at FPW = 12 frames/word; en-US-AvaMultilingualNeural
      //       at the house +8% delivers 9.65. That is a ratio of 1.243 — so a 1.25 cushion
      //       is spent almost entirely before local variation is considered at all.
      //   (b) LOCAL variation: "and we add one line to it" runs far under the average and a
      //       spelled-out AZURE_OPENAI_API_KEY far over.
      // So the cushion is the PRODUCT of the two, not the larger of them. The nine clips
      // that failed by under 12 frames are exactly what (a) eating (b) looks like.
      const RATE_SLIP = 12 / 9.65;   // solver's FPW vs the measured voice rate
      const LOCAL_CUSHION = 1.25;    // the 2026-09-04 measurement above
      const GAP_MARGIN = RATE_SLIP * LOCAL_CUSHION;
      const floor = i === 0 ? start : starts[i - 1] + clipFrames[i - 1] * GAP_MARGIN;
      const after = clipFrames.slice(i).reduce((a, b) => a + b, 0);
      const tailOk = asked + after <= Math.max(auto + after, total * LAW8_TAIL - FPW);
      if (asked >= floor && tailOk) {
        at = asked;
        overridden.push(i);
      } else if (asked < floor && floor + after <= Math.max(auto + after, total * LAW8_TAIL - FPW)) {
        // AN ANCHOR JUST BELOW THE FLOOR MEANT "AS EARLY AS YOU CAN", NOT "NEVER MIND".
        //
        // PAID FOR, 2026-09-04: a four-clip beat asked for its last clip at word 91 and
        // the floor — the previous clip finishing — was word 93.6. Two and a half words
        // out. The old branch dropped the request entirely and fell back to the automatic
        // cursor, which sits AFTER every leading clip has taken its share of the slack:
        // frame 1602 instead of 1111. Sixteen seconds later than asked, which collapsed
        // the clip's window to nothing and failed the whole scene with a message about
        // callouts that had nothing to do with the cause.
        //
        // Honouring the FLOOR instead keeps the author's intent (start this as soon as it
        // legally can) and cannot cut the previous clip off, which is the only thing the
        // floor exists to protect.
        // SNAP UP TO A WORD BOUNDARY. `at` is converted to a word with `wordOf`, which
        // ROUNDS — so landing exactly on the floor round-trips to a frame up to half a
        // word BELOW it, and the linter then reports the previous clip cut off by two or
        // three frames. Ceil to the next whole word and the round-trip cannot go under.
        at = Math.ceil(floor / FPW) * FPW;
        overridden.push(i);
      }
    }
    starts.push(at);
    clips.push({atWord: wordOf(at), callouts: []});
    cursor = at + clipFrames[i] + (i < lead ? Math.round((slack * weights[i]) / wsum) : 0);
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
    // A PULL-BACK IS A RELEASE, NOT A TEACHING BEAT, so it does not share the even spread.
    //
    // PAID FOR on the SQLite cuts: `zooms: [{mark}, {at:'full'}]` with one callout produced
    // zoom / callout / pull-back at words 81.0 / 81.8 / 82.75 — the camera started leaving
    // 0.8 words after the label appeared, and the 18-frame ease meant the payoff was legible
    // punched-in for under half a second. Four scenes of the long cut did this, including the
    // 8192-byte reveal and SCAN -> SEARCH, which are the two beats the whole course is for.
    //
    // So a trailing release is pinned to the END of the clip's window and the teaching beats
    // spread across the room BEFORE it — which is the most dwell the script can afford.
    const rel = releases[i] ? 1 : 0;
    const teach = cn - rel;
    // ── AN AUTHORED EVENT WORD IS AN INSTRUCTION TOO ────────────────────────────────
    // PAID FOR by `audit-sync`, which read the finished timings back against the real
    // word timings and found FOURTEEN beats showing one thing while the voice said
    // another — "measured, not guessed" appearing four words after the sentence that
    // says "measured rather than guessed". Cause: clips honoured `wantAtWord` (see
    // pass 1) and their EVENTS did not, so every callout and zoom landed on an even
    // spread through the hold, no matter which word named it. The author's intent had
    // no channel at all — the manifest's own note says "EVERY clip AND every callout
    // needs atWord", and for callouts that was a field nothing read.
    //
    // The spread stays as the DEFAULT, because most events are not worth naming a word
    // for. An authored `wantAtWord` wins whenever it still fits the window: after the
    // footage has played (you see the thing before it is labelled), a word clear of the
    // previous event, and a word clear of the window's end.
    const wants = eventWant[i] ?? [];
    const spread = [];
    for (let j = 0; j < teach; j++) {
      spread.push(afterFootage + Math.round((room * (j + 1)) / (teach + 1)));
    }
    if (rel) spread.push(afterFootage + room);
    let floor = afterFootage;
    for (let j = 0; j < spread.length; j++) {
      const isRel = rel && j === spread.length - 1;
      const asked = wants[j] == null ? null : frameOf(wants[j]);
      // A release is the camera letting go; it stays pinned to the end of the window.
      const ceil = winEnd - FPW * (spread.length - 1 - j);
      const at = (!isRel && asked != null && asked >= floor && asked <= ceil) ? asked : spread[j];
      clips[i].callouts.push(wordOf(at));
      floor = at + FPW;
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

  // A trailing pull-back is the camera letting go, not another thing to read.
  const isRelease = (seq) => {
    const last = seq[seq.length - 1];
    return !!(last && last.kind === 'zoom' && last.obj?.at === 'full');
  };
  const solve = (plan) => solveAnchors({
    words,
    clipFrames: d.clips.map((c) => Number(c.frames)),
    callouts: plan.map((seq) => seq.length),
    releases: plan.map(isRelease),
    settle,
    // A SEPARATE FIELD, BECAUSE `atWord` IS THE SOLVER'S OUTPUT. Reading the authored
    // intent back out of `atWord` would make this pass sticky and non-idempotent: the
    // second run would treat its own first answer as an instruction. `wantAtWord` is
    // written by the spec author and never touched here.
    want: d.clips.map((c) => (c.wantAtWord == null ? null : Number(c.wantAtWord))),
    // Same separation as `want` above: `atWord` on a callout or a zoom is this pass's
    // OUTPUT, so the author's intent is a different field and is never read back.
    eventWant: plan.map((seq) => seq.map((e) => {
      const w = e.obj?.wantAtWord;
      return w == null ? null : Number(w);
    })),
  });

  let plan = eventPlan;
  let res = solve(plan);
  if (!res.ok) return res;

  // A CAMERA MOVE THE VIEWER CANNOT REGISTER IS WORSE THAN NO MOVE. Pinning the pull-back to
  // the end of the window bought the payoff more dwell, but on a clip with long footage and a
  // short script there is simply no room left: measured 9 frames — three tenths of a second —
  // between the callout on the 8192-byte reveal and the camera starting to leave, against an
  // 18-frame ease. The label would be legible punched-in for almost no time at all.
  //
  // So when a release cannot earn at least MIN_DWELL, it is DROPPED and the beat re-solved
  // without it. The punch-in simply holds to the end of the clip, which is what the payoff
  // wanted anyway. Garnish loses to legibility.
  const MIN_DWELL = 36; // 1.2s — long enough to read a short label before the camera moves
  const drop = [];
  plan.forEach((seq, i) => {
    if (!isRelease(seq) || seq.length < 2) return;
    const at = res.clips[i].callouts;
    const dwell = (at[at.length - 1] - at[at.length - 2]) * FPW;
    if (dwell < MIN_DWELL) drop.push(i);
  });
  if (drop.length) {
    for (const i of drop) {
      const seq = plan[i];
      const rel = seq.pop();                                  // the trailing {at:'full'}
      d.clips[i].zooms = (d.clips[i].zooms ?? []).filter((z) => z !== rel.obj);
    }
    plan = plan.map((seq) => seq.filter(Boolean));
    const re = solve(plan);
    if (re.ok) res = re;
  }

  d.clips.forEach((c, i) => {
    c.atWord = res.clips[i].atWord;
    plan[i].forEach((e, j) => { e.obj.atWord = res.clips[i].callouts[j]; });
  });
  if (d.atWord == null) d.atWord = 2;
  scene.durationFrames = res.durationFrames;
  return {ok: true, words, durationFrames: res.durationFrames};
};
