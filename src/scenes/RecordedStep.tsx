import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {StepOverlay, minCardWidth} from '../recordedOverlay';
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
  // THE CARD IS NOW A SIBLING OF THE VIDEO, SO THE VIDEO HAS TO BUDGET FOR IT (LAW 0o.1 —
  // measure, never assume). The old figure reserved 66px for the pill row the card replaced;
  // a card carrying a five-row table is four times that, and the surplus came out of the
  // bottom of the frame. Reserved from the card's own contents, the same way the full-bleed
  // cluster measures itself.
  const cardChrome = (() => {
    const o = clips.find((c) => c.overlay)?.overlay as
      {kind?: string; rows?: unknown[]; nodes?: unknown[]; messages?: unknown[]} | undefined;
    let body = 0;
    if (o?.kind === 'rows') body = 30 + (o.rows?.length ?? 0) * 40;
    else if (o?.kind === 'graph') body = 40 + Math.min(3, o.nodes?.length ?? 0) * 62;
    else if (o?.kind === 'seq') body = 54 + (o.messages?.length ?? 0) * 34;
    else if (o) body = 56;
    // caption + premise (full-bleed only) + the step rule + the card's own padding and the
    // gap between it and the video.
    return (d.caption ? 46 : 0) + body + (clips.length > 1 ? 30 : 0) + 58 + 18;
  })();
  const chromeH = (d.premise ? 96 : 0) + (anyKeys ? 62 : 0) + (split ? 0 : cardChrome) + 80;
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
  // `gentle` raises the floor for a FULL-BLEED move. In a focus layout the capture is
  // already a panel and a hard punch-in is the point; in full bleed the whole screen is the
  // subject, so a 3.2x crop stops being a camera move and becomes a different shot — which
  // is the crop that used to cut commands off the right edge. A person leaning towards a
  // page moves maybe 2x, so that is the floor: the move reads as attention, and everything
  // around the target stays on screen.
  const windowFor = (
    r?: {x: number; y: number; w: number; h: number},
    keepLeft?: {x: number; w: number},
    gentle = false,
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
    let winW = Math.max(bw * 1.08, capW / (gentle ? 2 : vertical || split ? 4.2 : 3.2));
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
  // ⚠ AN AUTHORED MOVE IS AN INSTRUCTION, NOT A SUGGESTION — AND IT WAS BEING BINNED.
  //
  // This block used to be guarded by `if (!fullBleed)`, three lines under a comment
  // promising the opposite (*"authored `zooms` still move the camera for a real emphasis
  // beat"*). `layout` defaults to `'full'`, and `'full'` IS full bleed at 16:9 — so the
  // guard covered the default. Counted across the repo the day it was found: **32 clips
  // carry authored zooms and all 32 were discarded**, including every move in
  // `topics/rec-camera-moves`, a topic that exists to demonstrate this feature. The camera
  // has never once moved on a wide cut.
  //
  // Owner, on the Fable browser beats: *"the screen recording, it's just displaying the
  // part. But you must script often like how humans would visit a webpage — scroll through
  // and get to know, with pan, tilt, zoom in/out effects."* The spec said exactly that. The
  // renderer threw it away, silently, which is the field-dropping failure again (LAW 0n
  // corollary, now five-for-five): a spec field that no code path reads produces no error,
  // no warning and no picture.
  //
  // What full bleed still refuses is AUTOMATIC focus — the punch-in nobody asked for, which
  // is what cropped commands off the right edge. An authored move is honoured, at the
  // gentler `windowFor` floor so it leans in rather than re-frames.
  const targets = [{at: curStart, win: wantFocus ? windowFor(bb) : wide}];
  // A move may name SEVERAL marks, and then it frames their union. A pan across a table row
  // is one gesture, not two: zooming to the 178px row LABEL alone crops off the columns the
  // row is being compared against, so the viewer is shown the question without the answer.
  // WHERE A LINE STARTS IS WHERE THE INK STARTS, NOT WHERE THE CAPTURE DOES.
  //
  // `keepLeft` exists so a punch-in never slices the first character off a line — measured
  // on the SQLite short, where "unsafe ->" rendered as "nsafe ->". It was handed the clip's
  // BBOX, i.e. the capture's own left edge, which is correct for a terminal or an editor
  // because that is exactly where prompts and line starts live.
  //
  // A WEB PAGE'S LEFT EDGE IS EMPTY MARGIN. Pulling the window back to it spends the shot
  // on whitespace: measured on the Fable table beat, the window was dragged to x=0 and
  // rendered with the left HALF of the frame blank while the table it had just zoomed to
  // was cut off on the right. The measured ink answers this for both surfaces at once — a
  // terminal's ink starts at the prompt, a page's at its content column.
  const inkRects = (cur.ink ?? []) as {x: number; y: number; w: number; h: number}[];
  const keepLeft = inkRects.length
    ? {x: Math.min(...inkRects.map((r) => Number(r.x))), w: 0}
    : (bb as {x: number; w: number} | undefined);

  const unionOf = (names: string[]) => {
    const rs = names.map((m) => cur.marks?.[m]).filter(Boolean) as
      {x: number; y: number; w: number; h: number}[];
    if (!rs.length) return undefined;
    const x = Math.min(...rs.map((r) => Number(r.x)));
    const y = Math.min(...rs.map((r) => Number(r.y)));
    const x1 = Math.max(...rs.map((r) => Number(r.x) + Number(r.w)));
    const y1 = Math.max(...rs.map((r) => Number(r.y) + Number(r.h)));
    return {x, y, w: x1 - x, h: y1 - y};
  };
  for (const z of cur.zooms ?? []) {
    const at = wordToFrame(z.atWord ?? cur.atWord ?? 1);
    const r = z.at === 'full'
      ? undefined
      : z.marks?.length ? unionOf(z.marks)
      : z.mark ? cur.marks?.[z.mark]
      : bb;
    targets.push({at, win: z.at === 'full' ? wide : windowFor(r, keepLeft, fullBleed)});
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
      (anyKeys && !compact ? 48 : 0) +
      // A `rows` overlay is a TABLE, not a chip — reserving one line for it put a five-row card
      // half on top of the terminal. Reserve what it will actually occupy.
      (hasOverlay ? (() => {
        const o = clips.find((c) => c.overlay)?.overlay as {kind?: string; rows?: unknown[]} | undefined;
        if (o?.kind === 'rows') return 34 + (o.rows?.length ?? 0) * 34;
        return 56;
      })() : 0) +
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
  //
  // AMENDED — THE MARKS ARE A SPARSE SAMPLE OF THE INK, NOT THE INK.
  // Owner, on the glassmorphic card: *"I dont know how it will hold when you are explaining
  // the code base, it will definitely overlap right."* He was right, and the proof frame
  // shows it: the card's top edge cutting `ORDER BY revenue DESC;`, because that line
  // carried no callout and therefore did not exist as far as this solver was concerned. Two
  // or three marked rectangles on a screen holding forty lines of text is not a map of the
  // ink. The runner now MEASURES every rendered text row (`inkFor`) and bakes the merged
  // blocks onto the clip, so `ink` is the real answer and the marks only supplement it.
  const inkBands = clips
    .flatMap((c) => [
      ...((c.ink ?? []) as {y: number; h: number}[]),
      ...Object.values((c.marks ?? {}) as Record<string, {y: number; h: number}>),
    ])
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
  const haveMarks = inkBands.length > 0;   // measured ink OR marks — either is real geometry
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

  // ── WHEN IS THE CARD THE SUBJECT, AND HOW MUCH? ─────────────────────────────
  //
  // Owner: *"the overlay over the recording must be visible upto some extent and not for
  // entire cutscene... If something shown in the overlay needs to be focused and is talked
  // about, the background shall be blurred. If background needs to be focused, the overlay
  // shall not exist."*
  //
  // So a step now has two phases, and only ONE thing is the subject in each:
  //
  //   PHASE 1 — the recording is working. Something is being typed, a command is running,
  //             output is arriving. The footage is the subject; there is no card at all.
  //   PHASE 2 — the footage has run out and the last frame is frozen. Nothing on screen is
  //             moving any more, so the card comes up, the footage steps back behind a small
  //             blur, and the card is the subject while the voice explains what just happened.
  //
  // The handover point is the same instant the standing command highlight uses, and for the
  // same reason: it is when the geometry on screen stops changing. The card then LEAVES before
  // the next step starts, so every step opens on a clean frame instead of a card crossfading
  // into another card.
  //
  // An overlay that carries its OWN anchors overrides all of this — an author who has said
  // when each row lands has said when the card matters, and that is better information than
  // any default.
  const cardWindow = (() => {
    const c0 = clips[active];
    if (!c0) return null;
    const nx = active + 1 < starts.length ? starts[active + 1] : (scene.durationFrames ?? 1e6);
    const st = starts[active] ?? 0;
    const ov = c0.overlay as {atWord?: number; rows?: {atWord?: number}[];
      messages?: {atWord?: number}[]; nodes?: {atWord?: number}[]; edges?: {atWord?: number}[]} | undefined;

    const at: number[] = [];
    const push = (w?: number) => { if (w != null) at.push(wordToFrame(w)); };
    if (ov) {
      push(ov.atWord);
      for (const g of [ov.rows, ov.messages, ov.nodes, ov.edges]) for (const e of g ?? []) push(e?.atWord);
    }
    // An authored anchor equal to the clip's own is the FALLBACK the components use, not a
    // real decision, so it does not count as one.
    const authored = at.filter((f) => Math.abs(f - st) > 2);

    if (authored.length) {
      const on = Math.max(st, Math.min(...authored) - 10);
      const off = Math.min(nx, Math.max(...authored) + 40);
      return {on, off: Math.max(on + 60, off), owns: !!ov};
    }
    // THE DEFAULT: appear when the footage freezes, leave before the next step.
    const settle = st + Math.max(0, Number(c0.frames ?? 0) - 2);
    const TAIL = 20;              // ~0.7s of clean frame before the next step takes over
    const MAX = 260;              // and never more than ~8.5s of card in one go
    const on = Math.min(settle, Math.max(st, nx - 90));   // a very short gap still gets a card
    const off = Math.min(nx - TAIL, on + MAX);
    if (off - on < 45) return null;   // no room to show and read one — leave the frame alone
    return {on, off, owns: !!ov};
  })();

  // The dial between the two subjects. Only a card with a DEPICTION dims the work: a caption
  // is furniture, and furniture never earns a blur.
  const cardFocus = (!fullBleed || !cardWindow || !cardWindow.owns) ? 0 : interpolate(
    frame,
    [cardWindow.on, cardWindow.on + 14,
     Math.max(cardWindow.on + 20, cardWindow.off - 12), cardWindow.off],
    [0, 1, 1, 0],
    clamp,
  );

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
        // MONO, letterspaced — the same subtitle voice the wide card uses, so 9:16 and 16:9 read
        // as one design. Owner on the shorts: *"needs to be better viewable, with the font that
        // follows moderndark."* Inter next to Space Grotesk is what "default font" looks like.
        fontFamily: t.fonts.mono,
        fontSize: (compact ? 16 : 19) * scale,
        letterSpacing: 0.9,
        lineHeight: compact ? 1.3 : 1.45,
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
          // LAW 0o.4 — centred flex content that outgrows its box pushes out of the TOP as
          // well as the bottom. `safe center` degrades to flex-start exactly when it would
          // otherwise overflow, which is what the card being in flow makes possible.
          justifyContent: fullBleed ? 'flex-start' : 'safe center',
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

        {/* THE SOURCE STRIP — a standing credit along the bottom of the frame.
            Owner, on the browser beats: *"when you show the browser screen recording, you
            must always say in the official website, and at the bottom there must be a text
            stating the source which is very very important."*
            He is right, and it is not the same field as `premise`. The premise says what the
            viewer is LOOKING at and lives on the card; this says where the footage came FROM
            and must be readable for the whole beat regardless of where the card is parked —
            because footage of somebody else's page is a quotation, and a quotation carries
            its attribution. It sits under everything else in the stack but above the video,
            is never anchored (it is on from frame 0), and is deliberately quiet: small, mono,
            dimmed, with its own scrim so it survives a light page underneath it. */}
        {d.sourceNote ? (
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3,
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
            paddingBottom: (vertical ? 26 : 18) * scale,
            paddingTop: 40 * scale,
            background: `linear-gradient(to top, ${hexA(t.colors.bg, 0.82)}, ${hexA(t.colors.bg, 0)})`,
            pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 17 : 15) * scale,
              letterSpacing: 0.7,
              color: hexA(t.colors.text, 0.72),
              maxWidth: '92%',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{String(d.sourceNote)}</div>
          </div>
        ) : null}

        {/* footage, and — when split — the demo's own steps beside it.
            THE WORK RECEDES WHILE THE CARD IS SPEAKING. Owner: *"If something shown in the
            overlay needs to be focused and is talked about, the background shall be blurred."*
            A small blur and a slight desaturation is enough — the footage stays legible as
            CONTEXT, it just stops competing for the eye. It ramps on the same curve the card
            fades in on, so the handover is one movement rather than two. */}
        <div style={fullBleed
          ? {
              position: 'absolute', inset: 0, zIndex: 0,
              filter: cardFocus > 0.01
                ? `blur(${(4.5 * cardFocus).toFixed(2)}px) saturate(${(1 - 0.35 * cardFocus).toFixed(3)})`
                : undefined,
              // A blur samples outside the element's box and would show the frame's ground at
              // the edges; scaling up by the blur radius keeps the footage edge-to-edge.
              transform: cardFocus > 0.01 ? `scale(${(1 + 0.012 * cardFocus).toFixed(4)})` : undefined,
            }
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
          {/* THE RUNNING COMMAND STAYS LIT FOR THE WHOLE STEP.

              Owner: *"I would like you to highlight the queries each and every time you are
              executing, just helps users to focus on where. you just highlight once and leave!"*

              He is describing two separate holes. The first: only the steps where I had
              hand-authored a callout on the command ever got a box, so most executions were
              never pointed at. The runner now measures every `run` step's own command as a
              `__cmd` mark, so the rectangle always exists. The second: a callout DRAWS ON and
              then the eye moves elsewhere — nothing tells you, ten seconds later, which line
              produced the output being talked about. This is a STANDING highlight: it lands
              once with the clip and then holds, unanimated, for the whole step.

              It is deliberately quieter than a callout — a filled band and a left-edge accent
              bar, no leader, no label — because a beat can carry both, and the callout is the
              one making a point. LAW 0h: it holds, it never pulses. */}
          {(() => {
            const r = cur.marks?.__cmd as {x: number; y: number; w: number; h: number} | undefined;
            if (!r || cur.cmdHighlight === false) return null;
            // STAND DOWN ONLY WHILE A CALLOUT IS ACTUALLY ON THE COMMAND.
            //
            // Two outlines on one line is noise and the callout wins — but only once the
            // callout is VISIBLE. The runner used to make this call, and it got it wrong,
            // because it cannot see the spec: a mark inside the command suppressed the band
            // for the whole step even though its callout arrived eleven seconds later. Here
            // the test is per-frame and geometric, so the band holds the line until the
            // callout takes over, and steps back in if the callout is one of several.
            const hits = (a: {x: number; y: number; w: number; h: number},
                          b: {x: number; y: number; w: number; h: number}) =>
              a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
            const covered = (cur.callouts ?? []).some((co) => {
              if (frame < wordToFrame(co.atWord ?? cur.atWord ?? 1)) return false;
              const m = co.mark ? cur.marks?.[co.mark] : null;
              return !!m && hits(m as {x: number; y: number; w: number; h: number}, r);
            });
            if (covered) return null;
            // WAIT FOR THE FRAME TO FREEZE BEFORE DRAWING ON IT.
            //
            // A mark is measured ONCE, at the end of the step — that is the only moment the
            // runner can measure anything, because it is the only moment the step is done.
            // The clip, meanwhile, PLAYS: the terminal scrolls, output arrives, and the line
            // the rectangle describes is somewhere else for most of the take. Pulled from the
            // scan-vs-search render at frame 1500: the band was drawn around empty space just
            // right of `QUERY PLAN`, because that is where the command WOULD be once the
            // output had landed, and the footage had not got there yet.
            //
            // This is precisely why callouts are anchored after their clip's footage (see the
            // anchor solver). The standing band takes the same rule: it appears when the
            // segment runs out and the last frame freezes, which is when the geometry it was
            // measured against is what is actually on screen — and it then holds for the whole
            // rest of the step, which is the part the owner asked for.
            const settleAt = curStart + Math.max(0, Number(cur.frames ?? 0) - 2);
            const on = interpolate(frame, [settleAt, settleAt + 10], [0, 1], clamp);
            if (on <= 0.001) return null;
            const c = sem(d.color ?? 'blue');
            const x = Number(r.x) - 5, y = Number(r.y) - 3;
            const w = Number(r.w) + 10, h = Number(r.h) + 6;
            return (
              <AbsoluteFill style={{pointerEvents: 'none', opacity: on}}>
                <svg width="100%" height="100%" viewBox={`0 0 ${capW} ${capH}`} preserveAspectRatio="none">
                  <rect x={x} y={y} width={w} height={h} rx={5}
                    fill={hexA(c, 0.14)} stroke={hexA(c, 0.55)} strokeWidth={1.6 / k} />
                  {/* The bar is the "you are here" — it reads at a glance even when the
                      band itself is washed out by bright syntax colouring underneath. */}
                  <rect x={x} y={y} width={3.5 / k} height={h} rx={2 / k} fill={c} />
                </svg>
              </AbsoluteFill>
            );
          })()}

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
              // A LABEL AVOIDS THE INK, NOT JUST THE OTHER LABELS.
              //
              // The solver used to score a candidate against the other callout boxes and the
              // labels already placed — and nothing else, because nothing else was known.
              // Pulled from the scan-vs-search render at frame 1780: *"straight to the rows"*
              // landed squarely on the `CREATE INDEX` line above its target, which is a line
              // the viewer had just been asked to read. The measured ink makes that avoidable,
              // and it is the same list the card's placement uses, so the two agree.
              //
              // The ink is a DEMOTED obstacle: a label that cannot find a clear spot at all
              // still has to go somewhere, and beside the right thing beats nowhere. So it is
              // tried against ink first, and the pass is repeated without it if nothing fits.
              const inkBoxes = ((cur.ink ?? []) as {x: number; y: number; w: number; h: number}[])
                .map((r) => ({x: Number(r.x) - 2, y: Number(r.y) - 2, w: Number(r.w) + 4, h: Number(r.h) + 4}));
              const obstacles = boxes.filter((_, k) => k !== n).concat(placed);
              // ONE SCORED PASS, NOT A LADDER OF FALLBACKS.
              //
              // The solver used to try candidates in preference order, take the first that
              // was clean, and — if none was — dump the label in "the emptiest corner". Pulled
              // from the long cut at frame 22900: with three callouts live on a crowded frame,
              // nothing came back clean and *"and the count moves"* landed in the TOP-RIGHT
              // corner with a leader running diagonally across the entire 1920px frame, over
              // the code, over the card and down into the terminal. A label that far from its
              // target is not pointing at anything; it is a line across the picture.
              //
              // So every candidate is SCORED and the cheapest wins. The weights are an
              // ordering, and they say what matters in what order:
              //   · landing on another callout's box or label is nearly disqualifying —
              //     two labels on top of each other are both unreadable;
              //   · covering measured ink costs its actual area, so a gutter beats a code
              //     line and a short line's right-hand slack beats a long one's;
              //   · distance from the target costs, because a near label needs no leader
              //     to be understood and a far one does;
              //   · preference order is the tie-break, never the whole answer.
              const areaOver = (r: Rect, o: Rect) =>
                Math.max(0, Math.min(r.x + r.w, o.x + o.w) - Math.max(r.x, o.x)) *
                Math.max(0, Math.min(r.y + r.h, o.y + o.h) - Math.max(r.y, o.y));
              const unit = Math.max(1, lw * lh);   // score in label-areas, so `u` cancels out
              let pick: {x: number; y: number; w: number; h: number; side: string} | null = null;
              let best = Infinity;
              (e.co.side ? [e.co.side, ...order] : order).forEach((side, rank) => {
                const q = at(side);
                const r = {x: q.x, y: q.y, w: lw, h: lh};
                if (!inside(r)) return;
                const clash = obstacles.reduce((acc, o) => acc + areaOver(r, o), 0) / unit;
                const ink = inkBoxes.reduce((acc, o) => acc + areaOver(r, o), 0) / unit;
                const away = Math.hypot((r.x + lw / 2) - cx, (r.y + lh / 2) - cy) / Math.max(1, vw);
                // CLASH IS SQUARED, AND THAT IS THE WHOLE POINT OF THE WEIGHT.
                //
                // A flat x100 prices a GRAZE like a COLLISION. Measured on the Fable table
                // beat: the clean spot below `52.6%` overlapped the other callout's box by
                // 3% of a label — a nicked corner — and was charged 3.0, while the spot
                // that covered 30% of the `Fable 5.1` COLUMN HEADER was charged 1.2. So the
                // solver put a label reading *"the new model"* on top of the header naming
                // which model it was. Squaring keeps the intent (0.5 overlap costs 25, a
                // full one costs 100 — still disqualifying) and stops a corner touch from
                // outbidding real text.
                const cost = clash * clash * 100 + ink * 4 + away * 6 + rank * 0.01;
                if (cost < best) { best = cost; pick = {...q, w: lw, h: lh}; }
              });
              if (!pick) {
                // Nothing fits inside the view at all — only possible on a tiny window. Pin it
                // to the target's own corner so the leader stays short.
                pick = {
                  x: Math.min(Math.max(tx0, vx + pad), vx + vw - pad - lw),
                  y: Math.min(Math.max(ty0 - gap - lh, vy + pad), vy + vh - pad - lh),
                  w: lw, h: lh, side: 'pinned',
                };
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
        {/* THE OVERLAY CARD — in BOTH aspects, positionable, and it STAYS while a step is
            being explained.

            Three owner notes, all acted on here:
            · *"in shorts i dont see anything changed"* — the card was gated on `fullBleed`, so 9:16
              still got the old stack of pills and a caption jammed under the video. It renders in
              both now, and in 9:16 it sits BELOW the footage with a real gap, because
              *"there must be gap in between the container box which holds the video, and the one
              row all of them text."*
            · *"I would like to see it stay, whenever something is being explained"* — the earlier
              version faded out early. It now holds for the whole step and only crosses over at the
              boundary into the next one, so it is present whenever there is something to read and
              still re-animates per beat rather than being one permanent block.
            · *"The position of the glassmorphic card, and its width and length must be
              adjustable... it can be a square, a vertical rectangle, a 4:3 or 3:4"* — `card.place`,
              `card.aspect` and `card.width` do that, so a beat that explains code can park a narrow
              portrait card beside it instead of a strip across it. */}
        {(() => {
          // The window is computed once, above, so the card and the blur behind it cannot
          // disagree about when the handover happens.
          if (!cardWindow) return null;
          const IN = 14, OUT = 12;
          const life = interpolate(
            frame,
            [cardWindow.on, cardWindow.on + IN,
             Math.max(cardWindow.on + IN + 6, cardWindow.off - OUT), cardWindow.off],
            [0, 1, 1, 0],
            clamp,
          );
          if (life <= 0.001) return null;

          const cardCfg = d.card ?? {};
          const pad = 42 * scale;
          // The source strip is a STANDING credit along the bottom (LAW 0f corollary, WHAT
          // YOU RECORD FROM SOMEONE ELSE IS A QUOTATION). It is on for the whole beat, so
          // anything the solver parks at the bottom has to clear it — an attribution the
          // card sits on top of is not an attribution.
          const sourceInset = d.sourceNote ? (vertical ? 52 : 44) * scale : 0;

          // ── WHERE THE CARD GOES WHEN NOBODY SAID ──────────────────────────────
          //
          // Owner: *"the overlay need not always sit in the center... the component overlay
          // can be placed at the right or left, where you can see when we are in VS Code the
          // screen recordings, the right side has some gaps where the overlays can fit in,
          // where the overlay need not be a horizontal rectangle, it can be a vertical rounded
          // rectangle, like how in Android Studio or Xcode we see the mobile on the right side
          // of the editor, something like that of that size."*
          //
          // He is describing a DOCK, and the measured ink can find one. Editor text is
          // left-aligned and ragged-right, so on a real IDE capture there is almost always a
          // tall empty column down the right-hand side — exactly the strip a device preview
          // occupies in Android Studio. When that column is wide enough to hold a readable
          // card, the card goes there as a vertical panel and the eye stops being thrown from
          // centre to top to bottom and back.
          //
          // The centre band is the FALLBACK now, not the default: it is where the card goes
          // when the footage genuinely has no free column, which is what a full-width terminal
          // dump looks like.
          const sideDock = (() => {
            if (!fullBleed || !cur.ink?.length) return null;
            const ink = cur.ink as {x: number; y: number; w: number; h: number}[];
            const toPx = (x: number) => (x - view.x) * k;
            // The rightmost ink on screen — everything past it is free.
            const rightEdge = Math.max(...ink.map((r) => toPx(Number(r.x) + Number(r.w))));
            const freeW = frameW - rightEdge;
            // A floor for any card, plus whatever THIS depiction says it needs. `seq` refuses
            // anything under ~560px because its labels collide, `graph` scales with its widest
            // layer; the stacking kinds are happy at the floor. Measured by rendering all seven
            // into a 460px dock and looking at every one (LAW 0o.6).
            const MIN = Math.max(330, minCardWidth(cur.overlay as Parameters<typeof minCardWidth>[0])) * scale;
            if (freeW < MIN + 2 * pad) return null;
            // AN AUTHORED WIDTH IS AN INSTRUCTION, AND IT DECIDES WHETHER THE DOCK APPLIES.
            //
            // PAID FOR, and the owner photographed it. `sqlite-scan-vs-search` authors
            // `card: {width: 0.46}` = 883px. On its third clip the free column is 592px, so the
            // dock fired and positioned the card from the DOCK's width (460px) at left = 1418 —
            // while the card rendered at the AUTHORED 883px. Right edge 2301 against a 1920
            // frame: 381px of the card, including the end of its title and every row, hanging
            // off the screen.
            //
            // Two numbers that must agree and did not. An authored width wins (the author said
            // it), so when it cannot fit the column the DOCK is what gives way — the card takes
            // the centre band, where the width it asked for is honoured. Same shape of decision
            // as `seq` refusing a narrow dock: placement yields to legibility.
            if (cardCfg.width != null &&
                frameW * Math.min(0.92, Math.max(0.2, Number(cardCfg.width))) > freeW - 2 * pad) {
              return null;
            }
            const w = Math.min(freeW - 2 * pad, 460 * scale);
            return {left: Math.max(rightEdge + pad, frameW - pad - w), width: w};
          })();

          const place = cardCfg.place ?? (sideDock ? 'right' : 'auto');

          // An authored width always wins; otherwise the dock decides, and only when there is
          // no dock does the old full-width strip apply.
          const wFrac = Math.min(0.92, Math.max(0.2, Number(cardCfg.width ?? (vertical ? 0.9 : 0.62))));
          const cardW = cardCfg.width != null
            ? frameW * wFrac
            : (sideDock ? sideDock.width : frameW * wFrac);
          const ASPECT = {wide: 16 / 6, square: 1, portrait: 3 / 4, '4:3': 4 / 3, '3:4': 3 / 4};
          const ratio = ASPECT[cardCfg.aspect as keyof typeof ASPECT];
          // `auto` lets the content decide the height, which is right for a line of text; a named
          // aspect pins it, which is what a diagram or a table needs.
          const cardH = ratio ? cardW / ratio : undefined;


          // IN THE STACKED LAYOUT THE CARD IS A SIBLING OF THE VIDEO, NOT A LAYER OVER IT.
          //
          // Owner: *"there must be gap in between the container box which holds the video, and
          // the one row all of them text."* The card was absolutely positioned at
          // `bottom: pad` in both aspects, so in 9:16 it sat ON the container's lower edge and
          // over the last lines of the terminal — visible in the shorts proof, the card's top
          // border crossing the video's bottom border. There is nothing to overlay in the
          // stacked layout: the video already occupies a box of its own, and the card belongs
          // UNDER it, in flow, separated by the column's own gap. Full-bleed is the case where
          // the card genuinely floats, and there the ink solver places it.
          const inFlow = !fullBleed && place === 'auto';

          const pos: React.CSSProperties = {};
          if (sideDock && place === 'right' && cardCfg.place == null) {
            // Vertically centred IN THE DOCK, which reads as a panel beside the editor rather
            // than a banner over it.
            //
            // CLAMPED AS A BELT FOR THE BRACES. The check above should mean this never binds,
            // but the defect it fixes was precisely two numbers disagreeing about the card's
            // width — so the position is derived from the width that will ACTUALLY render, and
            // a card can never start at an x it cannot finish inside. If a future path
            // reintroduces the disagreement, the card is mispositioned rather than half off
            // the screen, which is a bug you can see in a still instead of one you cannot.
            pos.left = Math.max(pad, Math.min(sideDock.left, frameW - pad - cardW));
            pos.top = 0; pos.bottom = 0;
          } else if (place === 'auto') {
            if (fullBleed) {
              const edgeKey = hasGap || clusterAtTop ? 'top' : 'bottom';
              pos.left = 0; pos.right = 0;
              pos[edgeKey] = clusterInset + (edgeKey === 'bottom' ? sourceInset : 0);
            }
          } else {
            if (place.includes('left')) pos.left = pad;
            else if (place.includes('right')) pos.right = pad;
            else { pos.left = 0; pos.right = 0; }
            // A BARE SIDE PLACEMENT IS A DOCK, AND A DOCK IS VERTICALLY CENTRED.
            //
            // `place: 'right'` used to fall through to `pos.bottom = pad`, so asking for the
            // side put the card in the bottom-right CORNER — which is not what a side dock
            // is, and on a beat carrying a `sourceNote` it landed on the credit strip as
            // well. `top-right` / `bottom-right` still say corner; `right` says side.
            const bareSide = place === 'left' || place === 'right';
            if (place.includes('top')) pos.top = pad;
            else if (place.includes('bottom')) pos.bottom = pad + sourceInset;
            else if (place === 'center' || bareSide) { pos.top = 0; pos.bottom = 0; }
            else { pos.bottom = pad + sourceInset; }
          }
          const justify = place.includes('left') ? 'flex-start'
            : place.includes('right') ? 'flex-end' : 'center';

          const glass = hexA(t.colors.panel, 0.66);
          const edge = hexA(t.colors.text, 0.13);

          return (
            <div style={{
              ...(inFlow
                ? {position: 'relative', width: '100%', marginTop: 18 * scale}
                : {position: 'absolute', ...pos}),
              zIndex: 3,
              display: 'flex', justifyContent: justify,
              // `undefined` means STRETCH, and the docked wrapper spans top-to-bottom — so the
              // card grew to the full height of the frame and read as a sidebar rather than a
              // panel. Anything given a top AND a bottom is centred inside that span.
              alignItems: (place === 'center' || (pos.top != null && pos.bottom != null))
                ? 'center' : undefined,
              pointerEvents: 'none', opacity: life,
              transform: `translateY(${(1 - life) * 10 * scale}px)`,
            }}>
              <div style={{
                width: cardW, ...(cardH ? {height: cardH} : {}),
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 10 * scale,
                padding: `${(compact ? 14 : 20) * scale}px ${(compact ? 20 : 28) * scale}px`,
                borderRadius: 20 * scale * t.style.cornerRadius,
                background: glass,
                backdropFilter: 'blur(20px) saturate(1.25)',
                border: `${1 * scale}px solid ${edge}`,
                boxShadow: `0 ${22 * scale}px ${54 * scale}px ${hexA('#000000', 0.5)},`
                  + ` inset 0 ${1 * scale}px 0 ${hexA(t.colors.text, 0.14)}`,
                overflow: 'hidden',
              }}>
                {d.caption ? (
                  <div style={{
                    fontFamily: t.fonts.display,
                    fontWeight: t.style.displayWeight,
                    letterSpacing: t.style.displayTracking,
                    fontSize: (compact ? 25 : 30) * scale,
                    lineHeight: 1.12, color: t.colors.text, textAlign: 'center',
                  }}>{d.caption}</div>
                ) : null}

                {/* THE PREMISE BELONGS TO EXACTLY ONE OF THEM.
                    In 9:16 the standing setup already sits above the video container, where it
                    is unanchored and readable for the whole beat (LAW 0l). Rendering it in the
                    card as well printed the same sentence twice on one frame — visible in the
                    shorts proof, and the kind of defect that reads as carelessness. Full-bleed
                    has no stacked layout, so there the card is the only place it can live. */}
                {d.premise && fullBleed ? (
                  <div style={{
                    fontFamily: mono,
                    fontSize: (compact ? 14 : 15.5) * scale,
                    letterSpacing: 1.1, lineHeight: 1.4,
                    color: hexA(t.colors.text, 0.62), textAlign: 'center',
                  }}>{d.premise}</div>
                ) : null}

                {cur.overlay ? (
                  <StepOverlay
                    data={cur.overlay as any}
                    fallbackAtWord={cur.atWord}
                    maxWidth={cardW * 0.9}
                  />
                ) : null}

                {!split && clips.length > 1 ? (
                  <div style={{display: 'flex', alignItems: 'center', gap: 9 * scale, marginTop: 2 * scale}}>
                    <div style={{display: 'flex', gap: 4 * scale}}>
                      {clips.map((_, i) => (
                        <div key={i} style={{
                          width: (i === active ? 20 : 9) * scale, height: 3 * scale, borderRadius: 999,
                          background: i === active ? accent
                            : hexA(t.colors.text, frame >= starts[i] ? 0.32 : 0.14),
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontFamily: mono, fontSize: 13.5 * scale, letterSpacing: 0.8,
                      color: hexA(t.colors.text, 0.55), whiteSpace: 'nowrap',
                    }}>{String(cur.label ?? cur.id ?? '')}</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })()}

        {/* THE KEYCAPS — mid-bottom, on their own, nowhere near the card. A chord is an EVENT:
            it presses in, holds long enough to read, and releases. */}
        {(cur.keys ?? []).length ? (() => {
          const kStart = wordToFrame(cur.keysAtWord ?? cur.atWord ?? 1);
          if (frame < kStart) return null;
          const K_IN = 8, K_HOLD = 40, K_OUT = 14;
          const kp = interpolate(
            frame,
            [kStart, kStart + K_IN, kStart + K_IN + K_HOLD, kStart + K_IN + K_HOLD + K_OUT],
            [0, 1, 1, 0],
            clamp,
          );
          if (kp <= 0.001) return null;
          return (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: frameH * (vertical ? 0.05 : 0.08),
              zIndex: 4, display: 'flex', gap: 9 * scale,
              alignItems: 'center', justifyContent: 'center', opacity: kp,
            }}>
              {(cur.keys ?? []).map((key, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? (
                    <span style={{fontFamily: mono, fontSize: 22 * scale, color: hexA(t.colors.text, 0.45)}}>+</span>
                  ) : null}
                  <span style={{
                    fontFamily: mono, fontSize: 23 * scale, fontWeight: 700,
                    color: t.colors.text,
                    background: hexA(t.colors.panel, 0.9),
                    backdropFilter: 'blur(10px)',
                    border: `${1.5 * scale}px solid ${hexA(t.colors.text, 0.26)}`,
                    borderBottomWidth: `${4.5 * scale}px`,
                    borderRadius: 9 * scale,
                    padding: `${7 * scale}px ${15 * scale}px`,
                    boxShadow: `0 ${8 * scale}px ${20 * scale}px ${hexA('#000000', 0.45)}`,
                    transform: `translateY(${(1 - kp) * -7 * scale}px)`,
                  }}>{String(key)}</span>
                </React.Fragment>
              ))}
            </div>
          );
        })() : null}
      </AbsoluteFill>

      {scene.data.source ? <SourceFooter text={String(scene.data.source)} /> : null}
    </AbsoluteFill>
  );
};
