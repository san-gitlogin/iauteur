import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {StepOverlay} from '../recordedOverlay';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ClipVideo} from '../video';
import {easeInOutCubic} from '../motion/util';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// RECORDED_STEP — REAL captured footage, made to obey the VOICE.
//
// This is the component the whole recording subsystem exists for. A demo is captured
// once as N segments (one per authored step) plus a manifest; this plays segment k
// starting at ITS OWN narration word and then FREEZES on its last frame until the
// voice reaches the next word. That is the entire mechanism:
//
//     footage is captured on the machine's clock, and replayed on the narrator's.
//
// Consequences, all deliberate:
//  · Rewrite the narration and the demo re-paces itself. Nothing is re-captured.
//  · A segment that finishes early HOLDS instead of running dry — no dead frame,
//    and no "animation still going while the voice moved on" (LAW 0i, the 2026-08-17
//    owner verdict). The freeze is the fix for the opposite failure too: the voice
//    can never arrive before the picture, because the picture waits for it.
//  · There is NO fixed frame interval in this file. Every moment resolves from an
//    element's own `atWord` through `wordToFrame` (LAW 0i.1). The only constants are
//    cosmetic fades measured from an anchor, never step timing.
//
// Authoring is `rec:<slug>#<step>`; `scripts/bake-rec.mjs` resolves that against the
// capture manifest into `src` + `frames` + `bbox` before render. An unbaked `rec:`
// reference is a hard lint failure — it must never reach the renderer.
export const RecordedStep: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.recordedStep;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const clips = (d.clips ?? []).slice(0, 8);
  if (!clips.length) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = sem(d.color ?? 'blue');
  const rad = 14 * scale * t.style.cornerRadius;

  // BASE ≤38 — the frame (chrome, headline, premise) exists from here, so nothing
  // pops in later. Matches the convention every stepping component uses.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  // Each segment starts at its OWN spoken word. No intervals, no fallback spacing
  // that could drift: an unanchored clip inherits the base so it is visible rather
  // than invisible, and the linter is what refuses to ship it.
  const starts = clips.map((c) => (c.atWord != null ? wordToFrame(c.atWord) : base));

  // The active segment is the last one whose word has been spoken.
  let active = 0;
  for (let i = 0; i < clips.length; i++) if (frame >= starts[i]) active = i;

  const cur = clips[active];
  const curStart = starts[active];
  const curFrames = Math.max(1, Number(cur.frames ?? 1));
  // How far into its own footage this segment is, and whether it has run out and is
  // now HOLDING for the voice. `held` drives the honest on-screen "holding" state.
  const into = frame - curStart;
  const held = into >= curFrames;

  const capW = Number(d.capture?.width ?? 960);
  const capH = Number(d.capture?.height ?? 540);

  // ── THE VIEW WINDOW ────────────────────────────────────────────────────────
  // A rectangle in CAPTURE space that the stage shows. Everything — the wide cut, the
  // vertical cut, and the focus punch-in — is one calculation over this window, which
  // replaced three separate transform hacks that each had their own bug.
  //
  // PAID FOR (LAW 0o, "the CONST must never be the binding term"): the stage used to be
  // `vertical ? 980 : 1180` wide with its height derived from the capture aspect. In 9:16
  // that drew a 16:9 strip ~608px tall inside a 1920px frame — the picture floating in a
  // pane three times its height, the exact "patty inside a burger" defect. A vertical cut
  // must CROP the capture to a portrait window, not letterbox it.
  // The headline sits HIGHER and taller in 9:16, so a single constant put the premise
  // straight on top of it (LAW 0o: "the top and bottom are getting overlapped with the
  // content inside"). Measured from a vertical still, not guessed.
  const headH = (scene.data.headline ? (vertical ? 300 : 150) : 40) * scale;
  // Reserve for EVERYTHING the column carries, including the keycap row — LAW 0o: a
  // pane measures itself. Adding the keycaps without counting them shrank the budget's
  // denominator and pushed the premise up into the headline.
  // Reserved if ANY clip has keys, so the stage does not resize between steps.
  const anyKeys = clips.some((c) => (c.keys ?? []).length > 0);
  // SPLIT puts the demo's own steps beside the footage instead of under it. Only in
  // WIDE: in 9:16 there is no width to give away, and the legibility fight is already
  // the hard one there.
  const split = d.layout === 'split' && !vertical;
  // FULL-BLEED — the recording IS the frame, and everything else floats on top of it.
  //
  // Owner: *"I am also wondering on how you will be displaying an entire screen recording
  // which most of the coding tutorial videos have and expect, where you would not need a
  // component to hold the video, but have the video as base and include components that
  // float over the video that does not hide the content."*
  //
  // The card layout puts the capture inside a bordered panel with the premise above and the
  // caption below, which costs roughly a third of the frame in chrome and forces a harder
  // punch-in to keep the text readable — which is what was cutting commands off at the right.
  // In full-bleed the capture fills the frame edge to edge and the premise, rail, keycaps and
  // caption sit ON it, over gradient scrims so they stay legible whatever is underneath.
  // WIDE ONLY. A 16:9 capture filling a 9:16 frame has to crop to about a third of its
  // width, which is the opposite of showing the whole screen — so vertical keeps the card
  // layout and its punch-in, where cropping is a deliberate choice rather than a side effect.
  // FULL IS THE DEFAULT, which is what the manifest has always said this field means:
  // "full (default) = the footage IS the frame, overlays on top". The code had never
  // implemented it, so every recorded beat silently got the card. `layout: "card"` asks for
  // the old bordered panel back.
  const fullBleed = (d.layout ?? 'full') === 'full' && !vertical;
  const frameW = (vertical ? 1080 : 1920) * scale;
  const frameH = (vertical ? 1920 : 1080) * scale;
  const sideW = split ? 430 * scale : 0;
  // When the rail moves into the side panel it stops costing vertical space, so the
  // footage gets that height back.
  const chromeH = (d.premise ? 96 : 0) + (d.caption ? 52 : 0) + (anyKeys ? 62 : 0) + (split ? 0 : 66) + 80;
  const availW = ((vertical ? 1010 : 1220) * scale) - sideW;
  const availH = ((vertical ? 1920 : 1080) * scale) - headH - chromeH * scale;

  // The stage fills the space it is given, capped by the capture's own aspect in wide
  // (never upscale a 16:9 capture past its width) and free to go portrait in vertical.
  const stageW = fullBleed ? frameW : Math.min(availW, vertical ? availW : (availH * capW) / capH);
  // In 9:16, do NOT let the stage take the whole column. A 16:9 capture has no portrait
  // region that holds a terminal at readable size AND fills a 0.65 aspect, so the surplus
  // comes back as a dead band of empty editor above the content. Capping the stage at a
  // squarish 0.8 gives the window a shape the capture can actually satisfy, and hands the
  // reclaimed height to the rail and caption.
  const MIN_ASPECT = 0.8;
  const stageH = fullBleed ? frameH : Math.min(availH, vertical ? Math.min(availH, stageW / MIN_ASPECT) : (stageW * capH) / capW);
  const stageAspect = stageW / stageH;

  const bb = cur.bbox;
  // Punching in is not optional in either NARROW case, and for the same reason: the
  // footage no longer has the width to carry a whole 16:9 screen legibly.
  //  · VERTICAL — a 16:9 capture on a phone is unreadable whole.
  //  · SPLIT    — giving a third of the frame to the side panel shrinks the footage by the
  //    same third. Measured on the first split render: the terminal became unreadable, which
  //    would have made `split` a downgrade rather than a tool. Focusing is what pays for the
  //    width the panel takes.
  // A clip with a bbox therefore focuses by default in both; `focus: false` opts out.
  const autoFocus = vertical || split;
  // IN FULL-BLEED THE WHOLE SCREEN IS THE POINT, so the default is no punch-in at all —
  // the capture already fills the frame at close to 1:1 (a 1600x900 capture in a 1920x1080
  // video is a 1.2x upscale) and the callout box is what draws the eye. Punching in on top
  // of that is what was cutting commands off at the right edge. A clip can still ask for
  // focus explicitly, and authored `zooms` still move the camera for a real emphasis beat.
  const wantFocus = fullBleed
    ? Boolean(bb) && cur.focus === true && (cur.zooms ?? []).length > 0
    : Boolean(bb) && (cur.focus === true || (autoFocus && cur.focus !== false));

  // The window we would show with no focus at all: the whole capture, cropped to the
  // stage's aspect so nothing is letterboxed.
  const fullW = Math.min(capW, capH * stageAspect);
  const fullH = Math.min(capH, capW / stageAspect);
  const wide = {x: (capW - fullW) / 2, y: (capH - fullH) / 2, w: fullW, h: fullH};

  // Turn ANY rectangle in capture space into the view window that frames it.
  // COVER, not contain: take the SMALLER of the two candidate windows, so the region
  // FILLS the stage in one axis and is cropped in the other.
  // PAID FOR TWICE. Taking the larger window (contain) means a wide, short target — a
  // terminal panel, the shape that matters most — produces a window nearly as big as the
  // whole capture, i.e. no punch-in and unreadable type. Measured: a 1252x300 bbox in a
  // 1600x900 capture asked for a 1477px window, 92% of the frame.
  // The floor stops the opposite failure: a one-line target blowing up into mush
  // (LAW 0o rule 6 — space comes from carrying less, never from unreadable scale), and it
  // is tighter in 9:16/split because those hold LESS CONTENT, not smaller type.
  const windowFor = (
    r?: {x: number; y: number; w: number; h: number},
    keepLeft?: {x: number; w: number},
  ) => {
    if (!r) return wide;
    const bw = Math.max(1, Number(r.w));
    const bh = Math.max(1, Number(r.h));
    // THE WINDOW MUST CONTAIN THE TARGET'S WIDTH. Text is read across, so a window
    // narrower than the thing it frames does not "punch in" — it cuts the sentence, and
    // draws a highlight box that leaves the screen with its label attached.
    //
    // PAID FOR, owner on the shipped shorts: *"Shorts still has part of the required video
    // hidden due to width, and mostly the highlights that is done gets hidden to the right"*
    // and on the wide cut *"the command you are executing gets hidden to the right"*.
    // Measured: the mark on `cur.execute("SELECT ... ?", (wanted,))` is 723px wide, and this
    // line produced a 381px window — the box was nearly twice the frame it was drawn in.
    //
    // The old form took `Math.min(width-driven, height-driven)` — COVER, from gotcha 33,
    // which was written for the CLIP BBOX (a wide, short terminal that should be punched
    // into). Applied to a MARK, whose height is one text line, the height-driven candidate is
    // always tiny, so the minimum could never contain the words. Width leads; height follows.
    let winW = Math.max(bw * 1.08, capW / (vertical || split ? 4.2 : 3.2));
    let winH = winW / stageAspect;
    if (winH > capH) { winH = capH; winW = winH * stageAspect; }
    if (winW > capW) { winW = capW; winH = winW / stageAspect; }
    // FRAME FROM THE LEADING EDGE, not the centre. Text reads left-to-right, so a narrow
    // target that is CENTRED splits the empty space evenly either side — measured on the
    // first zoom-to-a-line render: a third of the stage was blank editor to the left of the
    // words. Sitting the target near the left with room after it shows the line AND what
    // follows it, which is what a viewer is actually reading.
    // A target WIDER than the window still anchors its own left edge (same reason).
    const LEAD_MARGIN = 0.12;
    let cx = bw > winW
      ? Number(r.x) + winW / 2
      : Number(r.x) - winW * LEAD_MARGIN + winW / 2;
    let cy = bh > winH ? Number(r.y) + winH / 2 : Number(r.y) + bh / 2;
    // NEVER CUT THE START OF A LINE. Zooming to a mark in the MIDDLE of a terminal frames
    // that mark, and the window's left edge then lands inside the text — measured on the
    // first 9:16 still of the SQLite short, where "unsafe ->" rendered as "nsafe ->" and the
    // prompt "PS shop3>" as "S shop3>". A character sliced off the left of every line reads
    // as a broken capture, not as a punch-in. So when the whole target still fits, the
    // window is pulled back to the clip's own left edge, which is where prompts and line
    // starts live.
    if (keepLeft) {
      const left = Number(keepLeft.x);
      const fitsFromLeft = Number(r.x) + bw - left <= winW;
      if (fitsFromLeft) cx = Math.min(cx, left + winW / 2);
    }
    cx = Math.min(Math.max(cx, winW / 2), capW - winW / 2);
    cy = Math.min(Math.max(cy, winH / 2), capH - winH / 2);
    return {x: cx - winW / 2, y: cy - winH / 2, w: winW, h: winH};
  };

  // ── THE ZOOM TIMELINE ───────────────────────────────────────────────────────
  // A clip used to get ONE focus for its whole duration, which cannot teach a step that
  // has two things worth looking at: the line you typed AND the output it produced. A clip
  // now carries a SEQUENCE of zoom moves, each on its OWN spoken word (LAW 0i.1), so the
  // camera can go to the code, then the output, then back out — while the footage under it
  // is the same frozen frame.
  //
  //   "zooms": [{"mark": "greeting", "atWord": 14}, {"at": "full", "atWord": 22}]
  //
  // Entry 0 is always the clip's own default, so a clip with no `zooms` behaves exactly as
  // before. `mark` points at a rectangle the RUNNER measured; `at: "full"` pulls back out.
  // IN FULL-BLEED THE CAMERA DOES NOT MOVE. The whole recording stays on screen for the
  // whole beat and the neon box does the pointing — which is what "the video as base, with
  // components floating over it" means, and the only way a long command is never cut. A mark
  // zoom would crop it again: the SEARCH mark is 220px wide, so its window is ~500 of 1600,
  // and everything past it leaves the frame. Emphasis moved from the lens to the overlay.
  const targets = fullBleed
    ? [{at: curStart, win: wide}]
    : [{at: curStart, win: wantFocus ? windowFor(bb) : wide}];
  if (!fullBleed) {
    for (const z of cur.zooms ?? []) {
      const at = wordToFrame(z.atWord ?? cur.atWord ?? 1);
      const r = z.at === 'full' ? undefined : (z.mark ? cur.marks?.[z.mark] : bb);
      targets.push({at, win: z.at === 'full' ? wide : windowFor(r, bb as any)});
    }
  }
  targets.sort((a, b) => a.at - b.at);

  let zi = 0;
  for (let i = 0; i < targets.length; i++) if (frame >= targets[i].at) zi = i;
  const from = targets[Math.max(0, zi - 1)].win;
  const to = targets[zi].win;
  // Ease into each move so it reads as a camera, not a cut. The 18-frame ramp is a
  // COSMETIC constant measured from the move's own anchor — never step timing.
  // EASED, not linear. A linear camera move starts and stops abruptly and reads as a
  // slide; easeInOutCubic (the repo's own curve, src/motion/util) accelerates and settles,
  // which is what makes a push feel like a camera rather than a transform. The 18-frame
  // ramp is COSMETIC and measured from the move's own anchor — never step timing.
  const fzRaw = interpolate(frame, [targets[zi].at, targets[zi].at + 18], [0, 1], clamp);
  const fz = easeInOutCubic(fzRaw);
  const lerp = (a: number, b: number) => a + (b - a) * fz;
  const view = {
    x: lerp(from.x, to.x),
    y: lerp(from.y, to.y),
    w: lerp(from.w, to.w),
    h: lerp(from.h, to.h),
  };

  // How much the capture is scaled to make `view` fill the stage, and where that puts
  // the capture's top-left. Overlays live in the same scaled box, so a bbox in capture
  // space maps to the right pixels with no extra maths.
  const k = stageW / view.w;
  const innerW = capW * k;
  const innerH = capH * k;
  const innerX = -view.x * k;
  const innerY = -view.y * k;

  // WHERE DOES THE FURNITURE GO? WHERE THE WORK ISN'T.
  //
  // Owner: *"components that float over the video that does not hide the content"*. In
  // full-bleed the rail and the caption were pinned to the floor, and the floor is exactly
  // where a terminal lives — so the overlays covered the SEARCH line the beat was about.
  //
  // The runner already measured the region of interest for this step (the clip bbox), so the
  // answer is not a guess: put the cluster on whichever side of that region has room for it.
  // A terminal at the bottom pushes the furniture to the top; an editor beat at the top
  // pushes it to the floor.
  // COUNT EVERY ROW, AND THE GAPS BETWEEN THEM.
  //
  // This estimate was short by about ninety pixels: it forgot the 10px flex gap between each
  // child, and it predated the animated overlay that now rides in the same column. Because the
  // cluster is CENTRED in the gap, half of any underestimate spills upward — and upward is the
  // code. Pulled from the finished render: the premise line sat squarely on top of `con.close()`
  // while the rail and caption below it were correctly inside the band.
  const hasOverlay = clips.some((c) => c.overlay);
  const measure = (compact: boolean) => {
    const rows = (d.premise ? 1 : 0) + (d.caption ? 1 : 0) + (split ? 0 : 1) +
      (anyKeys && !compact ? 1 : 0) + (hasOverlay ? 1 : 0);
    return ((d.premise ? (compact ? 30 : 60) : 0) + (d.caption ? 46 : 0) + (split ? 0 : 44) +
      (anyKeys && !compact ? 48 : 0) + (hasOverlay ? 56 : 0) +
      Math.max(0, rows - 1) * 10 + (compact ? 12 : 34)) * scale;
  };
  const clusterHFull = measure(false);

  // THE MARKS KNOW WHERE THE INK IS. A bbox is a PANE, not the writing in it, so "outside
  // the bbox" is not the same as "empty" — measured on an editor beat, the cluster went
  // below the editor pane and landed squarely on the terminal, which is content too.
  //
  // Every mark the runner measured is a rectangle around real text this beat points at. Take
  // all of them across every clip in the scene, project them into screen space, and find the
  // tallest horizontal band with none of them in it. That is where the furniture goes.
  const inkBands = clips
    .flatMap((c) => Object.values((c.marks ?? {}) as Record<string, {y: number; h: number}>))
    .map((m) => ({
      top: (Number(m.y) - view.y) * k - 10 * scale,
      bot: (Number(m.y) + Number(m.h) - view.y) * k + 10 * scale,
    }))
    .filter((b) => b.bot > 0 && b.top < frameH)
    .sort((a, b) => a.top - b.top);

  let gapTop = 0;
  let gapBot = frameH;
  if (inkBands.length) {
    const edges = [{top: -1e6, bot: 0}, ...inkBands, {top: frameH, bot: 1e6}];
    let best = -1;
    for (let i = 0; i < edges.length - 1; i++) {
      // bands can overlap, so carry the furthest bottom seen so far
      const from = Math.max(...edges.slice(0, i + 1).map((e) => e.bot));
      const to = edges[i + 1].top;
      if (to - from > best) { best = to - from; gapTop = from; gapBot = to; }
    }
  }
  const gapH = gapBot - gapTop;

  // Fall back to the bbox rule when the beat marked nothing.
  const bbTopPx = bb ? (Number(bb.y) - view.y) * k : frameH;
  const bbBotPx = bb ? (Number(bb.y) + Number(bb.h) - view.y) * k : 0;
  const roomBelow = frameH - bbBotPx;
  const roomAbove = bbTopPx;
  // WHEN NOTHING FITS, SHRINK — do not just move.
  //
  // Pulled from the finished render: on the parameters beat the free band between the last line
  // of code and the terminal is about 117px, and the full cluster wants 180. Centring it, or
  // clamping it, only chooses WHICH content it covers. The honest answer is that the furniture
  // has to get smaller: the empty keycap row this clip never uses goes first, then the standing
  // premise drops to a single small line. Both are furniture; the code underneath is the lesson.
  // WHEN THERE ARE MARKS, THE INK GAP WINS — the bbox is blind to the terminal.
  //
  // The first attempt at this asked "does the full cluster fit ANYWHERE", and the bbox answered
  // yes: 480px of room below the editor pane. But that room IS the terminal, which is content the
  // bbox knows nothing about, so compact mode never fired and the premise stayed on the code. The
  // marks are the only thing that knows where real ink is, so once a beat has any, the gap between
  // them is the only band considered — and the cluster shrinks to fit it rather than spilling out.
  const haveMarks = inkBands.length > 0;
  const compact = fullBleed && haveMarks && gapH < clusterHFull + 24 * scale;
  const clusterH = compact ? measure(true) : clusterHFull;
  const hasGap = fullBleed && haveMarks && gapH >= clusterH + 10 * scale;

  const clusterAtTop = fullBleed && !hasGap && roomBelow < clusterH && roomAbove >= clusterH;
  const band = clusterAtTop ? roomAbove : roomBelow;
  // NEVER START ABOVE THE GAP. Centring is right when the cluster fits; when it does not, the
  // overflow must go DOWN into whatever slack is left, never up onto the work. An estimate can
  // still be wrong — this makes being wrong harmless in the direction that matters.
  const clusterInset = hasGap
    ? Math.max(gapTop + 6 * scale, gapTop + (gapH - clusterH) / 2)
    : Math.max(20 * scale, (band - clusterH) / 2);

  const mono = t.fonts.mono;

  // THE STANDING SETUP (LAW 0l) — what the viewer is looking at, on screen for the whole
  // beat, unanchored. In full-bleed it JOINS THE CLUSTER rather than taking the opposite
  // edge: parking it on the far side just moved the problem, because when the work is at the
  // bottom the "free" edge is the top and the premise was landing on the terminal instead.
  // One group, one free side, nothing on the work.
  const premiseNode = d.premise ? (
    <div
      style={{
        position: 'relative', zIndex: 2,
        maxWidth: fullBleed ? frameW * 0.9 : stageW,
        padding: fullBleed ? `0 ${40 * scale}px` : 0,
        fontFamily: t.fonts.body,
        fontSize: (compact ? 17 : 21) * scale,
        lineHeight: compact ? 1.25 : 1.42,
        // one line only when the band is tight — a wrapped premise is what lands on the code
        ...(compact ? {whiteSpace: 'nowrap' as const, overflow: 'hidden' as const,
                       textOverflow: 'ellipsis' as const} : {}),
        color: fullBleed ? hexA(t.colors.text, 0.95) : hexA(t.colors.text, 0.82),
        textAlign: 'center',
      }}
    >
      {d.premise}
    </div>
  ) : null;

  return (
    <AbsoluteFill style={{background: t.colors.bg}}>
      {scene.data.headline ? <Headline text={String(scene.data.headline)} color={d.color ?? 'blue'} startFrame={base} /> : null}

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: fullBleed ? 'flex-start' : 'center',
          flexDirection: 'column',
          gap: fullBleed ? 0 : 16 * scale,
          paddingTop: fullBleed ? 28 * scale : headH,
          paddingBottom: fullBleed ? 26 * scale : 40 * scale,
          opacity: appear,
        }}
      >
        {/* SCRIMS. An overlay on top of a recording has to stay legible whatever happens to
            be under it — a white terminal, a bright IDE theme, a diff. Two gradients, from
            the frame's own background colour at the edge to fully transparent, give the
            premise and the caption a reliable ground without hiding any of the footage they
            sit over. They are painted between the video and the text, never over the middle
            of the frame where the work is. */}
        {fullBleed && !hasGap ? (
          <>
            {/* ONE SCRIM, ON THE EDGE THE CLUSTER CHOSE. Everything that floats lives in
                that one group now, so a second gradient on the opposite edge would only be
                dimming footage nothing is written over. */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              ...(clusterAtTop ? {top: 0} : {bottom: 0}),
              height: (vertical ? 320 : 250) * scale, zIndex: 1, pointerEvents: 'none',
              background: `linear-gradient(to ${clusterAtTop ? 'bottom' : 'top'}, ${hexA(t.colors.bg, 0.93)}, ${hexA(t.colors.bg, 0)})`,
            }} />
          </>
        ) : null}
        {fullBleed ? null : premiseNode}

        {/* footage, and — when split — the demo's own steps beside it */}
        <div style={fullBleed
          ? {position: 'absolute', inset: 0, zIndex: 0}
          : {display: 'flex', gap: split ? 22 * scale : 0, alignItems: 'stretch'}}>
        <div
          style={{
            width: fullBleed ? '100%' : stageW,
            height: fullBleed ? '100%' : stageH,
            borderRadius: fullBleed ? 0 : rad,
            overflow: 'hidden',
            position: 'relative',
            // No card, no border, no drop shadow: in full-bleed the recording is the
            // background of the whole video, not an object sitting on one.
            border: fullBleed ? 'none' : `${2 * scale}px solid ${hexA(accent, held ? 0.5 : 0.8)}`,
            boxShadow: fullBleed ? 'none' : `0 ${18 * scale}px ${46 * scale}px ${hexA('#000000', 0.45)}`,
            background: t.colors.panel,
          }}
        >
          {/* THE SCALED CAPTURE BOX. Absolute size and offset rather than a transform:
              the whole capture is laid out at scale `k` and slid so `view` sits in the
              stage. Overlays are children of this box, so a rectangle in capture space
              maps to the right pixels by percentage alone — which removed three separate
              transform bugs (origin, centring and stroke compensation). */}
          <div
            style={{
              position: 'absolute',
              left: innerX,
              top: innerY,
              width: innerW,
              height: innerH,
            }}
          >
            {/* Sequence.from = this segment's OWN anchor, so the clip's internal
                time starts at 0 exactly when its word is spoken. endBehavior
                'freeze' holds the last decoded frame once the footage runs out. */}
            <Sequence from={curStart} layout="none">
              <ClipVideo
                src={cur.src}
                fit="cover"
                muted
                endBehavior="freeze"
                placeholderLabel={cur.src ? 'CLIP MISSING' : 'NOT BAKED'}
                style={{background: t.colors.panel}}
              />
            </Sequence>
          {/* CALLOUTS — a label and a leader line pointing at a rectangle the RUNNER
              MEASURED, never a hand-placed pixel. Each appears at its OWN spoken word, so
              a single held frame can be annotated three times as the voice works through
              it. Drawn in capture space and scaled with the stage, so the arrow still
              lands if the capture size or the stage size changes.
              They ride INSIDE the zoom container so a punch-in carries them along. */}
          {(() => {
            // ── PLACE EVERY VISIBLE CALLOUT TOGETHER, NOT ONE AT A TIME ────────────
            //
            // Owner, on the shipped cuts: *"the point for the highlights are coming from the
            // center of the highlight box, sometimes its fine, sometimes, it hides the text,
            // which can be adjusted by making the lines and dot responsive to the UI, so that
            // it can be displayed at any place on the screen like top right, top left, which
            // doesnt overlap with another highlight."*
            //
            // Three defects in one sentence, and all three came from deciding each callout in
            // isolation, in its own `.map()` iteration:
            //   1. the leader started at the box CENTRE, so it crossed the very words the box
            //      was drawn around;
            //   2. a label could land on another callout's box, because nothing knew the
            //      others existed;
            //   3. "right" was preferred unconditionally, which on a terminal line is exactly
            //      where the rest of the command is.
            //
            // So placement is solved for the whole set first: the leader leaves from the box
            // EDGE facing the label, and each label takes the best free position out of ten,
            // scored against the other boxes and the labels already placed.
            // DECIDE AGAINST WHERE THE CAMERA IS GOING, NOT WHERE IT IS THIS FRAME.
            //
            // Owner, on the 9:16 cut: *"when you moved the camera to right when already a
            // part of the code is highlighted, it moved, but the anchor dot ... stayed in the
            // old place, and the line was cross then it moved to the new place"*. The
            // placement was solved against the ANIMATING window, so as the view slid a
            // candidate that had been rejected became valid and the label teleported
            // mid-move, dragging its leader across the frame.
            //
            // `to` is the window this move is heading for and is constant for its whole
            // duration, so the choice is made once. The box and the label both live in
            // capture space inside the scaled container, so they travel WITH the camera —
            // the geometry animates, the decision does not.
            const vx = to.x, vy = to.y, vw = to.w, vh = to.h;
            // capture units per rendered pixel — labels are HTML sized in screen px, the
            // geometry is in capture space, and collisions have to be judged in one of them.
            const u = vw / Math.max(1, stageW);
            const visible = (cur.callouts ?? []).slice(0, 4)
              .map((co, i) => ({co, i, start: wordToFrame(co.atWord ?? cur.atWord ?? 1)}))
              .filter((e) => frame >= e.start)
              .map((e) => ({...e, target: ((e.co.mark && cur.marks?.[e.co.mark]) || bb) as {x: number; y: number; w: number; h: number}}))
              .filter((e) => !!e.target);

            const pad = 8 * u;
            const gap = 20 * u;
            // THE BOX IS CLAMPED TO WHAT IS ON SCREEN. When a marked line is wider than the
            // window can hold — which 9:16 cannot always avoid, since a 0.8-aspect stage over
            // a 16:9 capture tops out around 720 capture-px of width — an unclamped rect
            // leaves the frame and drags its label with it. Clamping draws the box around the
            // VISIBLE part of the line instead, which still reads as "this line" and stays
            // inside the video.
            const clampBox = (r: {x: number; y: number; w: number; h: number}) => {
              const x0 = Math.max(Number(r.x) - 4, vx + 3);
              const y0 = Math.max(Number(r.y) - 4, vy + 3);
              const x1 = Math.min(Number(r.x) + Number(r.w) + 4, vx + vw - 3);
              const y1 = Math.min(Number(r.y) + Number(r.h) + 4, vy + vh - 3);
              return {x: x0, y: y0, w: Math.max(8, x1 - x0), h: Math.max(8, y1 - y0)};
            };
            const boxes = visible.map((e) => clampBox(e.target));
            type Rect = {x: number; y: number; w: number; h: number};
            const hits = (a: Rect, b: Rect) =>
              a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
            const inside = (r: Rect) =>
              r.x >= vx + pad && r.y >= vy + pad &&
              r.x + r.w <= vx + vw - pad && r.y + r.h <= vy + vh - pad;

            const placed: {x: number; y: number; w: number; h: number}[] = [];
            const placements = visible.map((e, n) => {
              const t = boxes[n];                    // the CLAMPED box, so the label and the
              const tx0 = Number(t.x), ty0 = Number(t.y);   // leader agree with what is drawn
              const tw = Number(t.w), th = Number(t.h);
              const cx = tx0 + tw / 2, cy = ty0 + th / 2;
              const txt = String(e.co.text ?? '');
              // Estimated on the same numbers the label is styled with, below.
              const lw = (txt.length * 17 * 0.62 + 26) * scale * u;
              const lh = (17 * 1.55 + 12) * scale * u;

              // A TERMINAL FILLS FROM THE TOP AND THE LAST LINE HAS EMPTY SPACE UNDER IT, so
              // "below" is the safest place for a label on the lower half of a pane, and
              // "above" for the upper half. The previous rule was the other way round.
              const lower = cy > vy + vh * 0.5;
              const order = lower
                ? ['below', 'below-right', 'below-left', 'above', 'right', 'left', 'above-right', 'above-left']
                : ['above', 'above-right', 'above-left', 'below', 'right', 'left', 'below-right', 'below-left'];
              const at = (side: string) => {
                switch (side) {
                  case 'right': return {x: tx0 + tw + gap, y: cy - lh / 2, side};
                  case 'left': return {x: tx0 - gap - lw, y: cy - lh / 2, side};
                  case 'above': return {x: cx - lw / 2, y: ty0 - gap - lh, side};
                  case 'below': return {x: cx - lw / 2, y: ty0 + th + gap, side};
                  case 'above-right': return {x: tx0 + tw * 0.5, y: ty0 - gap - lh, side};
                  case 'above-left': return {x: tx0 + tw * 0.5 - lw, y: ty0 - gap - lh, side};
                  case 'below-right': return {x: tx0 + tw * 0.5, y: ty0 + th + gap, side};
                  default: return {x: tx0 + tw * 0.5 - lw, y: ty0 + th + gap, side};
                }
              };
              const obstacles = boxes.filter((_, k) => k !== n).concat(placed);
              let pick = null;
              for (const side of (e.co.side ? [e.co.side, ...order] : order)) {
                const p = at(side);
                const r = {x: p.x, y: p.y, w: lw, h: lh};
                if (!inside(r)) continue;
                if (obstacles.some((o) => hits(r, o))) continue;
                pick = {...p, w: lw, h: lh};
                break;
              }
              if (!pick) {
                // Nothing clean: sit it in the emptiest corner of the view rather than on
                // top of something. A label the viewer can read beside the wrong thing beats
                // a label they cannot read at all.
                const corners = [
                  {x: vx + vw - pad - lw, y: vy + pad, side: 'corner'},
                  {x: vx + pad, y: vy + pad, side: 'corner'},
                  {x: vx + vw - pad - lw, y: vy + vh - pad - lh, side: 'corner'},
                  {x: vx + pad, y: vy + vh - pad - lh, side: 'corner'},
                ];
                pick = corners
                  .map((p) => ({p, bad: obstacles.filter((o) => hits({...p, w: lw, h: lh}, o)).length}))
                  .sort((a, b) => a.bad - b.bad)[0].p;
                pick = {...pick, w: lw, h: lh};
              }
              placed.push({x: pick.x, y: pick.y, w: lw, h: lh});

              // THE LEADER LEAVES FROM THE EDGE OF THE BOX, not its middle, so it never
              // crosses the words the box is drawn around. The end it leaves from is the one
              // facing the label.
              const lcx = pick.x + lw / 2, lcy = pick.y + lh / 2;
              const ax = lcx < tx0 ? tx0 : lcx > tx0 + tw ? tx0 + tw : cx;
              const ay = lcy < ty0 ? ty0 : lcy > ty0 + th ? ty0 + th : cy;
              // ...and lands on the label's nearest edge, not its centre.
              const bx = lcx < ax ? pick.x + lw : lcx > ax ? pick.x : lcx;
              const by = lcy < ay ? pick.y + lh : lcy > ay ? pick.y : lcy;
              return {...e, ax, ay, bx, by, label: pick, box: t};
            });

            return placements.map(({co, i, start, target, ax, ay, bx, by, label, box}) => {
            const t0 = interpolate(frame, [start, start + 12], [0, 1], clamp);
            const tx = ax;
            const ty = ay;
            const lx = bx;
            const ly = by;
            const c = sem(co.color ?? d.color ?? 'blue');
            const glow = t.style.glow;
            // Stroke the outline on over ~14 frames from this callout's OWN anchor.
            const draw = easeInOutCubic(interpolate(frame, [start, start + 14], [0, 1], clamp));
            const perim = 2 * (box.w + box.h) + 40;
            return (
              <AbsoluteFill key={`co-${active}-${i}`} style={{pointerEvents: 'none', opacity: t0}}>
                <svg width="100%" height="100%" viewBox={`0 0 ${capW} ${capH}`} preserveAspectRatio="none">
                  {/* NEON HIGHLIGHT. The glow amount is a THEME TOKEN (t.style.glow), the
                      same one NeonText uses, so a flat design pack degrades to a clean
                      outline instead of shipping a glow that fights its grammar.
                      The box DRAWS ON rather than appearing: a dash offset that retracts
                      over ~14 frames from the callout's own anchor. A pulse would keep
                      moving after the point is made (LAW 0h is about exactly that kind of
                      standing distraction); a draw-on lands once and then holds. */}
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx={6}
                    fill={glow > 0 ? hexA(c, 0.1 * t0) : 'none'}
                    stroke={c}
                    strokeWidth={3 / k}
                    strokeDasharray={perim}
                    strokeDashoffset={perim * (1 - draw)}
                    style={glow > 0
                      ? {filter: `drop-shadow(0 0 ${6 * glow}px ${hexA(c, 0.9)}) drop-shadow(0 0 ${16 * glow}px ${hexA(c, 0.5)})`}
                      : undefined}
                  />
                  <line
                    x1={tx} y1={ty}
                    x2={tx + (lx - tx) * draw} y2={ty + (ly - ty) * draw}
                    stroke={c} strokeWidth={3 / k} strokeLinecap="round"
                    style={glow > 0 ? {filter: `drop-shadow(0 0 ${5 * glow}px ${hexA(c, 0.8)})`} : undefined}
                  />
                  <circle cx={tx} cy={ty} r={(5 / k) * draw} fill={c} />
                </svg>
                {co.text ? (
                  <div
                    style={{
                      position: 'absolute',
                      // The solver already chose a free RECTANGLE in capture space, so the
                      // label is positioned by its own top-left and needs no side-based
                      // transform. The old translate()/transformOrigin pair re-derived a
                      // position the solver had already decided, which is how a label ended
                      // up half a box away from where collision was checked.
                      left: `${(label.x / capW) * 100}%`,
                      top: `${(label.y / capH) * 100}%`,
                      // NO scale compensation. The label is HTML inside the scaled BOX,
                      // not inside the SVG's user-unit space, so its font-size is already
                      // in real pixels. (SVG strokes DO still divide by k.)
                      background: c,
                      color: t.colors.bg,
                      fontFamily: t.fonts.mono,
                      fontSize: 17 * scale,
                      fontWeight: 700,
                      padding: `${5 * scale}px ${11 * scale}px`,
                      borderRadius: 6 * scale,
                      whiteSpace: 'nowrap',
                      boxShadow: `0 ${4 * scale}px ${14 * scale}px ${hexA('#000000', 0.5)}`,
                    }}
                  >
                    {String(co.text).slice(0, 64)}
                  </div>
                ) : null}
              </AbsoluteFill>
            );
            });
          })()}

          </div>

          {/* SPOTLIGHT — dim everything except the bbox the runner reported. Only
              when the step asks for it and is not already punched in. */}
          {bb && cur.spotlight && !wantFocus ? (
            <AbsoluteFill style={{pointerEvents: 'none'}}>
              <svg width="100%" height="100%" viewBox={`0 0 ${capW} ${capH}`} preserveAspectRatio="none">
                <defs>
                  <mask id={`sp-${active}`}>
                    <rect x="0" y="0" width={capW} height={capH} fill="white" />
                    <rect
                      x={Number(bb.x)}
                      y={Number(bb.y)}
                      width={Number(bb.w)}
                      height={Number(bb.h)}
                      rx={10}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width={capW}
                  height={capH}
                  fill={hexA('#000000', 0.62 * fz)}
                  mask={`url(#sp-${active})`}
                />
                <rect
                  x={Number(bb.x)}
                  y={Number(bb.y)}
                  width={Number(bb.w)}
                  height={Number(bb.h)}
                  rx={10}
                  fill="none"
                  stroke={accent}
                  strokeWidth={3}
                  opacity={fz}
                />
              </svg>
            </AbsoluteFill>
          ) : null}
        </div>

        {/* THE SIDE PANEL — the demo's OWN steps, read down the side. It is built from the
            same clip list the rail uses, so it can never disagree with what was recorded:
            each row is a step, ticked once its word has been spoken, and the ACTIVE row
            carries that step's callout text at readable size. This is the "side by side"
            case: a wide capture with a small region of interest and a lot to say.
            Every row resolves from its own `atWord` — no fixed interval (LAW 0i.1). */}
        {split ? (
          <div
            style={{
              width: sideW - 22 * scale,
              display: 'flex',
              flexDirection: 'column',
              gap: 10 * scale,
              justifyContent: 'safe center',
            }}
          >
            {clips.map((c, i) => {
              const on = i === active;
              const done = frame >= starts[i];
              const note = on ? (c.callouts ?? []).find((co) => frame >= wordToFrame(co.atWord ?? c.atWord ?? 1)) : null;
              return (
                <div
                  key={i}
                  style={{
                    padding: `${10 * scale}px ${13 * scale}px`,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    background: on ? hexA(accent, 0.16) : hexA(t.colors.text, done ? 0.05 : 0.02),
                    borderLeft: `${3 * scale}px solid ${on ? accent : hexA(t.colors.text, done ? 0.22 : 0.08)}`,
                    opacity: done ? 1 : 0.45,
                  }}
                >
                  <div style={{display: 'flex', gap: 8 * scale, alignItems: 'baseline'}}>
                    <span style={{fontFamily: mono, fontSize: 14 * scale, color: done ? accent : hexA(t.colors.text, 0.4)}}>
                      {done ? '✓' : String(i + 1)}
                    </span>
                    <span style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: t.colors.text, fontWeight: on ? 700 : 400}}>
                      {String(c.label ?? c.id ?? 'step')}
                    </span>
                  </div>
                  {note?.text ? (
                    <div style={{marginTop: 6 * scale, fontFamily: t.fonts.body, fontSize: 16 * scale,
                                 lineHeight: 1.35, color: hexA(t.colors.text, 0.85)}}>
                      {String(note.text)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
        </div>

        {/* KEYCAPS — the chord the RUNNER ACTUALLY PRESSED for this step, drawn as keys.
            Recorded at capture time (`keys` in the manifest), never hand-authored, so it
            cannot drift from the take: if the demo stops pressing Ctrl+S, the keycaps stop
            saying Ctrl+S. This is the one overlay that answers "what did you just DO",
            which a screen recording otherwise leaves invisible. */}
        {/* THE BOTTOM CLUSTER — keycaps, step rail and caption travel together, and in
            full-bleed they are pinned to whichever edge the WORK is not on. `display:
            contents` keeps the card layout byte-identical: the wrapper vanishes and the three
            blocks stay direct children of the column exactly as before. */}
        <div style={fullBleed
          ? {position: 'absolute', left: 0, right: 0, [hasGap || clusterAtTop ? 'top' : 'bottom']: clusterInset,
             zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale,
             // A SCRIM UNDER THE CLUSTER ITSELF, not along the frame edge.
             //
             // The marks are a SPARSE sample of the ink — they are the lines this beat points at,
             // not every line on screen. So the "tallest band with no marks in it" can still be
             // full of unmarked code, and on a full IDE screen it always is: there is no empty
             // space to find. Pulled from the finished render, the premise sat on an unmarked
             // `print(...)` with nothing behind it, reading as two texts colliding.
             //
             // Covering something is unavoidable when the screen is full; being ILLEGIBLE is not.
             // The edge gradient only helped when the cluster was against an edge, so the group
             // now carries its own ground wherever it lands.
             paddingTop: 14 * scale, paddingBottom: 14 * scale,
             background: `linear-gradient(to bottom, ${hexA(t.colors.bg, 0)}, ${hexA(t.colors.bg, 0.9)} 14%, ${hexA(t.colors.bg, 0.9)} 86%, ${hexA(t.colors.bg, 0)})`,
             backdropFilter: 'blur(3px)'}
          : {display: 'contents'}}>
          {fullBleed ? premiseNode : null}
          {/* THE EXPLAINING LAYER. Until now this group could only carry furniture — a rail, a
              keycap, a caption. An overlay that ANIMATES what the command is doing rides here
              too, in the same measured ink-free band, so it still covers nothing. */}
          {cur.overlay ? (
            <StepOverlay
              data={cur.overlay as any}
              fallbackAtWord={cur.atWord}
              maxWidth={(fullBleed ? frameW * 0.86 : stageW)}
            />
          ) : null}
        {anyKeys ? (() => {
          // The reservation keeps the cluster from jumping between clips when one has a chord
          // and the next does not — but 44px of nothing is not worth covering a line of code
          // for, so it is the first thing dropped when the band is tight.
          if (!(cur.keys ?? []).length) return compact ? null : <div style={{height: 44 * scale}} />;
          const kStart = wordToFrame(cur.keysAtWord ?? cur.atWord ?? 1);
          if (frame < kStart) return null;
          // A KEYPRESS IS AN EVENT, NOT A STATE. This only faded IN, so "Ctrl + P" sat on
          // screen until the next scene cut — owner: *"it gets displayed but didnt disappear
          // until the next video cutscene started"*. A chord happens once: it presses in over
          // 8 frames, holds long enough to read (36f ~ 1.2s), and releases over 12.
          const K_IN = 8, K_HOLD = 36, K_OUT = 12;
          const kp = interpolate(
            frame,
            [kStart, kStart + K_IN, kStart + K_IN + K_HOLD, kStart + K_IN + K_HOLD + K_OUT],
            [0, 1, 1, 0],
            clamp,
          );
          return (
            <div style={{position: 'relative', zIndex: 2, display: 'flex', gap: 8 * scale, alignItems: 'center', opacity: kp}}>
              {(cur.keys ?? []).map((key, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? (
                    <span style={{fontFamily: mono, fontSize: 20 * scale, color: hexA(t.colors.text, 0.5)}}>+</span>
                  ) : null}
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 20 * scale,
                      fontWeight: 700,
                      color: t.colors.text,
                      background: hexA(t.colors.text, 0.09),
                      border: `${1.5 * scale}px solid ${hexA(t.colors.text, 0.28)}`,
                      // a key has a bottom edge — that is what makes it read as a KEY
                      borderBottomWidth: `${4 * scale}px`,
                      borderRadius: 7 * scale,
                      padding: `${5 * scale}px ${13 * scale}px`,
                      // spring in: the cap "presses" as it appears
                      transform: `translateY(${(1 - kp) * -6 * scale}px)`,
                    }}
                  >
                    {String(key)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          );
        })() : null}

        {/* step rail — which step of the demo this is, and its plain-English note.
            Hidden when split, because the side panel already carries the steps. */}
        {split ? null : <div style={{position: 'relative', zIndex: 2, display: 'flex', gap: 8 * scale, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: fullBleed ? frameW * 0.92 : stageW, marginBottom: fullBleed ? 10 * scale : 0}}>
          {clips.map((c, i) => {
            const on = i === active;
            const done = frame >= starts[i];
            return (
              <div
                key={i}
                style={{
                  fontFamily: mono,
                  fontSize: 15 * scale,
                  padding: `${5 * scale}px ${11 * scale}px`,
                  borderRadius: 999,
                  color: on ? t.colors.bg : hexA(t.colors.text, done ? 0.75 : 0.34),
                  background: on ? accent : hexA(t.colors.text, done ? 0.1 : 0.04),
                  border: `${1 * scale}px solid ${on ? accent : hexA(t.colors.text, 0.12)}`,
                }}
              >
                {i + 1}. {String(c.label ?? c.id ?? 'step')}
              </div>
            );
          })}
        </div>}

        {d.caption ? (
          <div
            style={{
              position: 'relative', zIndex: 2,
              // TYPOGRAPHY ROLES, as themes.ts defines them: display carries headlines and
              // big statements, body is the deliberately invisible face for longer text. The
              // caption is the beat's one-line takeaway — a statement — so it belongs in the
              // theme's display face. In body it rendered as neutral Inter next to
              // components using Space Grotesk, which is what "normal fonts" looks like.
              fontFamily: t.fonts.display,
              fontSize: (fullBleed ? 27 : 23) * scale,
              fontWeight: t.style.displayWeight,
              letterSpacing: t.style.displayTracking,
              color: hexA(t.colors.text, fullBleed ? 0.97 : 0.9),
              textAlign: 'center',
              maxWidth: fullBleed ? frameW * 0.9 : stageW,
            }}
          >
            {d.caption}
          </div>
        ) : null}
        </div>
      </AbsoluteFill>

      {scene.data.source ? <SourceFooter text={String(scene.data.source)} /> : null}
    </AbsoluteFill>
  );
};
